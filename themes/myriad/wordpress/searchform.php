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
 * The template for displaying Search Form in Search widget
 */

$context = Timber::context();

Timber::render('searchform.html.twig', $context);
