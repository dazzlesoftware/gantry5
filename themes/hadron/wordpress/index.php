<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Genesis\Component\Config\Config;
use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Timber\Timber;

/*
 * The main template file
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists
 */

$genesis = Genesis::instance();

/** @var Theme $theme */
$theme  = $genesis['theme'];

/** @var Config $config */
$config = $genesis['config'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

// Genesis applies optional blog category filters without replacing the global query.
$context['posts']      = $theme->getPosts();
$context['pagination'] = $context['posts']->pagination();

$templates = ['index.html.twig'];

if (is_home()) {
    array_unshift($templates, 'home.html.twig');
}

Timber::render($templates, $context);
