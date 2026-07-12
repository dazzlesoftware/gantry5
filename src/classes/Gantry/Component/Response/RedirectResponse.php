<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Response;

/**
 * Class RedirectResponse
 * @package Gantry\Component\Response
 */
class RedirectResponse extends Response
{
    /**
     * RedirectResponse constructor.
     * @param string $content
     * @param int $status
     */
    public function __construct($content = '', $status = 303)
    {
        parent::__construct('', $status);

        $this->setHeader('Location', $content);
    }

    /**
     * @return string
     */
    public function getContent()
    {
        return (string) $this->getHeaders()['Location'];
    }

    /**
     * @param string $content
     * @return Response
     */
    public function setContent($content)
    {
        $this->setHeader('Location', $content);

        return $this;
    }
}
