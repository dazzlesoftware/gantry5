<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Config\Config;
use Genesis\Component\Filesystem\Folder;
use Genesis\Component\Url\Url;
use DazzleSoftware\Toolbox\File\MarkdownFile;
use DazzleSoftware\Toolbox\File\YamlFile;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Importer
 * @package Genesis\Framework
 */
class Importer
{
    /** @var string */
    protected string $folder;
    /** @var array */
    protected ?array $articles = null;
    /** @var array */
    protected array $categories = [];
    /** @var UniformResourceLocator */
    protected UniformResourceLocator $locator;

    /**
     * Importer constructor.
     * @param $folder
     */
    public function __construct(string $folder)
    {
        /** @var UniformResourceLocator $locator */
        $this->locator = Genesis::instance()['locator'];

        $this->folder = $folder;
    }

    public function all(): void
    {
        $this->fetchArticles();
        //$this->files();
        $this->positions();
        $this->outlines();
        $this->menus();
        $this->content();
    }

    /**
     * Copy files.
     */
    public function files(): void
    {
        $files = Folder::all("{$this->folder}/files", ['folders' => false]);

        foreach ($files as $file) {
            $stream = preg_replace('|^([^/]+)|', '\\1:/', $file);

            $destination = $this->locator->findResource($stream, true, true);
            if (!is_string($destination) || $destination === '') {
                throw new \RuntimeException("Unable to resolve import destination '{$stream}'");
            }
            copy("{$this->folder}/files/{$file}", $destination);
        }
    }

    public function positions(): void
    {
        $folder = $this->locator->findResource('genesis-positions://', true, true);
        if (!is_string($folder) || $folder === '') {
            throw new \RuntimeException('Unable to resolve the positions import folder');
        }

        if (is_dir($folder)) {
            Folder::delete($folder);
        }

        Folder::copy("{$this->folder}/positions", $folder);
    }

    public function outlines(): void
    {
        $folder = $this->locator->findResource('genesis-theme://config', true, true);
        if (!is_string($folder) || $folder === '') {
            throw new \RuntimeException('Unable to resolve the outline import folder');
        }

        if (is_dir($folder)) {
            Folder::delete($folder);
        }

        Folder::copy("{$this->folder}/outlines", $folder);
    }

    public function menus(): void
    {
        $from = "{$this->folder}/menus";

        $config = $this->locator->findResource('genesis-theme://config/menus', true, true);
        if (is_string($config) && is_dir($config)) {
            Folder::delete($config);
        }

        $pages = $this->locator->findResource('page://', true, true);
        if (is_string($pages) && is_dir($pages)) {
            Folder::delete($pages);
        }

        $files = Folder::all($from, ['folders' => false, 'recursive' => false]);

        foreach ($files as $filename) {
            $file = YamlFile::instance("{$from}/{$filename}");
            $menu = (array) $file->content();
            $this->menu($menu);
        }

        //Folder::copy($from, $config);
    }

    public function content(): void
    {
        foreach ((array) $this->articles as $id => $filename) {
            $article = $this->readArticle($id);
            if (!$article) {
                continue;
            }

            $foldername = sprintf('%02d.%s', $id, $article['alias']);
            $folder = $this->locator->findResource("page://category/{$article['category']}/{$foldername}", true, true);
            if (!is_string($folder) || $folder === '') {
                throw new \RuntimeException('Unable to resolve the article import folder');
            }
            Folder::create($folder);

            $file = MarkdownFile::instance("{$folder}/blog_item.md");
            $file->header($article['header']);
            $file->markdown($article['content']);
            $file->save();
            $file->free();
        }
    }

    /**
     * @param array $menu
     */
    protected function menu(array $menu): void
    {
        $config = new Config([]);

        foreach ($menu['items'] as $path => &$item) {
            $alias = trim(substr($path, strrpos($path, '/')), '/');
            $location = preg_replace('|/|', '/children/', $path);
            $children = substr($location, 0, strrpos($location, '/'));

            $ordering = $config->count($children, '/') + 1;
            $parent = $config->get(substr($children, 0, strrpos($children, '/')));

            $item['ordering'] = $ordering;
            $item['alias'] = $alias;
            $item['path'] = $path;

            switch ($item['type']) {
                case 'joomla.component':
                    $item['page'] = $this->createComponentPage($item);
                    break;
                case 'joomla.alias':
                    $item['page'] = $this->createAliasPage($item);
                    break;
                case 'url':
                    $item['alias'] = preg_replace('|[^a-z0-9-_]+|', '-', strtolower($item['title']));
                    $item['page'] = $this->createUrlPage($item);
                    break;
                case 'particle':
                    $item['page'] = $this->createParticlePage($item);
                    break;
                case 'separator':
                default:
                    $item['page'] = $this->createSeparatorPage($item);
            }

            $folder = sprintf('%s%02d.%s', (isset($parent['folder']) ? $parent['folder'] . '/' : ''), $item['ordering'], $item['alias']);
            $item['folder'] = $folder;

            $config->set($location, $item, '/');
        }
        unset($item);

        foreach ($menu['items'] as $path => $menuitem) {
            $page = $menuitem['page'];
            $folder = $this->locator->findResource("page://{$menuitem['folder']}", true, true);
            if (!is_string($folder) || $folder === '') {
                throw new \RuntimeException('Unable to resolve the menu page import folder');
            }
            Folder::create($folder);

            $file = MarkdownFile::instance("{$folder}/{$page['type']}.md");
            $file->header($page['header']);
            $file->markdown($page['content']);
            $file->save();
            $file->free();
        }
    }

