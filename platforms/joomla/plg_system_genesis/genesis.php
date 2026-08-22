<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Joomla\CMS\Document\HtmlDocument;
use Joomla\CMS\Event\AbstractEvent;
use Joomla\CMS\Event\GenericEvent;
use Joomla\CMS\Event\Model;
use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\CMS\Table\Extension;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;
use Joomla\Registry\Registry;
use Joomla\Event\SubscriberInterface;
use Genesis\Loader;
use Genesis\Component\Config\Config;
use Genesis\Component\File\CompiledYamlFile;
use Genesis\Component\FileSystem\Folder;
use Genesis\Component\Theme\ThemeDetails;
use Genesis\Debugger;
use Genesis\Framework\Assignments;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use Genesis\Framework\Menu;
use Genesis\Framework\Outlines;
use Genesis\Framework\Platform;
use Genesis\Framework\Theme;
use Genesis\Joomla\EventDispatcher;
use Genesis\Joomla\CacheHelper;
use Genesis\Joomla\StyleHelper;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

// Quick check to prevent fatal error in unsupported Joomla admin.
if (!class_exists(CMSPlugin::class)) {
    return;
}

/**
 * Class plgSystemGenesis
 */
class plgSystemGenesis extends CMSPlugin implements SubscriberInterface
{
    protected $autoloadLanguage = true;

    protected $styles;
    protected $modules;

    public static function getSubscribedEvents(): array
    {
        return [
            'onGenesisGlobalConfig' => 'handleGenesisGlobalConfig',
            'onAfterRoute' => 'handleAfterRoute',
            'onAfterDispatch' => 'handleAfterDispatch',
            'onAfterRender' => 'handleAfterRender',
            'onRenderModule' => 'handleRenderModule',
            'onAjaxParticle' => 'handleAjaxParticle',
            'onGenesisSaveConfig' => 'handleGenesisSaveConfig',
            'onContentBeforeSave' => 'handleContentBeforeSave',
            'onExtensionBeforeSave' => 'handleExtensionBeforeSave',
            'onExtensionAfterSave' => 'handleExtensionAfterSave',
            'onExtensionBeforeDelete' => 'handleExtensionBeforeDelete',
            'onContentPrepareData' => 'handleContentPrepareData',
            'onContentPrepareForm' => 'handleContentPrepareForm',
        ];
    }

    public function handleGenesisGlobalConfig(GenericEvent $event): void
    {
        $global = $event->getArgument('global');
        $this->onGenesisGlobalConfig($global);
        $event->setArgument('global', $global);
    }

    public function handleAfterRoute(AbstractEvent $event): void
    {
        $this->onAfterRoute();
    }

    public function handleAfterDispatch(AbstractEvent $event): void
    {
        $this->onAfterDispatch();
    }

    public function handleAfterRender(AbstractEvent $event): void
    {
        $this->onAfterRender();
    }

    public function handleRenderModule(AbstractEvent $event): void
    {
        $module = $event->getArgument('subject');
        $attribs = $event->getArgument('attributes');
        $this->onRenderModule($module, $attribs);

        if (method_exists($event, 'updateAttributes')) {
            $event->updateAttributes($attribs);
        } else {
            $event->setArgument('attributes', $attribs);
        }
    }

    public function handleAjaxParticle(GenericEvent $event): void
    {
        $result = $event->getArgument('result', []);
        $result[] = $this->onAjaxParticle();
        $event->setArgument('result', $result);
    }

    public function handleGenesisSaveConfig(GenericEvent $event): void
    {
        $this->onGenesisSaveConfig((array) $event->getArgument('data', []));
    }

    public function handleContentBeforeSave(Model\BeforeSaveEvent $event): void
    {
        $this->onContentBeforeSave($event->getContext(), $event->getItem(), $event->getIsNew(), $event->getData());
    }

