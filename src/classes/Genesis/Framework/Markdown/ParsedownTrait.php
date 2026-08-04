<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Markdown;

use Genesis\Framework\Document;
use Genesis\Framework\Genesis;

/**
 * Trait ParsedownTrait
 * @package Genesis\Framework\Markdown
 */
trait ParsedownTrait
{
    /** @var array */
    protected $special_chars;
    /** @var string */
    protected $twig_link_regex = '/\!*\[(?:.*)\]\((\{([\{%#])\s*(.*?)\s*(?:\2|\})\})\)/';

    /**
     * Initialization function to setup key variables needed by the MarkdownGravLinkTrait
     *
     * @param array $defaults
     */
    protected function init(array $defaults)
    {
        $defaults += [
            'auto_line_breaks' => false,
            'auto_url_links' => false,
            'escape_markup' => false,
            'special_chars' => false
        ];

        $this->BlockTypes['{'][] = 'TwigTag';
        $this->special_chars = ['>' => 'gt', '<' => 'lt', '"' => 'quot'];

        $this->setBreaksEnabled($defaults['auto_line_breaks']);
        $this->setUrlsLinked($defaults['auto_url_links']);
        $this->setMarkupEscaped($defaults['escape_markup']);
        $this->setSpecialChars($defaults['special_chars']);
    }

    /**
     * Setter for special chars
     *
     * @param array $special_chars
     * @return $this
     */
    public function setSpecialChars($special_chars)
    {
        $this->special_chars = $special_chars;

        return $this;
    }

    /**
     * Ensure Twig tags are treated as block level items with no <p></p> tags
     *
     * @param array $line
     * @return array|null
     */
    protected function blockTwigTag($line)
    {
        if (preg_match('/(?:{{|{%|{#)(.*)(?:}}|%}|#})/', $line['body'], $matches)) {
            return ['markup' => $line['body']];
        }

        return null;
    }

    /**
     * @param array $excerpt
     * @return array|null
     */
    protected function inlineSpecialCharacter($excerpt)
    {
        if ($excerpt['text'][0] === '&' && !preg_match('/^&#?\w+;/', $excerpt['text'])) {
            return [
                'markup' => '&amp;',
                'extent' => 1,
            ];
        }

        if (isset($this->special_chars[$excerpt['text'][0]])) {
            return [
                'markup' => '&' . $this->special_chars[$excerpt['text'][0]] . ';',
                'extent' => 1,
            ];
        }

        return null;
    }

    /**
     * @param array $excerpt
     * @return array
     */
    protected function inlineImage($excerpt)
    {
        if (preg_match($this->twig_link_regex, $excerpt['text'], $matches)) {
            $excerpt['text'] = str_replace($matches[1], '/', $excerpt['text']);
            $excerpt = parent::inlineImage($excerpt);
            $excerpt['element']['attributes']['src'] = $matches[1];
            $excerpt['extent'] = $excerpt['extent'] + \strlen($matches[1]) - 1;

            return $excerpt;
        }

        $excerpt['type'] = 'image';
        $excerpt = parent::inlineImage($excerpt);

        // if this is an image process it
        if (isset($excerpt['element']['attributes']['src'])) {
            $genesis = Genesis::instance();

            /** @var Document $document */
            $document = $genesis['document'];

            $excerpt['element']['attributes']['src'] = $document::url($excerpt['element']['attributes']['src']);
        }

        return $excerpt;
    }

    /**
     * @param array $excerpt
     * @return array
     */
    protected function inlineLink($excerpt)
    {
        if (!isset($excerpt['type'])) {
            $excerpt['type'] = 'link';
        }

        // do some trickery to get around Parsedown requirement for valid URL if its Twig in there
        if (preg_match($this->twig_link_regex, $excerpt['text'], $matches)) {
            $excerpt['text'] = str_replace($matches[1], '/', $excerpt['text']);
            $excerpt = parent::inlineLink($excerpt);
            $excerpt['element']['attributes']['href'] = $matches[1];
            $excerpt['extent'] = $excerpt['extent'] + \strlen($matches[1]) - 1;

            return $excerpt;
        }

        $excerpt = parent::inlineLink($excerpt);

        // if this is a link
        if (isset($excerpt['element']['attributes']['href'])) {
            $genesis = Genesis::instance();

            /** @var Document $document */
            $document = $genesis['document'];

            $excerpt['element']['attributes']['href'] = $document::url($excerpt['element']['attributes']['href']);
        }

        return $excerpt;
    }
}
