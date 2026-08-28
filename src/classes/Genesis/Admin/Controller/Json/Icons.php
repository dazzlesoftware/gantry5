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
use Genesis\Component\Config\Config;
use Genesis\Component\Response\JsonResponse;

/**
 * Class Icons
 * @package Genesis\Admin\Controller\Json
 */
class Icons extends JsonController
{
    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $response = [];

        $this->container['configuration'] = 'default';

        /** @var Config $config */
        $config = $this->container['config'];

        $version = $config->get('page.fontawesome.version', $config->get('page.fontawesome.default_version', 'fa7css'));
        if ($version === 'fa5css' || $version === 'fa5js') {
            $list = include __DIR__ . '/Icons/FontAwesome5.php';
        } elseif ($version === 'fa6css' || $version === 'fa6js') {
            $list = include __DIR__ . '/Icons/FontAwesome6.php';
        } elseif ($version === 'fa7css' || $version === 'fa7js') {
            $list = include __DIR__ . '/Icons/FontAwesome7.php';
        } else {
            $list = include __DIR__ . '/Icons/FontAwesome7.php';
        }

        $options = [
            'fw' => 'Fixed Width',
            'spin' => 'Spinning',
            'larger' => ['' => '- Size - ', 'lg' => 'Large', '2x' => '2x', '3x' => '3x', '4x' => '4x', '5x' => '5x'],
            'rotation' => ['' => '- Rotation -', 'flip-horizontal' => 'Horizontal Flip', 'flip-vertical' => 'Vertical Flip', 'rotate-90' => 'Rotate 90°', 'rotate-180' => 'Rotate 180°', 'rotate-270' => 'Rotate 270°']
        ];

        $list = array_unique($list);
        sort($list);

        $response['html'] = $this->render('@genesis-admin/ajax/icons.html.twig', ['icons' => $list, 'options' => $options, 'total' => count($list)]);

        return new JsonResponse($response);
    }
}
