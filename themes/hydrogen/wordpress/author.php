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
use Timber\User;

/*
 * The template for displaying Author Archive pages
 */

global $wp_query;

$gantry = Gantry::instance();

/** @var Theme $theme */
$theme  = $gantry['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$context['posts'] = Timber::get_posts();

if (isset($authordata)) {
    $author            = Timber::get_user($authordata->ID);
    $context['author'] = $author;
    $context['title']  = __('Author:', 'g5_hydrogen') . ' ' . $author->name();
}

Timber::render(['author.html.twig', 'archive.html.twig', 'index.html.twig'], $context);
