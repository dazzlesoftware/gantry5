<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Theme\ThemeInstaller as AbstractInstaller;

/**
 * Class ThemeInstaller
 * @package Genesis\Framework
 */
class ThemeInstaller extends AbstractInstaller
{
    /** @var bool */
    public bool $initialized = true;

    /**
     * @return string
     */
    public function getPath(): string
    {
        return \get_theme_root() . '/' . $this->name;
    }

    public function createSampleData(): void
    {
        // TODO: Create menus etc.
    }
}
