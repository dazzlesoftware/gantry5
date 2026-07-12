<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Gantry\Framework\Gantry;
use Gantry\Framework\Theme;
use Timber\Timber;

/*
 * Search results page
 */

$gantry = Gantry::instance();

/** @var Theme $theme */
$theme  = $gantry['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$context['title'] = __('Search results for:', $context['textdomain']) . ' ' . get_search_query();
$context['posts'] = Timber::get_posts();

$templates = ['search.html.twig', 'archive.html.twig', 'index.html.twig'];

Timber::render($templates, $context);
