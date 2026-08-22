<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Base;

use Genesis\Component\Theme\AbstractTheme;
use Genesis\Component\Theme\ThemeTrait;

/**
 * @deprecated 5.1.5
 */
abstract class Theme extends AbstractTheme
{
    use ThemeTrait;
}
