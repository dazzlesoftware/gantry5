<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Config\Config;
use Gantry\Component\Content\Block\ContentBlock;
use Gantry\Component\Theme\AbstractTheme;
use Gantry\Component\Theme\ThemeTrait;
use Gantry\Debugger;
use Gantry\phpBB\Runtime;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Twig\Environment;
use Twig\Extension\DebugExtension;
use Twig\Extension\EscaperExtension;
use Twig\Loader\LoaderInterface;

/**
 * Class Theme
 * @package Gantry\Framework
 *
 * phpBB 3.1+ ships a native Twig environment (phpbb\template\twig\environment extends
 * \Twig\Environment, registered as the `template.twig.environment` service). Gantry reuses that
 * environment instead of instantiating a second Twig instance, the same way Grav's Theme reuses
 * $grav['twig']->twig().
 */
class Theme extends AbstractTheme
{
    use ThemeTrait;

    /**
     * @return Environment
     */
    public function renderer()
    {
        if (!$this->renderer) {
            $gantry = static::gantry();

            /** @var Environment $twig */
            $twig = Runtime::service('template.twig.environment');
            $loader = $twig->getLoader();

            /** @var Config $global */
            $global = $gantry['global'];

            $debug = $gantry->debug();
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
        if (\is_string($particle)) {
            $id = $particle;
            $particle = (object) ['id' => $particle];
        } else {
            $particle = (object) $particle;
            $id = isset($particle->id) ? $particle->id : null;
        }

        if ($id) {
            if (preg_match('`^(.*?)-module-(.*)$`', $id, $matches)) {
                [, $position, $id] = $matches;

                $gantry = Gantry::instance();

                /** @var Platform $platform */
                $platform = $gantry['platform'];

                if (\GANTRY_DEBUGGER) {
                    Debugger::addMessage("Rendering module {$id} in position {$position}", 'debug');
                }

                /** @var Document $document */
                $document = $gantry['document'];
                $document::push();
                $html = trim($platform->displayModule("{$position}/{$id}", $attribs + ['position' => ['key' => $position]]));

                return $document::pop()->setContent($html);
            }

            if (\GANTRY_DEBUGGER) {
                Debugger::addMessage("Rendering particle {$id}", 'debug');
            }

            $layout = $this->loadLayout();
            $particle = $layout->find($id);
        }

        if (empty($particle->type) || $particle->type !== 'particle') {
            throw new \RuntimeException('Not Found', 404);
        }

        $context = $attribs + [
            'gantry' => $this,
            'inContent' => false
        ];

        return $this->getContent($particle, $context);
    }

    /**
     * @return array
     */
    public static function getTwigPaths()
    {
        /** @var UniformResourceLocator $locator */
        $locator = static::gantry()['locator'];

        return $locator->mergeResources(['gantry-theme://templates', 'gantry-engine://templates']);
    }

    /**
     * Engine templates (@nucleus/page.html.twig etc) reference some includes without the
     * `@nucleus/` namespace prefix (e.g. 'partials/page_head.html.twig'). Those paths must be
     * ADDED to the default Twig namespace, not set as a replacement for it: the default
     * namespace is owned by phpBB's active style (its own template/ folder), which our own
     * captured page body still depends on (forumlist_body.html, navbar_header.html, ...).
     * Overwriting it here would break phpBB's own rendering.
     *
     * @see AbstractTheme::setTwigLoaderPaths()
     *
     * @param LoaderInterface $loader
     * @return LoaderInterface|null
     */
    protected function setTwigLoaderPaths(LoaderInterface $loader)
    {
        $loader = parent::setTwigLoaderPaths($loader);

        if ($loader) {
            foreach (self::getTwigPaths() as $path) {
                $loader->addPath($path);
            }
        }

        return $loader;
    }

    /**
     * @param array $context
     * @return array
     */
    public function getContext(array $context)
    {
        $gantry = static::gantry();

        $context = parent::getContext($context);
        $context['site'] = $gantry['site'];

        return $context;
    }
}
