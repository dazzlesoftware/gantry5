<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace dazzlesoftware\gantry5\event;

use phpbb\event\data;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Boots the Gantry Framework for the current phpBB request and lets Gantry render the entire
 * page, the same way Gantry owns the page in Joomla/WordPress/Grav.
 *
 * phpBB always compiles head+body+footer as a single Twig template per request (the "body"
 * handle, e.g. index_body.html, which itself `<!-- INCLUDE -->`s overall_header.html /
 * overall_footer.html). This listener suppresses phpBB's own final render/echo of that handle
 * (via the `display_template` override on `core.page_footer_after`), captures the fully
 * rendered HTML as a string instead, splits it at the `<!-- GANTRY:HEAD_END -->` marker (see
 * themes/helium/phpbb/template/overall_header.html) into a <head> fragment and a body fragment,
 * and hands both to Gantry's own page.html.twig so Gantry can build the real <html>/<head>/
 * <body> around them with its own positions.
 */
class listener implements EventSubscriberInterface
{
    /** @var ContainerInterface */
    protected $container;

    /** @var \phpbb\path_helper */
    protected $pathHelper;

    /** @var bool */
    protected $booted = false;

    /**
     * @param ContainerInterface $container
     * @param \phpbb\path_helper $pathHelper
     */
    public function __construct(ContainerInterface $container, \phpbb\path_helper $pathHelper)
    {
        $this->container = $container;
        $this->pathHelper = $pathHelper;
    }

    /**
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return [
            'core.page_header' => 'onPageHeader',
            'core.page_footer_after' => 'onPageFooterAfter',
        ];
    }

    /**
     * Fires early in the request, well before phpBB compiles any Twig template. Registering
     * Gantry's Twig extension here (via getTheme()->renderer()) is required -- Twig locks its
     * extension set the first time it renders anything, and phpBB's own header/body/footer
     * render happens before core.page_footer_after, so registering there is too late.
     *
     * @return void
     */
    public function onPageHeader()
    {
        $this->getTheme()->renderer();
    }

    /**
     * @param data $event
     * @return void
     */
    public function onPageFooterAfter(data $event)
    {
        if (!$event['display_template']) {
            // Something already suppressed the normal render (e.g. an AJAX response); leave it alone.
            return;
        }

        /** @var \phpbb\template\template $template */
        $template = $this->container->get('template');
        $rendered = $template->assign_display('body', '', true);

        $marker = '<!-- GANTRY:HEAD_END -->';
        $pos = strpos($rendered, $marker);
        if ($pos === false) {
            $head = '';
            $body = $rendered;
        } else {
            $head = substr($rendered, 0, $pos);
            $body = substr($rendered, $pos + \strlen($marker));
        }

        try {
            $rendered_page = $this->getTheme()->render('@nucleus/index.html.twig', [
                'content' => $body,
                'phpbb_head' => $head,
            ]);
        } catch (\Throwable $e) {
            $rendered_page = '<pre style="white-space:pre-wrap;color:#c00;padding:1em;background:#fee;">'
                . htmlspecialchars($e->getMessage() . "\n" . $e->getTraceAsString(), ENT_QUOTES)
                . '</pre>';
        }

        // Defensive safety net: the base output-buffer level at this point in a phpBB request is
        // always exactly 1 (opened by phpBB's own bootstrap). A Twig \Exception/\Error thrown
        // while inside a native `{% set x %}...{% endset %}` capture (compiles to
        // `ob_start(); ...; $x = ob_get_clean();`) skips that ob_get_clean(), leaking an extra
        // open buffer level for the rest of the request -- this actually happened here once (see
        // Theme::renderer()'s Lexer-reset fix for the real cause: a SyntaxError from a corrupted
        // shared Twig Lexer, caught by the particle's own outer `{% try %}` so render() itself
        // still returned successfully) and produced a silent `Content-Length: 0` response, since
        // phpBB's own exit_handler() (includes/functions.php) only pops ONE buffer level
        // (`(ob_get_level() > 0) ? @ob_flush() : @flush();`) -- insufficient with 2+ open.
        // Collapse back to the 1-level baseline unconditionally before echoing, so any future
        // exception-during-a-capture bug degrades to a normal caught-error page instead of a
        // silently empty one.
        while (ob_get_level() > 1) {
            ob_end_flush();
        }

        echo $rendered_page;

        $event['display_template'] = false;
    }

    /**
     * @return \Gantry\Framework\Theme
     */
    protected function getTheme()
    {
        $this->boot();

        $gantry = \Gantry\Framework\Gantry::instance();

        if (!isset($gantry['theme'])) {
            $gantry['theme.path'] = GANTRY5_PHPBB_EXT_PATH . 'themes/g5_helium';
            $gantry['theme.name'] = 'g5_helium';
            $gantry['theme'] = static function ($c) {
                return new \Gantry\Framework\Theme($c['theme.path'], $c['theme.name']);
            };

            /** @var \Gantry\Framework\Theme $theme */
            $theme = $gantry['theme'];
            $theme->registerStream();
        }

        return $gantry['theme'];
    }

    /**
     * Bootstraps the Gantry Framework container for this request, on first use only.
     *
     * @return void
     */
    protected function boot()
    {
        if ($this->booted) {
            return;
        }

        $this->booted = true;

        $rootPath = rtrim((string) realpath($this->pathHelper->get_phpbb_root_path()), '/\\') . '/';
        $extPath = rtrim((string) realpath(__DIR__ . '/..'), '/\\') . '/';

        if (!\defined('GANTRY5_PHPBB_ROOT_PATH')) {
            \define('GANTRY5_PHPBB_ROOT_PATH', $rootPath);
        }
        if (!\defined('GANTRY5_PHPBB_EXT_PATH')) {
            \define('GANTRY5_PHPBB_EXT_PATH', $extPath);
        }

        require_once $extPath . 'vendor/autoload.php';
        require_once $extPath . 'src/Loader.php';

        \Gantry5\Loader::setup();

        \Gantry\phpBB\Runtime::boot($this->container, $rootPath, $this->pathHelper->get_php_ext(), $extPath);
    }
}
