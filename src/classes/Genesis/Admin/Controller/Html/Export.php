<?php
declare(strict_types=1);

// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_readfile,WordPress.WP.AlternativeFunctions.unlink_unlink

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Html;

use Genesis\Component\Admin\HtmlController;
use Genesis\Framework\Exporter;
use Joomla\CMS\Version;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Symfony\Component\Yaml\Yaml;

/**
 * Class Export
 * @package Genesis\Admin\Controller\Html
 */
class Export extends HtmlController
{
    /**
     * @return void
     */
    public function index(): never
    {
        if (!class_exists('Genesis\Framework\Exporter')) {
            $this->forbidden();
        }

        if (!class_exists('ZipArchive')) {
            throw new \RuntimeException('Please enable PHP ZIP extension to use this feature.');
        }

        $exporter = new Exporter;
        $exported = $exporter->all();

        $zipname = $exported['export']['theme']['name'] . '-export.zip';
        $tmpname = tempnam(sys_get_temp_dir(), 'zip') . '.zip';

        $zip = new \ZipArchive();
        $zip->open($tmpname, \ZipArchive::CREATE);

        $zip->addFromString("export.yaml", Yaml::dump($exported['export'], 10, 2));
        unset($exported['export']);

        foreach ($exported['positions'] as $key => $position) {
            foreach ($position['items'] as $module => $data) {
                $zip->addFromString("positions/{$key}/{$module}.yaml", Yaml::dump($data, 10, 2));
            }

            $position['ordering'] = array_keys($position['items']);
            unset($position['items']);

            $zip->addFromString("positions/{$key}.yaml", Yaml::dump($position, 10, 2));
        }

        foreach ($exported['outlines'] as $outline => &$data) {
            if (!empty($data['config'])) {
                foreach ($data['config'] as $name => $config) {
                    if (in_array($name, ['particles', 'page'])) {
                        foreach ($config as $sub => $subconfig) {
                            $zip->addFromString("outlines/{$outline}/{$name}/{$sub}.yaml", Yaml::dump($subconfig, 10, 2));
                        }
                    } else {
                        $zip->addFromString("outlines/{$outline}/{$name}.yaml", Yaml::dump($config, 10, 2));
                    }
                }
            }
            unset($data['config']);
        }
        unset($data);

        $zip->addFromString("outlines/outlines.yaml", Yaml::dump($exported['outlines'], 10, 2));

        foreach ($exported['menus'] as $menu => $data) {
            $zip->addFromString("menus/{$menu}.yaml", Yaml::dump($data, 10, 2));
        }

        foreach ($exported['content'] as $id => $data) {
            $zip->addFromString("content/{$id}.yaml", Yaml::dump($data, 10, 2));
        }

        if (!empty($exported['categories'])) {
            $zip->addFromString("content/categories.yaml", Yaml::dump($exported['categories'], 10, 2));
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->container['locator'];

        foreach ($exported['files'] as $stream => $files) {
            foreach ($files as $path => $uri) {
                $filename = $locator->findResource($uri);

                if (file_exists($filename)) {
                    $zip->addFile($filename, "files/{$stream}/{$path}");
                }
            }

        }

        if (!empty($exported['joomla']['mysql'])) {
            $zip->addFromString('joomla/mysql/custom.sql', $exported['joomla']['mysql']);
        }

        $zip->close();

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename=' . $zipname);
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($tmpname));

        @ob_end_clean();
        flush();

        readfile($tmpname);
        unlink($tmpname);

        exit;
    }
}