    public function handleExtensionBeforeSave(Model\BeforeSaveEvent $event): void
    {
        $this->onExtensionBeforeSave($event->getContext(), $event->getItem(), $event->getIsNew());
    }

    public function handleExtensionAfterSave(Model\AfterSaveEvent $event): void
    {
        $this->onExtensionAfterSave($event->getContext(), $event->getItem(), $event->getIsNew());
    }

    public function handleExtensionBeforeDelete(Model\BeforeDeleteEvent $event): void
    {
        $result = $this->onExtensionBeforeDelete($event->getContext(), $event->getItem());
        $event->addResult($result);
    }

    public function handleContentPrepareData(Model\PrepareDataEvent $event): void
    {
        $this->onContentPrepareData($event->getContext(), $event->getData());
    }

    public function handleContentPrepareForm(Model\PrepareFormEvent $event): void
    {
        $this->onContentPrepareForm($event->getForm(), $event->getData());
    }

    public function __construct(array $config = [])
    {
        $config['name'] = $config['name'] ?? 'genesis';
        $config['type'] = $config['type'] ?? 'system';
        parent::__construct($config);
    }

    public function initialise(): void
    {
        $this->loadLanguage('plg_system_genesis.sys');

        // Use Joomla's class loader instead of JLoader which is deprecated in Joomla 5
        require_once JPATH_LIBRARIES . '/genesis/src/Loader.php';

        // Detect Genesis Framework or fail gracefully.
        if (!class_exists('Genesis\Loader')) {
            if ($this->getApplication()->isClient('administrator')) {
                $this->getApplication()->enqueueMessage(
                    Text::sprintf('PLG_SYSTEM_GENESIS_LIBRARY_MISSING', Text::_('PLG_SYSTEM_GENESIS')),
                    'warning'
                );
            }
            return;
        }

        if (!class_exists('Genesis\Debugger')) {
            error_reporting(0);
        }

    }

    /**
     * Return global configuration for Genesis.
     *
     * @param array $global
     */
    public function onGenesisGlobalConfig(&$global)
    {
        $global = $this->params->toArray();
    }

    public function onAfterRoute()
    {
        if ($this->getApplication()->isClient('site')) {
            $this->onAfterRouteSite();

        } elseif ($this->getApplication()->isClient('administrator')) {
            $this->onAfterRouteAdmin();
        }
    }

    /**
     * Document gets set during dispatch, we need language and direction.
     */
    public function onAfterDispatch()
    {
        if (class_exists('Genesis\Framework\Genesis')) {
            $this->onAfterDispatchSiteAdmin();
        }
    }

    public function onAfterRender()
    {
        if ($this->getApplication()->isClient('site') && class_exists('Genesis\Framework\Genesis')) {
            $this->onAfterRenderSite();

        } elseif ($this->getApplication()->isClient('administrator')) {
            $this->onAfterRenderAdmin();
        }
    }

    /**
     * @param object $module
     * @param array $attribs
     */
    public function onRenderModule(&$module, &$attribs)
    {
        if (!$this->getApplication()->isClient('site') || !class_exists('Genesis\Framework\Genesis')) {
            return;
        }

        $genesis = Genesis::instance();
        $outline = $genesis['configuration'];

        // Do not render modules assigned to menu items in error and offline page.
        if (isset($module->menuid) && $module->menuid > 0 && in_array($outline, array('_error', '_offline'), true)) {
            $module = null;
        }

        // TODO: This event allows more diverse module assignment conditions.
    }

