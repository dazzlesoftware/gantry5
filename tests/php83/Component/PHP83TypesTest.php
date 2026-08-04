<?php

namespace Genesis\Tests\PHP83;

use Genesis\Tests\PHP83\MockableTest;

/**
 * Test PHP 8.3 specific type handling and compatibility
 */
class PHP83TypesTest extends MockableTest
{
    /**
     * Test that nullable types and union types work correctly
     * 
     * @covers \Genesis\Component\Stylesheet\CssCompiler
     */
    public function testNullableAndUnionTypes()
    {
        // Test with null values for nullable parameters
        $instance = new \Genesis\Component\Stylesheet\CssCompiler();
        
        // Set null target path and verify it handles correctly
        $instance->setTargetPath(null);
        $this->assertNull($instance->getTargetPath());
        
        // Test with string target
        $testPath = 'test/path/to/css';
        $instance->setTargetPath($testPath);
        $this->assertEquals($testPath, $instance->getTargetPath());
    }
    
    /**
     * Test compatibility with PHP 8.3 trait handling
     * 
     * @covers \Genesis\Component\Theme\ThemeTrait
     */
    public function testTraitCompatibility()
    {
        // Create a mock class using the trait
        $mock = new class {
            use \Genesis\Component\Theme\ThemeTrait;
            
            public function getUrl()
            {
                return $this->url;
            }
            
            public function setUrl($url)
            {
                $this->url = $url;
                return $this;
            }
        };
        
        // Test the trait functionality
        $testUrl = 'https://test.com/theme';
        $mock->setUrl($testUrl);
        $this->assertEquals($testUrl, $mock->getUrl());
    }
}
