<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html;

use Genesis\Component\Admin\HtmlController;
use Genesis\Component\Response\JsonResponse;
use Genesis\Component\Filesystem\Folder;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Cache
 * @package Genesis\Admin\Controller\Html
 */
class Cache extends HtmlController
{
    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        Folder::delete($locator('genesis-cache://theme'), false);
        Folder::delete($locator('genesis-cache://admin'), false);

        // Make sure that PHP has the latest data of the files.
        clearstatcache();

        return new JsonResponse(['html' => 'Cache was successfully cleared', 'title' => 'Cache Cleared']);
    }
}
