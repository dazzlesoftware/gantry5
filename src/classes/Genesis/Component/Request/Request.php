<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.NonceVerification.Recommended,WordPress.Security.NonceVerification.Missing

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Request;

/**
 * Class Request
 * @package Genesis\Component\Request
 */
class Request
{
    /** @var string */
    protected ?string $method = null;

    /** @var Input */
    public Input $get;
    /** @var Input */
    public Input $post;
    /** @var Input */
    public Input $cookie;
    /** @var Input */
    public Input $server;
    /** @var Input */
    public Input $request;

    public function __construct()
    {
        $this->init();
    }

    /**
     * @return string
     */
    public function getMethod(): string
    {
        if (!$this->method) {
            $method = $this->server['REQUEST_METHOD'] ?: 'GET';
            if ('POST' === $method) {
                $method = $this->server['X-HTTP-METHOD-OVERRIDE'] ?: $method;
                $method = $this->post['METHOD'] ?: $method;
            }
            $this->method = strtoupper((string) $method);
        }

        return $this->method;
    }

    protected function init(): void
    {
        $this->get = new Input($_GET);
        $this->post = new Input($_POST);
        $this->cookie = new Input($_COOKIE);
        $this->server = new Input($_SERVER);
        $this->request = new Input($_REQUEST);
    }
}
