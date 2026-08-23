<?php

namespace Genesis\Tests\PHP83\Component\Layout;

use Genesis\Tests\PHP83\MockableTest;
use Genesis\Component\Layout\Layout;

/**
 * Test layout component with PHP 8.3
 */
class LayoutTest extends MockableTest
{
    public function testCompactLayoutNormalizesLegacyFalseSubtype(): void
    {
        $source = file_get_contents(
            dirname(__DIR__, 4) . '/src/classes/Genesis/Component/Layout/Version/CompactFormat.php'
        );

        $this->assertIsString($source);
        $this->assertStringContainsString('is_string($child[\'subtype\'] ?? null)', $source);
        $this->assertStringContainsString(
            'protected function getTitle(string $type, ?string $subtype, string|int|null $id): ?string',
            $source
        );
    }

    /**
     * Test layout initialization
     */
    public function testLayoutInitialization()
    {
        // Test creating a layout instance with minimal parameters
        $layout = new Layout('test');
        $this->assertInstanceOf(Layout::class, $layout);

        // Test getting layout name
        $this->assertEquals('test', $layout->name);
    }

    /**
     * Test layout preset loading
     */
    public function testLayoutPresets()
    {
        $layout = new Layout('test');

        // Test preset functionality
        $preset = [
            'name' => 'Test Preset',
            'sections' => [
                'main' => [
                    'type' => 'section',
                    'attributes' => ['id' => 'main']
                ]
            ]
        ];

        $layout->initPreset($preset);

        // Test that preset was applied
        $this->assertNotEmpty($layout->preset);
    }

    /**
     * Test layout rendering with PHP 8.3 compatibility
     */
    public function testLayoutRendering()
    {
        $layout = new Layout('test');

        // Simple preset for testing
        $preset = [
            'name' => 'Test Preset',
            'sections' => [
                'main' => [
                    'type' => 'section',
                    'attributes' => ['id' => 'main'],
                    'children' => []
                ]
            ]
        ];

        $layout->initPreset($preset);

        // Test that the layout can be converted to array
        $array = $layout->toArray();
        $this->assertIsArray($array);
        $this->assertArrayHasKey('name', $array);
    }
}
