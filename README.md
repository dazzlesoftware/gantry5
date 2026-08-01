## Recent Updates – 2026 Activity & 5.6.0 Release

We've been heads-down on development since taking over stewardship, with lighter public communication than ideal (last major updates were quieter after October 2025). Thank you for your patience—we're back to more visible progress.

**Gantry 5.6.0** was released on **February 24, 2026** (just released!):
- Full native compatibility with **Joomla 5** (dropped Joomla 4 support)
- PHP **8.3.0 or newer** is required
- Platform-specific improvements and fixes across Joomla, WordPress, and Grav
- Updated compatibility matrix and admin notices for smoother upgrades
- Recent commits include Joomla 5 native changes, WordPress page assignment fixes, code cleanups, and version bumps

Check the full [CHANGELOG.md](https://github.com/gantry/gantry5/blob/develop/CHANGELOG.md) for details.

**Project Status**  
Gantry is actively developed and maintained by the Dazzle Software team. It's **not** in maintenance-only mode or abandoned—we're committed long-term.

**What's Ahead in 2026**
- Genesis remains **free and open-source** under GPL-3.0-or-later.
- Focus areas: **Developer tools** + **AI-assisted features** (smarter particle/outline workflows, AI integration points).
- Optional premium **add-on packages** to expand core capabilities without gating anything.
- Actively working on a **theme migration addon** to help convert legacy Dazzle Software Gantry themes (e.g., Quasar, Dominion, Galatea, Versla, and similar from their older catalog) to current Gantry using **Helium** (or Hydrogen) as the base—while preserving as much of the original design, layout, and styling as possible.  
  This includes tools to adapt/replace bundled legacy Dazzle Software addons/plugins like **RokSprocket**, **RokGallery**, **RokNavMenu**, **RokCandy**, **RokQuickCart**, **RokFeatureTable**, and others that were common in RT themes.  
  *No firm promises on 100% perfect 1:1 fidelity* (legacy extensions + platform changes can be complex), but we believe we can cover most common scenarios and make upgrades far easier for sites still on older RT setups.

- **Gantry 6.0** (next major version) is in planning/active development, with deeper modern integrations (including MCP support). A detailed feature list and roadmap will be shared soon via GitHub discussions and gantry.org.

**Community & Transparency**  
We'll improve regular updates here on GitHub (discussions/announcements), gantry.org/blog, and possibly X. If you have open PRs, issues, or ideas—especially around legacy theme migrations—please open a discussion or comment below. We're prioritizing backlog review and merges now that 5.6.0 is out.

Thanks for sticking with Gantry. Your feedback and support mean a lot—let's keep building!

— Gene Teigland, Dazzle Software



> [!IMPORTANT]
> **A NEW CHAPTER FOR GANTRY** - [Read about it here](https://dazzlesoftware.org/gantry/)
>
Dazzle Software is now the official steward of Gantry and gantry.org, the powerful theming framework that has shaped websites across WordPress, Joomla, and Grav for over a decade. Gantry has long been trusted by developers and organizations for its flexibility, speed, and clean design principles. We’ve crafted with it. We’ve relied on it. And now—we’re building its future.

Gantry’s success is built on the vision and dedication of Andy Miller and the team at Dazzle Software. Their innovative work laid the foundation for a framework trusted by thousands. We are honored that they have officially chosen us to carry this legacy forward and continue the development of Gantry into the future.

================

[![PHPStan](https://img.shields.io/badge/PHPStan-enabled-brightgreen.svg?style=flat)](https://github.com/phpstan/phpstan)
[![Join the chat at https://gitter.im/gantry/gantry5](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gantry/gantry5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Ready to get started with Gantry 5? That's great! We are here to help.

On this page, you will get some quick tips to help you hit the ground running with Gantry 5. You can find more detailed documentation for each of these tips by clicking the **Learn More** button at the bottom of each section.

We hope you enjoy Gantry 5 every bit as much as we have enjoyed making it.

## Browser Requirements

The back-end administration requirements of Gantry in order of preference are as follows:

* Google Chrome 60+
* Firefox 60+
* Safari 12+
* Opera 47+
* MS Edge

**Note:** Internet Explorer is no longer supported

## Installing Gantry 5 and the Hydrogen Theme

Gantry 5 is a framework by which Gantry-powered themes are made. In order for a Gantry theme to work, you will need to install both the **framework** and the **theme**. Doing this is not difficult at all.

The first thing you need to do is download the latest build of Gantry 5 and Hydrogen. You can do so by clicking the links below, or via [GitHub](http://github.com/gantry/gantry5/).

| [Download Stable](http://www.gantry.org/downloads#gantry5) | [Download CI Builds](http://gantry.org/downloads#ci-builds) |
|:---------------------------------------------------:|:---------------------------------------------------------:|

Once you have the latest packages, installation is simple. We have provided a step-by-step guide in the **Installation** portion of this documentation.

[**Learn More**](http://docs.gantry.org/gantry5/basics/installation)

## Accessing the Gantry Administrator

### Joomla

When you have installed and activated both the Gantry framework and Hydrogen, you can access the Gantry 5 administrator in several different ways. The easiest being simply navigating to **Components > Gantry 5 Templates** from the back end of Joomla.

Here, you will see a list of any installed Gantry-powered themes. You can **Preview** the theme from here or select **Configure** to go directly to the **Gantry Administrator** where you can get started modifying your Gantry-powered site.

## Navigating the Gantry 5 Administrator

The Gantry Administrator has multiple administrative tools you can flip through to configure how your Gantry-powered theme looks and functions. Here is a quick breakdown of each of these tools, and what you can do with them.

You will notice the following menu items in the Gantry 5 Administrator:

1. **Menu Editor**: This administrative panel gives you the ability to enhance the platform's menu by altering styling, rearranging links, and creating menu items that sit outside of the CMS's integrated Menu Manager.

2. **About**: This page gives you quick, at-a-glance information about the currently-accessed theme. This is a one-stop shop for information about the theme including: name, version number, creator, support links, features, and more.

3. **Platform Settings**: This button takes you to the CMS' settings page for Gantry 5. In Joomla, this is the **Permissions** configuration page.

4. **Clear Cache**: This button clears the cache files related to Gantry. This includes all of the temporary files outside of CSS and configuration information.

5. **Outlines Dropdown**: This dropdown makes it easy to quickly switch between Outlines without having to leave the Gantry Administrator.

6. **Styles**: This administrative panel gives you access to style related outline settings. This includes things like theme colors, fonts, style presets, and more.

7. **Settings**: This administrative panel offers you the ability to configure the functional settings of the theme. This includes setting defaults for Particles, as well as enabling/disabling individual Particles.

8. **Layout**: This administrative panel is where you would configure the layout for your theme. Creating an placing module positions, Particles, spacers, and non-rendered scripts such as Google Analytics code is all done in this panel.

[**Learn More**](http://docs.gantry.org/gantry5/configure/gantry-admin)

## What are Outlines, Particles, Atoms, etc.?

Because Gantry 5 is so different from any version of Gantry before it, we came up with some terms to help make sense of the relationships Gantry's new features have with one-another. Here is a quick breakdown of commonly used terms related to Gantry 5.

| Term          | Definition                                                                                                                                             |
| :-----        | :-----                                                                                                                                                 |
| Outline       | A configurable style used in one or more areas of your site. It serves as the container on which a page's style, settings, and layout are set.         |
| Particle      | A typically small block of data used on the front end. It acts a lot like a widget/module, but can be easily configured in the Gantry 5 Administrator. |
| Atom          | A type of Particle that contains non-rendered data, such as custom scripting (JS, CSS, etc.) or analytics scripts for traffic tracking.                |

[**Learn More**](http://docs.gantry.org/gantry5/basics/terminology)

## Where to Get Help

A chat room has been set up using [Gitter](https://gitter.im/gantry/gantry5) where you can go to talk about the project with developers, contributors, and other members of the community. This is the best place to go to get quick tips and discuss features with others.

[Documentation](http://docs.gantry.org) is also available, and being continually added to as development progresses. Is something missing? You can contribute to the documentation through GitHub.

## How to Contribute

Contributing to the Gantry 5 framework, or to its associated documentation is easy. Development for both of these projects is being conducted via [Github](http://github.com), where you can submit **Issues** to report any bugs or suggest improvements, as well as submit your own **Pull Requests** to submit your own fixes and additions.

We recommend chatting with the team via [Gitter](https://gitter.im/gantry/gantry5) prior to submitting the pull request to avoid doubling up on a fix that is already pending or likely to be overwritten by an upcoming change.

## Developing from Source on Windows

The repository includes Windows batch scripts for installing dependencies, compiling assets, running the PHP compatibility suite, creating distributable packages, and resetting the development environment. Run them from a Command Prompt or PowerShell window opened at the repository root.

### Requirements

- PHP **8.3.0 or newer** available as `php` in `PATH`.
- [Composer](https://getcomposer.org/) available as `composer` in `PATH`.
- Node.js **20.19.0 or newer**, including `npm.cmd`, in `PATH`.
- Windows PowerShell for the repository-wide Node cleanup script.

The scripts use the repository-local Gulp installation, so installing Gulp globally is not required.

### Recommended First-Time Build Order

From the repository root, run:

```bat
composer-install-all.bat
assets-install.bat
assets-build.bat all
php83-tests.bat
php bin\validate-joomla-scss.php
php bin\validate-wordpress-scss.php
php bin\validate-grav-scss.php
package-build.bat dev
```

This order ensures that PHP and package-builder dependencies exist before testing or packaging, and that all JavaScript and SCSS assets have been compiled before packages are created.

For a production package build, use `assets-build.bat all --prod` followed by `package-build.bat prod`.

### Batch Script Reference

| Script | Purpose | When to run it |
|:--|:--|:--|
| `composer-install-all.bat` | Verifies PHP 8.3+, creates missing platform `src` junctions, and runs `composer install` in the root, builder, current platform, and debug-bar projects. | First setup, after a `composer.lock` change, or after Composer cleanup. |
| `assets-install.bat` | Verifies Node.js 20.19.0+ and runs `npm install` in the root and all asset subprojects. | First setup, after a `package.json` or lock-file change, or after Node cleanup. |
| `assets-build.bat` | Runs the local Gulp compiler. It accepts `all`, `css`, or `js`, plus an optional `--prod`. | After asset installation and whenever JS or SCSS needs compiling. |
| `assets-watch.bat` | Runs Gulp in watch mode for `all`, `css`, or `js`. Press `Ctrl+C` to stop it. | During active frontend development. |
| `php83-tests.bat` | Verifies PHP 8.3+ and runs the PHPUnit compatibility suite with TestDox output. Extra PHPUnit arguments are forwarded. | After Composer installation and before packaging or committing PHP changes. |
| `package-build.bat` | Runs the Phing package builder through `bin\build` and writes packages to `dist`. | After dependencies, assets, and tests are ready. |
| `wordpress-deploy-builds.bat` | Replaces the local WordPress `gantry5` plugin and all `g5_*` themes with packages from `dist`. Other plugins and themes are preserved. | After `package-build.bat wordpress-dev` when refreshing the local WordPress test site. |
| `assets-reset.bat` | Runs targeted asset cleanup and then reinstalls the four known asset projects. | When the normal Node installation is stale or damaged. |
| `assets-cleanup.bat` | Removes `node_modules` from the root and the three known asset subprojects. | Before a targeted clean reinstall. Usually use `assets-reset.bat` instead. |
| `node-modules-cleanup-all.bat` | Recursively removes every outermost `node_modules` directory under the repository, including the root. | For a complete Node reset. Use `--dry-run` or `-n` to preview. |
| `composer-cleanup-all.bat` | Removes all known Composer `vendor` directories without changing lock files. | For a complete PHP reset; follow it with `composer-install-all.bat`. |

### Asset Commands

```bat
rem Compile all development assets
assets-build.bat
assets-build.bat all

rem Compile only CSS or JavaScript
assets-build.bat css
assets-build.bat js

rem Compile minified production assets without source maps
assets-build.bat all --prod

rem Watch all files, SCSS only, or JavaScript only
assets-watch.bat
assets-watch.bat css
assets-watch.bat js
```

### Package Build Targets

`package-build.bat` defaults to `dev` and accepts these targets:

| Target | Output |
|:--|:--|
| `dev` | Development packages for Joomla, WordPress, and Grav. |
| `prod` | Production packages for Joomla, WordPress, and Grav. |
| `joomla-dev` / `joomla-prod` | Joomla packages only. |
| `wordpress-dev` / `wordpress-prod` | WordPress packages only. |
| `grav-dev` / `grav-prod` | Grav packages only. |

Additional Phing properties can be passed after the target, for example:

```bat
package-build.bat wordpress-prod -Dversion=6.0.0
```

Existing files in `dist` may be replaced during a package build.

### Modern SCSS Validation

Validate every common and platform-specific theme entry point with the installed
scssphp 2.x compiler before packaging:

```bat
php bin\validate-joomla-scss.php
php bin\validate-wordpress-scss.php
php bin\validate-grav-scss.php
```

These validators use only the current platform Composer dependencies. They do
not load the removed scssphp 1.x compatibility projects. WordPress packages
bundle the current stable Twig 3 runtime; Grav uses the Twig runtime supplied by
the current stable Grav installation instead of bundling a second copy.

Run every platform validator and treat Sass warnings and deprecations as build
failures with:

```bat
scss-validate-all.bat
```

The batch script checks Joomla, WordPress, and Grav even if an earlier platform
fails, then returns a non-zero exit code if any SCSS entry point fails to compile
or emits a warning. Individual platform validators can use the same behavior by
adding `--strict-warnings`:

```bat
php bin\validate-wordpress-scss.php --strict-warnings
```

### Deploying to the WordPress Test Site

Build and deploy the WordPress development packages with:

```bat
package-build.bat wordpress-dev
wordpress-deploy-builds.bat
```

The deploy script defaults to:

```text
C:\wamp64\www\wordpress\wp-content
```

It validates the target and package set before making changes. It then deletes the existing `plugins\gantry5` directory and every `themes\g5_*` directory before extracting the matching development packages. WordPress default themes, other themes, and other plugins are preserved.

An alternate `wp-content` path and package suffix can be supplied:

```bat
wordpress-deploy-builds.bat "D:\sites\wordpress\wp-content" develop
```

### Complete Clean Rebuild

Use this sequence when both PHP and Node dependencies need to be rebuilt from scratch:

```bat
composer-cleanup-all.bat
node-modules-cleanup-all.bat
composer-install-all.bat
assets-install.bat
assets-build.bat all
php83-tests.bat
package-build.bat dev
```

Cleanup scripts remove generated dependency directories only. They do not remove Composer or npm lock files.
## Updating Google Fonts

The Google Fonts JSON file can be generated by following guide at `https://developers.google.com/fonts/docs/developer_api` or simply using the `https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR-API-KEY` url. You need to enable usage of Google Fonts API and provide your API key in the place of `YOUR-API-KEY`.

## License

Genesis is licensed under the **GNU General Public License version 3 or later (GPL-3.0-or-later)**.
