<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

/**
 * Class Exception
 * @package Genesis\Framework
 */
class Exception extends \RuntimeException
{
    protected array $responseCodes = [
        200 => '200 OK',
        400 => '400 Bad Request',
        401 => '401 Unauthorized',
        403 => '403 Forbidden',
        404 => '404 Not Found',
        410 => '410 Gone',
        500 => '500 Internal Server Error',
        501 => '501 Not Implemented',
        503 => '503 Service Temporarily Unavailable'
    ];

    /**
     * @return int
     */
    public function getResponseCode(): int
    {
        return isset($this->responseCodes[$this->code]) ? (int) $this->code : 500;
    }

    /**
     * @return string
     */
    public function getResponseStatus(): string
    {
        return $this->responseCodes[$this->getResponseCode()];
    }
}
