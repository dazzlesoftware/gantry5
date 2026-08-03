<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Admin;

use Gantry\Component\Request\Request;
use Gantry\Component\Response\Response;
use Gantry\Component\Router\Router as BaseRouter;
use Gantry\phpBB\Runtime;

/**
 * Class Router
 * @package Gantry\Admin
 *
 * phpBB has no per-theme admin picker like Grav/WordPress/Joomla -- there is exactly one
 * installed Gantry theme (g5_helium), so this router always administers that theme. The ACP
 * module (platforms/phpbb/gantry5/acp/gantry5_module.php) has a single fixed URL
 * (adm/index.php?i=gantry5&mode=main) and encodes the actual Gantry resource/path/format Gantry's
 * admin JS wants to hit via a `g5_path` query/POST variable instead of pretty path segments.
 */
class Router extends BaseRouter
{
    /**
     * @return void
     */
    protected function boot()
    {
        static $booted = false;

        if ($booted) {
            return;
        }

        $booted = true;

        $this->container['theme.path'] = GANTRY5_PHPBB_EXT_PATH . 'themes/g5_helium';
        $this->container['theme.name'] = 'g5_helium';

        /** @var Request $request */
        $request = $this->container['request'];

        $path = trim((string) $request->request['g5_path'], '/');
        $parts = $path !== '' ? explode('/', $path) : ['configurations', 'default', 'layout'];

        $this->method = $request->getMethod();
        $this->resource = array_shift($parts);
        $this->path = $parts;
        $this->format = (string) $request->request['g5_format'] ?: 'html';
        $this->params = [
            'ajax' => $this->format === 'json',
            'location' => $this->resource,
            'method' => $this->method,
            'format' => $this->format,
            'params' => $request->post->getJsonArray('params'),
        ];

        $this->container['ajax_suffix'] = '';

        // Gantry::route() builds every URL as '/' . base_url . sprintf($route, $path) -- base_url
        // must be just the site-relative prefix (Grav sets its own plugin base the same way), NOT
        // baked into the route template too, or it ends up doubled.
        /** @var \phpbb\path_helper $pathHelper */
        $pathHelper = Runtime::service('path_helper');
        $webRoot = rtrim($pathHelper->get_web_root_path(), '/');

        $nonce = static::createNonce();

        $this->container['base_url'] = '';
        $this->container['ajax_nonce'] = $nonce;
        $this->container['routes'] = [
            '1' => "{$webRoot}/adm/index.php?i=gantry5&mode=main&nonce={$nonce}&g5_path=%s",
        ];
    }

    /**
     * A single-value CSRF nonce (matching the shape the shared admin JS/Twig already expects via
     * `gantry.ajax_nonce`), rather than phpBB's own two-field add_form_key()/check_form_key(),
     * which needs named POST fields the admin JS has no notion of.
     *
     * @return string
     */
    public static function createNonce()
    {
        /** @var \phpbb\user $user */
        $user = Runtime::service('user');
        /** @var \phpbb\config\config $config */
        $config = Runtime::service('config');

        return substr(hash_hmac('sha1', 'gantry5-admin|' . $user->session_id, (string) $config['server_name']), 0, 16);
    }

    /**
     * @return bool
     */
    protected function checkSecurityToken()
    {
        /** @var Request $request */
        $request = $this->container['request'];
        $nonce = (string) $request->get['nonce'] ?: (string) $request->post['nonce'];

        return $nonce !== '' && hash_equals(static::createNonce(), $nonce);
    }

    /**
     * @param Response $response
     * @return bool
     */
    protected function send(Response $response)
    {
        header("HTTP/1.1 {$response->getStatus()}", true, $response->getStatusCode());
        header("Content-Type: {$response->mimeType}; charset={$response->charset}");
        foreach ($response->getHeaders() as $key => $values) {
            foreach ($values as $value) {
                header("{$key}: {$value}");
            }
        }

        echo $response;

        return true;
    }
}
