<?php

declare(strict_types=1);

namespace Genesis\Joomla;

use Joomla\CMS\Application\CMSApplicationInterface;
use Joomla\CMS\Event\AbstractEvent;
use Joomla\CMS\Event\GenericEvent;

final class EventDispatcher
{
    private const ARGUMENT_NAMES = [
        'onContentBeforeSave' => ['context', 'subject', 'isNew', 'data'],
        'onContentAfterSave' => ['context', 'subject', 'isNew', 'data'],
        'onExtensionBeforeSave' => ['context', 'subject', 'isNew', 'data'],
        'onExtensionAfterSave' => ['context', 'subject', 'isNew', 'data'],
        'onContentBeforeDelete' => ['context', 'subject'],
        'onContentAfterDelete' => ['context', 'subject'],
        'onRenderModule' => ['subject', 'attributes'],
    ];

    public static function dispatch(CMSApplicationInterface $application, string $eventName, array $arguments = []): array
    {
        if (array_is_list($arguments) && isset(self::ARGUMENT_NAMES[$eventName])) {
            $arguments = array_combine(
                array_slice(self::ARGUMENT_NAMES[$eventName], 0, count($arguments)),
                $arguments
            );
        }

        $event = isset(self::ARGUMENT_NAMES[$eventName]) || $eventName === 'onContentCleanCache'
            ? AbstractEvent::create($eventName, $arguments)
            : new GenericEvent($eventName, $arguments);

        $event = $application->getDispatcher()->dispatch($eventName, $event);
        $result = $event->getArgument('result', []);

        return $result === null ? [] : (is_array($result) ? $result : [$result]);
    }
}