    /**
     * Serve particle AJAX requests in 'index.php?option=com_ajax&plugin=particle&format=json'.
     *
     * @return array|string|null
     * @throws RuntimeException
     */
    public function onAjaxParticle()
    {
        if (!$this->getApplication()->isClient('site') || !class_exists('Genesis\Framework\Genesis')) {
            return null;
        }

        $input = $this->getApplication()->input;
        $format = strtolower($input->getCmd('format', 'html'));

        if (!in_array($format, ['json', 'raw', 'debug'], true)) {
            throw new RuntimeException(Text::_('JERROR_PAGE_NOT_FOUND'), 404);
        }

        $props = $_GET;
        unset($props['option'], $props['plugin'], $props['format'], $props['id'], $props['Itemid']);

        $identifier = $input->getCmd('id');

        if (strpos($identifier, 'module-') === 0) {
            preg_match('`-([\d]+)$`', $input->getCmd('id'), $matches);

            if (!isset($matches[1])) {
                throw new RuntimeException(Text::_('JERROR_PAGE_NOT_FOUND'), 404);
            }

            $id = $matches[1];

            require_once JPATH_ROOT . '/modules/mod_genesis_particle/helper.php';

            return ModGenesisParticleHelper::ajax($id, $props, $format);
        }

        $genesis = Genesis::instance();

        /** @var Theme $theme */
        $theme = $genesis['theme'];
        $layout = $theme->loadLayout();
        $html = '';

        if ($identifier === 'main-particle') {
            $type = $identifier;
            $menu = $this->getApplication()->getMenu();
            $menuItem = $menu ? $menu->getActive() : null;
            $params = $menuItem ? $menuItem->getParams() : new Registry;

            /** @var object $params */
            $data = json_decode($params->get('particle'), true);
            if ($data && $theme->hasContent()) {
                $context = [
                    'genesis' => $genesis,
                    'noConfig' => true,
                    'inContent' => true,
                    'ajax' => $props,
                    'segment' => [
                        'id' => $identifier,
                        'type' => $data['type'],
                        'classes' => $params->get('pageclass_sfx'),
                        'subtype' => $data['particle'],
                        'attributes' => $data['options']['particle'],
                    ]
                ];

                $html = trim($theme->render('@nucleus/content/particle.html.twig', $context));
            }
        } else {
            $particle = $layout->find($identifier);
            if (!isset($particle->type) || $particle->type !== 'particle') {
                throw new RuntimeException(Text::_('JERROR_PAGE_NOT_FOUND'), 404);
            }

            $context = array(
                'genesis' => $genesis,
                'inContent' => false,
                'ajax' => $props,
            );

            $block = $theme->getContent($particle, $context);
            $type = $particle->type . '.' . $particle->subtype;
            $html = (string) $block;
        }

        if ($format === 'raw') {
            return $html;
        }

        return ['code' => 200, 'type' => $type, 'id' => $identifier, 'props' => (object) $props, 'html' => $html];
    }

    /**
     * Load Genesis framework before dispatching to the component.
     *
     * @throws \RuntimeException
     */
    private function onAfterRouteSite()
    {
        $templateName = $this->getApplication()->getTemplate();

        if (!$this->isGenesisTemplate($templateName)) {
            return;
        }

        $genesisPath = JPATH_THEMES . "/{$templateName}/custom/includes/genesis.php";
        if (!is_file($genesisPath)) {
            $genesisPath = JPATH_THEMES . "/{$templateName}/includes/genesis.php";
        }
        if (is_file($genesisPath)) {
            // Manually setup Genesis Framework from the template.
            $genesis = include $genesisPath;

            if (!$genesis) {
                throw new \RuntimeException(
                    Text::sprintf('GENESIS_THEME_LOADING_FAILED', $templateName, Text::_('GENESIS_THEME_INCLUDE_FAILED')),
                    500
                );
            }

        } else {

            // Setup Genesis Framework or throw exception.
            Loader::setup();

            // Get Genesis instance.
            $genesis = Genesis::instance();

            // Initialize the template.
            $genesis['theme.path'] = JPATH_THEMES . "/{$templateName}";
            $genesis['theme.name'] = $templateName;

            $classPath = $genesis['theme.path'] . '/custom/includes/theme.php';
            if (!is_file($classPath)) {
                $classPath = $genesis['theme.path'] . '/includes/theme.php';
            }

            include_once $classPath;
        }

        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage("Using Genesis template {$templateName}");
        }

