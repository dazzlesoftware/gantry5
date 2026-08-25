<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Joomla\CMS\Application\ApplicationHelper;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Cache\CacheControllerFactoryInterface;
use Joomla\CMS\Installer\InstallerAdapter;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Table\Extension;
use Joomla\Filesystem\Folder;
use Joomla\Registry\Registry;

/**
 * Genesis package installer script.
 */
class Pkg_GenesisInstallerScript
{
    /**
     * List of supported versions. Newest version first!
     * @var array
     */
    protected array $versions = array(
        'PHP' => array (
            '8.3' => '8.3.0',
            '0' => '8.3.0' // Preferred version
        ),
        'Joomla!' => array (
            // Require Joomla 5+ (minimum 5.0.0)
            '5.0' => '5.0.0',
            '0' => '5.0.0' // Preferred version
        )
    );
    /**
     * List of required PHP extensions.
     * @var array
     */
    protected array $extensions = array('pcre');

    /**
     * @param InstallerAdapter $parent
     * @return bool
     */
    public function install(InstallerAdapter $parent): bool
    {
        return true;
    }

    /**
     * @param InstallerAdapter $parent
     * @return bool
     */
    public function discover_install(InstallerAdapter $parent): bool
    {
        return self::install($parent);
    }

    /**
     * @param InstallerAdapter $parent
     * @return bool
     */
    public function update(InstallerAdapter $parent): bool
    {
        return self::install($parent);
    }

    /**
     * @param InstallerAdapter $parent
     * @return bool
     */
    public function uninstall(InstallerAdapter $parent): bool
    {
        // Hack.. Joomla really doesn't give any information from the extension that's being uninstalled..
        $manifestFile = JPATH_MANIFESTS . '/packages/pkg_genesis.xml';
        if (is_file($manifestFile)) {
            $manifest = simplexml_load_file($manifestFile);
            $this->prepareExtensions($manifest, 0);
        }

        // Clear cached files.
        if (is_dir(JPATH_CACHE . '/genesis')) {
            Folder::delete(JPATH_CACHE . '/genesis');
        }
        if (is_dir(JPATH_SITE . '/cache/genesis')) {
            Folder::delete(JPATH_SITE . '/cache/genesis');
        }

        return true;
    }

    /**
     * @param string $type
     * @param InstallerAdapter $parent
     * @return bool
     */
    public function preflight(string $type, InstallerAdapter $parent): bool
    {
        $manifest = $parent->getManifest();

        if ($type !== 'uninstall') {
            // Prevent installation if requirements are not met.
            $errors = $this->checkRequirements((string) $manifest->version);
            if ($errors) {
                /** @var CMSApplication $app */
                $app = Factory::getApplication();

                foreach ($errors as $error) {
                    $app->enqueueMessage($error, 'error');
                }
                return false;
            }
        }

        // Disable and unlock existing extensions to prevent fatal errors (in the site).
        $this->prepareExtensions($manifest, 0);

        return true;
    }

    /**
     * @param string $type
     * @param InstallerAdapter $parent
     * @return bool
     */
    public function postflight(string $type, InstallerAdapter $parent): bool
    {
        // Clear Joomla system cache.
        /** @var JCache|JCacheController $cache */
        $cache = Factory::getContainer()
            ->get(CacheControllerFactoryInterface::class)
            ->createCacheController('callback', ['defaultgroup' => '']);
        $cache->clean('_system');

        // Clear Genesis cache.
        $path = Factory::getApplication()->getConfig()->get('cache_path', JPATH_SITE . '/cache') . '/genesis';
        if (is_dir($path)) {
            Folder::delete($path);
        }

        // Make sure that PHP has the latest data of the files.
        clearstatcache();

        // Remove all compiled files from opcode cache.
        if (function_exists('opcache_reset')) {
            @opcache_reset();
        } elseif (function_exists('apc_clear_cache')) {
            @apc_clear_cache();
        }

        if ($type === 'uninstall') {
            return true;
        }

        $manifest = $parent->getManifest();

        // Enable and lock extensions to prevent uninstalling them individually.
        $this->prepareExtensions($manifest, 1);

        // Repair missing update-site registrations for installed Genesis templates.
        $this->registerTemplateUpdateSites();

        // Make sure that all file formats used by Genesis are editable from template manager.
        $this->adjustTemplateSettings();

        // Install sample data on first install.
        if (in_array($type, array('install', 'discover_install'))) {
            $this->renderSplash('install', $manifest);
        } else {
            $this->renderSplash('update', $manifest);
        }

        return true;
    }

