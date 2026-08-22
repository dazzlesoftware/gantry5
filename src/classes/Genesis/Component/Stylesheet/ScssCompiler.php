<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,Squiz.PHP.DiscouragedFunctions.Discouraged,WordPress.WP.AlternativeFunctions.file_system_operations_fopen,PluginCheck.CodeAnalysis.Heredoc.NotAllowed,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Stylesheet;

use Genesis\Component\Stylesheet\Scss\Functions;
use Genesis\Debugger;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Grav\Common\Plugins;
use ScssPhp\ScssPhp\CompilationResult;
use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\Exception\SassException;
use DazzleSoftware\Toolbox\File\File;
use DazzleSoftware\Toolbox\File\JsonFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use ScssPhp\ScssPhp\Logger\StreamLogger;
use ScssPhp\ScssPhp\OutputStyle;
use ScssPhp\ScssPhp\ValueConverter;
use ScssPhp\ScssPhp\Version;

/**
 * Class ScssCompiler
 * @package Genesis\Component\Stylesheet
 */
class ScssCompiler extends CssCompiler
{
    /** @var string */
    public string $type = 'scss';
    /** @var string */
    public string $name = 'SCSS';

    /** @var CompilationResult|null */
    protected ?CompilationResult $result = null;
    /** @var array */
    protected array $includedFiles = [];
    /** @var Functions */
    protected Functions $functions;

    /**
     * Constructor.
     */
    public function __construct()
    {
        if (!class_exists(Compiler::class, false)) {
            // Do not use SCSS compiler from Grav Admin.
            $adminPlugin = class_exists(Plugins::class) ? Plugins::getPlugin('admin') : null;
            if ($adminPlugin && method_exists($adminPlugin, 'getAutoloader')) {
                $adminLoader = $adminPlugin->getAutoloader();
                if ($adminLoader) {
                    $adminLoader->setPsr4('ScssPhp\\ScssPhp\\', '');
                }
            }
        }

        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage('Using SCSS PHP library v' . Version::VERSION);
        }

        parent::__construct();

