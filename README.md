# Genesis

> Genesis is the new name for Genesis 5. During the transition, installed extensions, package names, filesystem paths, APIs, and download URLs may continue to use the `genesis`, `Genesis`, or `Genesis` identifiers for compatibility.

## Recent Updates – 2026 Activity & 5.6.0 Release

We've been heads-down on development since taking over stewardship, with lighter public communication than ideal (last major updates were quieter after October 2025). Thank you for your patience—we're back to more visible progress.

**Genesis 5.6.0** was released under the former product name on **February 24, 2026**:
- Full native compatibility with **Joomla 5** (dropped Joomla 4 support)
- PHP **8.3.0 or newer** is required
- Platform-specific improvements and fixes across Joomla, WordPress, and Grav
- Updated compatibility matrix and admin notices for smoother upgrades
- Recent commits include Joomla 5 native changes, WordPress page assignment fixes, code cleanups, and version bumps

Check the full [CHANGELOG.md](https://github.com/genesis/genesis/blob/develop/CHANGELOG.md) for details.

**Project Status**  
Genesis is actively developed and maintained by the Dazzle Software team. It is **not** in maintenance-only mode or abandoned—we are committed long-term.

**What's Ahead in 2026**
- Genesis remains **free and open-source** under GPL-3.0-or-later.
- Focus areas: **Developer tools** + **AI-assisted features** (smarter particle/outline workflows, AI integration points).
- Optional premium **add-on packages** to expand core capabilities without gating anything.
- Actively working on a **theme migration addon** to help convert legacy Dazzle Software Genesis themes (e.g., Quasar, Dominion, Galatea, Versla, and similar from their older catalog) to Genesis using **Helium** (or Hydrogen) as the base—while preserving as much of the original design, layout, and styling as possible.
  This includes tools to adapt/replace bundled legacy Dazzle Software addons/plugins like **RokSprocket**, **RokGallery**, **RokNavMenu**, **RokCandy**, **RokQuickCart**, **RokFeatureTable**, and others that were common in RT themes.  
  *No firm promises on 100% perfect 1:1 fidelity* (legacy extensions + platform changes can be complex), but we believe we can cover most common scenarios and make upgrades far easier for sites still on older RT setups.

- **Genesis** is in active development as the successor name for Genesis, with deeper modern integrations (including MCP support). A detailed feature list and roadmap will be shared through the project channels.

**Community & Transparency**  
We'll improve regular updates here on GitHub (discussions/announcements), genesis.org/blog, and possibly X. If you have open PRs, issues, or ideas—especially around legacy theme migrations—please open a discussion or comment below. We're prioritizing backlog review and merges now that 5.6.0 is out.

Thanks for joining us as Genesis becomes Genesis. Your feedback and support mean a lot—let's keep building!

— Gene Teigland, Dazzle Software



> [!IMPORTANT]
> **GENESIS IS BECOMING GENESIS** - [Read about the stewardship transition](https://dazzlesoftware.org/genesis/)
>
Dazzle Software is the official steward of the framework formerly known as Genesis. Under its new Genesis name, the project continues the flexible, fast, and clean theming framework used across WordPress, Joomla, Grav, and phpBB.

Genesis builds on Genesis's established architecture and ecosystem. Existing Genesis installations and themes remain a compatibility priority throughout the rename.

================

[![PHPStan](https://img.shields.io/badge/PHPStan-enabled-brightgreen.svg?style=flat)](https://github.com/phpstan/phpstan)
[![Join the chat at https://gitter.im/genesis/genesis](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/genesis/genesis?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Ready to get started with Genesis? That's great! We are here to help.

On this page, you will get some quick tips to help you hit the ground running with Genesis. Some installation packages and linked documentation still use the Genesis 5 name during the compatibility transition.

We hope you enjoy Genesis every bit as much as we enjoy building it.

## Browser Requirements

The back-end administration requirements of Genesis in order of preference are as follows:

* Google Chrome 60+
* Firefox 60+
* Safari 12+
* Opera 47+
* MS Edge

**Note:** Internet Explorer is no longer supported

## Installing Genesis and the Hydrogen Theme

Genesis is a framework for building and running Genesis-powered themes. You need to install both the **framework** and a compatible **theme**. Existing Genesis 5 themes remain part of the supported compatibility path.

During the rename transition, download packages continue to use their existing Genesis 5 names and locations. Download the latest framework build and Hydrogen using the links below or from [GitHub](http://github.com/genesis/genesis/).

| [Download Stable](https://dazzlecms.org/downloads) |
|:---------------------------------------------------:|:---------------------------------------------------------:|

Once you have the latest packages, installation is simple. We have provided a step-by-step guide in the **Installation** portion of this documentation.

[**Learn More**](https://codex.dazzlecms.org/basics/installation)

## Accessing the Genesis Administrator

### Joomla

After installing and activating the Genesis framework and Hydrogen, you can access its administrator in several ways. During the compatibility transition, Joomla may still display the legacy **Components > Genesis 5 Templates** menu and extension identifier.

Here, you will see a list of installed Genesis-compatible themes. You can **Preview** a theme or select **Configure** to open the administrator and modify your site.

## Navigating the Genesis Administrator

The Genesis Administrator has multiple tools for configuring how your theme looks and functions. Here is a quick breakdown of each tool.

You will notice the following menu items in the Genesis Administrator:

1. **Menu Editor**: This administrative panel gives you the ability to enhance the platform's menu by altering styling, rearranging links, and creating menu items that sit outside of the CMS's integrated Menu Manager.

2. **About**: This page gives you quick, at-a-glance information about the currently-accessed theme. This is a one-stop shop for information about the theme including: name, version number, creator, support links, features, and more.

3. **Platform Settings**: This button takes you to the CMS settings page for Genesis. In Joomla, this is the **Permissions** configuration page.

4. **Clear Cache**: This button clears the cache files related to Genesis. This includes all of the temporary files outside of CSS and configuration information.

5. **Outlines Dropdown**: This dropdown makes it easy to quickly switch between Outlines without having to leave the Genesis Administrator.

6. **Styles**: This administrative panel gives you access to style related outline settings. This includes things like theme colors, fonts, style presets, and more.

7. **Settings**: This administrative panel offers you the ability to configure the functional settings of the theme. This includes setting defaults for Particles, as well as enabling/disabling individual Particles.

8. **Layout**: This administrative panel is where you would configure the layout for your theme. Creating an placing module positions, Particles, spacers, and non-rendered scripts such as Google Analytics code is all done in this panel.

[**Learn More**](https://codex.dazzlecms.org/configure/genesis-admin)

## What are Outlines, Particles, Atoms, etc.?

Genesis uses a few framework-specific terms. Here is a quick breakdown of their relationships.

| Term          | Definition                                                                                                                                             |
| :-----        | :-----                                                                                                                                                 |
| Outline       | A configurable style used in one or more areas of your site. It serves as the container on which a page's style, settings, and layout are set.         |
| Particle      | A typically small block of data used on the front end. It acts like a widget or module and can be configured in the Genesis Administrator. |
| Atom          | A type of Particle that contains non-rendered data, such as custom scripting (JS, CSS, etc.) or analytics scripts for traffic tracking.                |

[**Learn More**](https://codex.dazzlecms.org/basics/terminology)

## Where to Get Help

A chat room has been set up using [Gitter](https://gitter.im/genesis/genesis) where you can go to talk about the project with developers, contributors, and other members of the community. This is the best place to go to get quick tips and discuss features with others.

[Documentation](https://codex.dazzlecms.org) is also available, and being continually added to as development progresses. Is something missing? You can contribute to the documentation through GitHub.

## How to Contribute

Contributing to Genesis or its documentation is easy. Development is conducted through [GitHub](https://github.com), where you can submit issues, suggest improvements, and open pull requests.

We recommend chatting with the team via [Gitter](https://gitter.im/genesis/genesis) prior to submitting the pull request to avoid doubling up on a fix that is already pending or likely to be overwritten by an upcoming change.

## Developing from Source on Linux or macOS

Linux and macOS automation is available under `bin/tools/unix`. It requires
Bash, PHP 8.3+, Composer, and Node.js 20.19.0+. From the repository root, run:

```bash
bin/tools/unix/composer-install-all.sh
bin/tools/unix/assets-install.sh
bin/tools/unix/assets-build.sh all
bin/tools/unix/php83-tests.sh
bin/tools/unix/scss-validate-all.sh
bin/tools/unix/package-build.sh dev
```

The Unix tools mirror the Windows tool names and arguments. See
`bin/tools/unix/README.md` for deployment defaults and PHP configuration.

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
bin\tools\windows\composer-install-all.bat
bin\tools\windows\assets-install.bat
bin\tools\windows\assets-build.bat all
bin\tools\windows\php83-tests.bat
bin\tools\windows\scss-validate-all.bat
bin\tools\windows\package-build.bat dev
```

This order ensures that PHP and package-builder dependencies exist before testing or packaging, and that all JavaScript and SCSS assets have been compiled before packages are created.

For a production package build, use `bin\tools\windows\assets-build.bat all --prod` followed by `bin\tools\windows\package-build.bat prod`.

### Batch Script Reference

| Script | Purpose | When to run it |
|:--|:--|:--|
| `bin\tools\windows\composer-install-all.bat` | Verifies PHP 8.3+, creates missing platform `src` junctions, and runs `composer install` in the root, builder, current platform, and debug-bar projects. | First setup, after a `composer.lock` change, or after Composer cleanup. |
| `bin\tools\windows\assets-install.bat` | Verifies Node.js 20.19.0+ and runs `npm install` in the root and all asset subprojects. | First setup, after a `package.json` or lock-file change, or after Node cleanup. |
| `bin\tools\windows\assets-build.bat` | Runs the local Gulp compiler. It accepts `all`, `css`, or `js`, plus an optional `--prod`. | After asset installation and whenever JS or SCSS needs compiling. |
| `bin\tools\windows\assets-watch.bat` | Runs Gulp in watch mode for `all`, `css`, or `js`. Press `Ctrl+C` to stop it. | During active frontend development. |
| `bin\tools\windows\php83-tests.bat` | Verifies PHP 8.3+ and runs the PHPUnit compatibility suite with TestDox output. Extra PHPUnit arguments are forwarded. | After Composer installation and before packaging or committing PHP changes. |
| `bin\tools\windows\scss-validate-all.bat` | Compiles every Joomla, WordPress, and Grav theme SCSS entry point with modern scssphp and fails on compiler warnings or deprecations. | After SCSS changes and before packaging. |
| `bin\tools\windows\package-build.bat` | Runs the Phing package builder through `bin\build` and writes packages to `dist`. | After dependencies, assets, and tests are ready. |
| `bin\tools\windows\wordpress-deploy-builds.bat` | Replaces the local WordPress `genesis` plugin and all `genesis_*` themes with packages from `dist`. Other plugins and themes are preserved. | After `bin\tools\windows\package-build.bat wordpress-dev` when refreshing the local WordPress test site. |
| `bin\tools\windows\assets-reset.bat` | Runs targeted asset cleanup and then reinstalls the four known asset projects. | When the normal Node installation is stale or damaged. |
| `bin\tools\windows\assets-cleanup.bat` | Removes `node_modules` from the root and the three known asset subprojects. | Before a targeted clean reinstall. Usually use `bin\tools\windows\assets-reset.bat` instead. |
| `bin\tools\windows\node-modules-cleanup-all.bat` | Recursively removes every outermost `node_modules` directory under the repository, including the root. | For a complete Node reset. Use `--dry-run` or `-n` to preview. |
| `bin\tools\windows\composer-cleanup-all.bat` | Removes all known Composer `vendor` directories without changing lock files. | For a complete PHP reset; follow it with `bin\tools\windows\composer-install-all.bat`. |

### Asset Commands

```bat
rem Compile all development assets
bin\tools\windows\assets-build.bat
bin\tools\windows\assets-build.bat all

rem Compile only CSS or JavaScript
bin\tools\windows\assets-build.bat css
bin\tools\windows\assets-build.bat js

rem Compile minified production assets without source maps
bin\tools\windows\assets-build.bat all --prod

rem Watch all files, SCSS only, or JavaScript only
bin\tools\windows\assets-watch.bat
bin\tools\windows\assets-watch.bat css
bin\tools\windows\assets-watch.bat js
```

### Package Build Targets

`bin\tools\windows\package-build.bat` defaults to `dev` and accepts these targets:

| Target | Output |
|:--|:--|
| `dev` | Development packages for Joomla, WordPress, and Grav. |
| `prod` | Production packages for Joomla, WordPress, and Grav. |
| `joomla-dev` / `joomla-prod` | Joomla packages only. |
| `wordpress-dev` / `wordpress-prod` | WordPress packages only. |
| `grav-dev` / `grav-prod` | Grav packages only. |

Additional Phing properties can be passed after the target, for example:

```bat
bin\tools\windows\package-build.bat wordpress-prod -Dversion=6.0.0
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
bin\tools\windows\scss-validate-all.bat
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
bin\tools\windows\package-build.bat wordpress-dev
bin\tools\windows\wordpress-deploy-builds.bat
```

The deploy script defaults to:

```text
C:\wamp64\www\wordpress\wp-content
```

It validates the target and package set before making changes. It then deletes the existing `plugins\genesis` directory and every `themes\genesis_*` directory before extracting the matching development packages. WordPress default themes, other themes, and other plugins are preserved.

An alternate `wp-content` path and package suffix can be supplied:

```bat
bin\tools\windows\wordpress-deploy-builds.bat "D:\sites\wordpress\wp-content" develop
```

### Complete Clean Rebuild

Use this sequence when both PHP and Node dependencies need to be rebuilt from scratch:

```bat
bin\tools\windows\composer-cleanup-all.bat
bin\tools\windows\node-modules-cleanup-all.bat
bin\tools\windows\composer-install-all.bat
bin\tools\windows\assets-install.bat
bin\tools\windows\assets-build.bat all
bin\tools\windows\php83-tests.bat
bin\tools\windows\package-build.bat dev
```

Cleanup scripts remove generated dependency directories only. They do not remove Composer or npm lock files.
## Updating Google Fonts

The Google Fonts JSON file can be generated by following guide at `https://developers.google.com/fonts/docs/developer_api` or simply using the `https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR-API-KEY` url. You need to enable usage of Google Fonts API and provide your API key in the place of `YOUR-API-KEY`.

## License

Genesis is licensed under the **GNU General Public License version 3 or later (GPL-3.0-or-later)**.
