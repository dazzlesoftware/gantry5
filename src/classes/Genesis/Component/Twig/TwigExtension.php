<?php
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Twig;

use Genesis\Component\Content\Document\HtmlDocument;
use Genesis\Component\Genesis\GenesisTrait;
use Genesis\Component\Remote\Response;
use Genesis\Component\Translator\TranslatorInterface;
use Genesis\Component\Twig\TokenParser\TokenParserPageblock;
use Genesis\Component\Twig\TokenParser\TokenParserAssets;
use Genesis\Component\Twig\TokenParser\TokenParserScripts;
use Genesis\Component\Twig\TokenParser\TokenParserStyles;
use Genesis\Component\Twig\TokenParser\TokenParserTryCatch;
use Genesis\Component\Twig\TokenParser\TokenParserMarkdown;
use Genesis\Component\Twig\TokenParser\TokenParserSwitch;
use Genesis\Component\Twig\TokenParser\TokenParserThrow;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Genesis\Framework\Markdown\Parsedown;
use Genesis\Framework\Markdown\ParsedownExtra;
use Genesis\Framework\Platform;
use Genesis\Framework\Request;
use DazzleSoftware\Toolbox\ArrayTraits\NestedArrayAccess;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;
use Twig\TwigFilter;
use Twig\TwigFunction;

/**
 * Class TwigExtension
 * @package Genesis\Component\Twig
 */
class TwigExtension extends AbstractExtension implements GlobalsInterface
{
    use GenesisTrait;

    /**
     * Register some standard globals
     *
     * @return array
     */
    public function getGlobals(): array
    {
        return [
            'genesis' => static::genesis(),
            'Genesis' => static::genesis(),
        ];
    }

    /**
     * Return a list of all filters.
     *
     * @return array
     */
    public function getFilters(): array
    {
        $filters = [
            new TwigFilter('html', [$this, 'htmlFilter']),
            new TwigFilter('url', [$this, 'urlFunc']),
            new TwigFilter('trans_key', [$this, 'transKeyFilter']),
            new TwigFilter('substr', 'substr'),
            new TwigFilter('trans', [$this, 'transFilter']),
            new TwigFilter('repeat', [$this, 'repeatFilter']),
            new TwigFilter('values', [$this, 'valuesFilter']),
            new TwigFilter('base64', 'base64_encode'),
            new TwigFilter('imagesize', [$this, 'imageSize'], ['is_safe' => ['html']]),
            new TwigFilter('truncate_text', [$this, 'truncateText']),
            new TwigFilter('attribute_array', [$this, 'attributeArrayFilter'], ['is_safe' => ['html']]),
        ];

        //if (1 || GENESIS_PLATFORM !== 'grav') {
        $filters = array_merge($filters, [
            new TwigFilter('fieldName', [$this, 'fieldNameFilter']),
            new TwigFilter('json_decode', [$this, 'jsonDecodeFilter']),
            new TwigFilter('truncate_html', [$this, 'truncateHtml']),
            new TwigFilter('markdown', [$this, 'markdownFunction'], ['is_safe' => ['html']]),
            new TwigFilter('nicetime', [$this, 'nicetimeFilter']),

            // Casting values
            new TwigFilter('string', [$this, 'stringFilter']),
            new TwigFilter('int', [$this, 'intFilter'], ['is_safe' => ['all']]),
            new TwigFilter('bool', [$this, 'boolFilter']),
            new TwigFilter('float', [$this, 'floatFilter'], ['is_safe' => ['all']]),
            new TwigFilter('array', [$this, 'arrayFilter']),
        ]);
        //}

        return $filters;
    }

    /**
     * Return a list of all functions.
     *
     * @return array
     */
    public function getFunctions(): array
    {
        $functions = [
            new TwigFunction('nested', [$this, 'nestedFunc']),
            new TwigFunction('parse_assets', [$this, 'parseAssetsFunc']),
            new TwigFunction('colorContrast', [$this, 'colorContrastFunc']),
            new TwigFunction('get_cookie', [$this, 'getCookie']),
            new TwigFunction('preg_match', [$this, 'pregMatch']),
            new TwigFunction('imagesize', [$this, 'imageSize'], ['is_safe' => ['html']]),
            new TwigFunction('is_selected', [$this, 'is_selectedFunc']),
            new TwigFunction('url', [$this, 'urlFunc']),
            new TwigFunction('instagram_feed', [$this, 'instagramFeed']),
        ];

        if (GENESIS_PLATFORM === 'grav') {
            $functions[] = new TwigFunction('taxonomy_categories', [$this, 'taxonomyCategories']);
        }

//        if (1 || GENESIS_PLATFORM !== 'grav') {
        $functions = array_merge($functions, [
            new TwigFunction('array', [$this, 'arrayFilter']),
            new TwigFunction('json_decode', [$this, 'jsonDecodeFilter']),
            new TwigFunction('preg_split', [$this, 'pregSplit']),

        ]);
//        }

        return $functions;
    }

