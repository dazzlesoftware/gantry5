<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Content\Block;

use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;

/**
 * Class HtmlBlock
 * @package Genesis\Component\Content\Block
 * @since 5.4.3
 */
class HtmlBlock extends ContentBlock implements HtmlBlockInterface
{
    protected int $version = 1;
    protected array $frameworks = [];
    protected array $styles = [];
    protected array $scripts = [];
    protected array $html = [];

    /**
     * @return array
     * @since 5.4.3
     */
    public function getAssets(): array
    {
        $assets = $this->getAssetsFast();

        $this->sortAssets($assets['styles']);
        $this->sortAssets($assets['scripts']);
        $this->sortAssets($assets['html']);

        return $assets;
    }

    /**
     * @return array
     * @since 5.4.3
     */
    public function getFrameworks(): array
    {
        $assets = $this->getAssetsFast();

        return array_keys($assets['frameworks']);
    }

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getStyles(string $location = 'head'): array
    {
        $styles = $this->getAssetsInLocation('styles', $location);

        if (!$styles) {
            return [];
        }

        $genesis = Genesis::instance();

        /** @var Theme|null $theme */
        $theme = isset($genesis['theme']) ? $genesis['theme'] : null;

        /** @var Document $document */
        $document = $genesis['document'];

        foreach ($styles as $key => $style) {
            if (isset($style['href'])) {
                $url = $style['href'];
                if ($theme && preg_match('|\.scss$|', $url)) {
                    // Compile SCSS files.
                    $url = $theme->css(Genesis::basename($url, '.scss'));
                }
                // Deal with streams and relative paths.
                $url = $document::url($url, null, null, false);

                $styles[$key]['href'] = $url;
            }
        }

        return $styles;
    }

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getScripts(string $location = 'head'): array
    {
        $scripts = $this->getAssetsInLocation('scripts', $location);

        if (!$scripts) {
            return [];
        }

        $genesis = Genesis::instance();

        /** @var Document $document */
        $document = $genesis['document'];

        foreach ($scripts as $key => $script) {
            if (isset($script['src'])) {
                // Deal with streams and relative paths.
                $scripts[$key]['src'] = $document::url($script['src'], null, null, false);
            }
        }

        return $scripts;
    }

    /**
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    public function getHtml(string $location = 'bottom'): array
    {
        return $this->getAssetsInLocation('html', $location);
    }

    /**
     * @return array
     * @since 5.4.3
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        if ($this->frameworks) {
            $array['frameworks'] = $this->frameworks;
        }
        if ($this->styles) {
            $array['styles'] = $this->styles;
        }
        if ($this->scripts) {
            $array['scripts'] = $this->scripts;
        }
        if ($this->html) {
            $array['html'] = $this->html;
        }

        return $array;
    }

    /**
     * @param array $serialized
     * @since 5.4.3
     */
    public function build(array $serialized): void
    {
        parent::build($serialized);

        $this->frameworks = isset($serialized['frameworks']) ? (array) $serialized['frameworks'] : [];
        $this->styles = isset($serialized['styles']) ? (array) $serialized['styles'] : [];
        $this->scripts = isset($serialized['scripts']) ? (array) $serialized['scripts'] : [];
        $this->html = isset($serialized['html']) ? (array) $serialized['html'] : [];
    }

    /**
     * @param string $framework
     * @return $this
     * @since 5.4.3
     */
    public function addFramework(string $framework): static
    {
        $this->frameworks[$framework] = 1;

        return $this;
    }

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     *
     * @example $block->addStyle('assets/js/my.js');
     * @example $block->addStyle(['href' => 'assets/js/my.js', 'media' => 'screen']);
     * @since 5.4.3
     */
    public function addStyle(string|array $element, int $priority = 0, string $location = 'head'): bool
    {
        if (!is_array($element)) {
            $element = ['href' => (string) $element];
        }

        if (empty($element['href'])) {
            return false;
        }

        if (!isset($this->styles[$location])) {
            $this->styles[$location] = [];
        }

        $id = !empty($element['id']) ? ['id' => (string) $element['id']] : [];
        $href = $element['href'];
        $type = !empty($element['type']) ? (string) $element['type'] : 'text/css';
        $media = !empty($element['media']) ? (string) $element['media'] : null;
        unset($element['tag'], $element['id'], $element['rel'], $element['content'], $element['href'], $element['type'], $element['media']);

        $this->styles[$location][md5($href) . sha1($href)] = [
                ':type' => 'file',
                ':priority' => (int) $priority,
                'href' => $href,
                'type' => $type,
                'media' => $media,
                'element' => $element
            ] + $id;

        return true;
    }

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addInlineStyle(string|array $element, int $priority = 0, string $location = 'head'): bool
    {
        if (!is_array($element)) {
            $element = ['content' => (string) $element];
        }

        if (empty($element['content'])) {
            return false;
        }

        if (!isset($this->styles[$location])) {
            $this->styles[$location] = [];
        }

        $content = (string) $element['content'];
        $type = !empty($element['type']) ? (string) $element['type'] : 'text/css';

        $this->styles[$location][md5($content) . sha1($content)] = [
            ':type' => 'inline',
            ':priority' => (int) $priority,
            'content' => $content,
            'type' => $type
        ];

        return true;
    }

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addScript(string|array $element, int $priority = 0, string $location = 'head'): bool
    {
        if (!is_array($element)) {
            $element = ['src' => (string) $element];
        }

        if (empty($element['src'])) {
            return false;
        }

        if (!isset($this->scripts[$location])) {
            $this->scripts[$location] = [];
        }

        $src = $element['src'];
        $type = !empty($element['type']) ? (string) $element['type'] : 'text/javascript';
        $defer = isset($element['defer']) ? true : false;
        $async = isset($element['async']) ? true : false;
        $handle = !empty($element['handle']) ? (string) $element['handle'] : '';

        $this->scripts[$location][md5($src) . sha1($src)] = [
            ':type' => 'file',
            ':priority' => (int) $priority,
            'src' => $src,
            'type' => $type,
            'defer' => $defer,
            'async' => $async,
            'handle' => $handle
        ];

        return true;
    }