        $this->functions = new Functions();
    }

    /**
     * @return $this
     */
    public function reset(): static
    {
        $this->functions->reset();

        return $this;
    }

    public function resetCache(): static
    {
        $this->result = null;
        $this->includedFiles = [];

        return $this;
    }

    /**
     * @param string $in    Filename without path or extension.
     * @return bool         True if the output file was saved.
     * @throws \RuntimeException
     */
    public function compileFile(string $in): bool
    {
        // Buy some extra time as compilation may take a lot of time in shared environments.
        @set_time_limit(30);
        @set_time_limit(60);
        @set_time_limit(90);
        @set_time_limit(120);

        $this->result = null;
        $this->includedFiles = [];

        $genesis = Genesis::instance();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $out = $this->getCssUrl($in);
        /** @var string $path */
        $path = $locator->findResource($out, true, true);
        $file = File::instance($path);

        // Attempt to lock the file for writing.
        try {
            $file->lock(false);
        } catch (\Exception $e) {
            // Another process has locked the file; we will check this in a bit.
        }

        if ($file->locked() === false) {
            // File was already locked by another process, lets avoid compiling the same file twice.
            return false;
        }

        $logfile = fopen('php://memory', 'rb+');
        $logger = new StreamLogger($logfile, true);

        $compiler = $this->getCompiler();
        $compiler->setLogger($logger);

        // Set the lookup paths.
        $this->functions->setBasePath($path);
        $compiler->setImportPaths($this->realPaths);

        // Run the compiler.
        $compiler->addVariables($this->getVariables(true));
        $scss = '$output-bourbon-deprecation-warnings: false;' . "\n" . '@import "' . $in . '.scss"';
        try {
            $this->result = $compiler->compileString($scss);
            $css = $this->result->getCss();
        } catch (SassException $e) {
            throw new \RuntimeException("ERROR: CSS Compilation on file '{$in}.scss' failed on error: {$e->getMessage()}", 500, $e);
        } catch (\Exception $e) {
            throw new \RuntimeException("ERROR: CSS Compilation on file '{$in}.scss' failed on fatal error: {$e->getMessage()}", 500, $e);
        }
        if (strpos($css, $scss) === 0) {
            $css = '/* ' . $scss . ' */';
        }

        // Extract map from css and save it as separate file.
        $sourceMapMarker = '/*# sourceMappingURL=';
        $pos = strrpos($css, $sourceMapMarker);
        if ($pos !== false) {
            $sourceMapStart = $pos + strlen($sourceMapMarker);
            $sourceMapEnd = strpos($css, ' */', $sourceMapStart);
            $sourceMapUrl = $sourceMapEnd !== false
                ? trim(substr($css, $sourceMapStart, $sourceMapEnd - $sourceMapStart))
                : '';
            $separator = strpos($sourceMapUrl, ',');
            $metadata = $separator !== false ? substr($sourceMapUrl, 0, $separator) : '';
            $sourceMapData = $separator !== false ? substr($sourceMapUrl, $separator + 1) : '';

            if (str_contains($metadata, ';base64')) {
                $sourceMapData = base64_decode($sourceMapData, true) ?: '';
            } else {
                $sourceMapData = rawurldecode($sourceMapData);
            }

            $map = json_decode($sourceMapData, true);
            if (!is_array($map)) {
                $map = [];
            }

            /** @var Document $document */
            $document = $genesis['document'];

            $sources = isset($map['sources']) && is_array($map['sources']) ? $map['sources'] : [];
            foreach ($sources as &$source) {
                $source = $document::url($source, false, -1);
            }
            unset($source);
            $map['sources'] = $sources;

            if ($map) {
                $mapFile = JsonFile::instance($path . '.map');
                $mapFile->save($map);
                $mapFile->free();

                $css = substr($css, 0, $pos) . '/*# sourceMappingURL=' . Genesis::basename($out) . '.map */';
            }
        }

        $warnings = preg_replace('/\n +(\w)/mu', '\1', stream_get_contents($logfile, -1, 0));
        if ($warnings) {
            $warnings = explode("\n\n", $warnings);
            foreach ($warnings as $i => $warning) {
                if ($warning === '') {
                    unset($warnings[$i]);
                    continue;
                }
                if (\GENESIS_DEBUGGER) {
                    Debugger::addMessage("{$in}: {$warning}", 'warning');
                }
            }

            if ($warnings) {
                $this->warnings[$in] = array_values($warnings);
            }
        }

        if (!$this->production) {
            $warning = <<<WARN
/* GENESIS DEVELOPMENT MODE ENABLED.
 *
 * WARNING: This file is automatically generated by Genesis. Any modifications to this file will be lost!
 *
 * For more information on modifying CSS, please read:
 *
 * https://codex.dazzlecms.org/configure/styles
 * https://codex.dazzlecms.org/tutorials/adding-a-custom-style-sheet
 */
WARN;
            $css = $warning . "\n\n" . $css;
        } else {
            // Compressed scssphp output can start with a UTF-8 BOM when the
            // stylesheet contains non-ASCII characters. The checksum must be
            // the first 36 bytes for production cache validation, so leaving
            // the BOM in place after the checksum makes it part of the first
            // selector and corrupts that rule (for example, `.g-content`).
            if (strncmp($css, "\xEF\xBB\xBF", 3) === 0) {
                $css = substr($css, 3);
            }

            $css = "{$this->checksum()}\n{$css}";
        }

        $file->save($css);
        $file->unlock();
        $file->free();

        $this->createMeta($out, md5($css));

        $this->reset();

        return true;
    }

    /**
     * @param string   $name       Name of function to register to the compiler.
     * @param callable $callback   Function to run when called by the compiler.
     * @return $this
     */
    public function registerFunction(string $name, callable $callback): static
    {
        $this->functions->registerFunction($name, $callback);

        return $this;
    }

    /**
     * @param string $name       Name of function to unregister.
     * @return $this
     */
    public function unregisterFunction(string $name): static
    {
        $this->functions->unregisterFunction($name);

        return $this;
    }

    /**
     * Resolve an SCSS import for cache and dependency checks.
     *
     * scssphp 2.x resolves imports through the filesystem paths configured in
     * compileFile(). Genesis still needs this method to detect missing or
     * changed imports before deciding whether a stylesheet must be rebuilt.
     *
     * @param string $url
     * @return null|string
     */
    public function findImport(string $url): ?string
    {
        // Leave plain CSS and external URLs to the browser.
        if (preg_match('/\.css$|^https?:\/\//', $url)) {
            return null;
        }

        return $this->tryImport($url);
    }

    /**
     * Search configured SCSS paths for a normal file or Sass partial.
     *
     * @param string $url
     * @return null|string
     */
    protected function tryImport(string $url): ?string
    {
        $url = str_replace('\\', '/', $url);
        $files = [$url, preg_replace('/[^\/]+$/', '_\0', $url)];

        foreach ($this->realPaths as $base) {
            foreach ($files as $file) {
                if (!preg_match('/\.scss$/', $file)) {
                    $file .= '.scss';
                }

                $filepath = rtrim($base, '/\\') . '/' . $file;
                if (is_file($filepath)) {
                    return $filepath;
                }
            }
        }

        return null;
    }

    /**
     * @param bool $encoded
     * @return array
     */
    public function getVariables(bool $encoded = false): array
    {
        $variables = $this->variables;
        if (!$encoded) {
            return $variables;
        }

        $list = [];
        foreach($variables as $key => $value) {
            $list[$key] = ValueConverter::parseValue($value);
        }

        return $list;
    }

    /**
     * @return Compiler
     */
    protected function getCompiler(): Compiler
    {
        $compiler = new Compiler();

        $this->functions->setCompiler($compiler);

        if ($this->production) {
            $compiler->setOutputStyle(OutputStyle::COMPRESSED);
        } else {
            $compiler->setOutputStyle(OutputStyle::EXPANDED);
            $compiler->setSourceMap(Compiler::SOURCE_MAP_INLINE);
            // TODO: Look if we can / should use option to let compiler to save the source map.
            $compiler->setSourceMapOptions([
                'sourceMapRootpath' => '',
                'sourceMapBasepath' => GENESIS_ROOT,
            ]);
        }

        return $compiler;
    }

    /**
     * @param array $list
     */
    protected function doSetFonts(array $list): void
    {
        $this->functions->setFonts($list);
    }

    /**
     * @return array
     */
    protected function getIncludedFiles(): array
    {
        if ($this->result) {
            $list = [];
            foreach ($this->result->getIncludedFiles() as $filename) {
                $time = filemtime($filename);
                // Convert real paths back to relative paths.
                foreach ($this->realPaths as $base) {
                    if (strpos($filename, $base) === 0) {
                        $filename = substr($filename, strlen($base) + 1);
                        break;
                    }
                }
                $list[$filename] = $time;
            }
        } else {
            $list = $this->includedFiles;
        }

        return $list;
    }
}
