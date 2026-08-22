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
use Genesis\Component\Content\Block\ContentBlock;
use Genesis\Component\Theme\AbstractTheme;
use Genesis\Component\Theme\ThemeTrait;
use Genesis\Debugger;
use Grav\Common\Config\Config as GravConfig;
use Grav\Common\Grav;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Common\Page\Pages;
use Grav\Common\Twig\Twig;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Twig\Environment;
use Twig\Extension\DebugExtension;
use Twig\Extension\EscaperExtension;

/**
 * Class Theme
 * @package Genesis\Framework
 */
class Theme extends AbstractTheme
{
    use ThemeTrait;

    /**
     * Return renderer.
     *
     * @return Environment
     */
    public function renderer(): Environment
    {
        if (!$this->renderer) {
            $genesis = static::genesis();
            $grav = Grav::instance();

            /** @var Twig $gravTwig */
            $gravTwig = $grav['twig'];

            $twig = $gravTwig->twig();
            $loader = $gravTwig->loader();

            /** @var Config $global */
            $global = $genesis['global'];

            $debug = $genesis->debug();
            $production = (bool) $global->get('production', 1);

            if ($debug && !$twig->isDebug()) {
                $twig->enableDebug();
                $twig->addExtension(new DebugExtension());
            }

            if ($production) {
                $twig->disableAutoReload();
            } else {
                $twig->enableAutoReload();
            }

            // Force html escaping strategy.
            $twig->getExtension(EscaperExtension::class)->setDefaultStrategy('html');

            $this->setTwigLoaderPaths($loader);

            $this->renderer = $this->extendTwig($twig, $loader);
        }

        return $this->renderer;
    }

    /**
     * @param string|array|object $particle
     * @param array $attribs
     * @return ContentBlock
     */
    public function getParticle($particle, array $attribs = [])
    {
        if (is_string($particle)) {
            $id = $particle;
            $particle = (object)['id' => $particle];
        } else {
            $particle = (object)$particle;
            $id = isset($particle->id) ? $particle->id : null;
        }
        if ($id) {
            // Render module.
            if (preg_match('`^(.*?)-module-(.*)$`', $id, $matches)) {
                list(, $position, $id) = $matches;

                $genesis = Genesis::instance();

                /** @var Platform $platform */
                $platform = $genesis['platform'];

                if (\GENESIS_DEBUGGER) {
                    Debugger::addMessage("Rendering module {$id} in position {$position}", 'debug');
                }

                /** @var Document $document */
                $document = $genesis['document'];
                $document::push();
                $html = trim($platform->displayModule("{$position}/{$id}", $attribs + ['position' => ['key' => $position]]));

                return $document::pop()->setContent($html);
            }

            if (\GENESIS_DEBUGGER) {
                Debugger::addMessage("Rendering particle {$id}", 'debug');
            }

            // Render particle.
            $layout = $this->loadLayout();
            $particle = $layout->find($id);
        }

        if (empty($particle->type) || $particle->type !== 'particle') {
            throw new \RuntimeException('Not Found', 404);
        }

        $context = $attribs + [
            'Genesis' => $this,
            'inContent' => false
        ];

        return $this->getContent($particle, $context);
    }

    /**
     * Get list of twig paths.
     *
     * @return array
     */
    public static function getTwigPaths()
    {
        /** @var UniformResourceLocator $locator */
        $locator = static::genesis()['locator'];

        return $locator->mergeResources(['genesis-theme://templates', 'genesis-engine://templates']);
    }

    /**
     * @see AbstractTheme::getContext()
     *
     * @param array $context
     * @return array
     */
    public function getContext(array $context): array
    {
        $genesis = static::genesis();
        $grav = Grav::instance();

        /** @var PageInterface $page */
        $page = $grav['page'];

        $context = parent::getContext($context);
        $context = array_replace($context, $grav['twig']->twig_vars);
        $context['site'] = $genesis['site'];

        // Emulate site context.
        if (!isset($context['theme'])) {
            /** @var GravConfig $config */
            $config = $grav['config'];

            $context['theme'] = $config->get('theme');
        }
        if (!isset($context['pages'])) {
            /** @var Pages $pages */
            $pages = $grav['pages'];

            $context['pages'] = $pages->root();
        }
        if (!isset($context['page'])) {
            $context['page'] = $page;
        }
        if (!isset($context['header'])) {
            $context['header'] = $page->header();
        }
        if (!isset($context['media'])) {
            $context['media'] = $page->media();
        }
        if (!isset($context['content'])) {
            $context['content'] = $page->content();
        }

        return $context;
    }
}
