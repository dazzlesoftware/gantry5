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

        $fontAwesomeEnabled = (bool) $config->get('page.fontawesome.enable', 1);
        $lucideEnabled = (bool) $config->get('page.lucide.enable', 1);
        $tablerEnabled = (bool) $config->get('page.tabler.enable', 1);

        $options = [
            'fw' => 'Fixed Width',
            'spin' => 'Spinning',
            'larger' => ['' => '- Size - ', 'lg' => 'Large', '2x' => '2x', '3x' => '3x', '4x' => '4x', '5x' => '5x'],
            'rotation' => ['' => '- Rotation -', 'flip-horizontal' => 'Horizontal Flip', 'flip-vertical' => 'Vertical Flip', 'rotate-90' => 'Rotate 90°', 'rotate-180' => 'Rotate 180°', 'rotate-270' => 'Rotate 270°']
        ];

        $icons = [];
        $libraries = [];
        $styles = [];

        if ($fontAwesomeEnabled) {
            $version = $config->get('page.fontawesome.version', $config->get('page.fontawesome.default_version', 'fa7css'));
            if ($version === 'fa5css' || $version === 'fa5js') {
                $list = include __DIR__ . '/Icons/FontAwesome5.php';
            } elseif ($version === 'fa6css' || $version === 'fa6js') {
                $list = include __DIR__ . '/Icons/FontAwesome6.php';
            } else {
                $list = include __DIR__ . '/Icons/FontAwesome7.php';
            }

            $list = array_unique($list);
            sort($list);
            foreach ($list as $icon) {
                $prefix = strtok($icon, ' ');
                $iconStyles = ['fab' => 'brands', 'far' => 'regular', 'fas' => 'solid'];
                $icons[] = [
                    'value' => $icon,
                    'library' => 'font-awesome',
                    'style' => $iconStyles[$prefix] ?? 'other'
                ];
            }
            $libraries['font-awesome'] = 'Font Awesome';
            $styles += ['solid' => 'Solid', 'regular' => 'Regular', 'brands' => 'Brands'];
        }

        if ($lucideEnabled) {
            $lucide = include __DIR__ . '/Icons/Lucide.php';
            foreach ($lucide as $name) {
                $icons[] = [
                    'value' => 'lucide icon-lucide-' . $name,
                    'library' => 'lucide',
                    'style' => 'outline'
                ];
            }
            $libraries['lucide'] = 'Lucide';
            $styles['outline'] = 'Outline';
        }

        if ($tablerEnabled) {
            $tabler = include __DIR__ . '/Icons/Tabler.php';
            foreach ($tabler['outline'] as $name) {
                $icons[] = [
                    'value' => 'ti ti-' . $name,
                    'library' => 'tabler',
                    'style' => 'outline'
                ];
            }
            foreach ($tabler['filled'] as $name) {
                $icons[] = [
                    'value' => 'ti-filled ti-' . $name,
                    'library' => 'tabler',
                    'style' => 'filled'
                ];
            }
            $libraries['tabler'] = 'Tabler Icons';
            $styles['outline'] = 'Outline';
            $styles['filled'] = 'Filled';
        }

        $response['html'] = $this->render('@genesis-admin/ajax/icons.html.twig', [
            'icons' => $icons,
            'libraries' => $libraries,
            'styles' => $styles,
            'options' => $options,
            'total' => count($icons)
        ]);

        return new JsonResponse($response);
    }
}
