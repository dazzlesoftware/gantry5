<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework\Services;

use Gantry\Component\Whoops\SystemFacade;
use Gantry\Debugger;
use Gantry\Framework\Platform;
use Pimple\Container;
use Pimple\ServiceProviderInterface;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Whoops\Handler\JsonResponseHandler;
use Whoops\Handler\PrettyPageHandler;
use Whoops\Run;
use Whoops\Util\Misc;

/**
 * Class ErrorServiceProvider
 * @package Gantry\Framework\Services
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
        foreach ($locator->findResources('gantry-assets://css/whoops.css') as $path) {
            $error_page->addResourcePath(dirname($path));
        }
        $error_page->addCustomCss('whoops.css');

        $errors->pushHandler($error_page);

        $jsonRequest = $this->format === 'json' || ($_SERVER && isset($_SERVER['HTTP_ACCEPT']) && $_SERVER['HTTP_ACCEPT'] === 'application/json');
        if (Misc::isAjaxRequest() || $jsonRequest) {
            $json_handler = new JsonResponseHandler();
            //$json_handler->setJsonApi(true);

            $errors->pushHandler($json_handler);
        }

        $errors->register();

        $container['errors'] = $errors;

        if (\GANTRY_DEBUGGER) {
            Debugger::setErrorHandler();
        }
    }
}
