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

<li class="sprocket-features-index-<?php echo $index;?>">
	<?php
		;
		if (($image = $item->getPrimaryImage())):
	?>
	<div class="sprocket-features-img-container" data-stories-image>
		<?php if ($item->getPrimaryLink()) : ?>
			<a href="<?php echo $item->getPrimaryLink()->getUrl(); ?>"><img src="<?php echo $image->getSource(); ?>" alt="" style="max-width: 100%; height: auto;" /></a>
		<?php else: ?>
			<img src="<?php echo $image->getSource(); ?>" alt="" style="max-width: 100%; height: auto;" />
		<?php endif; ?>
	</div>
	<?php endif; ?>
	<div class="sprocket-features-content" data-stories-content>
		<div class="sprocket-features-content-wrapper">
			<?php if ($parameters->get('features_show_title') && $item->getTitle()) : ?>
				<h2 class="sprocket-features-title">
					<?php if ($item->getPrimaryLink()) : ?>
						<a href="<?php echo $item->getPrimaryLink()->getUrl(); ?>"><?php echo $item->getTitle(); ?></a>				
					<?php else: ?>
						<?php echo $item->getTitle(); ?>
					<?php endif; ?>					
				</h2>
			<?php endif; ?>
			<?php if ($parameters->get('features_show_article_text') && ($item->getText() || $item->getPrimaryLink())) : ?>
				<div class="sprocket-features-desc">
					<div>
						<?php echo $item->getText(); ?>
					</div>
					<?php if ($item->getPrimaryLink()) : ?>
					<a href="<?php echo $item->getPrimaryLink()->getUrl(); ?>" class="readon"><span><?php rc_e('READ_MORE'); ?></span></a>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</li>
