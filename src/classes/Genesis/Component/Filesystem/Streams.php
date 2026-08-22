<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Filesystem;

use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use DazzleSoftware\Toolbox\StreamWrapper\ReadOnlyStream;
use DazzleSoftware\Toolbox\StreamWrapper\Stream;

/**
 * Class Streams
 * @package Genesis\Component\Filesystem
 */
class Streams
{
    /** @var array */
    protected array $schemes = [];

    /** @var array */
    protected ?array $registered = null;

    /** @var UniformResourceLocator */
    protected ?UniformResourceLocator $locator = null;

    /**
     * Streams constructor.
     * @param UniformResourceLocator|null $locator
     */
    public function __construct(?UniformResourceLocator $locator = null)
    {
        if ($locator) {
            $this->setLocator($locator);
        }
    }

    /**
     * @param UniformResourceLocator $locator
     */
    public function setLocator(UniformResourceLocator $locator): void
    {
        $this->locator = $locator;

        // Set locator to both streams.
        Stream::setLocator($locator);
        ReadOnlyStream::setLocator($locator);
    }

    /**
     * @return UniformResourceLocator
     */
    public function getLocator(): ?UniformResourceLocator
    {
        return $this->locator;
    }

    /**
     * @param array $schemes
     */
    public function add(array $schemes): void
    {
        foreach ($schemes as $scheme => $config) {
            $force = !empty($config['force']);

            if (isset($config['paths'])) {
                $this->locator->addPath($scheme, '', $config['paths'], false, $force);
            }
            if (isset($config['prefixes'])) {
                foreach ($config['prefixes'] as $prefix => $paths) {
                    $this->locator->addPath($scheme, $prefix, $paths, false, $force);
                }
            }
            $type = !empty($config['type']) ? $config['type'] : 'ReadOnlyStream';
            if ($type[0] !== '\\') {
                $type = '\\DazzleSoftware\\Toolbox\\StreamWrapper\\' . $type;
            }
            $this->schemes[$scheme] = $type;

            if (isset($this->registered)) {
                $this->doRegister($scheme, $type);
            }
        }
    }

    public function register(): void
    {
        $this->registered = stream_get_wrappers();

        foreach ($this->schemes as $scheme => $type) {
            $this->doRegister($scheme, $type);
        }
    }

    /**
     * @param string $scheme
     * @param string $type
     */
    protected function doRegister(string $scheme, string $type): void
    {
        if (in_array($scheme, $this->registered, true)) {
            stream_wrapper_unregister($scheme);
        }

        if (!stream_wrapper_register($scheme, $type)) {
            throw new \InvalidArgumentException("Stream `{$scheme}` ({$type}) could not be initialized.");
        }
    }
}
