<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Document\HtmlDocument;
use Joomla\CMS\Factory;

/**
 * Class Site
 * @package Genesis\Framework
 */
class Site
{
    /** @var string */
    public string $theme = '';
    /** @var string */
    public string $url = '';
    /** @var string */
    public string $title = '';
    /** @var string */
    public string $description = '';

    public function __construct()
    {
        try {
            /** @var CMSApplication $application */
            $application = Factory::getApplication();
            $document = $application->getDocument();

            if ($document instanceof HtmlDocument) {
                $this->theme = (string) $document->template;
                $this->url = (string) $document->baseurl;
                $this->title = (string) $document->title;
                $this->description = (string) $document->description;
            }
        } catch (\Exception $e) {
            // Catch errors when trying to get site properties from admin
            $this->theme = '';
            $this->url = '';
            $this->title = '';
            $this->description = '';
        }
    }
}
