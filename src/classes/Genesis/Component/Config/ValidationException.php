<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Config;

/**
 * Class ValidationException
 * @package Genesis\Component\Config
 */
class ValidationException extends \RuntimeException
{
    /** @var array */
    protected array $messages = [];

    /**
     * @param array $messages
     * @return $this
     */
    public function setMessages(array $messages = []): static
    {
        $this->messages = $messages;

        // TODO: add translation.
        $this->message = sprintf('Form validation failed:') . ' ' . $this->message;

        foreach ($messages as $variable => &$list) {
            $list = array_unique($list);
            foreach ($list as $message) {
                $this->message .= "<br/>$message";
            }
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getMessages(): array
    {
        return $this->messages;
    }
}
