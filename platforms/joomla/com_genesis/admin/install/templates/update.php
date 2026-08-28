<?php

declare(strict_types=1);
defined('_JEXEC') or die;
include __DIR__ . '/style.php';
?>

<div class="g5i">
    <h1>
        <span class="genesis-title"><?php echo $name; ?> Updated</span>
        <span class="genesis-info">v<?php echo $version; ?> / <?php echo $date; ?></span>
    </h1>

    <div class="genesis-actions">
        <a href="<?php echo $edit_url; ?>" class="genesis-button">Configure <?php echo $name; ?> <span class="genesis-icon icon-chevron-right"></span></a>
    </div>

    <div class="genesis-brand">
        <a href="https://dazzlesoftware.org"><span>Dazzle Software</span></a>
    </div>
</div>
