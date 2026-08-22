<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Request\Input;
use Genesis\Component\Request\Request as BaseRequest;
use Genesis\phpBB\Runtime;

/**
 * Class Request
 * @package Genesis\Framework
 *
 * phpBB replaces $_GET/$_POST/$_COOKIE/$_SERVER/$_REQUEST with guarded objects that throw on any
 * access (`deactivated_super_global`) -- the common Request base class reads those directly, so
 * it can never be used as-is under phpBB. This override sources the same data from phpBB's own
 * \phpbb\request\request, which captured the real values before disabling the superglobals.
 */
class Request extends BaseRequest
{
    protected function init(): void
    {
        /** @var \phpbb\request\request $request */
        $request = Runtime::service('request');

        $get = $this->extract($request, \phpbb\request\request_interface::GET);
        $post = $this->extract($request, \phpbb\request\request_interface::POST);
        $cookie = $this->extract($request, \phpbb\request\request_interface::COOKIE);
        $server = $this->extract($request, \phpbb\request\request_interface::SERVER);
        $all = $this->extract($request, \phpbb\request\request_interface::REQUEST);

        $this->get = new Input($get);
        $this->post = new Input($post);
        $this->cookie = new Input($cookie);
        $this->server = new Input($server);
        $this->request = new Input($all);
    }

    /**
     * @param \phpbb\request\request $request
     * @param int $type
     * @return array
     */
    protected function extract(\phpbb\request\request $request, int $type): array
    {
        // raw_variable(), not variable() -- variable() runs every string through
        // htmlspecialchars() (XSS protection for values phpBB itself might echo back into HTML).
        // Genesis's admin controllers send/expect raw JSON payloads in POST fields (e.g. the
        // layout editor's "layout"/"preset" fields) and decode them themselves; htmlspecialchars
        // mangles every quote into `&quot;` first, so json_decode() on the result always fails
        // ("Structure missing" et al). No other platform's raw $_POST access applies this kind of
        // transform, so raw_variable() is the correct equivalent here, not a security downgrade.
        $data = [];
        foreach ($request->variable_names($type) as $name) {
            $data[$name] = $request->raw_variable($name, '', $type);
        }

        return $data;
    }
}
