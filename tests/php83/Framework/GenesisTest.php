<?php

namespace Genesis\Tests\PHP83\Framework;

use Genesis\Tests\PHP83\MockableTest;
use Genesis\Framework\Base\Genesis;

/**
 * Test core Genesis framework functionality with PHP 8.3
 */
class GenesisTest extends MockableTest
{
    /**
     * Test instance creation and basic functionality
     */
    public function testGenesisInstance()
    {
        // Get the Genesis instance
        $genesis = Genesis::instance();
        
        // Test that we got a valid instance
        $this->assertInstanceOf(Genesis::class, $genesis);
        
        // Test that we can access the container
        $container = $genesis->container;
        $this->assertNotNull($container);
    }
    
    /**
     * Test Genesis container services
     */
    public function testGenesisContainer()
    {
        $genesis = Genesis::instance();
        
        // Test platform service
        $this->assertTrue($genesis->container->has('platform'));
        
        // Test theme service
        if ($genesis->container->has('theme')) {
            $theme = $genesis->container->get('theme');
            $this->assertNotNull($theme);
        }
    }
    
    /**
     * Test debugging functionality
     */
    public function testGenesisDebug()
    {
        $genesis = Genesis::instance();
        
        // Test debug mode can be set
        $genesis->debug(true);
        $this->assertTrue($genesis->debug());
        
        $genesis->debug(false);
        $this->assertFalse($genesis->debug());
    }
}
