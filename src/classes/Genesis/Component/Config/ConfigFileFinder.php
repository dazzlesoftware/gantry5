<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Config;

use Genesis\Component\Filesystem\Folder;

/**
 * The Configuration & Blueprints Finder class.
 */
class ConfigFileFinder
{
    /** @var string */
    protected string $base = '';

    /**
     * @param string $base
     * @return $this
     */
    public function setBase(string $base): static
    {
        $this->base = $base ? "{$base}/" : '';

        return $this;
    }

    /**
     * Return all locations for all the files with a timestamp.
     *
     * @param  array  $paths    List of folders to look from.
     * @param  string $pattern  Pattern to match the file. Pattern will also be removed from the key.
     * @param  int    $levels   Maximum number of recursive directories.
     * @return array
     */
    public function locateFiles(array $paths, string $pattern = '|\.yaml$|', int $levels = -1): array
    {
        $list = [];
        foreach ($paths as $folder) {
            $list += $this->detectRecursive($folder, $pattern, $levels);
        }
        return $list;
    }

    /**
     * Return all locations for all the files with a timestamp.
     *
     * @param  array  $paths    List of folders to look from.
     * @param  string $pattern  Pattern to match the file. Pattern will also be removed from the key.
     * @param  int    $levels   Maximum number of recursive directories.
     * @return array
     */
    public function getFiles(array $paths, string $pattern = '|\.yaml$|', int $levels = -1): array
    {
        $list = [];
        foreach ($paths as $folder) {
            $path = trim(Folder::getRelativePath($folder), '/');

            $files = $this->detectRecursive($folder, $pattern, $levels);

            $list += $files[trim($path, '/')] ?? [];
        }
        return $list;
    }

    /**
     * Return all paths for all the files with a timestamp.
     *
     * @param  array  $paths    List of folders to look from.
     * @param  string $pattern  Pattern to match the file. Pattern will also be removed from the key.
     * @param  int    $levels   Maximum number of recursive directories.
     * @return array
     */
    public function listFiles(array $paths, string $pattern = '|\.yaml$|', int $levels = -1): array
    {
        $list = [[]];
        foreach ($paths as $folder) {
            $list[] = $this->detectAll($folder, $pattern, $levels);
        }

        return array_merge_recursive(...$list);
    }

    /**
     * Find filename from a list of folders.
     *
     * Note: Only finds the last override.
     *
     * @param string $filename
     * @param array $folders
     * @return array
     */
    public function locateFileInFolder(string $filename, array $folders): array
    {
        $list = [];
        foreach ($folders as $folder) {
            $list += $this->detectInFolder($folder, $filename);
        }

        return $list;
    }

    /**
     * Find filename from a list of folders.
     *
     * @param array $folders
     * @param string $filename
     * @return array
     */
    public function locateInFolders(array $folders, ?string $filename = null): array
    {
        $list = [];
        foreach ($folders as $folder) {
            $path = trim(Folder::getRelativePath($folder), '/');
            $list[$path] = $this->detectInFolder($folder, $filename);
        }

        return $list;
    }

    /**
     * Return all existing locations for a single file with a timestamp.
     *
     * @param  array  $paths   Filesystem paths to look up from.
     * @param  string $name    Configuration file to be located.
     * @param  string $ext     File extension (optional, defaults to .yaml).
     * @return array
     */
    public function locateFile(array $paths, string $name, string $ext = '.yaml'): array
    {
        $filename = preg_replace('|[./]+|', '/', $name) . $ext;

        $list = [];
        foreach ($paths as $folder) {
            $path = trim(Folder::getRelativePath($folder), '/');

            if (is_file("{$folder}/{$filename}")) {
                $modified = filemtime("{$folder}/{$filename}");
            } else {
                $modified = 0;
            }
            $basename = $this->base . $name;
            $list[$path] = [$basename => ['file' => "{$path}/{$filename}", 'modified' => $modified]];
        }

        return $list;
    }

    /**
     * Detects all directories with a configuration file and returns them with last modification time.
     *
     * @param  string $folder   Location to look up from.
     * @param  string $pattern  Pattern to match the file. Pattern will also be removed from the key.
     * @param  int    $levels   Maximum number of recursive directories.
     * @return array
     * @internal
     */
    protected function detectRecursive(string $folder, string $pattern, int $levels): array
    {
        $path = trim(Folder::getRelativePath($folder), '/');

        if (is_dir($folder)) {
            // Find all system and user configuration files.
            $options = [
                'levels'  => $levels,
                'compare' => 'Filename',
                'pattern' => $pattern,
                'filters' => [
                    'pre-key' => $this->base,
                    'key' => $pattern,
                    'value' => function (\RecursiveDirectoryIterator $file) use ($path) {
                        return ['file' => "{$path}/{$file->getSubPathname()}", 'modified' => $file->getMTime()];
                    }
                ],
                'key' => 'SubPathname'
            ];

            $list = Folder::all($folder, $options);

            ksort($list);
        } else {
            $list = [];
        }

        return [$path => $list];
    }

    /**
     * Detects all directories with the lookup file and returns them with last modification time.
     *
     * @param  string $folder Location to look up from.
     * @param  string $lookup Filename to be located (defaults to directory name).
     * @return array
     * @internal
     */
    protected function detectInFolder(string $folder, ?string $lookup = null): array
    {
        $folder = rtrim($folder, '/');
        $path = trim(Folder::getRelativePath($folder), '/');
        if ($path === $folder) {
            $base = '';
        } else {
            $base = $path ? substr($folder, 0, -strlen($path)) : $folder . '/';
        }

        $list = [];

        if (is_dir($folder)) {
            $iterator = new \DirectoryIterator($folder);

            /** @var \DirectoryIterator $directory */
            foreach ($iterator as $directory) {
                if (!$directory->isDir() || $directory->isDot()) {
                    continue;
                }

                $name = $directory->getBasename();
                $find = ($lookup ?: $name) . '.yaml';
                $filename = "{$path}/{$name}/{$find}";

                if (file_exists($base . $filename)) {
                    $basename = $this->base . $name;
                    $list[$basename] = ['file' => $filename, 'modified' => filemtime($base . $filename)];
                }
            }
        }

        return $list;
    }

    /**
     * Detects all plugins with a configuration file and returns them with last modification time.
     *
     * @param  string $folder   Location to look up from.
     * @param  string $pattern  Pattern to match the file. Pattern will also be removed from the key.
     * @param  int    $levels   Maximum number of recursive directories.
     * @return array
     * @internal
     */
    protected function detectAll(string $folder, string $pattern, int $levels): array
    {
        $path = trim(Folder::getRelativePath($folder), '/');

        if (is_dir($folder)) {
            // Find all system and user configuration files.
            $options = [
                'levels'  => $levels,
                'compare' => 'Filename',
                'pattern' => $pattern,
                'filters' => [
                    'pre-key' => $this->base,
                    'key' => $pattern,
                    'value' => static function (\RecursiveDirectoryIterator $file) use ($path) {
                        return ["{$path}/{$file->getSubPathname()}" => $file->getMTime()];
                    }
                ],
                'key' => 'SubPathname'
            ];

            $list = Folder::all($folder, $options);

            ksort($list);
        } else {
            $list = [];
        }

        return $list;
    }
}
