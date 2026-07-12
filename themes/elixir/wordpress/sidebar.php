<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Timber\Timber;

/*
 * The Template for displaying sidebar
 */

Timber::render(['partials/sidebar.html.twig'], isset($context) ? $context : []);
