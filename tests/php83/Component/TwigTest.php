<?php

namespace Genesis\Tests\PHP83\Component;

use Genesis\Tests\PHP83\MockableTest;
use Genesis\Component\Twig\TwigExtension;

/**
 * Test Twig integration with PHP 8.3
 */
class TwigTest extends MockableTest
{
    /**
     * Test Twig extension class instantiation
     */
    public function testTwigExtensionInstantiation()
    {
        $extension = new TwigExtension();
        $this->assertInstanceOf(TwigExtension::class, $extension);
    }
    
    /**
     * Test Twig filters availability
     */
    public function testTwigFilters()
    {
        $extension = new TwigExtension();
        $filters = $extension->getFilters();
        
        $this->assertIsArray($filters);
        $this->assertNotEmpty($filters);
        
        // Check for core filters
        $filterNames = array_map(function ($filter) {
            return $filter->getName();
        }, $filters);
        
        $this->assertContains('transFilter', $filterNames);
        $this->assertContains('truncateHtml', $filterNames);
    }
    
    /**
     * Test Twig functions availability
     */
    public function testTwigFunctions()
    {
        $extension = new TwigExtension();
        $functions = $extension->getFunctions();
        
        $this->assertIsArray($functions);
        $this->assertNotEmpty($functions);
        
        // Check for core functions
        $functionNames = array_map(function ($function) {
            return $function->getName();
        }, $functions);
        
        $this->assertContains('trans', $functionNames);
        $this->assertContains('url', $functionNames);
    }

    public function testUrlFunctionAcceptsUnsetParticleValues(): void
    {
        $source = file_get_contents(dirname(__DIR__, 3) . '/src/classes/Genesis/Component/Twig/TwigExtension.php');

        $this->assertIsString($source);
        $this->assertStringContainsString('public function urlFunc(?string $input,', $source);
        $this->assertStringContainsString('trim($input ?? \'\')', $source);
    }

}
