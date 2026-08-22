<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress\MultiLanguage;

/**
 * Interface MultiLantuageInterface
 * @package Genesis\WordPress\MultiLanguage
 */
interface MultiLantuageInterface
{
    /**
     * @return bool
     */
    public static function enabled(): bool;

    /**
     * @return string
     */
    public function getCurrentLanguage(): string;

    /**
     * @return array
     */
    public function getLanguageOptions(): array;
}
