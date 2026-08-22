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
 * Class Response
 * @package Genesis\Component\Response
 */
class Response
{
    /** @var string */
    public string $charset = 'utf-8';
    /** @var string */
    public string $mimeType = 'text/html';

    /** @var int */
    protected int $code = 200;
    /** @var string */
    protected string $message = 'OK';
    /** @var int */
    protected int $lifetime = 0;
    /** @var string */
    protected ?string $etag = null;
    /** @var array Response headers. */
    protected array $headers = [];
    /** @var string Response body. */
    protected mixed $content = null;
    /** @var array */
    protected array $responseCodes = [
        200 => 'OK',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        410 => 'Gone',
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        503 => 'Service Temporarily Unavailable'
    ];

    /**
     * Response constructor.
     * @param string $content
     * @param int $status
     */
    public function __construct(mixed $content = '', int $status = 200)
    {
        if ($content) {
            $this->setContent($content);
        }

        if ($status !== 200) {
            $this->setStatusCode($status);
        }
    }

    /**
     * @param int $seconds
     * @return $this
     */
    public function setLifetime(int $seconds): static
    {
        $this->lifetime = $seconds;

        return $this;
    }

    /**
     * @param mixed $key
     * @return $this
     */
    public function setKey(mixed $key): static
    {
        $this->etag = md5(json_encode($key));

        return $this;
    }

    /**
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->code;
    }

    /**
     * @param int $code
     * @param string $message
     * @return $this
     */
    public function setStatusCode(int $code, ?string $message = null): static
    {
        if ($message) {
            $this->code = $code;
            $this->message = $message;
        } else {
            $this->code = isset($this->responseCodes[$code]) ? (int) $code : 500;
            $this->message = $this->responseCodes[$this->code];
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getStatus(): string
    {
        $code = $this->getStatusCode();

        return $code . ' ' . (isset($this->responseCodes[$code]) ? $this->responseCodes[$code] : 'Unknown error');
    }

    /**
     * @return array
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    /**
     * @param array $headers
     * @param bool $replace
     * @return $this
     */
    public function setHeaders(array $headers, bool $replace = false): static
    {
        foreach ($headers as $key => $values) {
            $act = $replace;
            foreach ((array) $values as $value) {
                $this->setHeader((string) $key, (string) $value, $act);
                $act = false;
            }
        }

        return $this;
    }

    /**
     * @return $this
     */
    public function clearHeaders(): static
    {
        $this->headers = [];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     * @param bool $replace
     * @return $this
     */
    public function setHeader(string $name, string $value, bool $replace = false): static
    {
        if ($replace) {
            $this->headers[$name] = [$value];
        } else {
            $this->headers[$name][] = $value;
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getContent(): string
    {
        return (string) $this->content;
    }

    /**
     * @param string|int|callable|null $content
     * @return Response
     * @throws \UnexpectedValueException
     */
    public function setContent(mixed $content): static
    {
        if ($content !== null && !is_string($content) && !is_numeric($content) && !is_callable([$content, '__toString'])) {
            throw new \UnexpectedValueException(
                sprintf('Content must be a string or object implementing __toString()')
            );
        }
        $this->content = $content;

        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return (string) $this->content;
    }
}
