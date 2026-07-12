<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Controller;

use Gantry\Component\Response\HtmlResponse;
use Gantry\Component\Response\Response;

/**
 * Class HtmlController
 * @package Gantry\Component\Controller
 */
abstract class HtmlController extends BaseController
{
    /**
     * Execute controller and returns Response object, defaulting to HtmlResponse.
     *
     * @param string $method
     * @param array $path
     * @param array $params
     * @return Response
     * @throws \RuntimeException
     */
    public function execute($method, array $path, array $params)
    {
        $response = parent::execute($method, $path, $params);

        if (!$response instanceof Response) {
            $response = new HtmlResponse($response);
        }

        return $response;
    }
}