    // Internal functions

        /**
     * @param string $template
     * @param \SimpleXMLElement $manifest
     */
    public function renderSplash(string $template, \SimpleXMLElement $manifest): void
    {
        // Define variables for the template file.
        $name = Text::sprintf($manifest->name);
        $version = $manifest->version;
        $date = $manifest->creationDate;
        $edit_url = Route::_('index.php?option=com_genesis', false);

        include JPATH_ADMINISTRATOR . "/components/com_genesis/install/templates/{$template}.php";
    }

    /**
     * @param $manifest
     * @param int $state
     */
    protected function prepareExtensions(\SimpleXMLElement $manifest, int $state = 1): void
    {
        foreach ($manifest->files->children() as $file) {
            $attributes = $file->attributes();

            $search = array('type' => (string) $attributes->type, 'element' => (string) $attributes->id);

            $clientName = (string) $attributes->client;
            if (!empty($clientName)) {
                $client = ApplicationHelper::getClientInfo($clientName, true);
                $search +=  array('client_id' => $client->id);
            }

            $group = (string) $attributes->group;
            if (!empty($group)) {
                $search +=  array('folder' => $group);
            }

            $extension = new Extension(Factory::getContainer()->get(DatabaseInterface::class));

            if (!$extension->load($search)) {
                continue;
            }

            $extension->protected = 0;

            if (isset($attributes->enabled)) {
                $extension->enabled = $state ? (int) $attributes->enabled : 0;
            }

            $extension->store();
        }
    }

    protected function adjustTemplateSettings(): void
    {
        $extension = new Extension(Factory::getContainer()->get(DatabaseInterface::class));
        if (!$extension->load(array('type' => 'component', 'element' => 'com_templates'))) {
            return;
        }

        $params = new Registry($extension->params);
        $params->set('source_formats', $this->addParam($params->get('source_formats'), array('scss', 'yaml', 'twig')));
        $params->set('font_formats', $this->addParam($params->get('font_formats'), array('eot', 'svg')));

        $extension->params = $params->toString();
        $extension->store();
    }

    /**
     * @param string $string
     * @param array $options
     * @return string
     */
    protected function addParam(?string $string, array $options): string
    {
        $items = array_flip(explode(',', (string) $string)) + array_flip($options);

        return implode(',', array_keys($items));
    }

    protected function registerTemplateUpdateSites(): void
    {
        $db = Factory::getContainer()->get(DatabaseInterface::class);

        $query = $db->getQuery(true)
            ->select('extension_id, element')
            ->from('#__extensions')
            ->where('type=' . $db->quote('template'))
            ->where('client_id=0')
            ->where('element IN (' . $db->quote('genesis_neon') . ',' . $db->quote('genesis_argon') . ')');
        $db->setQuery($query);

        $templates = (array) $db->loadObjectList();

        foreach ($templates as $template) {
            $this->registerTemplateUpdateSite((int) $template->extension_id, (string) $template->element);
        }
    }

