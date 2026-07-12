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
 * The Template for displaying all single posts
 */

$gantry = Gantry::instance();

/** @var Theme $theme */
$theme  = $gantry['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::get_context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$post            = Timber::query_post();
$context['post'] = $post;
$context['wp_title'] .= ' - ' . $post->title();

Timber::render(['single-' . $post->ID . '.html.twig', 'single-' . $post->post_type . '.html.twig', 'single.html.twig'], $context);
