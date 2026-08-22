<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Controller;

use Genesis\Component\Response\JsonResponse;

/**
 * Class JsonController
 * @package Genesis\Component\Controller
 */
abstract class JsonController extends BaseController
{
    /**
     * Execute controller and returns JsonResponse object.
     *
     * @param string $method
     * @param array $path
     * @param array $params
     * @return JsonResponse
     * @throws \RuntimeException
     */
    public function execute(string $method, array $path, array $params): JsonResponse
    {
        $response = parent::execute($method, $path, $params);

        if (!$response instanceof JsonResponse) {
            $response = new JsonResponse($response);
        }

        return $response;
    }
}
