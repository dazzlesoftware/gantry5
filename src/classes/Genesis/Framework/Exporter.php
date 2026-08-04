<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

/**
 * @package Genesis\Framework
 */
class Exporter
{
    protected $files = [];

    /**
     * @return array
     */
    public function all()
    {
        /** @var Theme $theme */
        $theme = Genesis::instance()['theme'];
        $details = $theme->details();

        return [
            'export' => [
                'Genesis' => [
                    'version' => GENESIS_VERSION !== '@version@' ? GENESIS_VERSION : 'GIT',
                    'format' => 1
                ],
                'platform' => [
                    'name' => 'default',
                    'version' => '0.0'
                ],
                'theme' => [
                    'name' => $details->get('name'),
                    'title' => $details->get('details.name'),
                    'version' => $details->get('details.version'),
                    'date' => $details->get('details.date'),
                    'author' => $details->get('details.author'),
                    'copyright' => $details->get('details.copyright'),
                    'license' => $details->get('details.license'),
                ]
            ],
            'outlines' => $this->outlines(),
            'positions' => $this->positions(),
            'menus' => $this->menus(),
            'content' => $this->articles(),
            'categories' => $this->categories(),
            'files' => $this->files,
        ];
    }

    /**
     * @return array
     */
    public function outlines()
    {
        // TODO: implement
        return [];
    }

    /**
     * @param bool $all
     * @return array
     */
    public function positions($all = true)
    {
        // TODO: implement
        return [];
    }

    /**
     * @return array
     */
    public function menus()
    {
        // TODO: implement
        return [];
    }

    /**
     * @return array
     */
    public function articles()
    {
        // TODO: implement
        return [];
    }

    /**
     * @return array
     */
    public function categories()
    {
        // TODO: implement
        return [];
    }


    /**
     * List all the rules available.
     *
     * @param string $configuration
     * @return array
     */
    public function getOutlineAssignments($configuration)
    {
        // TODO: implement
        return [];
    }
}
