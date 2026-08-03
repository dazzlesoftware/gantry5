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

        // getAjaxSuffix() (platforms/common/application/utils/get-ajax-suffix.js) is appended to
        // every modal-remote-load / save URL the shared admin JS builds, specifically so the
        // request comes back as a bare JSON fragment instead of a full page render -- Grav uses
        // '.json' (its Router reads $uri->extension()), WordPress uses '&action=gantry5'. Without
        // an equivalent here, $this->format below always defaulted to 'html', so
        // BaseController rendered the full admin page shell (layout.html.twig/base.html.twig,
        // complete with <head> assets) for every particle/container/section edit modal instead of
        // the JSON {success,html} envelope the JS expects -- that raw full-page HTML then got
        // dumped into the modal by elements-native.js, whose relative asset links (font-awesome,
        // stylesheet.css) resolved wrong against the current /adm/index.php location.
        $this->container['ajax_suffix'] = '&g5_format=json';

        // Gantry::route() builds every URL as '/' . base_url . sprintf($route, $path) -- base_url
        // must be just the site-relative prefix (Grav sets its own plugin base the same way), NOT
        // baked into the route template too, or it ends up doubled. Runtime::webRoot() is the
        // reliable site-relative prefix (see its docblock for why path_helper isn't safe here).
        $webRoot = Runtime::webRoot();

        $nonce = static::createNonce();

        // phpBB identifies ACP modules in URLs by a mangled version of the module class's own
        // basename (functions_module.php::get_module_identifier(): backslashes become dashes),
        // not by anything we choose ourselves -- "i=gantry5" 404s because that identifier simply
        // doesn't exist.
        $moduleId = str_replace('\\', '-', '\\' . \dazzlesoftware\gantry5\acp\gantry5_module::class);

        // phpBB's ACP redirects (302) any adm/index.php request whose `sid` doesn't match the
        // current admin session -- a plain browser navigation always carries it (phpBB injects it
        // into every link it renders itself), but our own route()-built URLs never included it, so
        // every fetch() call from the admin JS (particle/container edit, devprod toggle, etc.) hit
        // that redirect instead of our module code. fetch() follows redirects transparently, so
        // the symptom wasn't an error -- it was a silently-wrong page (without g5_format) landing
        // in the modal, whose relative <head> asset links then 404'd against /adm/'s location.
        /** @var \phpbb\user $user */
        $user = Runtime::service('user');
        $sid = (string) $user->session_id;

        $this->container['base_url'] = '';
        $this->container['ajax_nonce'] = $nonce;
        $this->container['routes'] = [
            '1' => "{$webRoot}/adm/index.php?sid={$sid}&i={$moduleId}&mode=main&nonce={$nonce}&g5_path=%s",
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
