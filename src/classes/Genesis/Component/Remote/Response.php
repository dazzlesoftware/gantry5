<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,WordPress.WP.AlternativeFunctions.curl_curl_init,WordPress.WP.AlternativeFunctions.curl_curl_setopt_array,WordPress.WP.AlternativeFunctions.curl_curl_exec,WordPress.WP.AlternativeFunctions.curl_curl_errno,WordPress.WP.AlternativeFunctions.curl_curl_strerror,WordPress.WP.AlternativeFunctions.curl_curl_close,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Remote;

/**
 * Class Response
 * @package Genesis\Component\Remote
 */
class Response
{
    /** @var callable  The callback for the progress */
    public static mixed $callback = null;

    /** @var string Which method to use for HTTP calls, can be 'curl', 'fopen' or 'auto'. Auto is default and fopen is the preferred method */
    private static string $method = 'auto';
    /** @var array Default parameters for `curl` and `fopen` */
    private static array $defaults = [
        'curl'  => [
            CURLOPT_REFERER        => 'Genesis Response',
            CURLOPT_USERAGENT      => 'Genesis Response',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_HEADER         => false,
            /*
             * Example of callback parameters from within your own class
             */
            //CURLOPT_NOPROGRESS     => false,
            //CURLOPT_PROGRESSFUNCTION => [$this, 'progress']
        ],
        'fopen' => [
            'method'          => 'GET',
            'user_agent'      => 'Genesis Response',
            'max_redirects'   => 5,
            'follow_location' => 1,
            'timeout'         => 15,
            /*
             * Example of callback parameters from within your own class
             */
            //'notification' => [$this, 'progress']
        ]
    ];

    /**
     * Sets the preferred method to use for making HTTP calls.
     *
     * @param string $method Default is `auto`
     * @return Response
     */
    public static function setMethod(string $method = 'auto'): self
    {
        if (!in_array($method, ['auto', 'curl', 'fopen'], true)) {
            $method = 'auto';
        }

        self::$method = $method;

        return new self();
    }

    /**
     * Makes a request to the URL by using the preferred method
     *
     * @param  string   $uri     URL to call
     * @param  array    $options An array of parameters for both `curl` and `fopen`
     * @param  callable $callback
     * @return string The response of the request
     */
    public static function get(string $uri = '', array $options = [], ?callable $callback = null): string
    {
        if (!self::isCurlAvailable() && !self::isFopenAvailable()) {
            throw new \RuntimeException('Could not start an HTTP request. `allow_url_open` is disabled and `cURL` is not available');
        }

        $options = array_replace_recursive(self::$defaults, $options);
        $method  = 'get' . ucfirst(strtolower(self::$method));

        self::$callback = $callback;
        return static::$method($uri, $options, $callback);
    }

    /**
     * Checks if cURL is available
     *
     * @return boolean
     */
    public static function isCurlAvailable(): bool
    {
        return function_exists('curl_version');
    }

    /**
     * Checks if the remote fopen request is enabled in PHP
     *
     * @return boolean
     */
    public static function isFopenAvailable(): bool
    {
        return preg_match('/1|yes|on|true/i', (string) ini_get('allow_url_fopen')) === 1;
    }

    /**
     * Progress normalized for cURL and fopen
     */
    public static function progress(mixed ...$args): void
    {
        static $filesize = null;

        $isCurlResource = is_resource($args[0]) && get_resource_type($args[0]) === 'curl';

        $notification_code = !$isCurlResource ? $args[0] : false;
        $bytes_transferred = $isCurlResource ? $args[2] : $args[4];

        if ($isCurlResource) {
            $filesize = $args[1];
        } elseif ($notification_code === STREAM_NOTIFY_FILE_SIZE_IS) {
            $filesize = $args[5];
        }

        if ($bytes_transferred > 0) {
            if (in_array($notification_code, [STREAM_NOTIFY_PROGRESS, STREAM_NOTIFY_COMPLETED], true) || $isCurlResource) {

                $progress = [
                    'code'        => $notification_code,
                    'filesize'    => $filesize,
                    'transferred' => $bytes_transferred,
                    'percent'     => $filesize <= 0 ? '-' : round(($bytes_transferred * 100) / $filesize, 1)
                ];

                if (self::$callback !== null) {
                    call_user_func(self::$callback, $progress);
                }
            }
        }
    }

    /**
     * Automatically picks the preferred method
     *
     * @return string The response of the request
     */
    private static function getAuto(mixed ...$args): string
    {
        if (self::isFopenAvailable()) {
            return self::getFopen($args);
        }

        if (self::isCurlAvailable()) {
            return self::getCurl($args);
        }

        return '';
    }

    /**
     * Starts a HTTP request via fopen
     *
     * @return string The response of the request
     */
    private static function getFopen(mixed ...$args): string
    {
        if (count($args) === 1) {
            $args = $args[0];
        }

        list($uri, $options, $callback) = $args;

        if ($callback) {
            $options['fopen']['notification'] = ['self', 'progress'];
        }

        $stream  = stream_context_create(['http' => $options['fopen']], $options['fopen']);
        $content = @file_get_contents($uri, false, $stream);

        if ($content === false) {
            throw new \RuntimeException("Error while trying to download '$uri'");
        }

        return $content;
    }

    /**
     * Starts a HTTP request via cURL
     *
     * @return string The response of the request
     */
    private static function getCurl(mixed ...$args): string
    {
        $args = count($args) > 1 ? $args : array_shift($args);

        list($uri, $options, $callback) = $args;

        $ch = curl_init($uri);
        curl_setopt_array($ch, $options['curl']);

        if ($callback) {
            curl_setopt_array(
                $ch,
                [
                    CURLOPT_NOPROGRESS       => false,
                    CURLOPT_PROGRESSFUNCTION => ['self', 'progress']
                ]
            );
        }

        $response = curl_exec($ch);

        $errno = curl_errno($ch);
        if ($errno) {
            $error_message = curl_strerror($errno);
            throw new \RuntimeException("cURL error ({$errno}):\n {$error_message}");
        }

        curl_close($ch);

        return (string) $response;
    }
}
