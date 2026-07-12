<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Timber\Post;
use Timber\Timber;

/*
 * The template for displaying comments
 */

$context = Timber::context();

$post            = new Post();
$context['post'] = $post;

if (post_password_required($post)) {
    return;
}

Timber::render(['partials/comments-' . $post->ID . '.html.twig', 'partials/comments-' . $post->post_type . '.html.twig', 'partials/comments.html.twig'], $context);