    /**
     * Load a professional Instagram account feed through Meta Business Discovery.
     *
     * The access token is used only by PHP and is never returned to Twig.
     *
     * @param array $settings
     * @return array
     */
    public function instagramFeed(array $settings = []): array
    {
        $username = ltrim(trim((string) ($settings['username'] ?? '')), '@');
        $accountId = trim((string) ($settings['account_id'] ?? ''));
        $accessToken = trim((string) ($settings['access_token'] ?? ''));
        $apiVersion = trim((string) ($settings['api_version'] ?? 'v23.0'));
        $limit = max(1, min(100, (int) ($settings['limit'] ?? 12)));
        $cacheLifetime = max(60, min(86400, (int) ($settings['cache_lifetime'] ?? 3600)));

        $empty = [
            'success' => false,
            'username' => $username,
            'profile_picture_url' => '',
            'media' => [],
            'error' => '',
        ];

        if (!preg_match('/^[A-Za-z0-9._]+$/', $username)) {
            $empty['error'] = 'Enter a valid Instagram username.';
            return $empty;
        }

        if (!preg_match('/^\d+$/', $accountId) || $accessToken === '') {
            $empty['error'] = 'Instagram feed credentials have not been configured.';
            return $empty;
        }

        if (!preg_match('/^v\d+\.\d+$/', $apiVersion)) {
            $apiVersion = 'v23.0';
        }

        $cacheKey = hash('sha256', implode('|', [$username, $accountId, $accessToken, $apiVersion, $limit]));
        $cacheDirectory = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'genesis-instagram';
        $cacheFile = $cacheDirectory . DIRECTORY_SEPARATOR . $cacheKey . '.json';

        if (is_file($cacheFile) && (time() - (int) filemtime($cacheFile)) < $cacheLifetime) {
            $cached = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }

        $mediaFields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
        $discoveryFields = sprintf(
            'business_discovery.username(%s){username,profile_picture_url,media.limit(%d){%s}}',
            $username,
            $limit,
            $mediaFields
        );
        $endpoint = sprintf(
            'https://graph.facebook.com/%s/%s?%s',
            rawurlencode($apiVersion),
            rawurlencode($accountId),
            http_build_query(['fields' => $discoveryFields, 'access_token' => $accessToken], '', '&', PHP_QUERY_RFC3986)
        );

        try {
            $payload = json_decode(Response::get($endpoint), true);
        } catch (\Throwable $exception) {
            $empty['error'] = 'Instagram could not be reached. The cached feed will be used when available.';
            return $empty;
        }

        if (!is_array($payload) || isset($payload['error'])) {
            $message = is_array($payload) ? (string) ($payload['error']['message'] ?? '') : '';
            $empty['error'] = $message !== ''
                ? 'Instagram rejected the feed request: ' . strip_tags($message)
                : 'Instagram returned an invalid feed response.';
            return $empty;
        }

        $discovery = $payload['business_discovery'] ?? [];
        $result = $empty;
        $result['success'] = true;
        $result['username'] = (string) ($discovery['username'] ?? $username);
        $result['profile_picture_url'] = (string) ($discovery['profile_picture_url'] ?? '');

        foreach (($discovery['media']['data'] ?? []) as $media) {
            $type = strtoupper((string) ($media['media_type'] ?? 'IMAGE'));
            $image = $type === 'VIDEO'
                ? (string) ($media['thumbnail_url'] ?? '')
                : (string) ($media['media_url'] ?? '');

            if ($image === '') {
                continue;
            }

            $result['media'][] = [
                'id' => (string) ($media['id'] ?? ''),
                'caption' => (string) ($media['caption'] ?? ''),
                'media_type' => $type,
                'image_url' => $image,
                'media_url' => (string) ($media['media_url'] ?? $image),
                'permalink' => (string) ($media['permalink'] ?? ''),
                'timestamp' => (string) ($media['timestamp'] ?? ''),
                'likes' => max(0, (int) ($media['like_count'] ?? 0)),
                'comments' => max(0, (int) ($media['comments_count'] ?? 0)),
            ];
        }

        if (!is_dir($cacheDirectory)) {
            @mkdir($cacheDirectory, 0700, true);
        }
        if (is_dir($cacheDirectory) && is_writable($cacheDirectory)) {
            @file_put_contents($cacheFile, json_encode($result), LOCK_EX);
        }

        return $result;
    }

