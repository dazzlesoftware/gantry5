<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace dazzlesoftware\gantry5\acp;

class gantry5_module
{
    /** @var string */
    public $page_title;

    /** @var string */
    public $tpl_name;

    /** @var string */
    public $u_action;

    /**
     * @param int|string $id
     * @param string $mode
     * @return void
     */
    public function main($id, $mode)
    {
        global $phpbb_container;

        $this->boot($phpbb_container);

        if (!\defined('GANTRYADMIN_PATH')) {
            \define('GANTRYADMIN_PATH', GANTRY5_PHPBB_EXT_PATH . 'admin');
        }

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

        $router = new \Gantry\Admin\Router($gantry);

        // If something fatals (not merely throws) inside dispatch(), make sure whatever ended up
        // in the output buffer -- including any error text phpBB or PHP itself printed -- still
        // reaches the browser instead of being silently swallowed by an open ob_start().
        \register_shutdown_function(static function () {
            while (\ob_get_level() > 0) {
                \ob_end_flush();
            }
        });

        /** @var \phpbb\request\request $request */
        $request = $phpbb_container->get('request');

        // The shared admin JS calls fetch() directly and never sets X-Requested-With, so
        // \phpbb\request\request::is_ajax() (which keys off that header) never returns true for
        // these calls. `g5_path` is NOT a safe signal on its own: page.html.twig rewrites the
        // visible URL via history.replaceState() to include the current g5_path (so a plain
        // POST-to-window.location.href submit picks it up too), so a plain F5 reload of that
        // rewritten URL would also carry g5_path and would incorrectly get routed as ajax. Only
        // `g5_format` (appended via Router's ajax_suffix, '&g5_format=json') is exclusive to
        // JS-issued fetch() calls -- the URL rewrite deliberately never sets it.
        $isGantryAjax = $request->is_set('g5_format');

        if ($isGantryAjax) {
            // The admin JS fetches particle forms / save results to inject directly into a modal
            // or to parse as JSON -- it wants Gantry's own response completely bare, not wrapped
            // in phpBB's ACP chrome (which would nest a second full <html> document inside the
            // modal, with its own relative asset links resolving wrong once injected).
            try {
                $router->dispatch();
            } catch (\Throwable $e) {
                echo '<pre style="white-space:pre-wrap;color:#c00;padding:1em;background:#fee;">'
                    . htmlspecialchars($e->getMessage() . "\n" . $e->getTraceAsString(), ENT_QUOTES)
                    . '</pre>';
            }
            exit;
        }

        \ob_start();
        try {
            $router->dispatch();
            $html = \ob_get_clean();
        } catch (\Throwable $e) {
            $html = \ob_get_clean();
            $html .= '<pre style="white-space:pre-wrap;color:#c00;padding:1em;background:#fee;">'
                . htmlspecialchars($e->getMessage() . "\n" . $e->getTraceAsString(), ENT_QUOTES)
                . '</pre>';
        }

        /** @var \phpbb\template\template $template */
        $template = $phpbb_container->get('template');
        $template->assign_var('GANTRY_ADMIN_HTML', $html);

        $this->tpl_name = 'acp_gantry5';
        $this->page_title = 'ACP_GANTRY5_TITLE';
    }

    /**
     * Bootstraps the Gantry Framework container for this request, on first use only. Mirrors
     * event/listener.php::boot() (front-end bootstrap) -- kept separate since the ACP module and
     * the front-end listener are wired through completely different phpBB entry points, and the
     * module has direct access to $phpbb_container while the listener gets it via constructor
     * injection.
     *
     * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
     * @return void
     */
    protected function boot($container)
    {
        static $booted = false;

        if ($booted) {
            return;
        }

        $booted = true;

        /** @var \phpbb\path_helper $pathHelper */
        $pathHelper = $container->get('path_helper');

        $rootPath = rtrim((string) realpath($pathHelper->get_phpbb_root_path()), '/\\') . '/';
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

        \Gantry\phpBB\Runtime::boot($container, $rootPath, $pathHelper->get_php_ext(), $extPath);
    }
}