    /**
     * @param string|array $element
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addInlineScript(string|array $element, int $priority = 0, string $location = 'head'): bool
    {
        if (!is_array($element)) {
            $element = ['content' => (string) $element];
        }

        if (empty($element['content'])) {
            return false;
        }

        if (!isset($this->scripts[$location])) {
            $this->scripts[$location] = [];
        }

        $content = (string) $element['content'];
        $type = !empty($element['type']) ? (string) $element['type'] : 'text/javascript';

        $this->scripts[$location][md5($content) . sha1($content)] = [
            ':type' => 'inline',
            ':priority' => (int) $priority,
            'content' => $content,
            'type' => $type
        ];

        return true;
    }

    /**
     * @param string $html
     * @param int $priority
     * @param string $location
     * @return bool
     * @since 5.4.3
     */
    public function addHtml(string $html, int $priority = 0, string $location = 'bottom'): bool
    {
        if (empty($html) || !is_string($html)) {
            return false;
        }

        if (!isset($this->html[$location])) {
            $this->html[$location] = [];
        }

        $this->html[$location][md5($html) . sha1($html)] = [
            ':priority' => (int) $priority,
            'html' => $html
        ];

        return true;
    }

    /**
     * @param string $location
     * @deprecated Temporarily needed in WP
     * @since 5.4.3
     */
    public function clearStyles(string $location = 'head'): void
    {
        foreach ($this->blocks as $block) {
            if (method_exists($block, 'clearStyles')) {
                $block->clearStyles($location);
            }
        }
        unset($this->styles[$location]);
    }

    /**
     * @param string $location
     * @deprecated Temporarily needed in WP
     * @since 5.4.3
     */
    public function clearScripts(string $location = 'head'): void
    {
        foreach ($this->blocks as $block) {
            if (method_exists($block, 'clearScripts')) {
                $block->clearScripts($location);
            }
        }
        unset($this->scripts[$location]);
    }

    /**
     * @return array
     * @since 5.4.3
     */
    protected function getAssetsFast(): array
    {
        $assets = [
            'frameworks' => $this->frameworks,
            'styles' => $this->styles,
            'scripts' => $this->scripts,
            'html' => $this->html
        ];

        foreach ($this->blocks as $block) {
            if ($block instanceof HtmlBlock) {
                $blockAssets = $block->getAssetsFast();
                $assets['frameworks'] += $blockAssets['frameworks'];

                foreach ($blockAssets['styles'] as $location => $styles) {
                    if (!isset($assets['styles'][$location])) {
                        $assets['styles'][$location] = $styles;
                    } elseif ($styles) {
                        $assets['styles'][$location] += $styles;
                    }
                }

                foreach ($blockAssets['scripts'] as $location => $scripts) {
                    if (!isset($assets['scripts'][$location])) {
                        $assets['scripts'][$location] = $scripts;
                    } elseif ($scripts) {
                        $assets['scripts'][$location] += $scripts;
                    }
                }

                foreach ($blockAssets['html'] as $location => $htmls) {
                    if (!isset($assets['html'][$location])) {
                        $assets['html'][$location] = $htmls;
                    } elseif ($htmls) {
                        $assets['html'][$location] += $htmls;
                    }
                }
            }
        }

        return $assets;
    }

    /**
     * @param string $type
     * @param string $location
     * @return array
     * @since 5.4.3
     */
    protected function getAssetsInLocation(string $type, string $location): array
    {
        $assets = $this->getAssetsFast();

        if (empty($assets[$type][$location])) {
            return [];
        }

        $styles = $assets[$type][$location];
        $this->sortAssetsInLocation($styles);

        return $styles;
    }

    /**
     * @param array $items
     * @since 5.4.3
     */
    protected function sortAssetsInLocation(array &$items): void
    {
        $count = 0;
        foreach ($items as &$item) {
            $item[':order'] = ++$count;
        }
        unset ($item);

        uasort(
            $items,
            static function (array $a, array $b): int {
                return ($a[':priority'] === $b[':priority']) ? $a[':order'] - $b[':order'] : $b[':priority'] - $a[':priority'];
            }
        );
    }

    /**
     * @param array $array
     * @since 5.4.3
     */
    protected function sortAssets(array &$array): void
    {
        foreach ($array as $location => &$items) {
            $this->sortAssetsInLocation($items);
        }
    }
}