    /**
     * @param int $extensionId
     * @param string $template
     */
    protected function registerTemplateUpdateSite(int $extensionId, string $template): void
    {
        if (!$extensionId || !$template) {
            return;
        }

        $manifestFile = JPATH_SITE . "/templates/{$template}/templateDetails.xml";
        if (!is_file($manifestFile)) {
            return;
        }

        $manifest = simplexml_load_file($manifestFile);
        if (!$manifest || empty($manifest->updateservers->server)) {
            return;
        }

        $server = $manifest->updateservers->server[0];
        $location = trim((string) $server);
        if ($location === '') {
            return;
        }

        $name = trim((string) $server['name']) ?: $template;
        $type = trim((string) $server['type']) ?: 'extension';
        $enabled = isset($server['enabled']) ? (int) $server['enabled'] : 1;

        $db = Factory::getContainer()->get(DatabaseInterface::class);

        $query = $db->getQuery(true)
            ->select('us.update_site_id')
            ->from($db->quoteName('#__update_sites', 'us'))
            ->innerJoin(
                $db->quoteName('#__update_sites_extensions', 'usex') .
                ' ON ' . $db->quoteName('usex.update_site_id') . ' = ' . $db->quoteName('us.update_site_id')
            )
            ->where($db->quoteName('usex.extension_id') . ' = ' . (int) $extensionId)
            ->where($db->quoteName('us.location') . ' = ' . $db->quote($location));
        $db->setQuery($query);
        $updateSiteId = (int) $db->loadResult();

        if ($updateSiteId) {
            $query = $db->getQuery(true)
                ->update($db->quoteName('#__update_sites'))
                ->set($db->quoteName('name') . ' = ' . $db->quote($name))
                ->set($db->quoteName('type') . ' = ' . $db->quote($type))
                ->set($db->quoteName('location') . ' = ' . $db->quote($location))
                ->set($db->quoteName('enabled') . ' = ' . (int) $enabled)
                ->where($db->quoteName('update_site_id') . ' = ' . $updateSiteId);
            $db->setQuery($query);
            $db->execute();

            return;
        }

        $query = $db->getQuery(true)
            ->select('update_site_id')
            ->from($db->quoteName('#__update_sites'))
            ->where($db->quoteName('location') . ' = ' . $db->quote($location));
        $db->setQuery($query);
        $updateSiteId = (int) $db->loadResult();

        if ($updateSiteId) {
            $query = $db->getQuery(true)
                ->update($db->quoteName('#__update_sites'))
                ->set($db->quoteName('name') . ' = ' . $db->quote($name))
                ->set($db->quoteName('type') . ' = ' . $db->quote($type))
                ->set($db->quoteName('enabled') . ' = ' . (int) $enabled)
                ->where($db->quoteName('update_site_id') . ' = ' . $updateSiteId);
            $db->setQuery($query);
            $db->execute();
        } else {
            $updateSite = (object) array(
                'name' => $name,
                'type' => $type,
                'location' => $location,
                'enabled' => $enabled,
                'extra_query' => ''
            );
            $db->insertObject('#__update_sites', $updateSite, 'update_site_id');
            $updateSiteId = (int) $updateSite->update_site_id;
        }

        if (!$updateSiteId) {
            return;
        }

        $query = $db->getQuery(true)
            ->select('COUNT(*)')
            ->from($db->quoteName('#__update_sites_extensions'))
            ->where($db->quoteName('update_site_id') . ' = ' . $updateSiteId)
            ->where($db->quoteName('extension_id') . ' = ' . (int) $extensionId);
        $db->setQuery($query);
        $exists = (int) $db->loadResult();

        if (!$exists) {
            $link = (object) array(
                'update_site_id' => $updateSiteId,
                'extension_id' => (int) $extensionId
            );
            $db->insertObject('#__update_sites_extensions', $link);
        }
    }

    /**
     * @param string $genesisVersion
     * @return array
     */
    protected function checkRequirements(string $genesisVersion): array
    {
        $results = array();
        $this->checkVersion($results, 'PHP', PHP_VERSION);
        $this->checkVersion($results, 'Joomla!', JVERSION);
        $this->checkExtensions($results, $this->extensions);

        return $results;
    }

    /**
     * @param array $results
     * @param string $name
     * @param string $version
     */
    protected function checkVersion(array &$results, string $name, string $version): void
    {
        $major = $minor = 0;
        foreach ($this->versions[$name] as $major => $minor) {
            if (!$major || version_compare($version, $major, '<')) {
                continue;
            }

            if (version_compare($version, $minor, '>=')) {
                return;
            }
            break;
        }

        if (!$major) {
            $minor = reset($this->versions[$name]);
        }

        $recommended = end($this->versions[$name]);

        if (version_compare($recommended, $minor, '>')) {
            $results[] = sprintf(
                '%s %s is not supported. Minimum required version is %s %s, but it is highly recommended to use %s %s or later version.',
                $name,
                $version,
                $name,
                $minor,
                $name,
                $recommended
            );
        } else {
            $results[] = sprintf(
                '%s %s is not supported. Please update to %s %s or later version.',
                $name,
                $version,
                $name,
                $minor
            );
        }
    }

    /**
     * @param array $results
     * @param array $extensions
     */
    protected function checkExtensions(array &$results, array $extensions): void
    {
        foreach ($extensions as $name) {
            if (!extension_loaded($name)) {
                $results[] = sprintf("Required PHP extension '%s' is missing. Please install it into your system.", $name);
            }
        }
    }
}
