<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin;

use Genesis\Component\Config\Config;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Component\Filesystem\Streams;
use Genesis\Component\Request\Request;
use Genesis\Component\Response\JsonResponse;
use Genesis\Component\Response\Response;
use Genesis\Component\Router\Router as BaseRouter;
use Grav\Common\Config\Config as GravConfig;
use Grav\Common\Grav;
use Grav\Common\Uri;
use Grav\Common\Utils;
use Grav\Plugin\Admin\Admin;
use Psr\Http\Message\ResponseInterface;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Router
 * @package Genesis\Admin
 */
class Router extends BaseRouter
{
    /**
     * @return void
     */
    public function boot()
    {
        /** @var bool */
        static $booted = false;

        if ($booted) {
            return null;
        }

        $booted = true;

        $grav = Grav::instance();
        $plugin = $grav['genesis_plugin'];

        /** @var Admin $admin */
        $admin = $grav['admin'];

        /** @var Uri $uri */
        $uri = $grav['uri'];

        $parts = array_filter(explode('/', $admin->route), static function($var) { return $var !== ''; });
        $base = '';

        // Set theme.
        if ($parts && $parts[0] === 'themes') {
            $base = '/' . array_shift($parts);
            $theme = array_shift($parts);
        } else {
            /** @var GravConfig $config */
            $config = $grav['config'];

            $theme = $config->get('system.pages.theme');
        }
        $this->setTheme($theme);

        /** @var Request $request */
        $request = $this->container['request'];

        // Figure out the action we want to make.
        $this->method = $request->getMethod();
        $this->path = $parts ?: ($theme ? ['configurations', 'default', 'styles'] : ['themes']);
        $this->resource = array_shift($this->path);
        $this->format = $uri->extension('html');
        $ajax = ($this->format === 'json');

        $this->params = [
            'ajax' => $ajax,
            'location' => $this->resource,
            'method' => $this->method,
            'format' => $this->format,
            'params' => $request->post->getJsonArray('params')
        ];

        $this->container['ajax_suffix'] = '.json';

        $nonce = Utils::getNonce('Genesis-admin');
        $this->container['base_url'] = $plugin->base;
        $this->container['ajax_nonce'] = $nonce;
        if ($base) {
            $this->container['routes'] = [
                '1' => "{$base}/{$theme}/%s?nonce={$nonce}",
                'themes' => '/themes',
                'picker/layouts' => "{$base}/{$theme}/layouts?nonce={$nonce}",
            ];
        } else {
            $this->container['routes'] = [
                '1' => "/%s?nonce={$nonce}",
                'themes' => '/themes',
                'picker/layouts' => "/layouts?nonce={$nonce}",
            ];
        }
    }

    /**
     * @param string|null $theme
     * @return $this
     */
    public function setTheme(&$theme)
    {
        $path = "themes://{$theme}";

        if (!$theme || !is_file("{$path}/genesis/theme.yaml") || !is_file("{$path}/theme.php")) {
            $theme = null;
            /** @var Streams $streams */
            $streams = $this->container['streams'];
            $streams->register();

            /** @var UniformResourceLocator $locator */
            $locator = $this->container['locator'];

            /** @var Config $global */
            $global = $this->container['global'];

            CompiledYamlFile::$defaultCachePath = $locator->findResource('genesis-cache://theme/compiled/yaml', true, true);
            CompiledYamlFile::$defaultCaching = $global->get('compile_yaml', 1);
        } else {
            /** @var GravConfig $config */
            $config = Grav::instance()['config'];
            $config->set('system.pages.theme', $theme);
        }

        return $this;
    }

    /**
     * @return bool
     */
    protected function checkSecurityToken()
    {
        /** @var Request $request */
        $request = $this->container['request'];
        $nonce = $request->get->get('nonce');

        return isset($nonce) && Utils::verifyNonce($nonce, 'Genesis-admin');
    }

    /**
     * @param Response $response
     * @return ResponseInterface
     */
    protected function send(Response $response)
    {
        // Add missing translations to debugbar.
//        if (\GENESIS_DEBUGGER) {
//            Debugger::addCollector(new ConfigCollector(Genesis::instance()['translator']->untranslated(), 'Untranslated'));
//        }

       $headers = [
           'Content-Type' => "{$response->mimeType}; charset={$response->charset}"
       ] + $response->getHeaders();
       if ($response instanceof JsonResponse) {
           $headers['expires'] = 'Wed, 17 Aug 2005 00:00:00 GMT';
           $headers['Last-Modified'] = gmdate('D, d M Y H:i:s') . ' GMT';
           $headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0';
           $headers['Pragma'] = 'no-cache';
       }

        $resp = new \Grav\Framework\Psr7\Response($response->getStatusCode(), $headers, (string)$response);
        if ($response instanceof JsonResponse) {
            $grav = Grav::instance();
            $grav->close($resp);
        }

        return $resp;
    }
}
