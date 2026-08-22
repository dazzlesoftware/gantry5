<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Gettext;

/**
 * Class Gettext
 * @package Genesis\Component\Gettext
 *
 * Examples on translating gettext in twig:
 *
 * {% trans string_var %}
 *
 * {% trans %}Hello {{ author.name }}{% endtrans %}
 * http://symfony.com/doc/current/book/translation.html
 *
 * {{ 'Hello %name%'|trans({'%name%': name}) }}
 * {{ trans('Hello %name%', {'%name%': name}) }}
 */
class Gettext
{
    /** @var int */
    public int $pos = 0;
    /** @var string */
    public string $str = '';
    /** @var int */
    public int $len = 0;
    /** @var string */
    public string $endian = 'V';

    /**
     * @param string $string
     * @return array
     * @throws \Exception
     */
    public function parse(string $string): array
    {
        $this->str = $string;
        $this->len = strlen($string);

        $magic = $this->readInt() & 0xffffffff;

        if ($magic === 0x950412de) {
            // Low endian.
            $this->endian = 'V';
        } elseif ($magic === 0xde120495) {
            // Big endian.
            $this->endian = 'N';
        } else {
            throw new \Exception('Not a Gettext file (.mo)');
        }

        // Skip revision number.
        $this->readInt();
        // Total count.
        $total = $this->readInt();
        // Offset of original table.
        $originals = $this->readInt();
        // Offset of translation table.
        $translations = $this->readInt();

        $this->seek($originals);
        $table_originals = $this->readIntArray($total * 2);
        $this->seek($translations);
        $table_translations = $this->readIntArray($total * 2);

        $items = [];
        for ($i = 0; $i < $total; $i++) {
            $this->seek($table_originals[$i * 2 + 2]);
            $original = $this->read($table_originals[$i * 2 + 1]);

            if ($original) {
                $this->seek($table_translations[$i * 2 + 2]);
                $items[$original] = $this->read($table_translations[$i * 2 + 1]);
            }
        }

        return $items;
    }

    /**
     * @return int|false
     */
    protected function readInt(): int|false
    {
        $read = $this->read(4);
        if ($read === false) {
            return false;
        }

        $read = unpack($this->endian, $read);

        if ($read === false) {
            return false;
        }

        return (int) array_shift($read);
    }

    /**
     * @param int $count
     * @return array
     */
    protected function readIntArray(int $count): array
    {
        $data = $this->read(4 * $count);
        if ($data === false) {
            return [];
        }

        return unpack($this->endian . $count, $data) ?: [];
    }

    /**
     * @param int $bytes
     * @return string|false
     */
    private function read(int $bytes): string|false
    {
        $data = substr($this->str, $this->pos, $bytes);
        $this->seek($this->pos + $bytes);

        return strlen($data) === $bytes ? $data : false;
    }

    /**
     * @param int $pos
     * @return int
     */
    private function seek(int $pos): int
    {
        $this->pos = min($this->len, max(0, $pos));

        return $this->pos;
    }
}
