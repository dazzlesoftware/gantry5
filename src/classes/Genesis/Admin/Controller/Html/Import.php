<?php
declare(strict_types=1);

// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotValidated,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html;

use Genesis\Component\Admin\HtmlController;
use Genesis\Component\Filesystem\Folder;
use Genesis\Framework\Importer;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Symfony\Component\Yaml\Yaml;

/**
 * Class Import
 * @package Genesis\Admin\Controller\Html
 */
class Import extends HtmlController
{
    protected array $httpVerbs = [
        'GET' => [
            '/'                 => 'index',
        ],
        'POST' => [
            '/'                 => 'import',
        ]
    ];

    /**
     * @return string
     */
    public function index(): string
    {
        return $this->render('@genesis-admin/pages/import/import.html.twig', $this->params);
    }

    /**
     * @return string
     */
    public function import(): string
    {
        \check_admin_referer('genesis-layout-manager');

        if (!isset($_FILES['file']) || !is_array($_FILES['file']) || !isset($_FILES['file']['error']) || is_array($_FILES['file']['error'])) {
            throw new \RuntimeException('No file sent', 400);
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- The Genesis admin router already requires the matching nonce.
        $upload = $_FILES['file'];

        switch ($upload['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new \RuntimeException('No file sent', 400);
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new \RuntimeException('Exceeded filesize limit.', 400);
            default:
                throw new \RuntimeException('Unknown upload error', 400);
        }

        if (empty($upload['tmp_name']) || !is_string($upload['tmp_name'])) {
            throw new \RuntimeException('No file sent', 400);
        }

        $filename = $upload['tmp_name'];

        if (!is_uploaded_file($filename)) {
            throw new \RuntimeException('No file sent', 400);
        }

        $zip = new \ZipArchive;
        if ($zip->open($filename) !== true || !($export = Yaml::parse($zip->getFromName('export.yaml'))) || !isset($export['genesis'])) {
            throw new \RuntimeException('Uploaded file is not Genesis export file', 400);
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        $folder = $locator->findResource('genesis-cache://import', true, true);
        if (!is_string($folder) || $folder === '') {
            throw new \RuntimeException('Unable to create the import cache folder', 500);
        }
        if (is_dir($folder)) Folder::delete($folder);
        $zip->extractTo($folder);
        $zip->close();

        $importer = new Importer($folder);
        $importer->all();

        if (is_dir($folder)) Folder::delete($folder);

        $this->params['success'] = true;

        return $this->render('@genesis-admin/pages/import/import.html.twig', $this->params);
    }
}
