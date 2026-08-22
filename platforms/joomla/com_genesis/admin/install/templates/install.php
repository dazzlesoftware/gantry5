<?php

declare(strict_types=1);
defined('_JEXEC') or die;

include __DIR__ . '/style.php';
?>

<div class="g5i">
    <h1>
        <span class="genesis-title"><?php echo $name; ?> Installed</span>
        <span class="genesis-info">v<?php echo $version; ?> / <?php echo $date; ?></span>
    </h1>

    <p>
        Thank you for choosing Genesis Framework!
        <br>
        The next step is to install a Genesis-compatible template. For more information, please read the <a href="https://codex.dazzlecms.org/basics/installation">documentation</a>.
    </p>

    <div class="genesis-rockettheme">
        <a href="https://dazzlesoftware.org"><span>Dazzle Software</span></a>
    </div>
</div>
