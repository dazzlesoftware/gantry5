<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin\Controller\Json;

use Genesis\Component\Admin\JsonController;
use Genesis\Component\Remote\Response as RemoteResponse;
use Genesis\Component\Response\JsonResponse;

/**
 * Class Changelog
 * @package Genesis\Admin\Controller\Json
 */
class Changelog extends JsonController
{
    /** @var string */
    protected string $url = 'https://raw.githubusercontent.com/genesis/genesis';
    /** @var string */
    protected string $fullurl = 'https://github.com/dazzlesoftware/genesis/blob/develop';
    /** @var string */
    protected string $issues = 'https://github.com/dazzlesoftware/genesis/issues';
    /** @var string */
    protected string $contrib = 'https://github.com';
    /** @var string */
    protected string $file = 'CHANGELOG.md';
    /** @var array */
    protected array $platforms = ['common' => 'share-alt', 'joomla' => '', 'wordpress' => '', 'grav' => ''];
    /** @var array */
    protected array $httpVerbs = [
        'POST' => [
            '/' => 'index'
        ]
    ];

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $version = $this->request->post['version'];
        $lookup = $version;

        if ($version === '@version@') {
            $version = 'develop';
            $lookup  = '';
        }

        if (strpos($version, 'dev-') === 0) {
            $version = preg_replace('/^dev-/i', '', $version);
            $lookup  = '';
        }

        $url       = $this->url . '/' . $version . '/' . $this->file;
        $changelog = RemoteResponse::get($url);

        if ($changelog) {
            $found = preg_match("/(#\\s" . $lookup . ".+?\\n.*?)(?=\\n{1,}#|$)/uis", $changelog, $changelog);

            if ($found) {
                $changelog = \Parsedown::instance()->parse($changelog[0]);

                // auto-link issues
                $changelog = preg_replace("/#(\\d{1,})/ui", '<a target="_blank" rel="noopener" href="' . $this->issues . '/$1">#$1</a>', $changelog);

                // auto-link contributors
                $changelog = preg_replace("/@([\\w]+)[^\\w]/ui", '<a target="_blank" rel="noopener" href="' . $this->contrib . '/$1">@$1</a> ', $changelog);

                // add icons for platforms
                foreach($this->platforms as $platform => $icon) {
                    $changelog = preg_replace('/(<a href="\#' . $platform . '">)/uis', '$1<i class="fa fa-' . ($icon ?: $platform) . '" aria-hidden="true"></i> ', $changelog);
                }
            } else {
                $changelog = 'No changelog for version <strong>' . $version . '</strong> was found.';
            }
        }

        $response = [
            'html' => $this->render('@genesis-admin/ajax/changelog.html.twig', [
                'changelog' => $changelog,
                'version'   => $version,
                'url'       => $url,
                'fullurl'   => $this->fullurl . '/' . $this->file
            ])
        ];

        return new JsonResponse($response);
    }
}
