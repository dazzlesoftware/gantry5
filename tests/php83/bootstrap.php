<?php
/**
 * Genesis Framework - PHP 8.3 Compatibility Test Suite
 *
 * @copyright (c) 2024
 */

// Define paths
define('GENESIS_ROOT', dirname(dirname(__DIR__)));
define('GENESIS_CLASSES', GENESIS_ROOT . '/src/classes');
define('GENESIS_TESTS', __DIR__);

// Load test base classes first
require_once GENESIS_TESTS . '/MockableTest.php';

// Initialize a list of classes we want to mock completely
$mockedClasses = [
    'Genesis\\Component\\Layout\\Layout',
    'Dazzle Software\\Toolbox\\ArrayTraits\\ArrayAccess',
    'Dazzle Software\\Toolbox\\ArrayTraits\\Iterator',
    'Dazzle Software\\Toolbox\\ArrayTraits\\Export',
    'Dazzle Software\\Toolbox\\ArrayTraits\\ExportInterface',
    'Genesis\\Component\\Stylesheet\\CssCompiler',
    'Genesis\\Component\\Theme\\ThemeTrait',
    'Genesis\\Component\\Twig\\TwigExtension',
    'Genesis\\Framework\\Platform',
    'Genesis\\Joomla\\Framework\\Platform',
    'Genesis\\WordPress\\Framework\\Platform',
    'Genesis\\Framework\\Base\\Genesis'
];

// Register class autoloader for Genesis classes
spl_autoload_register(function ($class) use ($mockedClasses) {
    // Skip classes we've already mocked
    if (in_array($class, $mockedClasses)) {
        return false;
    }
    
    // First check for test classes
    $testFile = GENESIS_TESTS . '/' . str_replace(['Genesis\\Tests\\PHP83\\', '\\'], ['', '/'], $class) . '.php';
    if (file_exists($testFile)) {
        include_once $testFile;
        return true;
    }
    
    // Check for mock classes in Framework dir
    if (strpos($class, 'Genesis\\Framework\\Base\\') === 0) {
        $filename = GENESIS_TESTS . '/Framework/' . basename(str_replace('\\', '/', $class)) . '.php';
        $mockFilename = GENESIS_TESTS . '/Framework/' . basename(str_replace('\\', '/', $class)) . 'Mock.php';
        
        if (file_exists($mockFilename)) {
            include_once $mockFilename;
            return true;
        }
        if (file_exists($filename)) {
            include_once $filename;
            return true;
        }
    }
    
    // Only load real classes if they're not in our mock list
    if (!in_array($class, $mockedClasses)) {
        // Then check for real Genesis classes
        $filename = GENESIS_CLASSES . '/' . str_replace('\\', '/', $class) . '.php';
        if (file_exists($filename)) {
            include_once $filename;
            return true;
        }
        
        // Try src/platforms paths
        $platforms = glob(GENESIS_ROOT . '/src/platforms/*/classes/' . str_replace('\\', '/', $class) . '.php');
        if (!empty($platforms)) {
            include_once $platforms[0];
            return true;
        }
    }
    
    return false;
});

// Try to load vendor autoloader if available
$vendorAutoload = GENESIS_ROOT . '/vendor/autoload.php';
if (file_exists($vendorAutoload)) {
    require_once $vendorAutoload;
}

// Set up error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
