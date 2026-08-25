<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Timber\Timber;
use Timber\User;

/*
 * The template for displaying Author Archive pages
 */

global $wp_query;

$genesis = Genesis::instance();

/** @var Theme $theme */
$theme  = $genesis['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$context['posts'] = Timber::get_posts();

if (isset($authordata)) {
    $author            = Timber::get_user($authordata->ID);
    $context['author'] = $author;
    $context['title']  = __('Author:', 'neon') . ' ' . $author->name();
}

Timber::render(['author.html.twig', 'archive.html.twig', 'index.html.twig'], $context);
