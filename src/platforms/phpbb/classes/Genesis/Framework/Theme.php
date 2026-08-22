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
use Genesis\phpBB\Runtime;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Twig\Environment;
use Twig\Extension\DebugExtension;
use Twig\Loader\LoaderInterface;

/**
 * Class Theme
 * @package Genesis\Framework
 *
 * phpBB 3.1+ ships a native Twig environment (phpbb\template\twig\environment extends
 * \Twig\Environment, registered as the `template.twig.environment` service). Genesis reuses that
 * environment instead of instantiating a second Twig instance, the same way Grav's Theme reuses
 * $grav['twig']->twig().
 */
class Theme extends AbstractTheme
{
    use ThemeTrait;

    /**
     * @return Environment
     */
    public function renderer(): Environment
    {
        if (!$this->renderer) {
            $genesis = static::genesis();

            /** @var Environment $twig */
            $twig = Runtime::service('template.twig.environment');
            $loader = $twig->getLoader();

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

            // Note: phpBB constructs this Twig environment with autoescape disabled, since its
            // legacy templates output raw HTML vars everywhere without `|raw`. Do NOT force an
            // escaping strategy here (Grav's Theme does, but Grav owns its own, separate Twig
            // environment) -- doing so double-escapes phpBB's own template output.

            // By this point in the request phpBB has already used this *shared* environment to
            // tokenize/parse a large number of its own templates (the whole captured page body).
            // Twig\Environment lazily creates and permanently caches ONE Lexer instance
            // (getLexer()), reused for every tokenize() call for the rest of the environment's
            // lifetime -- and that Lexer is NOT safely reusable indefinitely across this many
            // renders in one request: by the time Genesis's own first render happens, its
            // accumulated internal state causes a genuine mis-tokenization of otherwise-valid
            // template source (confirmed live: engines/common/nucleus/particles/menu.html.twig
            // -- byte-for-byte identical, confirmed via md5 -- threw "A hash key must be followed
            // by a colon" from phpBB's shared environment, but parsed cleanly through the exact
            // same environment object with nothing else changed except installing a fresh Lexer
            // first). Install a clean Lexer before Genesis starts using the environment so none of
            // phpBB's own prior usage carries over into Genesis's render.
            //
            // MUST be phpBB's own \phpbb\template\twig\lexer subclass, not bare \Twig\Lexer --
            // that subclass's tokenize() regex-translates phpBB's own legacy template syntax
            // ({VAR}, {L_VAR}, <!-- IF/BEGIN/INCLUDE --> etc.) into real Twig syntax *before*
            // calling parent::tokenize(); swapping in a vanilla \Twig\Lexer skips that
            // translation entirely, so every legacy tag in phpBB's own captured body (which this
            // same environment also renders) comes out as literal untouched text instead of its
            // real value -- reproduced live as literal "{LAST_VISIT_DATE}"/"{L_LOGIN_LOGOUT}"/etc.
            // text appearing on the page instead of the forum's actual content.
            $twig->setLexer(new \phpbb\template\twig\lexer($twig));

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
     * @return array
     */
    public static function getTwigPaths()
    {
        /** @var UniformResourceLocator $locator */
        $locator = static::genesis()['locator'];

        return $locator->mergeResources(['genesis-theme://templates', 'genesis-engine://templates']);
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
    protected function setTwigLoaderPaths(LoaderInterface $loader): ?FilesystemLoader
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
    public function getContext(array $context): array
    {
        $genesis = static::genesis();

        $context = parent::getContext($context);
        $context['site'] = $genesis['site'];

        return $context;
    }
}
