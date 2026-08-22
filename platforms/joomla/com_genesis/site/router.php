<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die ();

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Component\Router\RouterBase;
use Joomla\CMS\Factory;

/**
 * Class GenesisRouter
 */
class GenesisRouter extends RouterBase
{
    /**
     * Build the route for the Genesis component
     *
     * @param   array  &$query  An array of URL arguments
     * @return  array  The URL arguments to use to assemble the subsequent URL.
     */
    public function build(array &$query): array
    {
        $segments = array();

        unset($query['view']);

        return $segments;
    }

    /**
     * Parse the segments of a URL.
     *
     * @param   array  &$segments  The segments of the URL to parse.
     * @return  array  The URL attributes to be used by the application.
     */
    public function parse(array &$segments): array
    {
        if ($segments) {
            return array('genesis_not_found' => 1);
        }

        return array();
    }
}

/**
 * Content router functions
 *
 * These functions are proxys for the new router interface
 * for old SEF extensions.
 *
 * @param   array  &$query  An array of URL arguments
 *
 * @return  array  The URL arguments to use to assemble the subsequent URL.
 */
function GenesisBuildRoute(array &$query): array
{
    /** @var CMSApplication $app */
	$app = Factory::getApplication();
	$router = new GenesisRouter($app, $app->getMenu());

	return $router->build($query);
}

/**
 * Parse the segments of a URL.
 *
 * This function is a proxy for the new router interface
 * for old SEF extensions.
 *
 * @param   array  $segments  The segments of the URL to parse.
 * @return  array  The URL attributes to be used by the application.
 */
function GenesisParseRoute(array $segments): array
{
    /** @var CMSApplication $app */
    $app = Factory::getApplication();
	$router = new GenesisRouter($app, $app->getMenu());

	return $router->parse($segments);
}