    /**
     * @return array
     */
    public function getTokenParsers(): array
    {
        return [
            new TokenParserPageblock(),
            new TokenParserAssets(),
            new TokenParserScripts(),
            new TokenParserStyles(),
            new TokenParserThrow(),
            new TokenParserTryCatch(),
            new TokenParserMarkdown(),
            new TokenParserSwitch()
        ];
    }

    /**
     * Filters field name by changing dot notation into array notation.
     *
     * @param  string  $str
     * @return string
     */
    public function fieldNameFilter($str)
    {
        $path = explode('.', $str);

        return array_shift($path) . ($path ? '[' . implode('][', $path) . ']' : '');
    }

    /**
     * Translate by using key, default on original string.
     *
     * @param string $str
     * @return string
     */
    public function transKeyFilter($str)
    {
        $params = \func_get_args();
        array_shift($params);

        $key = preg_replace('|[^A-Z0-9]+|', '_', strtoupper(implode('_', $params)));

        $translation = $this->transFilter($key);

        return $translation === $key ? $str : $translation;
    }

    /**
     * Translate string.
     *
     * @param  string  $str
     * @return string
     */
    public function transFilter($str)
    {
        /** @var TranslatorInterface|null $translator */
        static $translator;

        $params = \func_get_args();

        if (!$translator) {
            $translator = self::genesis()['translator'];
        }

        return $translator->translate(...$params);
    }

    /**
     * Repeat string x times.
     *
     * @param  string  $str
     * @param  int  $count
     * @return string
     */
    public function repeatFilter($str, $count)
    {
        return str_repeat($str, max(0, (int) $count));
    }


    /**
     * Decodes string from JSON.
     *
     * @param  string  $str
     * @param  bool  $assoc
     * @param int $depth
     * @param int $options
     * @return array
     */
    public function jsonDecodeFilter($str, $assoc = false, $depth = 512, $options = 0)
    {
        return json_decode(html_entity_decode($str ?? ''), $assoc, $depth, $options);
    }

    /**
     * @param mixed $src
     * @param bool $attrib
     * @param bool $remote
     * @return array|string
     */
    public function imageSize($src, $attrib = true, $remote = false)
    {
        // TODO: need to better handle absolute and relative paths
        //$url = Genesis::instance()['document']->url(trim((string) $src), false, false);
        $width = $height = null;
        $sizes = ['width' => $width, 'height' => $height];
        $attr = '';

        if ($remote || @is_file($src)) {
            try {
                list($width, $height,, $attr) = @getimagesize($src);
            } catch (\Exception $e) {}

            $sizes['width'] = $width;
            $sizes['height'] = $height;
        }

        return $attrib ? $attr : $sizes;
    }

    /**
     * Reindexes values in array.
     *
     * @param array $array
     * @return array
     */
    public function valuesFilter(array $array)
    {
        return array_values($array);
    }

    /**
     * Casts input to string.
     *
     * @param mixed $input
     * @return string
     */
    public function stringFilter($input)
    {
        return (string) $input;
    }


    /**
     * Casts input to int.
     *
     * @param mixed $input
     * @return int
     */
    public function intFilter($input)
    {
        return (int) $input;
    }

    /**
     * Casts input to bool.
     *
     * @param mixed $input
     * @return bool
     */
    public function boolFilter($input)
    {
        return (bool) $input;
    }

    /**
     * Casts input to float.
     *
     * @param mixed $input
     * @return float
     */
    public function floatFilter($input)
    {
        return (float) $input;
    }

