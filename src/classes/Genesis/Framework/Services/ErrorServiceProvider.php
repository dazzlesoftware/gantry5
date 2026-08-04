<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Services;

use Genesis\Component\Whoops\SystemFacade;
use Genesis\Debugger;
use Genesis\Framework\Platform;
use Genesis\Framework\Request;
use Pimple\Container;
use Pimple\ServiceProviderInterface;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Whoops\Handler\JsonResponseHandler;
use Whoops\Handler\PrettyPageHandler;
use Whoops\Run;

/**
 * Class ErrorServiceProvider
 * @package Genesis\Framework\Services
 */
class ErrorServiceProvider implements ServiceProviderInterface
{
    /** @var string */
    protected $format;

    /**
     * ErrorServiceProvider constructor.
     * @param string $format
     */
    public function __construct($format = 'html')
    {
        $this->format = $format;
    }

    /**
     * @param Container $container
     */
    public function register(Container $container)
    {
        /** @var UniformResourceLocator $locator */
        $locator = $container['locator'];

        /** @var Platform $platform */
        $platform = $container['platform'];

        // Setup Whoops-based error handler
        $system = new SystemFacade($platform->errorHandlerPaths());
        $errors = new Run($system);

        $error_page = new PrettyPageHandler();
        $error_page->setPageTitle('Crikey! There was an error...');
        $error_page->setEditor('sublime');
        foreach ($locator->findResources('genesis-assets://css/whoops.css') as $path) {
            $error_page->addResourcePath(dirname($path));
        }
        $error_page->addCustomCss('whoops.css');

        $errors->pushHandler($error_page);

        // Go through Genesis's own Request abstraction rather than $_SERVER / Whoops's
        // Misc::isAjaxRequest() directly -- some hosts (e.g. phpBB) replace the raw superglobals
        // with guarded objects that trigger a fatal error on any direct access outside of their
        // own request abstraction, which Request's platform-specific implementation already
        // knows how to read safely.
        /** @var Request $request */
        $request = $container['request'];
        $accept = (string) $request->server['HTTP_ACCEPT'];
        $requestedWith = (string) $request->server['HTTP_X_REQUESTED_WITH'];

        $jsonRequest = $this->format === 'json' || $accept === 'application/json';
        $ajaxRequest = strtolower($requestedWith) === 'xmlhttprequest';

        if ($ajaxRequest || $jsonRequest) {
            $json_handler = new JsonResponseHandler();
            //$json_handler->setJsonApi(true);

            $errors->pushHandler($json_handler);
        }

        $errors->register();

        $container['errors'] = $errors;

        if (\GENESIS_DEBUGGER) {
            Debugger::setErrorHandler();
        }
    }
}
