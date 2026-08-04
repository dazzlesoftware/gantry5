<?php

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

/*
 * The template for displaying BBPress pages
 */

$genesis = Genesis::instance();

/** @var Theme $theme */
$theme  = $genesis['theme'];

// We need to render contents of <head> before plugin content gets added.
$context              = Timber::context();
$context['page_head'] = $theme->render('partials/page_head.html.twig', $context);

$context['posts']   = Timber::get_post();
$context['content'] = (static function (): string { ob_start(); the_content(); return (string) ob_get_clean(); })();

Timber::render('bbpress.html.twig', $context);
