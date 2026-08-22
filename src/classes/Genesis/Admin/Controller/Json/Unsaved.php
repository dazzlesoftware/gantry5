<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Json;

use Genesis\Component\Admin\JsonController;
use Genesis\Component\Response\JsonResponse;

/**
 * Class Unsaved
 * @package Genesis\Admin\Controller\Json
 */
class Unsaved extends JsonController
{
    /** @var array */
    protected array $httpVerbs = [
        'GET' => [
            '/' => 'index'
        ]
    ];

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $response = ['html' => $this->render('@genesis-admin/ajax/unsaved.html.twig')];

        return new JsonResponse($response);
    }
}