    /**
     * @return array
     */
    protected function fetchArticles(): array
    {
        if (!isset($this->articles)) {
            $from = "{$this->folder}/content";
            $this->articles = Folder::all($from, ['folders' => false, 'recursive' => false, 'key' => 'filename', 'value' => 'pathname', 'filters' => ['key' => 'intval']]);
            if (isset($this->articles[0])) {
                $file = YamlFile::instance($this->articles[0]);
                $this->categories = (array) $file->content();
                $file->free();
                unset($this->articles[0]);
            } else {
                $this->categories = [];
            }
        }

        return $this->articles ?? [];
    }

    /**
     * @param string $id
     * @return string|null
     */
    protected function getCategoryAlias(string|int $id): ?string
    {
        return isset($this->categories[$id]['alias']) ? (string) $this->categories[$id]['alias'] : null;
    }

    /**
     * @param string $id
     * @return string|null
     */
    protected function getCategoryTitle(string|int $id): ?string
    {
        return isset($this->categories[$id]['title']) ? (string) $this->categories[$id]['title'] : null;
    }

    /**
     * @param string $id
     * @return array
     */
    protected function readArticle(string|int $id): array
    {
        if (!isset($this->articles[$id])) {
            return [];
        }

        $file = YamlFile::instance($this->articles[$id]);
        $content = (array) $file->content();
        $file->free();

        $text = $this->urlFilter($content['introtext'] . ($content['fulltext'] ? "\n\n===\n\n" . $content['fulltext'] : ''));
        $twig = strpos($text, '{{ url(') !== false && strpos($text, ') }}') !== false;

        $article = [
            'type' => 'default',
            'alias' => $content['alias'],
            'catid' => $content['catid'],
            'category' => $content['category']['alias'],
            'modified' => $content['modified'] !== '0000-00-00 00:00:00' ? $content['modified'] : null,
            'header' => [
                'title' => $content['title'],
                'author' => [
                    'username' => $content['author']['username'] ?: null,
                    'alias' => $content['created_by_alias'] ?: ($content['author']['realname'] ?: null)
                ],
                'date' => $content['created'] !== '0000-00-00 00:00:00' ? $content['created'] : null,
                'published' => $content['state'] === 1,
                'publish_date' => $content['publish_up'] !== '0000-00-00 00:00:00' ? $content['publish_up'] : null,
                'unpublish_date' => $content['publish_down'] !== '0000-00-00 00:00:00' ? $content['publish_down'] : null,
                'taxonomy' => [
                    'category' => $content['category']['title'] ?: null
                ],
                'process' => [
                    'markdown' => false,
                    'twig' => $twig
                ],
                'metadata' => [
                    'keywords' => $content['metakey'] ?: null,
                    'description' => $content['metadesc'] ?: null
                ]
            ],
            'content' => $text
        ];

        $article = $this->filterNull($article);

        return $article;
    }

