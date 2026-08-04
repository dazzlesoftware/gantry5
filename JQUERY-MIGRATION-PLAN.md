# jQuery Migration Plan

**Audit date:** August 3, 2026
**Project:** Genesis (formerly Gantry 5)
**Status:** Implementation complete; final repository validation recorded below.

## Acceptance criteria

| Requirement | Result |
|---|---|
| Genesis and recovered themes work without `window.jQuery` | Complete |
| No first-party JavaScript or Twig jQuery calls | Complete |
| No Genesis jQuery/jQuery UI loader or platform registration | Complete |
| Repeated behavior consolidated into shared native controllers | Complete |
| Obsolete jQuery plugin assets removed after migration | Complete |
| Core bundle and PHP tests pass | Complete |
| Audit documentation reflects current repository state | Complete |

## Completed work

1. Replaced core Lightcase, Grav search, platform content pagination, DebugBar loading, and Frameworks atom options.
2. Migrated duplicated theme families: navigation, headers, tabs, accordions, forms, counters, calendars, audio/video, galleries, filters, sliders, carousels, news components, overlays, and theme-specific interactions.
3. Replaced abandoned jQuery plugins with smaller shared native controllers rather than porting their internal APIs.
4. Removed copied plugin files and direct CDN/platform loader paths once every consumer was migrated.
5. Removed platform registration keys and methods for jQuery, jQuery UI, and Bootstrap 2.
6. Removed unused compatibility-era NPM dependencies and refreshed the lockfile.

## Compatibility notes

- Existing particle names and most markup/class contracts are retained so theme SCSS and stored outlines continue to work.
- FlexSlider and Flipster remain particle names only; their former plugin runtimes are gone.
- Existing Lightcase `data-rel` markup is supported by the native delegated lightbox.
- Swiper 14 remains an intentional dependency-free carousel library. Theme-owned legacy Swiper copies were removed in favor of the shared generated bundle.
- AOS contains no jQuery integration; its minified internal `$()` function is a scan false positive.
- phpBB template JavaScript is platform-owned and outside the recovered gantry-theme migration. It was not modified because the workspace contains unrelated user changes in that integration.

## Reproducible scans

```powershell
# Direct first-party theme calls (expected: no output)
rg -l 'jQuery|\$\(' themes --glob '*.js' --glob '!*/aos.js' --glob '!helium/phpbb/**'
rg -l 'jQuery|\$\(' themes --glob '*.twig'

# Genesis loader and registration APIs (expected: no active matches)
rg -n "gantry\.load\('jquery'\)|jquery\.framework|jquery\.ui|registerJquery|wp_enqueue_script\('jquery'" themes engines src platforms

# Obsolete runtime filenames (particle/SCSS compatibility names may remain)
rg --files | rg -i 'jquery|jquery-ui|flexslider\.js|flipster\.js|filterizr|lightslider|fullpage\.js|enllax|morris|raphael'
```

## Validation

- `assets-build.bat js --prod`: passed.
- `node --check` over all 196 changed JavaScript files: passed.
- `php -l` over all 4 changed PHP files: passed.
- `php83-tests.bat`: passed (14 tests, 24 assertions, 2 platform-specific skips).
- `git diff --check`: passed.
- `npm install --package-lock-only --ignore-scripts`: passed.
- `scss-validate-all.bat`: passed; all 294 platform/theme entry points compiled without warnings.