    /**
     * Casts input to array.
     *
     * @param mixed $input
     * @return array
     */
    public function arrayFilter($input)
    {
        return (array) $input;
    }

    /**
     * Takes array of attribute keys and values and converts it to properly escaped HTML attributes.
     *
     * @example ['data-id' => 'id', 'data-key' => 'key'] => ' data-id="id" data-key="key"'
     * @example [['data-id' => 'id'], ['data-key' => 'key']] => ' data-id="id" data-key="key"'
     *
     * @param string|array $input
     * @return string
     */
    public function attributeArrayFilter($input)
    {
        if (\is_string($input)) {
            return $input;
        }

        $array = [];
        /**
         * @var string $key
         * @var string|string[] $value
         */
        foreach ((array) $input as $key => $value) {
            if (\is_array($value)) {
                /**
                 * @var string $key2
                 * @var string $value2
                 */
                foreach ($value as $key2 => $value2) {
                    $array[] = HtmlDocument::escape($key2) . '="' . HtmlDocument::escape($value2, 'html_attr') . '"';
                }
            } elseif ($key) {
                $array[] = HtmlDocument::escape($key) . '="' . HtmlDocument::escape($value, 'html_attr') . '"';
            }
        }
        return $array ? ' ' . implode(' ', $array) : '';
    }

    /**
     * @param string $a
     * @param string|array $b
     * @return bool
     */
    public function is_selectedFunc($a, $b)
    {
        $b = (array) $b;
        array_walk(
            $b,
            static function (&$item) {
                if (\is_bool($item)) {
                    $item = (int) $item;
                }
                $item = (string) $item;
            }
        );

        return \in_array((string) $a, $b, true);
    }

    /**
     * Truncate text by number of characters but can cut off words. Removes html tags.
     *
     * @param  string $string
     * @param  int    $limit       Max number of characters.
     *
     * @return string
     */
    public function truncateText($string, $limit = 150)
    {
        /** @var Platform $platform */
        $platform = Genesis::instance()['platform'];

        return $platform->truncate($string, (int) $limit, false);
    }

    /**
     * Truncate text by number of characters but can cut off words.
     *
     * @param  string $string
     * @param  int    $limit       Max number of characters.
     *
     * @return string
     */
    public function truncateHtml($string, $limit = 150)
    {
        /** @var Platform $platform */
        $platform = Genesis::instance()['platform'];

        return $platform->truncate($string, (int) $limit, true);
    }

    /**
     * @param string $string
     * @param bool $block  Block or Line processing
     * @param array $settings
     * @return mixed|string
     */
    public function markdownFunction($string, $block = true, ?array $settings = null)
    {
        // Initialize the preferred variant of Parsedown
        if (!empty($settings['extra'])) {
            $parsedown = new ParsedownExtra($settings);
        } else {
            $parsedown = new Parsedown($settings);
        }

        if ($block) {
            $string = $parsedown->text($string);
        } else {
            $string = $parsedown->line($string);
        }

        return $string;
    }

    /**
     * Get value by using dot notation for nested arrays/objects.
     *
     * @example {{ nested(array, 'this.is.my.nested.variable')|json_encode }}
     *
     * @param array|object $items Array of items.
     * @param string  $name       Dot separated path to the requested value.
     * @param mixed   $default    Default value (or null).
     * @param string  $separator  Separator, defaults to '.'
     * @return mixed  Value.
     */
    public function nestedFunc($items, $name, $default = null, $separator = '.')
    {
        if (is_callable([$items, 'getNestedProperty'])) {
            return $items->getNestedProperty($name, $default, $separator);
        }
        $path = explode($separator, $name) ?: [];
        $current = $items;
        foreach ($path as $field) {
            if (\is_object($current) && isset($current->{$field})) {
                $current = $current->{$field};
            } elseif (\is_array($current) && isset($current[$field])) {
                $current = $current[$field];
            } else {
                return $default;
            }
        }

        return $current;
    }

    /**
     * Return URL to the resource.
     *
     * @example {{ url('theme://images/logo.png')|default('http://www.placehold.it/150x100/f4f4f4') }}
     *
     * @param  string $input       Resource to be located.
     * @param  bool|null $domain   True to include domain name.
     * @param  int $timestamp_age  Append timestamp to files that are less than x seconds old. Defaults to a week.
     *                             Use value <= 0 to disable the feature.
     * @return string|null         Returns url to the resource or null if resource was not found.
     */
    public function urlFunc($input, $domain = null, $timestamp_age = null)
    {
        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];

