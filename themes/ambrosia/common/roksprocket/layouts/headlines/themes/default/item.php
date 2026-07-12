<?php
/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

/**
 * @var $item RokSprocket_Item
 */
?>
<li>
	<div class="sprocket-headlines-item<?php echo (!$index) ? ' active' : ''; ?>" data-headlines-item>
		<?php if ( $item->getPrimaryImage()) :?>
		<img src="<?php echo $item->getPrimaryImage()->getSource(); ?>" class="sprocket-headlines-image" alt="<?php echo $item->getPrimaryImage()->getAlttext(); ?>"/>
		<?php endif; ?>
		<?php if ($item->getPrimaryLink()) : ?>
		<a href="<?php echo $item->getPrimaryLink()->getUrl(); ?>" class="sprocket-headlines-text">
		<?php else : ?>
		<div class="sprocket-headlines-text">
		<?php endif; ?>
			<?php echo $item->getText(); ?>
		<?php if ($item->getPrimaryLink()) : ?>
		</a>
		<?php else : ?>
		</div>
		<?php endif; ?>
	</div>
</li>