    /**
     * @param array $item
     * @return array
     */
    protected function createComponentPage(array $item): array
    {
        $page = [];

        $link = Url::parse($item['link'], true);
        $vars = $link['vars'];
        if (isset($vars['option'])) {
            switch ($vars['option']) {
                case 'com_content':
                    switch ($vars['view']) {
                        case 'article':
                            $page = $this->readArticle($vars['id']);
                            unset($this->articles[$vars['id']]);
                            break;
                        case 'featured':
                            $page = [
                                'type' => 'blog_list',
                                'header' => [
                                    'content' => [
                                        'items' => [],
                                        'limit' => 5,
                                        'order' => [
                                            'by' => 'date',
                                            'dir' => 'desc'
                                        ],
                                        'pagination' => true,
                                        'url_taxonomy_filters' => true
                                    ],
                                    'pagination' => 1
                                ]
                            ];
                            break;
                        case 'category':
                            if ($vars['layout'] !== 'blog') {
                                die($link['query']);
                            }
                            $page = [
                                'type' => 'blog_list',
                                'header' => [
                                    'content' => [
                                        'items' => ['@taxonomy.category' => $this->getCategoryTitle($vars['id'])],
                                        'limit' => 5,
                                        'order' => [
                                            'by' => 'date',
                                            'dir' => 'desc'
                                        ],
                                        'pagination' => true,
                                        'url_taxonomy_filters' => true
                                    ],
                                    'pagination' => 1
                                ]
                            ];
                            break;
                        default:
                            die($link['query']);
                    }
                    break;
                case 'com_genesis':
                    if ($vars['view'] === 'error') {
                        $page = [
                            'header' => [
                                'Genesis' => [
                                    'outline' => '_error'
                                ],
                                'http_response_code' => 404
                            ],
                            'content' => "Whoops. Looks like this page doesn't exist."
                        ];
                    }
                    break;
                case 'com_contact':
                    $page = [
                        'header' => [
                            'cache_enable' => false,
                            'process' => [
                                'markdown' => true,
                                'twig' => true
                            ]
                        ],
                        'content' => "## Contact Form

{% include \"forms/form.html.twig\" with {form: forms( {route: '/form/contact'} )} %}"
                    ];
                    break;
                case 'com_search':
                    // TODO:
                    break;
                default:
                    die($link['query']);
            }
        }

        $page += [
            'type' => 'default',
            'header' => [],
            'content' => ''
        ];
        $page['header'] += [
            'menu' => $item['title'],
            'title' => $item['title']
        ];

        if ($page['header']['menu'] === $page['header']['title']) {
            unset($page['header']['menu']);
        }

        return $page;
    }

    /**
     * @param array $item
     * @return array
     */
    protected function createAliasPage(array $item): array
    {
        return [
            'type' => 'default',
            'header' => [
                'title' => $item['title'],
            ],
            'content' => ''
        ];
    }

    /**
     * @param array $item
     * @return array
     */
    protected function createUrlPage(array $item): array
    {
        return [
            'type' => 'default',
            'header' => [
                'menu' => $item['title'],
                'external_url' => $item['link']
            ],
            'content' => ''
        ];
    }

    /**
     * @param array $item
     * @return array
     */
    protected function createSeparatorPage(array $item): array
    {
        return [
            'type' => 'default',
            'header' => [
                'menu' => $item['title'],
                'routable' => false
            ],
            'content' => ''
        ];
    }

    /**
     * @param array $item
     * @return array
     */
    protected function createParticlePage(array $item): array
    {
        return [
            'type' => 'default',
            'header' => [
                'menu' => $item['title'],
                'routable' => false
            ],
            'content' => ''
        ];
    }

    /**
     * @param array $v
     * @return array
     */
    protected function filterNull(mixed $v): mixed
    {
        if (is_array($v)) {
            foreach ($v as $key => $value) {
                $value = $this->filterNull($value);
                if (null === $value || (is_array($value) && empty($value))) {
                    unset($v[$key]);
                } else {
                    $v[$key] = $value;
                }
            }
        }

        return $v;
    }

    /**
     * Filter stream URLs from HTML.
     *
     * @param  string $html         HTML input to be filtered.
     * @return string               Returns modified HTML.
     */
    protected function urlFilter(string $html): string
    {
        // Tokenize all PRE and CODE tags to avoid modifying any src|href|url in them
        $tokens = [];
        $html = preg_replace_callback('#<(pre|code).*?>.*?</\\1>#is', static function(array $matches) use (&$tokens): string {
            $token = uniqid('__genesis_token', false);
            $tokens['#' . $token . '#'] = $matches[0];

            return $token;
        }, $html) ?? $html;

        $html = preg_replace_callback('^(\s)url\((.*?)\)^', 'static::urlHandler', $html) ?? $html;
        $html = preg_replace_callback('^(\s)(src|href)="(.*?)"^', 'static::linkHandler', $html) ?? $html;
        $html = preg_replace(array_keys($tokens), array_values($tokens), $html) ?? $html; // restore tokens

        return $html;
    }

    /**
     * @param array $matches
     * @return string
     * @internal
     */
    public static function linkHandler(array $matches): string
    {
        $url = trim($matches[3]);

        return "{$matches[1]}{$matches[2]}=\"{{ url('{$url}') }}\"";
    }

    /**
     * @param array $matches
     * @return string
     * @internal
     */
    public static function urlHandler(array $matches): string
    {
        $url = trim($matches[2], '"\'');

        return "{$matches[1]}url({{ url('{$url}') }})";
    }
}
