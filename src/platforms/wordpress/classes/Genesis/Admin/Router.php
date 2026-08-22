<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin;

use Genesis\Component\Request\Request;
use Genesis\Component\Response\JsonResponse;
use Genesis\Component\Response\Response;
use Genesis\Component\Router\Router as BaseRouter;

/**
 * Genesis administration router for WordPress.
 */
class Router extends BaseRouter
{
    /**
     * @return $this
     */
    public function boot(): static
    {
        /** @var Request $request */
        $request = $this->container['request'];

        $this->container['content'] = function ($c) {
            return new Content($c);
        };

        $path = array_filter(explode('/', (string) $request->get->get('view')), function($var) { return $var !== ''; });

        $this->method = $request->getMethod();
        $this->path = $path ?: ['configurations', true];
        $this->resource = array_shift($this->path);

        // FIXME: make it better by detecting admin-ajax.php..
        $ajax = ($request->get['action'] === 'genesis');
        $this->format = $ajax ? 'json' : 'html';

        $this->params = [
            'ajax' => $ajax,
            'location' => $this->resource,
            'method' => $this->method,
            'format' => $this->format,
            'params' => $request->post->getJsonArray('params')
        ];

        $this->setTemplate();

        return $this;
    }

    /**
     * @param string $url
     * @return string
     */
    protected function makeUri(string $url): string
    {
        $components = wp_parse_url($url);

        $path     = isset($components['path']) ? $components['path'] : '';
        $query    = isset($components['query']) ? '?' . $components['query'] : '';
        $fragment = isset($components['fragment']) ? '#' . $components['fragment'] : '';

        return "{$path}{$query}{$fragment}";
    }

    /**
     * @return $this
     */
    public function setTemplate(): static
    {
        // FIXME: in here use pages.php, but in AJAX we need admin-ajax.php.
        $this->container['base_url'] = $this->makeUri(\admin_url( 'admin.php?page=layout-manager' ));

        $this->container['ajax_suffix'] = '&action=genesis';

        // Create nonce
        $nonce = \wp_create_nonce( 'genesis-layout-manager' );

        $this->container['routes'] = [
            '1' => "&view=%s&_wpnonce={$nonce}",

            'themes' => "&view=themes&_wpnonce={$nonce}",
            'picker/layouts' => "&view=layouts&_wpnonce={$nonce}",
        ];

        $this->container['ajax_nonce'] = $nonce;

        return $this;
    }

    /**
     * @return bool
     */
    protected function checkSecurityToken(): bool
    {
        // Check security nonce and return false on failure.
        if(\check_admin_referer('genesis-layout-manager')) {
            return true;
        }

        return false;
    }

    /**
     * Send response to the client.
     *
     * @param Response $response
     * @return string
     */
    protected function send(Response $response): Response
    {
        // Output HTTP header.
        $headersSent = headers_sent($file, $line);

        if (!$headersSent) {
            header("HTTP/1.1 {$response->getStatus()}", true, $response->getStatusCode());
            header("Content-Type: {$response->mimeType}; charset={$response->charset}");
            foreach ($response->getHeaders() as $key => $values) {
                $replace = true;
                foreach ($values as $value) {
                    header("{$key}: {$value}", $replace);
                    $replace = false;
                }
            }
        }

        if ($response instanceof JsonResponse) {
            header('Expires: Wed, 17 Aug 2005 00:00:00 GMT', true);
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT', true);
            header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0', false);
            header('Pragma: no-cache');

            // Output Genesis JSON response.
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JsonResponse is already encoded output.
            echo $response;

            die();
        }

        return $response;
    }
}
