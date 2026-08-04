<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress;

use Timber\Pagination;

/**
 * Class PostQuery
 * @package Genesis\WordPress
 */
class PostQuery extends \Timber\PostQuery
{
    /**
     * @param \WP_Query|array<string, mixed>|null $query
     */
    public function __construct($query = null)
    {
        if (!$query instanceof \WP_Query) {
            $query = new \WP_Query((array) $query);
        }

        parent::__construct($query);
    }

    /**
     * For backwards compatibility.
     *
     * @return mixed
     */
    public function post_count()
    {
        return $this->count();
    }

    /**
     * For backwards compatibility.
     *
     * @param array $prefs
     * @return Pagination
     */
    public function get_pagination($prefs)
    {
        return $this->pagination((array)$prefs);
    }
}
