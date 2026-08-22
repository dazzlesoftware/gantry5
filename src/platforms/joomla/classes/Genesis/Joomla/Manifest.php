<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla;

/**
 * Joomla manifest file modifier.
 */
class Manifest
{
    /** @var string */
    protected string $theme;
    /** @var string */
    protected string $path;
    /** @var \SimpleXMLElement */
    protected \SimpleXMLElement $xml;

    /**
     * @param string $theme
     * @param \SimpleXMLElement $manifest
     * @throws \RuntimeException
     */
    public function __construct(string $theme, ?\SimpleXMLElement $manifest = null)
    {
        $this->theme = $theme;
        $this->path = JPATH_SITE . "/templates/{$theme}/templateDetails.xml";

        if (!is_file($this->path)) {
            throw new \RuntimeException(sprintf('Template %s does not exist.', $theme));
        }
        $contents = file_get_contents($this->path);
        $xml = $manifest ?: ($contents !== false ? simplexml_load_string($contents) : false);
        if (!$xml instanceof \SimpleXMLElement) {
            throw new \RuntimeException(sprintf('Template manifest for %s could not be parsed.', $theme));
        }
        $this->xml = $xml;
    }

    /**
     * @param string $variable
     * @return string
     */
    public function get(string $variable): string
    {
        return (string) $this->xml->{$variable};
    }

    /**
     * @return \SimpleXMLElement
     */
    public function getXml(): \SimpleXMLElement
    {
        return $this->xml;
    }

    /**
     * @return string
     */
    public function getScriptFile(): string
    {
        return (string) $this->xml->scriptfile;
    }

    /**
     * @param array $positions
     */
    public function setPositions(array $positions): void
    {
        sort($positions);

        // Get the positions.
        $target = current($this->xml->xpath('//positions'));
        if (!$target instanceof \SimpleXMLElement) {
            throw new \RuntimeException('Template manifest has no positions element.');
        }

        $xml = "<positions>\n        <position>" . implode("</position>\n        <position>", $positions) . "</position>\n    </positions>";
        $insert = new \SimpleXMLElement($xml);

        // Replace all positions.
        $targetDom = dom_import_simplexml($target);
        $insertDom = $targetDom->ownerDocument->importNode(dom_import_simplexml($insert), true);
        $targetDom->parentNode->replaceChild($insertDom, $targetDom);
    }

    public function save(): void
    {
        // Do not save manifest if template has been symbolically linked.
        if (is_link(dirname($this->path))) {
            return;
        }

        if (!$this->xml->asXML($this->path)) {
            throw new \RuntimeException(sprintf('Saving manifest for %s template failed', $this->theme));
        }
    }
}
