<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class FrontendCoreModulesTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
    }

    public function testFrontendApplicationUsesEsModulesWithoutCompatibilityFacades(): void
    {
        $application = $this->root . '/assets/common/application';
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($application, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if (!$file->isFile() || $file->getExtension() !== 'js') {
                continue;
            }

            $source = file_get_contents($file->getPathname());
            self::assertIsString($source);
            self::assertDoesNotMatchRegularExpression('/\brequire\s*\(|\bmodule\.exports\b/', $source, $file->getPathname());
        }

        self::assertFileDoesNotExist($application . '/utils/dom.js');
        self::assertFileDoesNotExist($application . '/utils/decouple.js');
    }

    public function testGenesisPublicApiAndNativeOffcanvasContractsArePreserved(): void
    {
        $main = $this->read('assets/common/application/main.js');
        $offcanvas = $this->read('assets/common/application/offcanvas/index.js');

        self::assertStringContainsString('window.Genesis = instances', $main);
        foreach (['ready', 'query', 'queryAll', 'delegate'] as $helper) {
            self::assertStringContainsString($helper, $main);
        }

        foreach (['window.bootstrap', 'Offcanvas', 'getOrCreateInstance', '.hide()'] as $bootstrapApi) {
            self::assertStringContainsString($bootstrapApi, $offcanvas);
        }

        foreach (['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as $obsoleteCustomInteraction) {
            self::assertStringNotContainsString($obsoleteCustomInteraction, $offcanvas);
        }

        foreach (['DocumentTouch', 'msPointerEnabled', 'MSPointer', 'data-g-offcanvas-css3', 'g-offcanvas-css2'] as $legacyApi) {
            self::assertStringNotContainsString($legacyApi, $offcanvas);
        }
    }

    public function testFrontendBuildUsesEsbuildAndGeneratedBundleExposesGenesis(): void
    {
        $rootBuild = $this->read('gulpfile.js');
        $frontendBuild = $this->read('assets/common/gulpfile.js');
        $package = json_decode($this->read('assets/common/package.json'), true, 512, JSON_THROW_ON_ERROR);
        $bundle = $this->read('assets/common/js/main.js');

        self::assertMatchesRegularExpression("/esm:\s*\[[\s\S]*assets\/common\/application\/main\.js/", $rootBuild);
        self::assertStringContainsString("require('esbuild')", $frontendBuild);
        self::assertArrayHasKey('esbuild', $package['devDependencies']);
        self::assertArrayNotHasKey('browserify', $package['devDependencies']);
        self::assertArrayNotHasKey('watchify', $package['devDependencies']);
        self::assertMatchesRegularExpression('/window\.Genesis\s*=/', $bundle);
        self::assertStringNotContainsString('function(require,module,exports)', $bundle);
    }

    public function testMobileMenuIsOwnedByBootstrapOffcanvas(): void
    {
        $layout = $this->read('engines/common/nucleus/templates/layout/offcanvas.html.twig');
        $page = $this->read('engines/common/nucleus/templates/page.html.twig');
        $legacyParticle = $this->read('engines/common/nucleus/particles/mobile-menu.html.twig');
        $menu = $this->read('assets/common/application/menu/index.js');

        self::assertStringContainsString('class="offcanvas {{ bs_side }}', $layout);
        self::assertStringContainsString('id="g-mobilemenu-container"', $layout);
        self::assertStringContainsString('data-bs-dismiss="offcanvas"', $layout);
        self::assertStringContainsString('data-bs-toggle="offcanvas"', $page);
        self::assertStringContainsString('id="g-mobilemenu-container"', $legacyParticle);
        self::assertStringContainsString("'id=\"g-mobilemenu-container\"' not in offcanvas", $layout);
        self::assertStringNotContainsString('if (!this.mobileContainer || !this.mainContainer) return;', $menu);

        foreach (glob($this->root . '/themes/*/common/scss/*/sections/_offcanvas.scss') ?: [] as $themeOffcanvas) {
            $source = file_get_contents($themeOffcanvas);
            self::assertIsString($source);
            self::assertStringNotContainsString('g-offcanvas-open', $source, $themeOffcanvas);
        }
    }

    public function testGenesisFeaturesUsesResponsiveBootstrapGridClasses(): void
    {
        $particle = $this->read('engines/common/nucleus/particles/genesisfeatures.html.twig');
        $blueprint = $this->read('engines/common/nucleus/particles/genesisfeatures.yaml');

        self::assertStringContainsString('col col-12 col-md-{{ columns|e }}', $particle);
        self::assertStringNotContainsString('col-{{ particle.columns', $particle);
        self::assertStringContainsString("particle.columns|default(4) == '33-3' ? 4", $particle);
        self::assertStringContainsString('4: 3 Columns', $blueprint);

        foreach ([
            'themes/argon/common/layouts/home_-_particles.yaml',
            'themes/nectarion/common/layouts/particles_5.yaml',
        ] as $layoutPath) {
            self::assertStringNotContainsString('columns: 33-3', $this->read($layoutPath), $layoutPath);
        }
    }

    public function testArgonContentCubesUseResponsiveBootstrapGridClasses(): void
    {
        $particle = $this->read('themes/argon/common/particles/contentcubes.html.twig');
        $styles = $this->read('themes/argon/common/scss/argon/particles/_contentcubes.scss');

        self::assertSame(2, substr_count($particle, 'class="col-12 col-md-6"'));
        self::assertStringNotContainsString('class="col col-6"', $particle);
        self::assertMatchesRegularExpression(
            '/image-position-right[\s\S]*breakpoint\(no-mobile\)[\s\S]*flex-flow:\s*row-reverse wrap/',
            $styles
        );
        self::assertStringContainsString('width: 100%;', $styles);
    }

    public function testArgonMobileSocialLinksUseAFullWidthHorizontalRow(): void
    {
        $navigation = $this->read('themes/argon/common/scss/argon/sections/_navigation.scss');

        self::assertMatchesRegularExpression(
            '/\.g-social-header[\s\S]*breakpoint\(mobile-only\)[\s\S]*flex:\s*0 0 100%[\s\S]*max-width:\s*100%/',
            $navigation
        );
        self::assertMatchesRegularExpression(
            '/\.g-social[\s\S]*breakpoint\(mobile-only\)[\s\S]*flex-direction:\s*row[\s\S]*flex-wrap:\s*nowrap[\s\S]*justify-content:\s*flex-end/',
            $navigation
        );
    }

    public function testArgonMultiColumnTextStacksOnMobile(): void
    {
        $layout = $this->read('themes/argon/common/layouts/home_-_particles.yaml');
        $styles = $this->read('themes/argon/common/scss/argon/styles/_argon-style.scss');
        $section = strstr($layout, '<div class=\"fp-multi-column-text\">');

        self::assertIsString($section);
        self::assertSame(2, substr_count($section, 'class=\"col-12 col-md-6\"'));
        self::assertStringNotContainsString('class=\"col col-6\"', $section);
        self::assertMatchesRegularExpression(
            '/\.fp-multi-column-text[\s\S]*\[class\*=\"col-\"\][\s\S]*breakpoint\(mobile-only\)[\s\S]*flex:\s*0 0 100%[\s\S]*max-width:\s*100%[\s\S]*padding:\s*0/',
            $styles
        );
    }

    public function testArgonFooterStacksItsLayoutBlocksOnMobile(): void
    {
        $footer = $this->read('themes/argon/common/scss/argon/sections/_footer.scss');

        self::assertMatchesRegularExpression(
            '/#g-footer[\s\S]*breakpoint\(mobile-only\)[\s\S]*> \.container > \.row[\s\S]*> \[class\*=\"col-\"\][\s\S]*flex:\s*0 0 100%[\s\S]*max-width:\s*100%/',
            $footer
        );
        self::assertMatchesRegularExpression(
            '/\.g-horizontalmenu[\s\S]*breakpoint\(mobile-only\)[\s\S]*display:\s*flex[\s\S]*flex-wrap:\s*wrap[\s\S]*justify-content:\s*center/',
            $footer
        );
    }

    public function testNectarionNativeOffcanvasCloseButtonIsVisible(): void
    {
        $offcanvas = $this->read('themes/nectarion/common/scss/nectarion/sections/_offcanvas.scss');

        self::assertMatchesRegularExpression(
            '/\.offcanvas-header[\s\S]*justify-content:\s*flex-end[\s\S]*padding-bottom:\s*0/',
            $offcanvas
        );
        self::assertMatchesRegularExpression(
            '/\.btn-close[\s\S]*z-index:\s*1[\s\S]*filter:\s*invert\(1\)/',
            $offcanvas
        );
    }

    public function testNectarionMobileToggleHasASeparateTouchTarget(): void
    {
        $offcanvas = $this->read('themes/nectarion/common/scss/nectarion/sections/_offcanvas.scss');

        self::assertMatchesRegularExpression(
            '/\.g-offcanvas-toggle[\s\S]*breakpoint\(mobile-only\)[\s\S]*left:\s*0\.75rem[\s\S]*right:\s*auto[\s\S]*width:\s*44px[\s\S]*height:\s*44px/',
            $offcanvas
        );
    }

    public function testNectarionMobileLogoIsCenteredAwayFromTheHamburger(): void
    {
        $navigation = $this->read('themes/nectarion/common/scss/nectarion/sections/_navigation.scss');

        self::assertMatchesRegularExpression(
            '/breakpoint\(mobile-only\)[\s\S]*\.g-logo-block[\s\S]*\.g-logo[\s\S]*margin-left:\s*auto[\s\S]*margin-right:\s*auto/',
            $navigation
        );
    }

    public function testNectarionHidesDesktopMenuWrapperOnMobile(): void
    {
        $navigation = $this->read('themes/nectarion/common/scss/nectarion/sections/_navigation.scss');

        self::assertStringContainsString('.g-main-nav.hidden', $navigation);
        self::assertStringContainsString('display: none !important;', $navigation);
    }

    public function testNectarionSeparateHeaderMenuGetsItsOwnMobileRow(): void
    {
        $header = $this->read('themes/nectarion/common/scss/nectarion/sections/_header.scss');

        self::assertMatchesRegularExpression(
            '/\.container[\s\S]*breakpoint\(mobile-only\)[\s\S]*> \.row > \[class\*=\"col-\"\][\s\S]*flex:\s*0 0 100%[\s\S]*max-width:\s*100%/',
            $header
        );
    }

    public function testNectarionHomeColumnsStackOnMobile(): void
    {
        $main = $this->read('themes/nectarion/common/scss/nectarion/sections/_main.scss');
        $sidebar = $this->read('themes/nectarion/common/scss/nectarion/sections/_sidebar.scss');
		$footer = $this->read('themes/nectarion/common/scss/nectarion/sections/_footer.scss');
		$layout = $this->read('themes/nectarion/common/layouts/home.yaml');

		self::assertStringContainsString('$breakpoints-mobile-menu-breakpoint', $main);
		self::assertStringContainsString('$breakpoints-mobile-menu-breakpoint', $footer);
		self::assertStringNotContainsString('@media (max-width: 60rem)', $main . $sidebar . $footer);
		self::assertStringNotContainsString('#g-container-3489', $main . $sidebar . $footer);
		self::assertStringContainsString('class: fp-home-content', $layout);
		self::assertStringContainsString('class: fp-side-notes', $layout);
		self::assertStringContainsString('class: fp-promoted-news', $layout);
    }

    public function testMenuUsesTheConfiguredMobileMenuBreakpoint(): void
    {
        $menu = $this->read('assets/common/application/menu/index.js');
        $offcanvas = $this->read('engines/common/nucleus/templates/layout/offcanvas.html.twig');

        self::assertStringNotContainsString('"48rem"', $menu);
        self::assertStringContainsString('data-g-menu-breakpoint', $offcanvas);
        self::assertStringContainsString("styles.breakpoints.mobile-menu-breakpoint", $offcanvas);
    }

    private function read(string $path): string
    {
        $contents = file_get_contents($this->root . '/' . $path);
        self::assertIsString($contents, sprintf('Unable to read %s.', $path));

        return $contents;
    }
}
