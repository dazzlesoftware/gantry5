<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Response;

/**
 * Class RedirectResponse
 * @package Genesis\Component\Response
 */
class RedirectResponse extends Response
{
    /**
     * RedirectResponse constructor.
     * @param string $content
     * @param int $status
     */
    public function __construct(mixed $content = '', int $status = 303)
    {
        parent::__construct('', $status);

        $this->setHeader('Location', (string) $content);
    }

    /**
     * @return string
     */
    public function getContent(): string
    {
        return (string) ($this->getHeaders()['Location'][0] ?? '');
    }

    /**
     * @param string $content
     * @return Response
     */
    public function setContent(mixed $content): static
    {
        $this->setHeader('Location', (string) $content);

        return $this;
    }
}
