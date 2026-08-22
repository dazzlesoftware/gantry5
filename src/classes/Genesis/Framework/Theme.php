<?php

declare(strict_types=1);



/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */



namespace Genesis\Framework;



if ( ! defined( 'ABSPATH' ) ) {

    if ( ! defined( '_JEXEC' ) && ! defined( 'GRAV_ROOT' ) && ! defined( 'IN_PHPBB' ) ) {

        exit;

    }

}



use Genesis\Component\Theme\AbstractTheme;

use Genesis\Component\Theme\ThemeTrait;



/**

 * Class Theme

 * @package Genesis\Framework

 */

abstract class Theme extends AbstractTheme

{

    use ThemeTrait;

}