        return $document::url(trim((string) $input), $domain, $timestamp_age);
    }

    /**
     * Filter stream URLs from HTML input.
     *
     * @param  string $str          HTML input to be filtered.
     * @param  bool $domain         True to include domain name.
     * @param  int $timestamp_age   Append timestamp to files that are less than x seconds old. Defaults to a week.
     *                              Use value <= 0 to disable the feature.
     * @return string               Returns modified HTML.
     */
    public function htmlFilter($str, $domain = false, $timestamp_age = null)
    {
        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];

        return $document::urlFilter($str, $domain, $timestamp_age);
    }

    /**
     * @param \LibXMLError $error
     * @param string $input
     * @throws \RuntimeException
     */
    protected function dealXmlError(\LibXMLError $error, $input)
    {
        switch ($error->level) {
            case LIBXML_ERR_WARNING:
                $level = 1;
                $message = "DOM Warning {$error->code}: ";
                break;
            case LIBXML_ERR_ERROR:
                $level = 2;
                $message = "DOM Error {$error->code}: ";
                break;
            case LIBXML_ERR_FATAL:
                $level = 3;
                $message = "Fatal DOM Error {$error->code}: ";
                break;
            default:
                $level = 3;
                $message = "Unknown DOM Error {$error->code}: ";
        }
        $message .= "{$error->message} while parsing:\n{$input}\n";

        if ($level <= 2 && !Genesis::instance()->debug()) {
            return;
        }

        throw new \RuntimeException($message, 500);
    }

    /**
     * Move supported document head elements into platform document object, return all
     * unsupported tags in a string.
     *
     * @param string $input
     * @param string $location
     * @param int $priority
     * @return string
     */
    public function parseAssetsFunc($input, $location = 'head', $priority = 0)
    {
        if ($location === 'head') {
            $scope = 'head';
            $html = "<!doctype html>\n<html><head>{$input}</head><body></body></html>";
        } else {
            $scope = 'body';
            $html = "<!doctype html>\n<html><head></head><body>{$input}</body></html>";
        }

        libxml_clear_errors();

        $internal = libxml_use_internal_errors(true);

        $doc = new \DOMDocument();
        $doc->loadHTML($html);
        foreach (libxml_get_errors() as $error) {
            $this->dealXmlError($error, $html);
        }

        libxml_clear_errors();

        libxml_use_internal_errors($internal);

        $raw = [];
        /** @var \DomElement $element */
        foreach ($doc->getElementsByTagName($scope)->item(0)->childNodes as $element) {
            if (empty($element->tagName)) {
                continue;
            }
            $result = ['tag' => $element->tagName, 'content' => $element->textContent];
            foreach ($element->attributes as $attribute) {
                $result[$attribute->name] = $attribute->value;
            }

                /** @var Document $document */
            $document = Genesis::instance()['document'];
            $success = $document::addHeaderTag($result, $location, (int) $priority);
            if (!$success) {
                $raw[] = $doc->saveHTML($element);
            }
        }

        return implode("\n", $raw);
    }

    /**
     * @param string $value
     * @return bool
     */
    public function colorContrastFunc($value)
    {
        $value = str_replace(' ', '', $value);
        $rgb = new \stdClass;
        $opacity = 1;

        if (0 !== strpos($value, 'rgb')) {
            $value = str_replace('#', '', $value);
            if (\strlen($value) === 3) {
                $h0 = str_repeat(substr($value, 0, 1), 2);
                $h1 = str_repeat(substr($value, 1, 1), 2);
                $h2 = str_repeat(substr($value, 2, 1), 2);
                $value = $h0 . $h1 . $h2;
            }

            $rgb->r = hexdec(substr($value, 0, 2));
            $rgb->g = hexdec(substr($value, 2, 2));
            $rgb->b = hexdec(substr($value, 4, 2));
        } else {
            preg_match("/(\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*(1\\.|0?\\.?[0-9]?+))?/uim", $value, $matches);
            $rgb->r = $matches[1];
            $rgb->g = $matches[2];
            $rgb->b = $matches[3];
            $opacity = isset($matches[4]) ? $matches[4] : 1;
            $opacity = substr($opacity, 0, 1) === '.' ? '0' . $opacity : $opacity;
        }

        $yiq = ((($rgb->r * 299) + ($rgb->g * 587) + ($rgb->b * 114)) / 1000) >= 128;

        return $yiq || (!$opacity || (float) $opacity < 0.35);
    }

    /**
     * Displays a facebook style 'time ago' formatted date/time.
     *
     * @param string|int $date
     * @param bool $long_strings
     *
     * @return string
     */
    public function nicetimeFilter($date, $long_strings = true)
    {
        static $lengths = [60, 60, 24, 7, 4.35, 12, 10];
        static $periods_long = [
            'GENESIS_ENGINE_NICETIME_SECOND',
            'GENESIS_ENGINE_NICETIME_MINUTE',
            'GENESIS_ENGINE_NICETIME_HOUR',
            'GENESIS_ENGINE_NICETIME_DAY',
            'GENESIS_ENGINE_NICETIME_WEEK',
            'GENESIS_ENGINE_NICETIME_MONTH',
            'GENESIS_ENGINE_NICETIME_YEAR',
            'GENESIS_ENGINE_NICETIME_DECADE'
        ];
        static $periods_short = [
            'GENESIS_ENGINE_NICETIME_SEC',
            'GENESIS_ENGINE_NICETIME_MIN',
            'GENESIS_ENGINE_NICETIME_HR',
            'GENESIS_ENGINE_NICETIME_DAY',
            'GENESIS_ENGINE_NICETIME_WK',
            'GENESIS_ENGINE_NICETIME_MO',
            'GENESIS_ENGINE_NICETIME_YR',
            'GENESIS_ENGINE_NICETIME_DEC'
        ];

        if (empty($date)) {
            return $this->transFilter('GENESIS_ENGINE_NICETIME_NO_DATE_PROVIDED');
        }

        $periods = $long_strings ? $periods_long : $periods_short;

        $now = time();

        // check if unix timestamp
        if (is_int($date) || (string)(int)$date === (string)$date) {
            $unix_date = (int)$date;
        } else {
            $unix_date = strtotime($date);
        }

        // check validity of date
        if (!$unix_date) {
            return $this->transFilter('GENESIS_ENGINE_NICETIME_BAD_DATE');
        }

        // is it future date or past date
        if ($now > $unix_date) {
            $difference = $now - $unix_date;
            $tense      = $this->transFilter('GENESIS_ENGINE_NICETIME_AGO');

        } else if ($now === $unix_date) {
            $difference = $now - $unix_date;
            $tense      = $this->transFilter('GENESIS_ENGINE_NICETIME_JUST_NOW');

        } else {
            $difference = $unix_date - $now;
            $tense      = $this->transFilter('GENESIS_ENGINE_NICETIME_FROM_NOW');
        }


        for ($j = 0; $difference >= $lengths[$j] && $j < \count($lengths) - 1; $j++) {
            $difference /= $lengths[$j];
        }
        $period = $periods[$j];

        $difference = round($difference);

        if ($difference !== 1) {
            $period .= '_PLURAL';
        }

        $period = $this->transFilter($period);

        if ($now === $unix_date) {
            return $tense;
        }

        return "{$difference} {$period} {$tense}";
    }

    /**
     * @param string $name
     * @return mixed
     */
    public function getCookie($name)
    {
        $genesis = Genesis::instance();

        /** @var Request $request */
        $request = $genesis['request'];

        return $request->cookie[$name];
    }

    /**
     * @param string $pattern
     * @param string $subject
     * @param array $matches
     * @return array|bool
     */
    public function pregMatch($pattern, $subject, &$matches = [])
    {
        preg_match($pattern, $subject, $matches);

        return $matches ?: false;
    }

    /**
     * @param string|array $str
     * @return array
     */
    public function taxonomyCategories($str)
    {
        if (!is_array($str)) {
            $taxonomies = explode(' ', $str);
        } else {
            $taxonomies = $str;
        }

        $list = [];
        foreach ($taxonomies as $taxonomy) {
            $list[] = ['@taxonomy.category' => $taxonomy];
        }

        return $list;
    }

     public function pregSplit($pattern, $subject, $limit = -1)
    {
        return preg_split($pattern, $subject, $limit);
    }
}
