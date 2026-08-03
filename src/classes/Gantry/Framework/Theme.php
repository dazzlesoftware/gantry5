<?php



/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */



namespace Gantry\Framework;



if ( ! defined( 'ABSPATH' ) ) {

    if ( ! defined( '_JEXEC' ) && ! defined( 'GRAV_ROOT' ) && ! defined( 'IN_PHPBB' ) ) {

        exit;

    }

}



use Gantry\Component\Theme\AbstractTheme;

use Gantry\Component\Theme\ThemeTrait;



/**

 * Class Theme

 * @package Gantry\Framework

 */

abstract class Theme extends AbstractTheme

{

    use ThemeTrait;

}