        /** @var Theme $theme */
        $theme = $genesis['theme'];

        $assignments = new Assignments();

        if (\GENESIS_DEBUGGER) {
            Debugger::addMessage('Selecting outline (rules, matches, scores):', 'debug');
            Debugger::addMessage($assignments->getPage(), 'debug');
            Debugger::addMessage($assignments->loadAssignments(), 'debug');
            Debugger::addMessage($assignments->matches(), 'debug');
            Debugger::addMessage($assignments->scores(), 'debug');
        }

        $theme->setLayout($assignments->select());

        if ($this->params->get('asset_timestamps', 1)) {
            $age = (int)($this->params->get('asset_timestamps_period', 7) * 86400);
            Document::$timestamp_age = $age > 0 ? $age : PHP_INT_MAX;
        } else {
            Document::$timestamp_age = 0;
        }
    }

    /**
     * Re-route Genesis templates to Genesis Administration component.
     */
    private function onAfterRouteAdmin()
    {
        $input = $this->getApplication()->input;

        $option = $input->getCmd('option');
        $task   = $input->getCmd('task');

        if (in_array($option, array('com_templates', 'com_advancedtemplates'), true)) {

            if ($task && strpos($task, 'style') === 0 && $this->params->get('use_assignments', true)) {
                // Get all ids.
                $cid = $input->post->get('cid', (array)$input->getInt('id'), 'array');

                if ($cid) {
                    $styles = $this->getStyles();
                    $selected = array_intersect_key($styles, array_flip($cid));

                    // If no Genesis templates were selected, just let com_templates deal with the request.
                    if (!$selected) {
                        return;
                    }

                    // Special handling for tasks coming from com_template.
                    if ($task === 'style.edit') {
                        $theme = reset($selected);
                        $id = key($selected);
                    $session = $this->getApplication()->getSession();
                    $token = $session::getFormToken();
                        $this->getApplication()->redirect("index.php?option=com_genesis&view=configurations/{$id}/layout&theme={$theme}&{$token}=1");
                    }
                }
            }
        }
    }

    /**
     * Document gets set during dispatch, we need language and direction.
     */
    public function onAfterDispatchSiteAdmin()
    {
        $genesis = Genesis::instance();
        if (!isset($genesis['theme'])) {
            return;
        }

        $theme = $genesis['theme'];

        $document = $this->getApplication()->getDocument();
        if ($document instanceof HtmlDocument) {
            $document->setHtml5(true);
        }
        $theme->language = $document->language;
        $theme->direction = $document->direction;
    }

    /**
     * Convert all stream uris into proper links.
     */
    private function onAfterRenderSite()
    {
        $genesis = Genesis::instance();

        $html = $this->getApplication()->getBody();

        /** @var Document $document */
        $document = $genesis['document'];

        // Only filter our streams. If there's an error (bad UTF8), fallback with original output.
        $this->getApplication()->setBody($document::urlFilter($html, false, 0, true) ?: $html);
    }

    /**
     * Convert links in com_templates to point into Genesis Administrator component.
     */
    private function onAfterRenderAdmin()
    {
        $document = $this->getApplication()->getDocument();
        $type   = $document->getType();

        $option = $this->getApplication()->input->getString('option');
        $view   = $this->getApplication()->input->getString('view', 'genesis');
        $task   = $this->getApplication()->input->getString('task');

        if (($option === 'com_templates' || $option === 'com_advancedtemplates') && ($view === 'genesis' || $view === 'styles') && !$task && $type === 'html') {
            $this->styles = $this->getStyles();

            $body = preg_replace_callback('/(<a\s[^>]*href=")([^"]*)("[^>]*>)(.*)(<\/a>)/siU', array($this, 'appendHtml'), $this->getApplication()->getBody());

            $this->getApplication()->setBody($body);
        }

        if (($option === 'com_modules' || $option === 'com_advancedmodules') && (($view === 'genesis' || $view === 'modules') || empty($view)) && $type === 'html') {
            $db    = Factory::getContainer()->get(DatabaseInterface::class);
            $query = $db->getQuery(true);
            $query->select('id, title, params');
            $query->from('#__modules');
            $query->where('module = ' . $db->quote('mod_genesis_particle'));
            $db->setQuery($query);
            $data = $db->loadObjectList();

            if (count($data) > 0) {
                $this->modules = array();
                $body = $this->getApplication()->getBody();

                foreach ($data as $module) {
                    $params   = json_decode($module->params, false);
                    $particle = isset($params->particle) ? json_decode($params->particle, false) : '';
                    $title = isset($particle->title) ? $particle->title : (isset($particle->particle) ? $particle->particle : '');
                    $type = isset($particle->particle) ? $particle->particle : '';

                    $this->modules[$module->id] = $particle;

                    $body = preg_replace_callback('/(<a\s[^>]*href=")([^"]*)("[^>]*>)(.*)(<\/a>)/siU', function($matches) use ($title, $type) {
                        return $this->appendHtml($matches, $title, $type);
                    }, $body);
                }


                $this->getApplication()->setBody($body);
            }
        }
    }

    /**
     * Save plugin parameters and trigger the save events.
     *
     * @param array $data
     * @return bool
     * @throws RuntimeException
     * @see JModelAdmin::save()
     */
    public function onGenesisSaveConfig(array $data)
    {
        $name = 'plg_' . $this->_type . '_' . $this->_name;

        // Initialise variables;
        $table = new Extension(Factory::getContainer()->get(DatabaseInterface::class));

        // Include the content plugins for the on save events.
        PluginHelper::importPlugin('extension');

        // Load the row if saving an existing record.
        $table->load(array('type'=>'plugin', 'folder'=>$this->_type, 'element'=>$this->_name));

        $params = new Registry($table->params);
        $params->loadArray($data);

        $table->params = $params->toString();

        // Check the data.
        if (!$table->check()) {
            throw new RuntimeException(Text::_('PLG_SYSTEM_GENESIS_ERROR_CONFIG_VALIDATION_FAILED'));
        }

        // Trigger the onContentBeforeSave event.
        $result = EventDispatcher::dispatch($this->getApplication(), 'onExtensionBeforeSave', array($name, $table, false));
        if (in_array(false, $result, true)) {
            throw new RuntimeException(Text::_('PLG_SYSTEM_GENESIS_ERROR_CONFIG_REJECTED'));
        }

        // Store the data.
        if (!$table->store()) {
            throw new RuntimeException(Text::_('PLG_SYSTEM_GENESIS_ERROR_CONFIG_STORE_FAILED'));
        }

        // Clean the cache.
        CacheHelper::cleanPlugin();

        // Update plugin settings.
        $this->params = $params;

        // Trigger the onExtensionAfterSave event.
        EventDispatcher::dispatch($this->getApplication(), 'onExtensionAfterSave', array($name, $table, false));

        return true;
    }

    /**
     * @param string $context
     * @param JTable $table
     * @param bool $isNew
     * @param array $data
     * @return void
     */
    public function onContentBeforeSave($context, $table, $isNew, $data = array())
    {
        switch ($context) {
            case 'com_menus.item':
                Loader::setup();

                $params = new Registry($table->params ?: '{}');
                $isGenesis = !empty($params['genesis']);
                if ($isGenesis and class_exists(Menu::class)) {
                    // Remove default Genesis params.
                    $genesisParams = Menu::decodeJParams($params);
                    Menu::updateJParams($params, $genesisParams);

                    $table->params = $params->toString();
                }

                break;
        }
    }

    /**
     * @param string $context
     * @param object $table
     * @param bool $isNew
     */
    public function onExtensionBeforeSave($context, $table, $isNew)
    {
        if ($context === 'com_config.component' && $table && $table->type === 'component' && $table->name === 'com_genesis') {
            $name = 'plg_' . $this->_type . '_' . $this->_name;

            $params = new Registry($table->params);

            $data = (array) $params->get($name);

            Loader::setup();

            $this->onGenesisSaveConfig($data);

            // Do not save anything into the component itself (Joomla cannot handle it).
            $table->params = '';

            return;
        }
    }

    /**
     * @param string $context
     * @param object $table
     * @param bool $isNew
     */
    public function onExtensionAfterSave($context, $table, $isNew)
    {
        if ($context === 'com_config.component' && $table && $table->type === 'component' && $table->name === 'com_genesis') {

        }

        if ($context !== 'com_templates.style' || $table->client_id || !$this->isGenesisTemplate($table->template)) {
            return;
        }

        if (!$isNew) {
            return;
        }

        $template = $table->template;

        $this->load($template);
        $registry = new Registry($table->params);
        $old = (int) $registry->get('configuration', 0);
        $new = (int) $table->id;

        if ($old && $old !== $new) {
            StyleHelper::copy($table, $old, $new);
        }
    }

    /**
     * @param string $context
     * @param object $table
     */
    public function onExtensionBeforeDelete($context, $table)
    {
        if ($context !== 'com_templates.style' || $table->client_id || !$this->isGenesisTemplate($table->template)) {
            return true;
        }

        $template = $table->template;

        $genesis = $this->load($template);

        /** @var Outlines $outlines */
        $outlines = $genesis['outlines'];

        try {
            $outlines->delete($table->id, false);
        } catch (Exception $e) {
            $this->getApplication()->enqueueMessage($e->getMessage(), 'error');
            return false;
        }

        return true;
    }

    /**
     * @param string $context
     * @param object $data
     * @return bool
     */
    public function onContentPrepareData($context, $data)
    {
        $name = 'plg_' . $this->_type . '_' . $this->_name;

        // Check that we are manipulating a valid form.
        switch ($context) {
            case 'com_menus.item':
                Loader::setup();

                $isNew = $data->parent_id === null;
                $menuParams = Menu::decodeJParams($data->params);
                $isGenesis = !empty($data->params['genesis']) || is_array($menuParams);
                if ($isNew || $isGenesis) {
                    // Add default Genesis params to menu item.
                    if (null === $menuParams) {
                        $menuParams = [];
                    }
                    $data->params = array_merge($data->params, Menu::encodeJParams($menuParams, false));
                }
                break;
        }

        return true;
    }

    /**
     * @param Form $form
     * @param object $data
     * @return bool
     */
    public function onContentPrepareForm($form, $data)
    {
        // Check that we are manipulating a valid form.
        if (!($form instanceof \Joomla\CMS\Form\Form)) {
            throw new UnexpectedValueException(Text::_('JERROR_NOT_A_FORM'));
        }

        $name = 'plg_' . $this->_type . '_' . $this->_name;

        switch ($form->getName()) {
            case 'com_config.component':
                // If we are editing configuration from Genesis component, add missing fields from system plugin.
                $rules = $form->getField('rules');
                if ($rules && $rules->getAttribute('component') === 'com_genesis') {
                    $this->loadLanguage("{$name}.sys");
                    // Add plugin fields to the form under plg_type_name.
                    $file = file_get_contents(__DIR__."/{$this->_name}.xml");
                    $file = preg_replace('/ name="params"/', " name=\"{$name}\"", $file);
                    $form->load($file, false, '/extension/config');

                    // Joomla seems to be missing support for component data manipulation so do it manually here.
                    $form->bind([$name => $this->params->toArray()]);
                }
                break;

            case 'com_menus.items.filter':
                break;

            case 'com_menus.item':
                Loader::setup();

                $isNew = $data->parent_id === null;
                $isGenesis = !empty($data->params['genesis']) || is_array(Menu::decodeJParams($data->params));
                if ($isNew || $isGenesis) {
                    // Add Genesis Menu tab to the form.
                    \Joomla\CMS\Form\Form::addFormPath(__DIR__ . '/forms');
                    $form->loadFile('menu_item', false);
                }

                break;
        }

        return true;
    }

    /**
     * @param array  $matches
     * @param string $content
     * @param string $type
     * @return string
     */
    private function appendHtml(array $matches, $content = 'Genesis', $type = '')
    {
        $html = $matches[0];

        if (strpos($matches[2], 'task=style.edit') || strpos($matches[2], 'task=module.edit')) {
            $uri = new Uri($matches[2]);
            $id = (int) $uri->getVar('id');

            if ($id && (isset($this->styles[$id]) || isset($this->modules[$id])) && in_array($uri->getVar('option'), array('com_templates', 'com_advancedtemplates', 'com_modules', 'com_advancedmodules'), true)) {
                $html = $matches[1] . $uri . $matches[3] . $matches[4] . $matches[5];
                $colors = $content ? 'background:#439a86;' : 'background:#f17f48;';
                $content = $content ?: 'No Particle Selected';
                $title = $type ? ' title="Particle Type: ' . $type . '"' : '';

                // TODO: remove label when dropping Joomla 3 support.
                $html .= ' <span class="label badge bagde-info" ' . $title . ' style="' . $colors . 'color:#fff;">' . $content . '</span>';

                if (isset($this->modules[$id])) {
                    unset($this->modules[$id]);
                } else {
                    unset($this->styles[$id]);
                }
            }
        }

        return $html;
    }

    /**
     * @return array
     */
    private function getStyles()
    {
        static $list;

        if ($list === null) {
            // Load styles
            $db = Factory::getContainer()->get(DatabaseInterface::class);
            $query = $db
                ->getQuery(true)
                ->select('s.id, s.template')
                ->from('#__template_styles as s')
                ->where('s.client_id = 0')
                ->where('e.enabled = 1')
                ->leftJoin('#__extensions as e ON e.element=s.template AND e.type=' . $db->quote('template') . ' AND e.client_id=s.client_id');

            $db->setQuery($query);
            $templates = (array)$db->loadObjectList();

            $list = array();

            foreach ($templates as $template) {
                if ($this->isGenesisTemplate($template->template)) {
                    $list[$template->id] = $template->template;
                }
            }
        }

        return $list;
    }

    /**
     * @param string $name
     * @return bool
     */
    private function isGenesisTemplate($name)
    {
        return file_exists(JPATH_SITE . "/templates/{$name}/genesis/theme.yaml");
    }

    /**
     * @param string $name
     * @return \Genesis\Framework\Genesis
     */
    protected function load($name)
    {
        Loader::setup();

        $genesis = Genesis::instance();

        if (!isset($genesis['theme.name']) || $name !== $genesis['theme.name']) {
            // Restart Genesis and initialize it.
            $genesis = Genesis::restart();
            $genesis['theme.name'] = $name;

            $streams = $genesis['streams'];
            $streams->register();

            /** @var Platform $patform */
            $patform = $genesis['platform'];
            /** @var UniformResourceLocator $locator */
            $locator = $genesis['locator'];
            /** @var Config $global */
            $global = $genesis['global'];

            // Initialize theme stream.
            $details = new ThemeDetails($name);
            $locator->addPath('genesis-theme', '', $details->getPaths(), false, true);

            // Initialize theme cache stream.
            $cachePath = $patform->getCachePath() . '/' . $name;
            Folder::create($cachePath);
            $locator->addPath('genesis-cache', 'theme', array($cachePath), true, true);

            CompiledYamlFile::$defaultCachePath = $locator->findResource('genesis-cache://theme/compiled/yaml', true, true);
            CompiledYamlFile::$defaultCaching = $global->get('compile_yaml', 1);
        }

        return $genesis;
    }
}
