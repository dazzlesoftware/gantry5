<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.NonceVerification.Recommended,WordPress.Security.NonceVerification.Missing

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Request\Input;
use Genesis\Component\Request\Request as BaseRequest;

/**
 * Class Request
 * @package Genesis\Framework
 */
class Request extends BaseRequest
{
    public function init(): void
    {
        // Replaces parent contructor.

        $get = \stripslashes_deep($_GET);
        $this->get = new Input($get);

        $post = \stripslashes_deep($_POST);
        $this->post = new Input($post);

        $cookie = \stripslashes_deep($_COOKIE);
        $this->cookie = new Input($cookie);

        $server = \stripslashes_deep($_SERVER);
        $this->server = new Input($server);

        $request = array_merge($get, $post);
        $this->request = new Input($request);
    }
}
