<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Controller;

use Genesis\Component\Response\HtmlResponse;
use Genesis\Component\Response\Response;

/**
 * Class HtmlController
 * @package Genesis\Component\Controller
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
    public function execute(string $method, array $path, array $params): Response
    {
        $response = parent::execute($method, $path, $params);

        if (!$response instanceof Response) {
            $response = new HtmlResponse($response);
        }

        return $response;
    }
}
