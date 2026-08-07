# Particles File Map

Generated mapping of Particle YAML, Twig, and SCSS files across the engine and all themes.

## Core vs. Theme Name Conflicts

13 particle names exist in both core (`engines/common/nucleus/particles`) and at least one theme's `common/particles` folder. This is normal Gantry 5 behavior — a theme overrides a core particle by placing a same-named file in its own `common/particles` folder, which takes precedence at render time.

| Particle | # Themes | Overriding Themes |
|---|---|---|
| **contenttabs** | 20 | acronym, ambrosia, anacron, antares, aphrodite, audacity, callisto, chimera, epsilon, flux, gemini, hadron, helium, interstellar, lexicon, notio, photon, protean, supra, vermilion, versla |
| **logo** | 21 | akuatik, ambrosia, calla, chimera, clarity, denali, elixir, horizon, koleti, kraken, manticore, myriad, orion, phoenix, reiko, requiem, salient, studius, vermilion, xenon, zenith |
| **social** | 19 | akuatik, ambrosia, anacron, audacity, chimera, clarity, elixir, epsilon, hadron, horizon, kraken, manticore, myriad, orion, phoenix, requiem, salient, studius, vermilion |
| **heading** | 12 | akuatik, calla, clarity, elixir, horizon, koleti, manticore, orion, phoenix, reiko, studius, zenith |
| **accordion** | 13 | acronym, citadel, flux, gemini, interstellar, notio, photon, protean, remnant, sienna, supra, topaz, versla |
| **totop** | 9 | anacron, antares, audacity, chimera, epsilon, hadron, lexicon, myriad, vermilion |
| **swipercarousel** | 8 | citadel, galatea, interstellar, photon, protean, remnant, sienna, topaz |
| **copyright** | 7 | antares, aphrodite, helium, isotope, kraken, requiem, xenon |
| **custom** | 7 | anacron, audacity, chimera, epsilon, hadron, lexicon, vermilion |
| **image** | 5 | elixir, horizon, orion, phoenix, studius |
| **menu** | 1 | vermilion |
| **timeline** | 1 | zenith |
| **imageoverlay** | 1 | ethereal |

## Engine (engines/common/nucleus)

### accordion
- YAML: `engines/common/nucleus/particles/accordion.yaml`
- Twig: `engines/common/nucleus/particles/accordion.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_accordion.scss`

### advancedprogressbar
- YAML: `engines/common/nucleus/particles/advancedprogressbar.yaml`
- Twig: `engines/common/nucleus/particles/advancedprogressbar.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_advancedprogressbar.scss`

### advancedtable
- YAML: `engines/common/nucleus/particles/advancedtable.yaml`
- Twig: `engines/common/nucleus/particles/advancedtable.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_advancedtable.scss`

### alert
- YAML: `engines/common/nucleus/particles/alert.yaml`
- Twig: `engines/common/nucleus/particles/alert.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_alert.scss`

### analytics
- YAML: `engines/common/nucleus/particles/analytics.yaml`
- Twig: `engines/common/nucleus/particles/analytics.html.twig`
- SCSS: _none_

### animatedheading
- YAML: `engines/common/nucleus/particles/animatedheading.yaml`
- Twig: `engines/common/nucleus/particles/animatedheading.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_animatedheading.scss`

### animatednumber
- YAML: `engines/common/nucleus/particles/animatednumber.yaml`
- Twig: `engines/common/nucleus/particles/animatednumber.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_animatednumber.scss`

### articlesscroller
- YAML: `engines/common/nucleus/particles/articlesscroller.yaml`
- Twig: `engines/common/nucleus/particles/articlesscroller.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_articlesscroller.scss`

### assets
- YAML: `engines/common/nucleus/particles/assets.yaml`
- Twig: `engines/common/nucleus/particles/assets.html.twig`
- SCSS: _none_

### audioplayer
- YAML: `engines/common/nucleus/particles/audioplayer.yaml`
- Twig: `engines/common/nucleus/particles/audioplayer.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_audioplayer.scss`

### blocknumber
- YAML: `engines/common/nucleus/particles/blocknumber.yaml`
- Twig: `engines/common/nucleus/particles/blocknumber.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_blocknumber.scss`

### branding
- YAML: `engines/common/nucleus/particles/branding.yaml`
- Twig: `engines/common/nucleus/particles/branding.html.twig`
- SCSS: _none_

### button
- YAML: `engines/common/nucleus/particles/button.yaml`
- Twig: `engines/common/nucleus/particles/button.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_button.scss`

### buttongroup
- YAML: `engines/common/nucleus/particles/buttongroup.yaml`
- Twig: `engines/common/nucleus/particles/buttongroup.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_buttongroup.scss`

### clients
- YAML: `engines/common/nucleus/particles/clients.yaml`
- Twig: `engines/common/nucleus/particles/clients.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_clients.scss`

### content
- YAML: `engines/common/nucleus/particles/content.yaml`
- Twig: _none_
- SCSS: _none_

### contentcarousel
- YAML: `engines/common/nucleus/particles/contentcarousel.yaml`
- Twig: `engines/common/nucleus/particles/contentcarousel.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_contentcarousel.scss`

### contentcarouselpro
- YAML: `engines/common/nucleus/particles/contentcarouselpro.yaml`
- Twig: `engines/common/nucleus/particles/contentcarouselpro.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_contentcarouselpro.scss`

### contenttabs
- YAML: `engines/common/nucleus/particles/contenttabs.yaml`
- Twig: `engines/common/nucleus/particles/contenttabs.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_contenttabs.scss`

### copyright
- YAML: `engines/common/nucleus/particles/copyright.yaml`
- Twig: `engines/common/nucleus/particles/copyright.html.twig`
- SCSS: _none_

### custom
- YAML: `engines/common/nucleus/particles/custom.yaml`
- Twig: `engines/common/nucleus/particles/custom.html.twig`
- SCSS: _none_

### date
- YAML: `engines/common/nucleus/particles/date.yaml`
- Twig: `engines/common/nucleus/particles/date.html.twig`
- SCSS: _none_

### divider
- YAML: `engines/common/nucleus/particles/divider.yaml`
- Twig: `engines/common/nucleus/particles/divider.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_divider.scss`

### feature
- YAML: `engines/common/nucleus/particles/feature.yaml`
- Twig: `engines/common/nucleus/particles/feature.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_feature.scss`

### flipbox
- YAML: `engines/common/nucleus/particles/flipbox.yaml`
- Twig: `engines/common/nucleus/particles/flipbox.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_flipbox.scss`

### flipboxpro
- YAML: `engines/common/nucleus/particles/flipboxpro.yaml`
- Twig: `engines/common/nucleus/particles/flipboxpro.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_flipboxpro.scss`

### frameworks
- YAML: `engines/common/nucleus/particles/frameworks.yaml`
- Twig: `engines/common/nucleus/particles/frameworks.html.twig`
- SCSS: _none_

### genesisfeatures
- YAML: `engines/common/nucleus/particles/genesisfeatures.yaml`
- Twig: `engines/common/nucleus/particles/genesisfeatures.html.twig`
- SCSS: _none_

### gmap
- YAML: `engines/common/nucleus/particles/gmap.yaml`
- Twig: `engines/common/nucleus/particles/gmap.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_gmap.scss`

### heading
- YAML: `engines/common/nucleus/particles/heading.yaml`
- Twig: `engines/common/nucleus/particles/heading.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_heading.scss`

### icon
- YAML: `engines/common/nucleus/particles/icon.yaml`
- Twig: `engines/common/nucleus/particles/icon.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_icon.scss`

### iconsgroup
- YAML: `engines/common/nucleus/particles/iconsgroup.yaml`
- Twig: `engines/common/nucleus/particles/iconsgroup.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_iconsgroup.scss`

### image
- YAML: `engines/common/nucleus/particles/image.yaml`
- Twig: `engines/common/nucleus/particles/image.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_image.scss`

### imagecarousel
- YAML: `engines/common/nucleus/particles/imagecarousel.yaml`
- Twig: `engines/common/nucleus/particles/imagecarousel.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_imagecarousel.scss`

### imagecontent
- YAML: `engines/common/nucleus/particles/imagecontent.yaml`
- Twig: `engines/common/nucleus/particles/imagecontent.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_imagecontent.scss`

### imagelayouts
- YAML: `engines/common/nucleus/particles/imagelayouts.yaml`
- Twig: `engines/common/nucleus/particles/imagelayouts.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_imagelayouts.scss`

### imageoverlay
- YAML: `engines/common/nucleus/particles/imageoverlay.yaml`
- Twig: `engines/common/nucleus/particles/imageoverlay.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_imageoverlay.scss`

### imagepopover
- YAML: `engines/common/nucleus/particles/imagepopover.yaml`
- Twig: `engines/common/nucleus/particles/imagepopover.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_imagepopover.scss`

### instagramgallery
- YAML: `engines/common/nucleus/particles/instagramgallery.yaml`
- Twig: `engines/common/nucleus/particles/instagramgallery.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_instagramgallery.scss`

### lightcase
- YAML: `engines/common/nucleus/particles/lightcase.yaml`
- Twig: `engines/common/nucleus/particles/lightcase.html.twig`
- SCSS: _none_

### logo
- YAML: `engines/common/nucleus/particles/logo.yaml`
- Twig: `engines/common/nucleus/particles/logo.html.twig`
- SCSS: _none_

### menu
- YAML: `engines/common/nucleus/particles/menu.yaml`
- Twig: `engines/common/nucleus/particles/menu.html.twig`
- SCSS: _none_

### messages
- YAML: `engines/common/nucleus/particles/messages.yaml`
- Twig: _none_
- SCSS: _none_

### mobile-menu
- YAML: `engines/common/nucleus/particles/mobile-menu.yaml`
- Twig: `engines/common/nucleus/particles/mobile-menu.html.twig`
- SCSS: _none_

### modal
- YAML: `engines/common/nucleus/particles/modal.yaml`
- Twig: `engines/common/nucleus/particles/modal.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_modal.scss`

### openstreetmap
- YAML: `engines/common/nucleus/particles/openstreetmap.yaml`
- Twig: `engines/common/nucleus/particles/openstreetmap.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_openstreetmap.scss`

### person
- YAML: `engines/common/nucleus/particles/person.yaml`
- Twig: `engines/common/nucleus/particles/person.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_person.scss`

### pieprogress
- YAML: `engines/common/nucleus/particles/pieprogress.yaml`
- Twig: `engines/common/nucleus/particles/pieprogress.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_pieprogress.scss`

### position
- YAML: `engines/common/nucleus/particles/position.yaml`
- Twig: `engines/common/nucleus/particles/position.html.twig`
- SCSS: _none_

### pricelist
- YAML: `engines/common/nucleus/particles/pricelist.yaml`
- Twig: `engines/common/nucleus/particles/pricelist.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_pricelist.scss`

### pricing
- YAML: `engines/common/nucleus/particles/pricing.yaml`
- Twig: `engines/common/nucleus/particles/pricing.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_pricing.scss`

### progressbar
- YAML: `engines/common/nucleus/particles/progressbar.yaml`
- Twig: `engines/common/nucleus/particles/progressbar.html.twig`
- SCSS: _none_

### simplecounter
- YAML: `engines/common/nucleus/particles/simplecounter.yaml`
- Twig: `engines/common/nucleus/particles/simplecounter.html.twig`
- SCSS: _none_

### singlepagenav
- YAML: `engines/common/nucleus/particles/singlepagenav.yaml`
- Twig: `engines/common/nucleus/particles/singlepagenav.html.twig`
- SCSS: _none_

### social
- YAML: `engines/common/nucleus/particles/social.yaml`
- Twig: `engines/common/nucleus/particles/social.html.twig`
- SCSS: _none_

### socialshare
- YAML: `engines/common/nucleus/particles/socialshare.yaml`
- Twig: `engines/common/nucleus/particles/socialshare.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_socialshare.scss`

### soundcloud
- YAML: `engines/common/nucleus/particles/soundcloud.yaml`
- Twig: `engines/common/nucleus/particles/soundcloud.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_soundcloud.scss`

### spacer
- YAML: `engines/common/nucleus/particles/spacer.yaml`
- Twig: _none_
- SCSS: _none_

### swipercarousel
- YAML: `engines/common/nucleus/particles/swipercarousel.yaml`
- Twig: `engines/common/nucleus/particles/swipercarousel.html.twig`
- SCSS: _none_

### tabbedcards
- YAML: `engines/common/nucleus/particles/tabbedcards.yaml`
- Twig: `engines/common/nucleus/particles/tabbedcards.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_tabbedcards.scss`

### tabimage
- YAML: `engines/common/nucleus/particles/tabimage.yaml`
- Twig: `engines/common/nucleus/particles/tabimage.html.twig`
- SCSS: _none_

### teamcarousel
- YAML: `engines/common/nucleus/particles/teamcarousel.yaml`
- Twig: `engines/common/nucleus/particles/teamcarousel.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_teamcarousel.scss`

### testimonialcard
- YAML: `engines/common/nucleus/particles/testimonialcard.yaml`
- Twig: `engines/common/nucleus/particles/testimonialcard.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_testimonialcard.scss`

### testimonialcarousel
- YAML: `engines/common/nucleus/particles/testimonialcarousel.yaml`
- Twig: `engines/common/nucleus/particles/testimonialcarousel.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_testimonialcarousel.scss`

### textblock
- YAML: `engines/common/nucleus/particles/textblock.yaml`
- Twig: `engines/common/nucleus/particles/textblock.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_textblock.scss`

### timeline
- YAML: `engines/common/nucleus/particles/timeline.yaml`
- Twig: `engines/common/nucleus/particles/timeline.html.twig`
- SCSS: `engines/common/nucleus/scss/nucleus/_timeline.scss`

### totop
- YAML: `engines/common/nucleus/particles/totop.yaml`
- Twig: `engines/common/nucleus/particles/totop.html.twig`
- SCSS: _none_

### video
- YAML: `engines/common/nucleus/particles/video.yaml`
- Twig: `engines/common/nucleus/particles/video.html.twig`
- SCSS: _none_

## Theme: acronym

### accordion
- YAML: `themes/acronym/common/particles/accordion.yaml`
- Twig: `themes/acronym/common/particles/accordion.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_accordion.scss`

### accordionmenu
- YAML: `themes/acronym/common/particles/accordionmenu.yaml`
- Twig: `themes/acronym/common/particles/accordionmenu.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_accordionmenu.scss`

### aos
- YAML: `themes/acronym/common/particles/aos.yaml`
- Twig: `themes/acronym/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/acronym/common/particles/blockcontent.yaml`
- Twig: `themes/acronym/common/particles/blockcontent.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_blockcontent.scss`

### calendar
- YAML: `themes/acronym/common/particles/calendar.yaml`
- Twig: `themes/acronym/common/particles/calendar.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_calendar.scss`

### contenttabs
- YAML: `themes/acronym/common/particles/contenttabs.yaml`
- Twig: `themes/acronym/common/particles/contenttabs.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_contenttabs.scss`

### fixedheader
- YAML: `themes/acronym/common/particles/fixedheader.yaml`
- Twig: `themes/acronym/common/particles/fixedheader.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_fixedheader.scss`

### flippingcards
- YAML: `themes/acronym/common/particles/flippingcards.yaml`
- Twig: `themes/acronym/common/particles/flippingcards.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_flippingcards.scss`

### gridcontent
- YAML: `themes/acronym/common/particles/gridcontent.yaml`
- Twig: `themes/acronym/common/particles/gridcontent.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/acronym/common/particles/gridstatistic.yaml`
- Twig: `themes/acronym/common/particles/gridstatistic.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_gridstatistic.scss`

### headerlicious
- YAML: `themes/acronym/common/particles/headerlicious.yaml`
- Twig: `themes/acronym/common/particles/headerlicious.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_headerlicious.scss`

### headertabs
- YAML: `themes/acronym/common/particles/headertabs.yaml`
- Twig: `themes/acronym/common/particles/headertabs.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_headertabs.scss`

### imagegrid
- YAML: `themes/acronym/common/particles/imagegrid.yaml`
- Twig: `themes/acronym/common/particles/imagegrid.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_imagegrid.scss`

### infolist
- YAML: `themes/acronym/common/particles/infolist.yaml`
- Twig: `themes/acronym/common/particles/infolist.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_infolist.scss`

### mailchimp
- YAML: `themes/acronym/common/particles/mailchimp.yaml`
- Twig: `themes/acronym/common/particles/mailchimp.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/acronym/common/particles/newsletter.yaml`
- Twig: `themes/acronym/common/particles/newsletter.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_newsletter.scss`

### particlesjs
- YAML: `themes/acronym/common/particles/particlesjs.yaml`
- Twig: `themes/acronym/common/particles/particlesjs.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_particlesjs.scss`

### popupmodule
- YAML: `themes/acronym/common/particles/popupmodule.yaml`
- Twig: `themes/acronym/common/particles/popupmodule.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/acronym/common/particles/pricingtable.yaml`
- Twig: `themes/acronym/common/particles/pricingtable.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/acronym/common/particles/simplecontent.yaml`
- Twig: `themes/acronym/common/particles/simplecontent.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/acronym/common/particles/simplemenu.yaml`
- Twig: `themes/acronym/common/particles/simplemenu.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_simplemenu.scss`

### swiper
- YAML: `themes/acronym/common/particles/swiper.yaml`
- Twig: `themes/acronym/common/particles/swiper.html.twig`
- SCSS: `themes/acronym/common/scss/acronym/particles/_swiper.scss`

### swipercards
- YAML: `themes/acronym/common/particles/swipercards.yaml`
- Twig: `themes/acronym/common/particles/swipercards.html.twig`
- SCSS: _none_

### swipershowcase
- YAML: `themes/acronym/common/particles/swipershowcase.yaml`
- Twig: `themes/acronym/common/particles/swipershowcase.html.twig`
- SCSS: _none_

## Theme: akuatik

### aos
- YAML: `themes/akuatik/common/particles/aos.yaml`
- Twig: `themes/akuatik/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/akuatik/common/particles/blockcontent.yaml`
- Twig: `themes/akuatik/common/particles/blockcontent.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_blockcontent.scss`

### categorylist
- YAML: `themes/akuatik/common/particles/categorylist.yaml`
- Twig: `themes/akuatik/common/particles/categorylist.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_categorylist.scss`

### featuredvideos
- YAML: `themes/akuatik/common/particles/featuredvideos.yaml`
- Twig: `themes/akuatik/common/particles/featuredvideos.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_featuredvideos.scss`

### fixedheader
- YAML: `themes/akuatik/common/particles/fixedheader.yaml`
- Twig: `themes/akuatik/common/particles/fixedheader.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/akuatik/common/particles/gridstatistic.yaml`
- Twig: `themes/akuatik/common/particles/gridstatistic.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_gridstatistic.scss`

### heading
- YAML: `themes/akuatik/common/particles/heading.yaml`
- Twig: `themes/akuatik/common/particles/heading.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_heading.scss`

### imagegrid
- YAML: `themes/akuatik/common/particles/imagegrid.yaml`
- Twig: `themes/akuatik/common/particles/imagegrid.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_imagegrid.scss`

### infolist
- YAML: `themes/akuatik/common/particles/infolist.yaml`
- Twig: `themes/akuatik/common/particles/infolist.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_infolist.scss`

### latestnews
- YAML: `themes/akuatik/common/particles/latestnews.yaml`
- Twig: `themes/akuatik/common/particles/latestnews.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_latestnews.scss`

### logo
- YAML: `themes/akuatik/common/particles/logo.yaml`
- Twig: `themes/akuatik/common/particles/logo.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/styles/_logo.scss`

### logos
- YAML: `themes/akuatik/common/particles/logos.yaml`
- Twig: `themes/akuatik/common/particles/logos.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_logos.scss`

### newsletter
- YAML: `themes/akuatik/common/particles/newsletter.yaml`
- Twig: `themes/akuatik/common/particles/newsletter.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_newsletter.scss`

### particlesjs
- YAML: `themes/akuatik/common/particles/particlesjs.yaml`
- Twig: `themes/akuatik/common/particles/particlesjs.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_particlesjs.scss`

### popupmodule
- YAML: `themes/akuatik/common/particles/popupmodule.yaml`
- Twig: `themes/akuatik/common/particles/popupmodule.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/akuatik/common/particles/pricingtable.yaml`
- Twig: `themes/akuatik/common/particles/pricingtable.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_pricingtable.scss`

### promo
- YAML: `themes/akuatik/common/particles/promo.yaml`
- Twig: `themes/akuatik/common/particles/promo.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_promo.scss`

### search
- YAML: `themes/akuatik/common/particles/search.yaml`
- Twig: `themes/akuatik/common/particles/search.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_search.scss`

### simplecontent
- YAML: `themes/akuatik/common/particles/simplecontent.yaml`
- Twig: `themes/akuatik/common/particles/simplecontent.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/akuatik/common/particles/simplemenu.yaml`
- Twig: `themes/akuatik/common/particles/simplemenu.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_simplemenu.scss`

### slideshow
- YAML: `themes/akuatik/common/particles/slideshow.yaml`
- Twig: `themes/akuatik/common/particles/slideshow.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_slideshow.scss`
- SCSS: `themes/akuatik/common/scss/akuatik/sections/_slideshow.scss`

### social
- YAML: `themes/akuatik/common/particles/social.yaml`
- Twig: `themes/akuatik/common/particles/social.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_social.scss`

### swiper
- YAML: `themes/akuatik/common/particles/swiper.yaml`
- Twig: `themes/akuatik/common/particles/swiper.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_swiper.scss`

### team
- YAML: `themes/akuatik/common/particles/team.yaml`
- Twig: `themes/akuatik/common/particles/team.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_team.scss`

### testimonials
- YAML: `themes/akuatik/common/particles/testimonials.yaml`
- Twig: `themes/akuatik/common/particles/testimonials.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_testimonials.scss`

### topiclist
- YAML: `themes/akuatik/common/particles/topiclist.yaml`
- Twig: `themes/akuatik/common/particles/topiclist.html.twig`
- SCSS: `themes/akuatik/common/scss/akuatik/particles/_topiclist.scss`

## Theme: ambrosia

### aos
- YAML: `themes/ambrosia/common/particles/aos.yaml`
- Twig: `themes/ambrosia/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/ambrosia/common/particles/blockcontent.yaml`
- Twig: `themes/ambrosia/common/particles/blockcontent.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_blockcontent.scss`

### calendar
- YAML: `themes/ambrosia/common/particles/calendar.yaml`
- Twig: `themes/ambrosia/common/particles/calendar.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_calendar.scss`

### contact
- YAML: `themes/ambrosia/common/particles/contact.yaml`
- Twig: `themes/ambrosia/common/particles/contact.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_contact.scss`

### contentlist
- YAML: `themes/ambrosia/common/particles/contentlist.yaml`
- Twig: `themes/ambrosia/common/particles/contentlist.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_contentlist.scss`

### contenttabs
- YAML: `themes/ambrosia/common/particles/contenttabs.yaml`
- Twig: `themes/ambrosia/common/particles/contenttabs.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_contenttabs.scss`

### featuresslider
- YAML: `themes/ambrosia/common/particles/featuresslider.yaml`
- Twig: `themes/ambrosia/common/particles/featuresslider.html.twig`
- SCSS: _none_

### fixedheader
- YAML: `themes/ambrosia/common/particles/fixedheader.yaml`
- Twig: `themes/ambrosia/common/particles/fixedheader.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_fixedheader.scss`

### headlines
- YAML: `themes/ambrosia/common/particles/headlines.yaml`
- Twig: `themes/ambrosia/common/particles/headlines.html.twig`
- SCSS: _none_

### horizontalmenu
- YAML: `themes/ambrosia/common/particles/horizontalmenu.yaml`
- Twig: `themes/ambrosia/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/ambrosia/common/particles/imagegrid.yaml`
- Twig: `themes/ambrosia/common/particles/imagegrid.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_imagegrid.scss`

### infolist
- YAML: `themes/ambrosia/common/particles/infolist.yaml`
- Twig: `themes/ambrosia/common/particles/infolist.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_infolist.scss`

### lists
- YAML: `themes/ambrosia/common/particles/lists.yaml`
- Twig: `themes/ambrosia/common/particles/lists.html.twig`
- SCSS: _none_

### logo
- YAML: `themes/ambrosia/common/particles/logo.yaml`
- Twig: `themes/ambrosia/common/particles/logo.html.twig`
- SCSS: _none_

### newsletter
- YAML: `themes/ambrosia/common/particles/newsletter.yaml`
- Twig: `themes/ambrosia/common/particles/newsletter.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_newsletter.scss`

### promoimage
- YAML: `themes/ambrosia/common/particles/promoimage.yaml`
- Twig: `themes/ambrosia/common/particles/promoimage.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_promoimage.scss`

### social
- YAML: `themes/ambrosia/common/particles/social.yaml`
- Twig: `themes/ambrosia/common/particles/social.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_social.scss`

### stripsslider
- YAML: `themes/ambrosia/common/particles/stripsslider.yaml`
- Twig: `themes/ambrosia/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/ambrosia/common/particles/swiper.yaml`
- Twig: `themes/ambrosia/common/particles/swiper.html.twig`
- SCSS: `themes/ambrosia/common/scss/ambrosia/_swiper.scss`

## Theme: anacron

### aos
- YAML: `themes/anacron/common/particles/aos.yaml`
- Twig: `themes/anacron/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/anacron/common/particles/blockcontent.yaml`
- Twig: `themes/anacron/common/particles/blockcontent.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_blockcontent.scss`

### calendar
- YAML: `themes/anacron/common/particles/calendar.yaml`
- Twig: `themes/anacron/common/particles/calendar.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_calendar.scss`

### contact
- YAML: `themes/anacron/common/particles/contact.yaml`
- Twig: `themes/anacron/common/particles/contact.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_contact.scss`

### contentlist
- YAML: `themes/anacron/common/particles/contentlist.yaml`
- Twig: `themes/anacron/common/particles/contentlist.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/anacron/common/particles/contenttabs.yaml`
- Twig: `themes/anacron/common/particles/contenttabs.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_contenttabs.scss`

### custom
- YAML: `themes/anacron/common/particles/custom.yaml`
- Twig: `themes/anacron/common/particles/custom.html.twig`
- SCSS: _none_

### fixedheader
- YAML: `themes/anacron/common/particles/fixedheader.yaml`
- Twig: `themes/anacron/common/particles/fixedheader.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_fixedheader.scss`

### imagegrid
- YAML: `themes/anacron/common/particles/imagegrid.yaml`
- Twig: `themes/anacron/common/particles/imagegrid.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_imagegrid.scss`

### infolist
- YAML: `themes/anacron/common/particles/infolist.yaml`
- Twig: `themes/anacron/common/particles/infolist.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_infolist.scss`

### lists
- YAML: `themes/anacron/common/particles/lists.yaml`
- Twig: `themes/anacron/common/particles/lists.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_lists.scss`

### mosaic
- YAML: `themes/anacron/common/particles/mosaic.yaml`
- Twig: `themes/anacron/common/particles/mosaic.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_mosaic.scss`

### newsletter
- YAML: `themes/anacron/common/particles/newsletter.yaml`
- Twig: `themes/anacron/common/particles/newsletter.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_newsletter.scss`

### pricingtable
- YAML: `themes/anacron/common/particles/pricingtable.yaml`
- Twig: `themes/anacron/common/particles/pricingtable.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/anacron/common/particles/promoimage.yaml`
- Twig: `themes/anacron/common/particles/promoimage.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_promoimage.scss`

### search
- YAML: `themes/anacron/common/particles/search.yaml`
- Twig: `themes/anacron/common/particles/search.html.twig`
- SCSS: _none_

### showcase
- YAML: `themes/anacron/common/particles/showcase.yaml`
- Twig: `themes/anacron/common/particles/showcase.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_showcase.scss`
- SCSS: `themes/anacron/common/scss/anacron/sections/_showcase.scss`

### social
- YAML: `themes/anacron/common/particles/social.yaml`
- Twig: `themes/anacron/common/particles/social.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_social.scss`

### stripsslider
- YAML: `themes/anacron/common/particles/stripsslider.yaml`
- Twig: `themes/anacron/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/anacron/common/particles/swiper.yaml`
- Twig: `themes/anacron/common/particles/swiper.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_swiper.scss`

### testimonials
- YAML: `themes/anacron/common/particles/testimonials.yaml`
- Twig: `themes/anacron/common/particles/testimonials.html.twig`
- SCSS: `themes/anacron/common/scss/anacron/particles/_testimonials.scss`

### totop
- YAML: `themes/anacron/common/particles/totop.yaml`
- Twig: `themes/anacron/common/particles/totop.html.twig`
- SCSS: _none_

## Theme: antares

### animatedblock
- YAML: `themes/antares/common/particles/animatedblock.yaml`
- Twig: `themes/antares/common/particles/animatedblock.html.twig`
- SCSS: `themes/antares/common/scss/antares/_animatedblock.scss`

### aos
- YAML: `themes/antares/common/particles/aos.yaml`
- Twig: `themes/antares/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/antares/common/particles/blockcontent.yaml`
- Twig: `themes/antares/common/particles/blockcontent.html.twig`
- SCSS: `themes/antares/common/scss/antares/_blockcontent.scss`

### calendar
- YAML: `themes/antares/common/particles/calendar.yaml`
- Twig: `themes/antares/common/particles/calendar.html.twig`
- SCSS: `themes/antares/common/scss/antares/_calendar.scss`

### contact
- YAML: `themes/antares/common/particles/contact.yaml`
- Twig: `themes/antares/common/particles/contact.html.twig`
- SCSS: `themes/antares/common/scss/antares/_contact.scss`

### contentlist
- YAML: `themes/antares/common/particles/contentlist.yaml`
- Twig: `themes/antares/common/particles/contentlist.html.twig`
- SCSS: `themes/antares/common/scss/antares/_contentlist.scss`

### contenttabs
- YAML: `themes/antares/common/particles/contenttabs.yaml`
- Twig: `themes/antares/common/particles/contenttabs.html.twig`
- SCSS: `themes/antares/common/scss/antares/_contenttabs.scss`

### copyright
- YAML: `themes/antares/common/particles/copyright.yaml`
- Twig: `themes/antares/common/particles/copyright.html.twig`
- SCSS: `themes/antares/common/scss/antares/_copyright.scss`

### fixedheader
- YAML: `themes/antares/common/particles/fixedheader.yaml`
- Twig: `themes/antares/common/particles/fixedheader.html.twig`
- SCSS: `themes/antares/common/scss/antares/_fixedheader.scss`

### flexslider
- YAML: `themes/antares/common/particles/flexslider.yaml`
- Twig: `themes/antares/common/particles/flexslider.html.twig`
- SCSS: `themes/antares/common/scss/antares/_flexslider.scss`

### gridcontent
- YAML: `themes/antares/common/particles/gridcontent.yaml`
- Twig: `themes/antares/common/particles/gridcontent.html.twig`
- SCSS: `themes/antares/common/scss/antares/_gridcontent.scss`

### gridpromogallery
- YAML: `themes/antares/common/particles/gridpromogallery.yaml`
- Twig: `themes/antares/common/particles/gridpromogallery.html.twig`
- SCSS: `themes/antares/common/scss/antares/_gridpromogallery.scss`

### horizontalmenu
- YAML: `themes/antares/common/particles/horizontalmenu.yaml`
- Twig: `themes/antares/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/antares/common/scss/antares/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/antares/common/particles/imagegrid.yaml`
- Twig: `themes/antares/common/particles/imagegrid.html.twig`
- SCSS: `themes/antares/common/scss/antares/_imagegrid.scss`

### infolist
- YAML: `themes/antares/common/particles/infolist.yaml`
- Twig: `themes/antares/common/particles/infolist.html.twig`
- SCSS: `themes/antares/common/scss/antares/_infolist.scss`

### newsletter
- YAML: `themes/antares/common/particles/newsletter.yaml`
- Twig: `themes/antares/common/particles/newsletter.html.twig`
- SCSS: `themes/antares/common/scss/antares/_newsletter.scss`

### overlaytoggle
- YAML: `themes/antares/common/particles/overlaytoggle.yaml`
- Twig: `themes/antares/common/particles/overlaytoggle.html.twig`
- SCSS: _none_

### popupgrid
- YAML: `themes/antares/common/particles/popupgrid.yaml`
- Twig: `themes/antares/common/particles/popupgrid.html.twig`
- SCSS: `themes/antares/common/scss/antares/_popupgrid.scss`

### popupmodule
- YAML: `themes/antares/common/particles/popupmodule.yaml`
- Twig: `themes/antares/common/particles/popupmodule.html.twig`
- SCSS: `themes/antares/common/scss/antares/_popupmodule.scss`

### pricingtable
- YAML: `themes/antares/common/particles/pricingtable.yaml`
- Twig: `themes/antares/common/particles/pricingtable.html.twig`
- SCSS: `themes/antares/common/scss/antares/_pricingtable.scss`

### promocontent
- YAML: `themes/antares/common/particles/promocontent.yaml`
- Twig: `themes/antares/common/particles/promocontent.html.twig`
- SCSS: `themes/antares/common/scss/antares/_promocontent.scss`

### promoimage
- YAML: `themes/antares/common/particles/promoimage.yaml`
- Twig: `themes/antares/common/particles/promoimage.html.twig`
- SCSS: `themes/antares/common/scss/antares/_promoimage.scss`

### swiper
- YAML: `themes/antares/common/particles/swiper.yaml`
- Twig: `themes/antares/common/particles/swiper.html.twig`
- SCSS: `themes/antares/common/scss/antares/_swiper.scss`

### testimonial
- YAML: `themes/antares/common/particles/testimonial.yaml`
- Twig: `themes/antares/common/particles/testimonial.html.twig`
- SCSS: _none_

### totop
- YAML: `themes/antares/common/particles/totop.yaml`
- Twig: `themes/antares/common/particles/totop.html.twig`
- SCSS: _none_

## Theme: aphrodite

### contentcubes
- YAML: `themes/aphrodite/common/particles/contentcubes.yaml`
- Twig: `themes/aphrodite/common/particles/contentcubes.html.twig`
- SCSS: `themes/aphrodite/common/scss/aphrodite/particles/_contentcubes.scss`

### contenttabs
- YAML: `themes/aphrodite/common/particles/contenttabs.yaml`
- Twig: `themes/aphrodite/common/particles/contenttabs.html.twig`
- SCSS: `themes/aphrodite/common/scss/aphrodite/particles/_contenttabs.scss`

### copyright
- YAML: `themes/aphrodite/common/particles/copyright.yaml`
- Twig: `themes/aphrodite/common/particles/copyright.html.twig`
- SCSS: _none_

### horizontalmenu
- YAML: `themes/aphrodite/common/particles/horizontalmenu.yaml`
- Twig: `themes/aphrodite/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/aphrodite/common/scss/aphrodite/particles/_horizontalmenu.scss`

## Theme: audacity

### aos
- YAML: `themes/audacity/common/particles/aos.yaml`
- Twig: `themes/audacity/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/audacity/common/particles/blockcontent.yaml`
- Twig: `themes/audacity/common/particles/blockcontent.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_blockcontent.scss`

### calendar
- YAML: `themes/audacity/common/particles/calendar.yaml`
- Twig: `themes/audacity/common/particles/calendar.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_calendar.scss`

### contact
- YAML: `themes/audacity/common/particles/contact.yaml`
- Twig: `themes/audacity/common/particles/contact.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_contact.scss`

### contentlist
- YAML: `themes/audacity/common/particles/contentlist.yaml`
- Twig: `themes/audacity/common/particles/contentlist.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/audacity/common/particles/contenttabs.yaml`
- Twig: `themes/audacity/common/particles/contenttabs.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_contenttabs.scss`

### custom
- YAML: `themes/audacity/common/particles/custom.yaml`
- Twig: `themes/audacity/common/particles/custom.html.twig`
- SCSS: _none_

### featuretabs
- YAML: `themes/audacity/common/particles/featuretabs.yaml`
- Twig: `themes/audacity/common/particles/featuretabs.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_featuretabs.scss`

### headlines
- YAML: `themes/audacity/common/particles/headlines.yaml`
- Twig: `themes/audacity/common/particles/headlines.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_headlines.scss`

### horizontalmenu
- YAML: `themes/audacity/common/particles/horizontalmenu.yaml`
- Twig: `themes/audacity/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/audacity/common/particles/imagegrid.yaml`
- Twig: `themes/audacity/common/particles/imagegrid.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_imagegrid.scss`

### imageslider
- YAML: `themes/audacity/common/particles/imageslider.yaml`
- Twig: `themes/audacity/common/particles/imageslider.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_imageslider.scss`

### infolist
- YAML: `themes/audacity/common/particles/infolist.yaml`
- Twig: `themes/audacity/common/particles/infolist.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_infolist.scss`

### linktabs
- YAML: `themes/audacity/common/particles/linktabs.yaml`
- Twig: `themes/audacity/common/particles/linktabs.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_linktabs.scss`

### lists
- YAML: `themes/audacity/common/particles/lists.yaml`
- Twig: `themes/audacity/common/particles/lists.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_lists.scss`

### mailchimp
- YAML: `themes/audacity/common/particles/mailchimp.yaml`
- Twig: `themes/audacity/common/particles/mailchimp.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_mailchimp.scss`

### mosaic
- YAML: `themes/audacity/common/particles/mosaic.yaml`
- Twig: `themes/audacity/common/particles/mosaic.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_mosaic.scss`

### pricingtable
- YAML: `themes/audacity/common/particles/pricingtable.yaml`
- Twig: `themes/audacity/common/particles/pricingtable.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/audacity/common/particles/promoimage.yaml`
- Twig: `themes/audacity/common/particles/promoimage.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_promoimage.scss`

### search
- YAML: `themes/audacity/common/particles/search.yaml`
- Twig: `themes/audacity/common/particles/search.html.twig`
- SCSS: _none_

### showcase
- YAML: `themes/audacity/common/particles/showcase.yaml`
- Twig: `themes/audacity/common/particles/showcase.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_showcase.scss`
- SCSS: `themes/audacity/common/scss/audacity/sections/_showcase.scss`

### slider
- YAML: `themes/audacity/common/particles/slider.yaml`
- Twig: `themes/audacity/common/particles/slider.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_slider.scss`

### social
- YAML: `themes/audacity/common/particles/social.yaml`
- Twig: `themes/audacity/common/particles/social.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_social.scss`

### stripsslider
- YAML: `themes/audacity/common/particles/stripsslider.yaml`
- Twig: `themes/audacity/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/audacity/common/particles/swiper.yaml`
- Twig: `themes/audacity/common/particles/swiper.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_swiper.scss`

### testimonials
- YAML: `themes/audacity/common/particles/testimonials.yaml`
- Twig: `themes/audacity/common/particles/testimonials.html.twig`
- SCSS: `themes/audacity/common/scss/audacity/particles/_testimonials.scss`

### totop
- YAML: `themes/audacity/common/particles/totop.yaml`
- Twig: `themes/audacity/common/particles/totop.html.twig`
- SCSS: _none_

### verticalmenu
- YAML: `themes/audacity/common/particles/verticalmenu.yaml`
- Twig: `themes/audacity/common/particles/verticalmenu.html.twig`
- SCSS: _none_

## Theme: aurora

### aos
- YAML: `themes/aurora/common/particles/aos.yaml`
- Twig: `themes/aurora/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/aurora/common/particles/blockcontent.yaml`
- Twig: `themes/aurora/common/particles/blockcontent.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_blockcontent.scss`

### calendar
- YAML: `themes/aurora/common/particles/calendar.yaml`
- Twig: `themes/aurora/common/particles/calendar.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_calendar.scss`

### carousel
- YAML: `themes/aurora/common/particles/carousel.yaml`
- Twig: `themes/aurora/common/particles/carousel.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_carousel.scss`

### casestudies
- YAML: `themes/aurora/common/particles/casestudies.yaml`
- Twig: `themes/aurora/common/particles/casestudies.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_casestudies.scss`

### fixedheader
- YAML: `themes/aurora/common/particles/fixedheader.yaml`
- Twig: `themes/aurora/common/particles/fixedheader.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_fixedheader.scss`

### gridcontent
- YAML: `themes/aurora/common/particles/gridcontent.yaml`
- Twig: `themes/aurora/common/particles/gridcontent.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/aurora/common/particles/gridstatistic.yaml`
- Twig: `themes/aurora/common/particles/gridstatistic.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/aurora/common/particles/imagegrid.yaml`
- Twig: `themes/aurora/common/particles/imagegrid.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_imagegrid.scss`

### infolist
- YAML: `themes/aurora/common/particles/infolist.yaml`
- Twig: `themes/aurora/common/particles/infolist.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_infolist.scss`

### newsletter
- YAML: `themes/aurora/common/particles/newsletter.yaml`
- Twig: `themes/aurora/common/particles/newsletter.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_newsletter.scss`

### panelslider
- YAML: `themes/aurora/common/particles/panelslider.yaml`
- Twig: `themes/aurora/common/particles/panelslider.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_panelslider.scss`

### popupmodule
- YAML: `themes/aurora/common/particles/popupmodule.yaml`
- Twig: `themes/aurora/common/particles/popupmodule.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/aurora/common/particles/pricingtable.yaml`
- Twig: `themes/aurora/common/particles/pricingtable.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_pricingtable.scss`

### search
- YAML: `themes/aurora/common/particles/search.yaml`
- Twig: `themes/aurora/common/particles/search.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_search.scss`

### simplecontent
- YAML: `themes/aurora/common/particles/simplecontent.yaml`
- Twig: `themes/aurora/common/particles/simplecontent.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/aurora/common/particles/simplemenu.yaml`
- Twig: `themes/aurora/common/particles/simplemenu.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_simplemenu.scss`

### swiper
- YAML: `themes/aurora/common/particles/swiper.yaml`
- Twig: `themes/aurora/common/particles/swiper.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_swiper.scss`

### testimonials
- YAML: `themes/aurora/common/particles/testimonials.yaml`
- Twig: `themes/aurora/common/particles/testimonials.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_testimonials.scss`

### verticalslider
- YAML: `themes/aurora/common/particles/verticalslider.yaml`
- Twig: `themes/aurora/common/particles/verticalslider.html.twig`
- SCSS: `themes/aurora/common/scss/aurora/particles/_verticalslider.scss`

## Theme: calla

### aos
- YAML: `themes/calla/common/particles/aos.yaml`
- Twig: `themes/calla/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/calla/common/particles/blockcontent.yaml`
- Twig: `themes/calla/common/particles/blockcontent.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_blockcontent.scss`

### calendar
- YAML: `themes/calla/common/particles/calendar.yaml`
- Twig: `themes/calla/common/particles/calendar.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_calendar.scss`

### carousel
- YAML: `themes/calla/common/particles/carousel.yaml`
- Twig: `themes/calla/common/particles/carousel.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_carousel.scss`

### casestudies
- YAML: `themes/calla/common/particles/casestudies.yaml`
- Twig: `themes/calla/common/particles/casestudies.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_casestudies.scss`

### gridstatistic
- YAML: `themes/calla/common/particles/gridstatistic.yaml`
- Twig: `themes/calla/common/particles/gridstatistic.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_gridstatistic.scss`

### heading
- YAML: `themes/calla/common/particles/heading.yaml`
- Twig: `themes/calla/common/particles/heading.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_heading.scss`

### imagegrid
- YAML: `themes/calla/common/particles/imagegrid.yaml`
- Twig: `themes/calla/common/particles/imagegrid.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_imagegrid.scss`

### infolist
- YAML: `themes/calla/common/particles/infolist.yaml`
- Twig: `themes/calla/common/particles/infolist.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_infolist.scss`

### logo
- YAML: `themes/calla/common/particles/logo.yaml`
- Twig: `themes/calla/common/particles/logo.html.twig`
- SCSS: `themes/calla/common/scss/calla/styles/_logo.scss`

### newsletter
- YAML: `themes/calla/common/particles/newsletter.yaml`
- Twig: `themes/calla/common/particles/newsletter.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/calla/common/particles/popupmodule.yaml`
- Twig: `themes/calla/common/particles/popupmodule.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/calla/common/particles/pricingtable.yaml`
- Twig: `themes/calla/common/particles/pricingtable.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_pricingtable.scss`

### promo
- YAML: `themes/calla/common/particles/promo.yaml`
- Twig: `themes/calla/common/particles/promo.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_promo.scss`

### search
- YAML: `themes/calla/common/particles/search.yaml`
- Twig: `themes/calla/common/particles/search.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_search.scss`

### simplecontent
- YAML: `themes/calla/common/particles/simplecontent.yaml`
- Twig: `themes/calla/common/particles/simplecontent.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/calla/common/particles/simplemenu.yaml`
- Twig: `themes/calla/common/particles/simplemenu.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_simplemenu.scss`

### slider
- YAML: `themes/calla/common/particles/slider.yaml`
- Twig: `themes/calla/common/particles/slider.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_slider.scss`

### slideshow
- YAML: `themes/calla/common/particles/slideshow.yaml`
- Twig: `themes/calla/common/particles/slideshow.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_slideshow.scss`
- SCSS: `themes/calla/common/scss/calla/sections/_slideshow.scss`

### springboard
- YAML: `themes/calla/common/particles/springboard.yaml`
- Twig: `themes/calla/common/particles/springboard.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_springboard.scss`

### swiper
- YAML: `themes/calla/common/particles/swiper.yaml`
- Twig: `themes/calla/common/particles/swiper.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_swiper.scss`

### verticalmenu
- YAML: `themes/calla/common/particles/verticalmenu.yaml`
- Twig: `themes/calla/common/particles/verticalmenu.html.twig`
- SCSS: `themes/calla/common/scss/calla/particles/_verticalmenu.scss`

## Theme: callisto

### aos
- YAML: `themes/callisto/common/particles/aos.yaml`
- Twig: `themes/callisto/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/callisto/common/particles/blockcontent.yaml`
- Twig: `themes/callisto/common/particles/blockcontent.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_blockcontent.scss`

### calendar
- YAML: `themes/callisto/common/particles/calendar.yaml`
- Twig: `themes/callisto/common/particles/calendar.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_calendar.scss`

### contact
- YAML: `themes/callisto/common/particles/contact.yaml`
- Twig: `themes/callisto/common/particles/contact.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_contact.scss`

### contentlist
- YAML: `themes/callisto/common/particles/contentlist.yaml`
- Twig: `themes/callisto/common/particles/contentlist.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_contentlist.scss`

### contenttabs
- YAML: `themes/callisto/common/particles/contenttabs.yaml`
- Twig: `themes/callisto/common/particles/contenttabs.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_contenttabs.scss`

### featuresslider
- YAML: `themes/callisto/common/particles/featuresslider.yaml`
- Twig: `themes/callisto/common/particles/featuresslider.html.twig`
- SCSS: _none_

### fixedheader
- YAML: `themes/callisto/common/particles/fixedheader.yaml`
- Twig: `themes/callisto/common/particles/fixedheader.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_fixedheader.scss`

### headlines
- YAML: `themes/callisto/common/particles/headlines.yaml`
- Twig: `themes/callisto/common/particles/headlines.html.twig`
- SCSS: _none_

### iconmenu
- YAML: `themes/callisto/common/particles/iconmenu.yaml`
- Twig: `themes/callisto/common/particles/iconmenu.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_iconmenu.scss`

### imagegrid
- YAML: `themes/callisto/common/particles/imagegrid.yaml`
- Twig: `themes/callisto/common/particles/imagegrid.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_imagegrid.scss`

### infolist
- YAML: `themes/callisto/common/particles/infolist.yaml`
- Twig: `themes/callisto/common/particles/infolist.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_infolist.scss`

### lists
- YAML: `themes/callisto/common/particles/lists.yaml`
- Twig: `themes/callisto/common/particles/lists.html.twig`
- SCSS: _none_

### newsletter
- YAML: `themes/callisto/common/particles/newsletter.yaml`
- Twig: `themes/callisto/common/particles/newsletter.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_newsletter.scss`

### promoimage
- YAML: `themes/callisto/common/particles/promoimage.yaml`
- Twig: `themes/callisto/common/particles/promoimage.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_promoimage.scss`

### search
- YAML: `themes/callisto/common/particles/search.yaml`
- Twig: `themes/callisto/common/particles/search.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_search.scss`

### stripsslider
- YAML: `themes/callisto/common/particles/stripsslider.yaml`
- Twig: `themes/callisto/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/callisto/common/particles/swiper.yaml`
- Twig: `themes/callisto/common/particles/swiper.html.twig`
- SCSS: `themes/callisto/common/scss/callisto/_swiper.scss`

### vertical_menu
- YAML: `themes/callisto/common/particles/vertical_menu.yaml`
- Twig: `themes/callisto/common/particles/vertical_menu.html.twig`
- SCSS: _none_

## Theme: chimera

### aos
- YAML: `themes/chimera/common/particles/aos.yaml`
- Twig: `themes/chimera/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/chimera/common/particles/blockcontent.yaml`
- Twig: `themes/chimera/common/particles/blockcontent.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_blockcontent.scss`

### calendar
- YAML: `themes/chimera/common/particles/calendar.yaml`
- Twig: `themes/chimera/common/particles/calendar.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_calendar.scss`

### contact
- YAML: `themes/chimera/common/particles/contact.yaml`
- Twig: `themes/chimera/common/particles/contact.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_contact.scss`

### contentlist
- YAML: `themes/chimera/common/particles/contentlist.yaml`
- Twig: `themes/chimera/common/particles/contentlist.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/chimera/common/particles/contenttabs.yaml`
- Twig: `themes/chimera/common/particles/contenttabs.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_contenttabs.scss`

### custom
- YAML: `themes/chimera/common/particles/custom.yaml`
- Twig: `themes/chimera/common/particles/custom.html.twig`
- SCSS: _none_

### fixedheader
- YAML: `themes/chimera/common/particles/fixedheader.yaml`
- Twig: `themes/chimera/common/particles/fixedheader.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_fixedheader.scss`

### horizontalmenu
- YAML: `themes/chimera/common/particles/horizontalmenu.yaml`
- Twig: `themes/chimera/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_horizontalmenu.scss`

### iconlist
- YAML: `themes/chimera/common/particles/iconlist.yaml`
- Twig: `themes/chimera/common/particles/iconlist.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/chimera/common/particles/imagegrid.yaml`
- Twig: `themes/chimera/common/particles/imagegrid.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_imagegrid.scss`

### infolist
- YAML: `themes/chimera/common/particles/infolist.yaml`
- Twig: `themes/chimera/common/particles/infolist.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_infolist.scss`

### lists
- YAML: `themes/chimera/common/particles/lists.yaml`
- Twig: `themes/chimera/common/particles/lists.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_lists.scss`

### logo
- YAML: `themes/chimera/common/particles/logo.yaml`
- Twig: `themes/chimera/common/particles/logo.html.twig`
- SCSS: _none_

### mosaic
- YAML: `themes/chimera/common/particles/mosaic.yaml`
- Twig: `themes/chimera/common/particles/mosaic.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_mosaic.scss`

### newsletter
- YAML: `themes/chimera/common/particles/newsletter.yaml`
- Twig: `themes/chimera/common/particles/newsletter.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_newsletter.scss`

### pricingtable
- YAML: `themes/chimera/common/particles/pricingtable.yaml`
- Twig: `themes/chimera/common/particles/pricingtable.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/chimera/common/particles/promoimage.yaml`
- Twig: `themes/chimera/common/particles/promoimage.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_promoimage.scss`

### search
- YAML: `themes/chimera/common/particles/search.yaml`
- Twig: `themes/chimera/common/particles/search.html.twig`
- SCSS: _none_

### slider
- YAML: `themes/chimera/common/particles/slider.yaml`
- Twig: `themes/chimera/common/particles/slider.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_slider.scss`

### slideshow
- YAML: `themes/chimera/common/particles/slideshow.yaml`
- Twig: `themes/chimera/common/particles/slideshow.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_slideshow.scss`
- SCSS: `themes/chimera/common/scss/chimera/sections/_slideshow.scss`

### social
- YAML: `themes/chimera/common/particles/social.yaml`
- Twig: `themes/chimera/common/particles/social.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_social.scss`

### stripsslider
- YAML: `themes/chimera/common/particles/stripsslider.yaml`
- Twig: `themes/chimera/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/chimera/common/particles/swiper.yaml`
- Twig: `themes/chimera/common/particles/swiper.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_swiper.scss`

### testimonials
- YAML: `themes/chimera/common/particles/testimonials.yaml`
- Twig: `themes/chimera/common/particles/testimonials.html.twig`
- SCSS: `themes/chimera/common/scss/chimera/particles/_testimonials.scss`

### totop
- YAML: `themes/chimera/common/particles/totop.yaml`
- Twig: `themes/chimera/common/particles/totop.html.twig`
- SCSS: _none_

## Theme: citadel

### accordion
- YAML: `themes/citadel/common/particles/accordion.yaml`
- Twig: `themes/citadel/common/particles/accordion.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_accordion.scss`

### aos
- YAML: `themes/citadel/common/particles/aos.yaml`
- Twig: `themes/citadel/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/citadel/common/particles/blockcontent.yaml`
- Twig: `themes/citadel/common/particles/blockcontent.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_blockcontent.scss`

### calendar
- YAML: `themes/citadel/common/particles/calendar.yaml`
- Twig: `themes/citadel/common/particles/calendar.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_calendar.scss`

### gridcontent
- YAML: `themes/citadel/common/particles/gridcontent.yaml`
- Twig: `themes/citadel/common/particles/gridcontent.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/citadel/common/particles/gridstatistic.yaml`
- Twig: `themes/citadel/common/particles/gridstatistic.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/citadel/common/particles/imagegrid.yaml`
- Twig: `themes/citadel/common/particles/imagegrid.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_imagegrid.scss`

### infolist
- YAML: `themes/citadel/common/particles/infolist.yaml`
- Twig: `themes/citadel/common/particles/infolist.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_infolist.scss`

### newsletter
- YAML: `themes/citadel/common/particles/newsletter.yaml`
- Twig: `themes/citadel/common/particles/newsletter.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/citadel/common/particles/popupmodule.yaml`
- Twig: `themes/citadel/common/particles/popupmodule.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/citadel/common/particles/pricingtable.yaml`
- Twig: `themes/citadel/common/particles/pricingtable.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/citadel/common/particles/simplecontent.yaml`
- Twig: `themes/citadel/common/particles/simplecontent.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_simplecontent.scss`

### simpleform
- YAML: `themes/citadel/common/particles/simpleform.yaml`
- Twig: `themes/citadel/common/particles/simpleform.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_simpleform.scss`

### simplemenu
- YAML: `themes/citadel/common/particles/simplemenu.yaml`
- Twig: `themes/citadel/common/particles/simplemenu.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_simplemenu.scss`

### simpleweather
- YAML: `themes/citadel/common/particles/simpleweather.yaml`
- Twig: `themes/citadel/common/particles/simpleweather.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_simpleweather.scss`

### swiper
- YAML: `themes/citadel/common/particles/swiper.yaml`
- Twig: `themes/citadel/common/particles/swiper.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/citadel/common/particles/swipercarousel.yaml`
- Twig: `themes/citadel/common/particles/swipercarousel.html.twig`
- SCSS: `themes/citadel/common/scss/citadel/particles/_swipercarousel.scss`

## Theme: clarity

### aos
- YAML: `themes/clarity/common/particles/aos.yaml`
- Twig: `themes/clarity/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/clarity/common/particles/blockcontent.yaml`
- Twig: `themes/clarity/common/particles/blockcontent.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_blockcontent.scss`

### fixedheader
- YAML: `themes/clarity/common/particles/fixedheader.yaml`
- Twig: `themes/clarity/common/particles/fixedheader.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/clarity/common/particles/gridstatistic.yaml`
- Twig: `themes/clarity/common/particles/gridstatistic.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_gridstatistic.scss`

### heading
- YAML: `themes/clarity/common/particles/heading.yaml`
- Twig: `themes/clarity/common/particles/heading.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_heading.scss`

### imagegrid
- YAML: `themes/clarity/common/particles/imagegrid.yaml`
- Twig: `themes/clarity/common/particles/imagegrid.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_imagegrid.scss`

### infolist
- YAML: `themes/clarity/common/particles/infolist.yaml`
- Twig: `themes/clarity/common/particles/infolist.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_infolist.scss`

### latestnews
- YAML: `themes/clarity/common/particles/latestnews.yaml`
- Twig: `themes/clarity/common/particles/latestnews.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_latestnews.scss`

### logo
- YAML: `themes/clarity/common/particles/logo.yaml`
- Twig: `themes/clarity/common/particles/logo.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/styles/_logo.scss`

### newsletter
- YAML: `themes/clarity/common/particles/newsletter.yaml`
- Twig: `themes/clarity/common/particles/newsletter.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/clarity/common/particles/popupmodule.yaml`
- Twig: `themes/clarity/common/particles/popupmodule.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/clarity/common/particles/pricingtable.yaml`
- Twig: `themes/clarity/common/particles/pricingtable.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_pricingtable.scss`

### promo
- YAML: `themes/clarity/common/particles/promo.yaml`
- Twig: `themes/clarity/common/particles/promo.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_promo.scss`

### search
- YAML: `themes/clarity/common/particles/search.yaml`
- Twig: `themes/clarity/common/particles/search.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_search.scss`

### simplecontent
- YAML: `themes/clarity/common/particles/simplecontent.yaml`
- Twig: `themes/clarity/common/particles/simplecontent.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/clarity/common/particles/simplemenu.yaml`
- Twig: `themes/clarity/common/particles/simplemenu.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_simplemenu.scss`

### slideshow
- YAML: `themes/clarity/common/particles/slideshow.yaml`
- Twig: `themes/clarity/common/particles/slideshow.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_slideshow.scss`
- SCSS: `themes/clarity/common/scss/clarity/sections/_slideshow.scss`

### social
- YAML: `themes/clarity/common/particles/social.yaml`
- Twig: `themes/clarity/common/particles/social.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_social.scss`

### socialfeed
- YAML: `themes/clarity/common/particles/socialfeed.yaml`
- Twig: `themes/clarity/common/particles/socialfeed.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_socialfeed.scss`

### swiper
- YAML: `themes/clarity/common/particles/swiper.yaml`
- Twig: `themes/clarity/common/particles/swiper.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_swiper.scss`

### testimonials
- YAML: `themes/clarity/common/particles/testimonials.yaml`
- Twig: `themes/clarity/common/particles/testimonials.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_testimonials.scss`

### verticalslideshow
- YAML: `themes/clarity/common/particles/verticalslideshow.yaml`
- Twig: `themes/clarity/common/particles/verticalslideshow.html.twig`
- SCSS: `themes/clarity/common/scss/clarity/particles/_verticalslideshow.scss`

## Theme: denali

### aos
- YAML: `themes/denali/common/particles/aos.yaml`
- Twig: `themes/denali/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/denali/common/particles/blockcontent.yaml`
- Twig: `themes/denali/common/particles/blockcontent.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_blockcontent.scss`

### calendar
- YAML: `themes/denali/common/particles/calendar.yaml`
- Twig: `themes/denali/common/particles/calendar.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_calendar.scss`

### carousel
- YAML: `themes/denali/common/particles/carousel.yaml`
- Twig: `themes/denali/common/particles/carousel.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_carousel.scss`

### casestudies
- YAML: `themes/denali/common/particles/casestudies.yaml`
- Twig: `themes/denali/common/particles/casestudies.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_casestudies.scss`

### eventlist
- YAML: `themes/denali/common/particles/eventlist.yaml`
- Twig: `themes/denali/common/particles/eventlist.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_eventlist.scss`

### fixedheader
- YAML: `themes/denali/common/particles/fixedheader.yaml`
- Twig: `themes/denali/common/particles/fixedheader.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/denali/common/particles/gridstatistic.yaml`
- Twig: `themes/denali/common/particles/gridstatistic.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/denali/common/particles/imagegrid.yaml`
- Twig: `themes/denali/common/particles/imagegrid.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_imagegrid.scss`

### infolist
- YAML: `themes/denali/common/particles/infolist.yaml`
- Twig: `themes/denali/common/particles/infolist.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_infolist.scss`

### logo
- YAML: `themes/denali/common/particles/logo.yaml`
- Twig: `themes/denali/common/particles/logo.html.twig`
- SCSS: `themes/denali/common/scss/denali/styles/_logo.scss`

### mailchimp
- YAML: `themes/denali/common/particles/mailchimp.yaml`
- Twig: `themes/denali/common/particles/mailchimp.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/denali/common/particles/newsletter.yaml`
- Twig: `themes/denali/common/particles/newsletter.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/denali/common/particles/popupmodule.yaml`
- Twig: `themes/denali/common/particles/popupmodule.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/denali/common/particles/pricingtable.yaml`
- Twig: `themes/denali/common/particles/pricingtable.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_pricingtable.scss`

### search
- YAML: `themes/denali/common/particles/search.yaml`
- Twig: `themes/denali/common/particles/search.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_search.scss`

### showcase
- YAML: `themes/denali/common/particles/showcase.yaml`
- Twig: `themes/denali/common/particles/showcase.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_showcase.scss`
- SCSS: `themes/denali/common/scss/denali/sections/_showcase.scss`

### simplecontent
- YAML: `themes/denali/common/particles/simplecontent.yaml`
- Twig: `themes/denali/common/particles/simplecontent.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/denali/common/particles/simplemenu.yaml`
- Twig: `themes/denali/common/particles/simplemenu.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_simplemenu.scss`

### slider
- YAML: `themes/denali/common/particles/slider.yaml`
- Twig: `themes/denali/common/particles/slider.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_slider.scss`

### swiper
- YAML: `themes/denali/common/particles/swiper.yaml`
- Twig: `themes/denali/common/particles/swiper.html.twig`
- SCSS: `themes/denali/common/scss/denali/particles/_swiper.scss`

## Theme: elixir

### aos
- YAML: `themes/elixir/common/particles/aos.yaml`
- Twig: `themes/elixir/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/elixir/common/particles/blockcontent.yaml`
- Twig: `themes/elixir/common/particles/blockcontent.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_blockcontent.scss`

### fixedheader
- YAML: `themes/elixir/common/particles/fixedheader.yaml`
- Twig: `themes/elixir/common/particles/fixedheader.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_fixedheader.scss`

### flipster
- YAML: `themes/elixir/common/particles/flipster.yaml`
- Twig: `themes/elixir/common/particles/flipster.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_flipster.scss`

### gridstatistic
- YAML: `themes/elixir/common/particles/gridstatistic.yaml`
- Twig: `themes/elixir/common/particles/gridstatistic.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_gridstatistic.scss`

### heading
- YAML: `themes/elixir/common/particles/heading.yaml`
- Twig: `themes/elixir/common/particles/heading.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_heading.scss`

### image
- YAML: `themes/elixir/common/particles/image.yaml`
- Twig: `themes/elixir/common/particles/image.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/elixir/common/particles/imagegrid.yaml`
- Twig: `themes/elixir/common/particles/imagegrid.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_imagegrid.scss`

### infolist
- YAML: `themes/elixir/common/particles/infolist.yaml`
- Twig: `themes/elixir/common/particles/infolist.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_infolist.scss`

### latestblogs
- YAML: `themes/elixir/common/particles/latestblogs.yaml`
- Twig: `themes/elixir/common/particles/latestblogs.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_latestblogs.scss`

### latestnews
- YAML: `themes/elixir/common/particles/latestnews.yaml`
- Twig: `themes/elixir/common/particles/latestnews.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_latestnews.scss`

### locations
- YAML: `themes/elixir/common/particles/locations.yaml`
- Twig: `themes/elixir/common/particles/locations.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_locations.scss`

### logo
- YAML: `themes/elixir/common/particles/logo.yaml`
- Twig: `themes/elixir/common/particles/logo.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/styles/_logo.scss`

### logos
- YAML: `themes/elixir/common/particles/logos.yaml`
- Twig: `themes/elixir/common/particles/logos.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_logos.scss`

### newsletter
- YAML: `themes/elixir/common/particles/newsletter.yaml`
- Twig: `themes/elixir/common/particles/newsletter.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/elixir/common/particles/popupmodule.yaml`
- Twig: `themes/elixir/common/particles/popupmodule.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/elixir/common/particles/pricingtable.yaml`
- Twig: `themes/elixir/common/particles/pricingtable.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_pricingtable.scss`

### promo
- YAML: `themes/elixir/common/particles/promo.yaml`
- Twig: `themes/elixir/common/particles/promo.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_promo.scss`

### quickmenu
- YAML: `themes/elixir/common/particles/quickmenu.yaml`
- Twig: `themes/elixir/common/particles/quickmenu.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_quickmenu.scss`

### search
- YAML: `themes/elixir/common/particles/search.yaml`
- Twig: `themes/elixir/common/particles/search.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_search.scss`

### simplecontent
- YAML: `themes/elixir/common/particles/simplecontent.yaml`
- Twig: `themes/elixir/common/particles/simplecontent.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/elixir/common/particles/simplemenu.yaml`
- Twig: `themes/elixir/common/particles/simplemenu.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_simplemenu.scss`

### slideshow
- YAML: `themes/elixir/common/particles/slideshow.yaml`
- Twig: `themes/elixir/common/particles/slideshow.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_slideshow.scss`
- SCSS: `themes/elixir/common/scss/elixir/sections/_slideshow.scss`

### social
- YAML: `themes/elixir/common/particles/social.yaml`
- Twig: `themes/elixir/common/particles/social.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_social.scss`

### socialfeed
- YAML: `themes/elixir/common/particles/socialfeed.yaml`
- Twig: `themes/elixir/common/particles/socialfeed.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_socialfeed.scss`

### swiper
- YAML: `themes/elixir/common/particles/swiper.yaml`
- Twig: `themes/elixir/common/particles/swiper.html.twig`
- SCSS: `themes/elixir/common/scss/elixir/particles/_swiper.scss`

## Theme: epsilon

### aos
- YAML: `themes/epsilon/common/particles/aos.yaml`
- Twig: `themes/epsilon/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/epsilon/common/particles/blockcontent.yaml`
- Twig: `themes/epsilon/common/particles/blockcontent.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_blockcontent.scss`

### calendar
- YAML: `themes/epsilon/common/particles/calendar.yaml`
- Twig: `themes/epsilon/common/particles/calendar.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_calendar.scss`

### contact
- YAML: `themes/epsilon/common/particles/contact.yaml`
- Twig: `themes/epsilon/common/particles/contact.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_contact.scss`

### contentlist
- YAML: `themes/epsilon/common/particles/contentlist.yaml`
- Twig: `themes/epsilon/common/particles/contentlist.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/epsilon/common/particles/contenttabs.yaml`
- Twig: `themes/epsilon/common/particles/contenttabs.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_contenttabs.scss`

### custom
- YAML: `themes/epsilon/common/particles/custom.yaml`
- Twig: `themes/epsilon/common/particles/custom.html.twig`
- SCSS: _none_

### fixedheader
- YAML: `themes/epsilon/common/particles/fixedheader.yaml`
- Twig: `themes/epsilon/common/particles/fixedheader.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_fixedheader.scss`

### headlines
- YAML: `themes/epsilon/common/particles/headlines.yaml`
- Twig: `themes/epsilon/common/particles/headlines.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_headlines.scss`

### horizontalmenu
- YAML: `themes/epsilon/common/particles/horizontalmenu.yaml`
- Twig: `themes/epsilon/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/epsilon/common/particles/imagegrid.yaml`
- Twig: `themes/epsilon/common/particles/imagegrid.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_imagegrid.scss`

### infolist
- YAML: `themes/epsilon/common/particles/infolist.yaml`
- Twig: `themes/epsilon/common/particles/infolist.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_infolist.scss`

### linktabs
- YAML: `themes/epsilon/common/particles/linktabs.yaml`
- Twig: `themes/epsilon/common/particles/linktabs.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_linktabs.scss`

### lists
- YAML: `themes/epsilon/common/particles/lists.yaml`
- Twig: `themes/epsilon/common/particles/lists.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_lists.scss`

### mailchimp
- YAML: `themes/epsilon/common/particles/mailchimp.yaml`
- Twig: `themes/epsilon/common/particles/mailchimp.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_mailchimp.scss`

### mosaic
- YAML: `themes/epsilon/common/particles/mosaic.yaml`
- Twig: `themes/epsilon/common/particles/mosaic.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_mosaic.scss`

### pricingtable
- YAML: `themes/epsilon/common/particles/pricingtable.yaml`
- Twig: `themes/epsilon/common/particles/pricingtable.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/epsilon/common/particles/promoimage.yaml`
- Twig: `themes/epsilon/common/particles/promoimage.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_promoimage.scss`

### search
- YAML: `themes/epsilon/common/particles/search.yaml`
- Twig: `themes/epsilon/common/particles/search.html.twig`
- SCSS: _none_

### slider
- YAML: `themes/epsilon/common/particles/slider.yaml`
- Twig: `themes/epsilon/common/particles/slider.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_slider.scss`

### slideshow
- YAML: `themes/epsilon/common/particles/slideshow.yaml`
- Twig: `themes/epsilon/common/particles/slideshow.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_slideshow.scss`

### social
- YAML: `themes/epsilon/common/particles/social.yaml`
- Twig: `themes/epsilon/common/particles/social.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_social.scss`

### stripsslider
- YAML: `themes/epsilon/common/particles/stripsslider.yaml`
- Twig: `themes/epsilon/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/epsilon/common/particles/swiper.yaml`
- Twig: `themes/epsilon/common/particles/swiper.html.twig`
- SCSS: `themes/epsilon/common/scss/epsilon/particles/_swiper.scss`

### totop
- YAML: `themes/epsilon/common/particles/totop.yaml`
- Twig: `themes/epsilon/common/particles/totop.html.twig`
- SCSS: _none_

### verticalmenu
- YAML: `themes/epsilon/common/particles/verticalmenu.yaml`
- Twig: `themes/epsilon/common/particles/verticalmenu.html.twig`
- SCSS: _none_

## Theme: ethereal

### aos
- YAML: `themes/ethereal/common/particles/aos.yaml`
- Twig: `themes/ethereal/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/ethereal/common/particles/blockcontent.yaml`
- Twig: `themes/ethereal/common/particles/blockcontent.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_blockcontent.scss`

### blogcontent
- YAML: `themes/ethereal/common/particles/blogcontent.yaml`
- Twig: `themes/ethereal/common/particles/blogcontent.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_blogcontent.scss`

### calendar
- YAML: `themes/ethereal/common/particles/calendar.yaml`
- Twig: `themes/ethereal/common/particles/calendar.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_calendar.scss`

### contact
- YAML: `themes/ethereal/common/particles/contact.yaml`
- Twig: `themes/ethereal/common/particles/contact.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_contact.scss`

### contentlist
- YAML: `themes/ethereal/common/particles/contentlist.yaml`
- Twig: `themes/ethereal/common/particles/contentlist.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_contentlist.scss`

### etherealblock
- YAML: `themes/ethereal/common/particles/etherealblock.yaml`
- Twig: `themes/ethereal/common/particles/etherealblock.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_etherealblock.scss`

### fixedheader
- YAML: `themes/ethereal/common/particles/fixedheader.yaml`
- Twig: `themes/ethereal/common/particles/fixedheader.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_fixedheader.scss`

### horizontalmenu
- YAML: `themes/ethereal/common/particles/horizontalmenu.yaml`
- Twig: `themes/ethereal/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_horizontalmenu.scss`

### iconheadline
- YAML: `themes/ethereal/common/particles/iconheadline.yaml`
- Twig: `themes/ethereal/common/particles/iconheadline.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_iconheadline.scss`

### imageblock
- YAML: `themes/ethereal/common/particles/imageblock.yaml`
- Twig: `themes/ethereal/common/particles/imageblock.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_imageblock.scss`

### imagegrid
- YAML: `themes/ethereal/common/particles/imagegrid.yaml`
- Twig: `themes/ethereal/common/particles/imagegrid.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_imagegrid.scss`

### imageoverlay
- YAML: `themes/ethereal/common/particles/imageoverlay.yaml`
- Twig: `themes/ethereal/common/particles/imageoverlay.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_imageoverlay.scss`

### infolist
- YAML: `themes/ethereal/common/particles/infolist.yaml`
- Twig: `themes/ethereal/common/particles/infolist.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_infolist.scss`

### mailchimp
- YAML: `themes/ethereal/common/particles/mailchimp.yaml`
- Twig: `themes/ethereal/common/particles/mailchimp.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_mailchimp.scss`

### newsletter
- YAML: `themes/ethereal/common/particles/newsletter.yaml`
- Twig: `themes/ethereal/common/particles/newsletter.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_newsletter.scss`

### numberheadline
- YAML: `themes/ethereal/common/particles/numberheadline.yaml`
- Twig: `themes/ethereal/common/particles/numberheadline.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_numberheadline.scss`

### promoimage
- YAML: `themes/ethereal/common/particles/promoimage.yaml`
- Twig: `themes/ethereal/common/particles/promoimage.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_promoimage.scss`

### slideshow
- YAML: `themes/ethereal/common/particles/slideshow.yaml`
- Twig: `themes/ethereal/common/particles/slideshow.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_slideshow.scss`

### swiper
- YAML: `themes/ethereal/common/particles/swiper.yaml`
- Twig: `themes/ethereal/common/particles/swiper.html.twig`
- SCSS: `themes/ethereal/common/scss/ethereal/_swiper.scss`

## Theme: fluent

### aos
- YAML: `themes/fluent/common/particles/aos.yaml`
- Twig: `themes/fluent/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/fluent/common/particles/blockcontent.yaml`
- Twig: `themes/fluent/common/particles/blockcontent.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_blockcontent.scss`

### calendar
- YAML: `themes/fluent/common/particles/calendar.yaml`
- Twig: `themes/fluent/common/particles/calendar.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_calendar.scss`

### casestudies
- YAML: `themes/fluent/common/particles/casestudies.yaml`
- Twig: `themes/fluent/common/particles/casestudies.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_casestudies.scss`

### gridcontent
- YAML: `themes/fluent/common/particles/gridcontent.yaml`
- Twig: `themes/fluent/common/particles/gridcontent.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/fluent/common/particles/gridstatistic.yaml`
- Twig: `themes/fluent/common/particles/gridstatistic.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/fluent/common/particles/imagegrid.yaml`
- Twig: `themes/fluent/common/particles/imagegrid.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_imagegrid.scss`

### infolist
- YAML: `themes/fluent/common/particles/infolist.yaml`
- Twig: `themes/fluent/common/particles/infolist.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_infolist.scss`

### newsletter
- YAML: `themes/fluent/common/particles/newsletter.yaml`
- Twig: `themes/fluent/common/particles/newsletter.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_newsletter.scss`

### newsslider
- YAML: `themes/fluent/common/particles/newsslider.yaml`
- Twig: `themes/fluent/common/particles/newsslider.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_newsslider.scss`

### popupmodule
- YAML: `themes/fluent/common/particles/popupmodule.yaml`
- Twig: `themes/fluent/common/particles/popupmodule.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/fluent/common/particles/pricingtable.yaml`
- Twig: `themes/fluent/common/particles/pricingtable.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_pricingtable.scss`

### search
- YAML: `themes/fluent/common/particles/search.yaml`
- Twig: `themes/fluent/common/particles/search.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_search.scss`

### simplecontent
- YAML: `themes/fluent/common/particles/simplecontent.yaml`
- Twig: `themes/fluent/common/particles/simplecontent.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/fluent/common/particles/simplemenu.yaml`
- Twig: `themes/fluent/common/particles/simplemenu.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_simplemenu.scss`

### swiper
- YAML: `themes/fluent/common/particles/swiper.yaml`
- Twig: `themes/fluent/common/particles/swiper.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_swiper.scss`

### testimonials
- YAML: `themes/fluent/common/particles/testimonials.yaml`
- Twig: `themes/fluent/common/particles/testimonials.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_testimonials.scss`

### testimonialslider
- YAML: `themes/fluent/common/particles/testimonialslider.yaml`
- Twig: `themes/fluent/common/particles/testimonialslider.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_testimonialslider.scss`

### verticalslider
- YAML: `themes/fluent/common/particles/verticalslider.yaml`
- Twig: `themes/fluent/common/particles/verticalslider.html.twig`
- SCSS: `themes/fluent/common/scss/fluent/particles/_verticalslider.scss`

## Theme: flux

### accordion
- YAML: `themes/flux/common/particles/accordion.yaml`
- Twig: `themes/flux/common/particles/accordion.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_accordion.scss`

### aos
- YAML: `themes/flux/common/particles/aos.yaml`
- Twig: `themes/flux/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/flux/common/particles/blockcontent.yaml`
- Twig: `themes/flux/common/particles/blockcontent.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_blockcontent.scss`

### calendar
- YAML: `themes/flux/common/particles/calendar.yaml`
- Twig: `themes/flux/common/particles/calendar.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_calendar.scss`

### cards
- YAML: `themes/flux/common/particles/cards.yaml`
- Twig: `themes/flux/common/particles/cards.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_cards.scss`

### carousel
- YAML: `themes/flux/common/particles/carousel.yaml`
- Twig: `themes/flux/common/particles/carousel.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_carousel.scss`

### charts
- YAML: `themes/flux/common/particles/charts.yaml`
- Twig: `themes/flux/common/particles/charts.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_charts.scss`

### contenttabs
- YAML: `themes/flux/common/particles/contenttabs.yaml`
- Twig: `themes/flux/common/particles/contenttabs.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_contenttabs.scss`

### fixedheader
- YAML: `themes/flux/common/particles/fixedheader.yaml`
- Twig: `themes/flux/common/particles/fixedheader.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_fixedheader.scss`

### gridcontent
- YAML: `themes/flux/common/particles/gridcontent.yaml`
- Twig: `themes/flux/common/particles/gridcontent.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/flux/common/particles/gridstatistic.yaml`
- Twig: `themes/flux/common/particles/gridstatistic.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/flux/common/particles/imagegrid.yaml`
- Twig: `themes/flux/common/particles/imagegrid.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_imagegrid.scss`

### infolist
- YAML: `themes/flux/common/particles/infolist.yaml`
- Twig: `themes/flux/common/particles/infolist.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_infolist.scss`

### mailchimp
- YAML: `themes/flux/common/particles/mailchimp.yaml`
- Twig: `themes/flux/common/particles/mailchimp.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/flux/common/particles/newsletter.yaml`
- Twig: `themes/flux/common/particles/newsletter.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/flux/common/particles/popupmodule.yaml`
- Twig: `themes/flux/common/particles/popupmodule.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/flux/common/particles/pricingtable.yaml`
- Twig: `themes/flux/common/particles/pricingtable.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_pricingtable.scss`

### search
- YAML: `themes/flux/common/particles/search.yaml`
- Twig: `themes/flux/common/particles/search.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_search.scss`

### simplecontent
- YAML: `themes/flux/common/particles/simplecontent.yaml`
- Twig: `themes/flux/common/particles/simplecontent.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/flux/common/particles/simplemenu.yaml`
- Twig: `themes/flux/common/particles/simplemenu.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_simplemenu.scss`

### slider
- YAML: `themes/flux/common/particles/slider.yaml`
- Twig: `themes/flux/common/particles/slider.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_slider.scss`

### swiper
- YAML: `themes/flux/common/particles/swiper.yaml`
- Twig: `themes/flux/common/particles/swiper.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_swiper.scss`

### testimonials
- YAML: `themes/flux/common/particles/testimonials.yaml`
- Twig: `themes/flux/common/particles/testimonials.html.twig`
- SCSS: `themes/flux/common/scss/flux/particles/_testimonials.scss`

## Theme: galatea

### aos
- YAML: `themes/galatea/common/particles/aos.yaml`
- Twig: `themes/galatea/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/galatea/common/particles/blockcontent.yaml`
- Twig: `themes/galatea/common/particles/blockcontent.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_blockcontent.scss`

### calendar
- YAML: `themes/galatea/common/particles/calendar.yaml`
- Twig: `themes/galatea/common/particles/calendar.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_calendar.scss`

### fixedheader
- YAML: `themes/galatea/common/particles/fixedheader.yaml`
- Twig: `themes/galatea/common/particles/fixedheader.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_fixedheader.scss`

### flexslider
- YAML: `themes/galatea/common/particles/flexslider.yaml`
- Twig: `themes/galatea/common/particles/flexslider.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_flexslider.scss`

### gridstatistic
- YAML: `themes/galatea/common/particles/gridstatistic.yaml`
- Twig: `themes/galatea/common/particles/gridstatistic.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/galatea/common/particles/imagegrid.yaml`
- Twig: `themes/galatea/common/particles/imagegrid.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_imagegrid.scss`

### infolist
- YAML: `themes/galatea/common/particles/infolist.yaml`
- Twig: `themes/galatea/common/particles/infolist.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_infolist.scss`

### mailchimp
- YAML: `themes/galatea/common/particles/mailchimp.yaml`
- Twig: `themes/galatea/common/particles/mailchimp.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_mailchimp.scss`

### mosaicgrid
- YAML: `themes/galatea/common/particles/mosaicgrid.yaml`
- Twig: `themes/galatea/common/particles/mosaicgrid.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_mosaicgrid.scss`

### newsletter
- YAML: `themes/galatea/common/particles/newsletter.yaml`
- Twig: `themes/galatea/common/particles/newsletter.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_newsletter.scss`

### offsidebartoggle
- YAML: `themes/galatea/common/particles/offsidebartoggle.yaml`
- Twig: `themes/galatea/common/particles/offsidebartoggle.html.twig`
- SCSS: _none_

### popupmodule
- YAML: `themes/galatea/common/particles/popupmodule.yaml`
- Twig: `themes/galatea/common/particles/popupmodule.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/galatea/common/particles/pricingtable.yaml`
- Twig: `themes/galatea/common/particles/pricingtable.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_pricingtable.scss`

### swiper
- YAML: `themes/galatea/common/particles/swiper.yaml`
- Twig: `themes/galatea/common/particles/swiper.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/galatea/common/particles/swipercarousel.yaml`
- Twig: `themes/galatea/common/particles/swipercarousel.html.twig`
- SCSS: `themes/galatea/common/scss/galatea/particles/_swipercarousel.scss`

## Theme: gemini

### accordion
- YAML: `themes/gemini/common/particles/accordion.yaml`
- Twig: `themes/gemini/common/particles/accordion.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_accordion.scss`

### accordionmenu
- YAML: `themes/gemini/common/particles/accordionmenu.yaml`
- Twig: `themes/gemini/common/particles/accordionmenu.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_accordionmenu.scss`

### accordionslider
- YAML: `themes/gemini/common/particles/accordionslider.yaml`
- Twig: `themes/gemini/common/particles/accordionslider.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_accordionslider.scss`

### aos
- YAML: `themes/gemini/common/particles/aos.yaml`
- Twig: `themes/gemini/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/gemini/common/particles/blockcontent.yaml`
- Twig: `themes/gemini/common/particles/blockcontent.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_blockcontent.scss`

### calendar
- YAML: `themes/gemini/common/particles/calendar.yaml`
- Twig: `themes/gemini/common/particles/calendar.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_calendar.scss`

### contenttabs
- YAML: `themes/gemini/common/particles/contenttabs.yaml`
- Twig: `themes/gemini/common/particles/contenttabs.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_contenttabs.scss`

### gridcontent
- YAML: `themes/gemini/common/particles/gridcontent.yaml`
- Twig: `themes/gemini/common/particles/gridcontent.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/gemini/common/particles/gridstatistic.yaml`
- Twig: `themes/gemini/common/particles/gridstatistic.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_gridstatistic.scss`

### headertabs
- YAML: `themes/gemini/common/particles/headertabs.yaml`
- Twig: `themes/gemini/common/particles/headertabs.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_headertabs.scss`

### imagegrid
- YAML: `themes/gemini/common/particles/imagegrid.yaml`
- Twig: `themes/gemini/common/particles/imagegrid.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_imagegrid.scss`

### infolist
- YAML: `themes/gemini/common/particles/infolist.yaml`
- Twig: `themes/gemini/common/particles/infolist.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_infolist.scss`

### mailchimp
- YAML: `themes/gemini/common/particles/mailchimp.yaml`
- Twig: `themes/gemini/common/particles/mailchimp.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/gemini/common/particles/newsletter.yaml`
- Twig: `themes/gemini/common/particles/newsletter.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_newsletter.scss`

### overlaytoggle
- YAML: `themes/gemini/common/particles/overlaytoggle.yaml`
- Twig: `themes/gemini/common/particles/overlaytoggle.html.twig`
- SCSS: _none_

### popupmodule
- YAML: `themes/gemini/common/particles/popupmodule.yaml`
- Twig: `themes/gemini/common/particles/popupmodule.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/gemini/common/particles/pricingtable.yaml`
- Twig: `themes/gemini/common/particles/pricingtable.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/gemini/common/particles/simplecontent.yaml`
- Twig: `themes/gemini/common/particles/simplecontent.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/gemini/common/particles/simplemenu.yaml`
- Twig: `themes/gemini/common/particles/simplemenu.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_simplemenu.scss`

### swiper
- YAML: `themes/gemini/common/particles/swiper.yaml`
- Twig: `themes/gemini/common/particles/swiper.html.twig`
- SCSS: `themes/gemini/common/scss/gemini/particles/_swiper.scss`

## Theme: hadron

### aos
- YAML: `themes/hadron/common/particles/aos.yaml`
- Twig: `themes/hadron/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/hadron/common/particles/blockcontent.yaml`
- Twig: `themes/hadron/common/particles/blockcontent.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_blockcontent.scss`

### calendar
- YAML: `themes/hadron/common/particles/calendar.yaml`
- Twig: `themes/hadron/common/particles/calendar.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_calendar.scss`

### contact
- YAML: `themes/hadron/common/particles/contact.yaml`
- Twig: `themes/hadron/common/particles/contact.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_contact.scss`

### contentlist
- YAML: `themes/hadron/common/particles/contentlist.yaml`
- Twig: `themes/hadron/common/particles/contentlist.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/hadron/common/particles/contenttabs.yaml`
- Twig: `themes/hadron/common/particles/contenttabs.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_contenttabs.scss`

### custom
- YAML: `themes/hadron/common/particles/custom.yaml`
- Twig: `themes/hadron/common/particles/custom.html.twig`
- SCSS: _none_

### headlines
- YAML: `themes/hadron/common/particles/headlines.yaml`
- Twig: `themes/hadron/common/particles/headlines.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_headlines.scss`

### horizontalmenu
- YAML: `themes/hadron/common/particles/horizontalmenu.yaml`
- Twig: `themes/hadron/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/hadron/common/particles/imagegrid.yaml`
- Twig: `themes/hadron/common/particles/imagegrid.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_imagegrid.scss`

### infolist
- YAML: `themes/hadron/common/particles/infolist.yaml`
- Twig: `themes/hadron/common/particles/infolist.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_infolist.scss`

### lists
- YAML: `themes/hadron/common/particles/lists.yaml`
- Twig: `themes/hadron/common/particles/lists.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_lists.scss`

### mailchimp
- YAML: `themes/hadron/common/particles/mailchimp.yaml`
- Twig: `themes/hadron/common/particles/mailchimp.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_mailchimp.scss`

### mosaic
- YAML: `themes/hadron/common/particles/mosaic.yaml`
- Twig: `themes/hadron/common/particles/mosaic.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_mosaic.scss`

### pricingtable
- YAML: `themes/hadron/common/particles/pricingtable.yaml`
- Twig: `themes/hadron/common/particles/pricingtable.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/hadron/common/particles/promoimage.yaml`
- Twig: `themes/hadron/common/particles/promoimage.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_promoimage.scss`

### search
- YAML: `themes/hadron/common/particles/search.yaml`
- Twig: `themes/hadron/common/particles/search.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_search.scss`

### slider
- YAML: `themes/hadron/common/particles/slider.yaml`
- Twig: `themes/hadron/common/particles/slider.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_slider.scss`

### social
- YAML: `themes/hadron/common/particles/social.yaml`
- Twig: `themes/hadron/common/particles/social.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_social.scss`

### stripsslider
- YAML: `themes/hadron/common/particles/stripsslider.yaml`
- Twig: `themes/hadron/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/hadron/common/particles/swiper.yaml`
- Twig: `themes/hadron/common/particles/swiper.html.twig`
- SCSS: `themes/hadron/common/scss/hadron/particles/_swiper.scss`

### totop
- YAML: `themes/hadron/common/particles/totop.yaml`
- Twig: `themes/hadron/common/particles/totop.html.twig`
- SCSS: _none_

### verticalmenu
- YAML: `themes/hadron/common/particles/verticalmenu.yaml`
- Twig: `themes/hadron/common/particles/verticalmenu.html.twig`
- SCSS: _none_

## Theme: helium

### contentcubes
- YAML: `themes/helium/common/particles/contentcubes.yaml`
- Twig: `themes/helium/common/particles/contentcubes.html.twig`
- SCSS: `themes/helium/common/scss/helium/particles/_contentcubes.scss`

### contenttabs
- YAML: `themes/helium/common/particles/contenttabs.yaml`
- Twig: `themes/helium/common/particles/contenttabs.html.twig`
- SCSS: `themes/helium/common/scss/helium/particles/_contenttabs.scss`

### copyright
- YAML: `themes/helium/common/particles/copyright.yaml`
- Twig: `themes/helium/common/particles/copyright.html.twig`
- SCSS: _none_

### horizontalmenu
- YAML: `themes/helium/common/particles/horizontalmenu.yaml`
- Twig: `themes/helium/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/helium/common/scss/helium/particles/_horizontalmenu.scss`

## Theme: horizon

### aos
- YAML: `themes/horizon/common/particles/aos.yaml`
- Twig: `themes/horizon/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/horizon/common/particles/blockcontent.yaml`
- Twig: `themes/horizon/common/particles/blockcontent.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_blockcontent.scss`

### comparisontable
- YAML: `themes/horizon/common/particles/comparisontable.yaml`
- Twig: `themes/horizon/common/particles/comparisontable.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_comparisontable.scss`

### cta
- YAML: `themes/horizon/common/particles/cta.yaml`
- Twig: `themes/horizon/common/particles/cta.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_cta.scss`

### featureslider
- YAML: `themes/horizon/common/particles/featureslider.yaml`
- Twig: `themes/horizon/common/particles/featureslider.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_featureslider.scss`

### fixedheader
- YAML: `themes/horizon/common/particles/fixedheader.yaml`
- Twig: `themes/horizon/common/particles/fixedheader.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/horizon/common/particles/gridstatistic.yaml`
- Twig: `themes/horizon/common/particles/gridstatistic.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_gridstatistic.scss`

### heading
- YAML: `themes/horizon/common/particles/heading.yaml`
- Twig: `themes/horizon/common/particles/heading.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_heading.scss`

### iconpromo
- YAML: `themes/horizon/common/particles/iconpromo.yaml`
- Twig: `themes/horizon/common/particles/iconpromo.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_iconpromo.scss`

### image
- YAML: `themes/horizon/common/particles/image.yaml`
- Twig: `themes/horizon/common/particles/image.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/horizon/common/particles/imagegrid.yaml`
- Twig: `themes/horizon/common/particles/imagegrid.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_imagegrid.scss`

### infolist
- YAML: `themes/horizon/common/particles/infolist.yaml`
- Twig: `themes/horizon/common/particles/infolist.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_infolist.scss`

### latestnews
- YAML: `themes/horizon/common/particles/latestnews.yaml`
- Twig: `themes/horizon/common/particles/latestnews.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_latestnews.scss`

### logo
- YAML: `themes/horizon/common/particles/logo.yaml`
- Twig: `themes/horizon/common/particles/logo.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/styles/_logo.scss`

### logos
- YAML: `themes/horizon/common/particles/logos.yaml`
- Twig: `themes/horizon/common/particles/logos.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_logos.scss`

### newsletter
- YAML: `themes/horizon/common/particles/newsletter.yaml`
- Twig: `themes/horizon/common/particles/newsletter.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/horizon/common/particles/popupmodule.yaml`
- Twig: `themes/horizon/common/particles/popupmodule.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/horizon/common/particles/pricingtable.yaml`
- Twig: `themes/horizon/common/particles/pricingtable.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_pricingtable.scss`

### promo
- YAML: `themes/horizon/common/particles/promo.yaml`
- Twig: `themes/horizon/common/particles/promo.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_promo.scss`

### quote
- YAML: `themes/horizon/common/particles/quote.yaml`
- Twig: `themes/horizon/common/particles/quote.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_quote.scss`

### search
- YAML: `themes/horizon/common/particles/search.yaml`
- Twig: `themes/horizon/common/particles/search.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_search.scss`

### simplecontact
- YAML: `themes/horizon/common/particles/simplecontact.yaml`
- Twig: `themes/horizon/common/particles/simplecontact.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_simplecontact.scss`

### simplecontent
- YAML: `themes/horizon/common/particles/simplecontent.yaml`
- Twig: `themes/horizon/common/particles/simplecontent.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/horizon/common/particles/simplemenu.yaml`
- Twig: `themes/horizon/common/particles/simplemenu.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_simplemenu.scss`

### slider
- YAML: `themes/horizon/common/particles/slider.yaml`
- Twig: `themes/horizon/common/particles/slider.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_slider.scss`

### social
- YAML: `themes/horizon/common/particles/social.yaml`
- Twig: `themes/horizon/common/particles/social.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_social.scss`

### swiper
- YAML: `themes/horizon/common/particles/swiper.yaml`
- Twig: `themes/horizon/common/particles/swiper.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_swiper.scss`

### team
- YAML: `themes/horizon/common/particles/team.yaml`
- Twig: `themes/horizon/common/particles/team.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_team.scss`

### teamhighlight
- YAML: `themes/horizon/common/particles/teamhighlight.yaml`
- Twig: `themes/horizon/common/particles/teamhighlight.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_teamhighlight.scss`

### testimonials
- YAML: `themes/horizon/common/particles/testimonials.yaml`
- Twig: `themes/horizon/common/particles/testimonials.html.twig`
- SCSS: `themes/horizon/common/scss/horizon/particles/_testimonials.scss`

## Theme: hydrogen-demo

### team
- YAML: `themes/hydrogen-demo/common/particles/team.yaml`
- Twig: `themes/hydrogen-demo/common/particles/team.html.twig`
- SCSS: _none_

### test
- YAML: `themes/hydrogen-demo/common/particles/test.yaml`
- Twig: _none_
- SCSS: _none_

## Theme: hydrogen

### sample
- YAML: `themes/hydrogen/common/particles/sample.yaml`
- Twig: `themes/hydrogen/common/particles/sample.html.twig`
- SCSS: `themes/hydrogen/common/scss/hydrogen/_sample.scss`

## Theme: interstellar

### accordion
- YAML: `themes/interstellar/common/particles/accordion.yaml`
- Twig: `themes/interstellar/common/particles/accordion.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_accordion.scss`

### aos
- YAML: `themes/interstellar/common/particles/aos.yaml`
- Twig: `themes/interstellar/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/interstellar/common/particles/blockcontent.yaml`
- Twig: `themes/interstellar/common/particles/blockcontent.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_blockcontent.scss`

### calendar
- YAML: `themes/interstellar/common/particles/calendar.yaml`
- Twig: `themes/interstellar/common/particles/calendar.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_calendar.scss`

### contenttabs
- YAML: `themes/interstellar/common/particles/contenttabs.yaml`
- Twig: `themes/interstellar/common/particles/contenttabs.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_contenttabs.scss`

### fixedheader
- YAML: `themes/interstellar/common/particles/fixedheader.yaml`
- Twig: `themes/interstellar/common/particles/fixedheader.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_fixedheader.scss`

### flexslider
- YAML: `themes/interstellar/common/particles/flexslider.yaml`
- Twig: `themes/interstellar/common/particles/flexslider.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_flexslider.scss`

### gridcontent
- YAML: `themes/interstellar/common/particles/gridcontent.yaml`
- Twig: `themes/interstellar/common/particles/gridcontent.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/interstellar/common/particles/gridstatistic.yaml`
- Twig: `themes/interstellar/common/particles/gridstatistic.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/interstellar/common/particles/imagegrid.yaml`
- Twig: `themes/interstellar/common/particles/imagegrid.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_imagegrid.scss`

### infolist
- YAML: `themes/interstellar/common/particles/infolist.yaml`
- Twig: `themes/interstellar/common/particles/infolist.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_infolist.scss`

### mosaicgrid
- YAML: `themes/interstellar/common/particles/mosaicgrid.yaml`
- Twig: `themes/interstellar/common/particles/mosaicgrid.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_mosaicgrid.scss`

### newsletter
- YAML: `themes/interstellar/common/particles/newsletter.yaml`
- Twig: `themes/interstellar/common/particles/newsletter.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_newsletter.scss`

### newsslider
- YAML: `themes/interstellar/common/particles/newsslider.yaml`
- Twig: `themes/interstellar/common/particles/newsslider.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_newsslider.scss`

### popupmodule
- YAML: `themes/interstellar/common/particles/popupmodule.yaml`
- Twig: `themes/interstellar/common/particles/popupmodule.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/interstellar/common/particles/pricingtable.yaml`
- Twig: `themes/interstellar/common/particles/pricingtable.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/interstellar/common/particles/simplecontent.yaml`
- Twig: `themes/interstellar/common/particles/simplecontent.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_simplecontent.scss`

### swiper
- YAML: `themes/interstellar/common/particles/swiper.yaml`
- Twig: `themes/interstellar/common/particles/swiper.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/interstellar/common/particles/swipercarousel.yaml`
- Twig: `themes/interstellar/common/particles/swipercarousel.html.twig`
- SCSS: `themes/interstellar/common/scss/interstellar/particles/_swipercarousel.scss`

## Theme: isotope

### aos
- YAML: `themes/isotope/common/particles/aos.yaml`
- Twig: `themes/isotope/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/isotope/common/particles/blockcontent.yaml`
- Twig: `themes/isotope/common/particles/blockcontent.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_blockcontent.scss`

### calendar
- YAML: `themes/isotope/common/particles/calendar.yaml`
- Twig: `themes/isotope/common/particles/calendar.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_calendar.scss`

### contact
- YAML: `themes/isotope/common/particles/contact.yaml`
- Twig: `themes/isotope/common/particles/contact.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_contact.scss`

### contentlist
- YAML: `themes/isotope/common/particles/contentlist.yaml`
- Twig: `themes/isotope/common/particles/contentlist.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_contentlist.scss`

### copyright
- YAML: `themes/isotope/common/particles/copyright.yaml`
- Twig: `themes/isotope/common/particles/copyright.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_copyright.scss`

### fixedheader
- YAML: `themes/isotope/common/particles/fixedheader.yaml`
- Twig: `themes/isotope/common/particles/fixedheader.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_fixedheader.scss`

### flexslider
- YAML: `themes/isotope/common/particles/flexslider.yaml`
- Twig: `themes/isotope/common/particles/flexslider.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_flexslider.scss`

### flippingcontent
- YAML: `themes/isotope/common/particles/flippingcontent.yaml`
- Twig: `themes/isotope/common/particles/flippingcontent.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_flippingcontent.scss`

### gridcontent
- YAML: `themes/isotope/common/particles/gridcontent.yaml`
- Twig: `themes/isotope/common/particles/gridcontent.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_gridcontent.scss`

### horizontalmenu
- YAML: `themes/isotope/common/particles/horizontalmenu.yaml`
- Twig: `themes/isotope/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/isotope/common/particles/imagegrid.yaml`
- Twig: `themes/isotope/common/particles/imagegrid.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_imagegrid.scss`

### infolist
- YAML: `themes/isotope/common/particles/infolist.yaml`
- Twig: `themes/isotope/common/particles/infolist.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_infolist.scss`

### mailchimp
- YAML: `themes/isotope/common/particles/mailchimp.yaml`
- Twig: `themes/isotope/common/particles/mailchimp.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_mailchimp.scss`

### newsletter
- YAML: `themes/isotope/common/particles/newsletter.yaml`
- Twig: `themes/isotope/common/particles/newsletter.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_newsletter.scss`

### overlaytoggle
- YAML: `themes/isotope/common/particles/overlaytoggle.yaml`
- Twig: `themes/isotope/common/particles/overlaytoggle.html.twig`
- SCSS: _none_

### popupgrid
- YAML: `themes/isotope/common/particles/popupgrid.yaml`
- Twig: `themes/isotope/common/particles/popupgrid.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_popupgrid.scss`

### promocontent
- YAML: `themes/isotope/common/particles/promocontent.yaml`
- Twig: `themes/isotope/common/particles/promocontent.html.twig`
- SCSS: _none_

### promoimage
- YAML: `themes/isotope/common/particles/promoimage.yaml`
- Twig: `themes/isotope/common/particles/promoimage.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_promoimage.scss`

### swiper
- YAML: `themes/isotope/common/particles/swiper.yaml`
- Twig: `themes/isotope/common/particles/swiper.html.twig`
- SCSS: `themes/isotope/common/scss/isotope/_swiper.scss`

### testimonial
- YAML: `themes/isotope/common/particles/testimonial.yaml`
- Twig: `themes/isotope/common/particles/testimonial.html.twig`
- SCSS: _none_

## Theme: koleti

### aos
- YAML: `themes/koleti/common/particles/aos.yaml`
- Twig: `themes/koleti/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/koleti/common/particles/blockcontent.yaml`
- Twig: `themes/koleti/common/particles/blockcontent.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_blockcontent.scss`

### calendar
- YAML: `themes/koleti/common/particles/calendar.yaml`
- Twig: `themes/koleti/common/particles/calendar.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_calendar.scss`

### fixedheader
- YAML: `themes/koleti/common/particles/fixedheader.yaml`
- Twig: `themes/koleti/common/particles/fixedheader.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/koleti/common/particles/gridstatistic.yaml`
- Twig: `themes/koleti/common/particles/gridstatistic.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_gridstatistic.scss`

### heading
- YAML: `themes/koleti/common/particles/heading.yaml`
- Twig: `themes/koleti/common/particles/heading.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_heading.scss`

### imagegrid
- YAML: `themes/koleti/common/particles/imagegrid.yaml`
- Twig: `themes/koleti/common/particles/imagegrid.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_imagegrid.scss`

### infolist
- YAML: `themes/koleti/common/particles/infolist.yaml`
- Twig: `themes/koleti/common/particles/infolist.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_infolist.scss`

### latestnews
- YAML: `themes/koleti/common/particles/latestnews.yaml`
- Twig: `themes/koleti/common/particles/latestnews.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_latestnews.scss`

### logo
- YAML: `themes/koleti/common/particles/logo.yaml`
- Twig: `themes/koleti/common/particles/logo.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/styles/_logo.scss`

### logos
- YAML: `themes/koleti/common/particles/logos.yaml`
- Twig: `themes/koleti/common/particles/logos.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_logos.scss`

### newsletter
- YAML: `themes/koleti/common/particles/newsletter.yaml`
- Twig: `themes/koleti/common/particles/newsletter.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_newsletter.scss`

### photocollage
- YAML: `themes/koleti/common/particles/photocollage.yaml`
- Twig: `themes/koleti/common/particles/photocollage.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_photocollage.scss`

### popupmodule
- YAML: `themes/koleti/common/particles/popupmodule.yaml`
- Twig: `themes/koleti/common/particles/popupmodule.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/koleti/common/particles/pricingtable.yaml`
- Twig: `themes/koleti/common/particles/pricingtable.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_pricingtable.scss`

### profile
- YAML: `themes/koleti/common/particles/profile.yaml`
- Twig: `themes/koleti/common/particles/profile.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_profile.scss`

### search
- YAML: `themes/koleti/common/particles/search.yaml`
- Twig: `themes/koleti/common/particles/search.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_search.scss`

### simplecontent
- YAML: `themes/koleti/common/particles/simplecontent.yaml`
- Twig: `themes/koleti/common/particles/simplecontent.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/koleti/common/particles/simplemenu.yaml`
- Twig: `themes/koleti/common/particles/simplemenu.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_simplemenu.scss`

### slider
- YAML: `themes/koleti/common/particles/slider.yaml`
- Twig: `themes/koleti/common/particles/slider.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_slider.scss`

### slideshow
- YAML: `themes/koleti/common/particles/slideshow.yaml`
- Twig: `themes/koleti/common/particles/slideshow.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_slideshow.scss`
- SCSS: `themes/koleti/common/scss/koleti/sections/_slideshow.scss`

### slidingmenu
- YAML: `themes/koleti/common/particles/slidingmenu.yaml`
- Twig: `themes/koleti/common/particles/slidingmenu.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_slidingmenu.scss`

### swiper
- YAML: `themes/koleti/common/particles/swiper.yaml`
- Twig: `themes/koleti/common/particles/swiper.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_swiper.scss`

### table-tabs
- YAML: `themes/koleti/common/particles/table-tabs.yaml`
- Twig: `themes/koleti/common/particles/table-tabs.html.twig`
- SCSS: _none_

### team
- YAML: `themes/koleti/common/particles/team.yaml`
- Twig: `themes/koleti/common/particles/team.html.twig`
- SCSS: `themes/koleti/common/scss/koleti/particles/_team.scss`

## Theme: kraken

### aos
- YAML: `themes/kraken/common/particles/aos.yaml`
- Twig: `themes/kraken/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/kraken/common/particles/blockcontent.yaml`
- Twig: `themes/kraken/common/particles/blockcontent.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_blockcontent.scss`

### calendar
- YAML: `themes/kraken/common/particles/calendar.yaml`
- Twig: `themes/kraken/common/particles/calendar.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_calendar.scss`

### contact
- YAML: `themes/kraken/common/particles/contact.yaml`
- Twig: `themes/kraken/common/particles/contact.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_contact.scss`

### contentlist
- YAML: `themes/kraken/common/particles/contentlist.yaml`
- Twig: `themes/kraken/common/particles/contentlist.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_contentlist.scss`

### copyright
- YAML: `themes/kraken/common/particles/copyright.yaml`
- Twig: `themes/kraken/common/particles/copyright.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_copyright.scss`

### gridcontent
- YAML: `themes/kraken/common/particles/gridcontent.yaml`
- Twig: `themes/kraken/common/particles/gridcontent.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_gridcontent.scss`

### gridstatistic
- YAML: `themes/kraken/common/particles/gridstatistic.yaml`
- Twig: `themes/kraken/common/particles/gridstatistic.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_gridstatistic.scss`

### horizontalmenu
- YAML: `themes/kraken/common/particles/horizontalmenu.yaml`
- Twig: `themes/kraken/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_horizontalmenu.scss`

### iconmenu
- YAML: `themes/kraken/common/particles/iconmenu.yaml`
- Twig: `themes/kraken/common/particles/iconmenu.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_iconmenu.scss`

### imagegrid
- YAML: `themes/kraken/common/particles/imagegrid.yaml`
- Twig: `themes/kraken/common/particles/imagegrid.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_imagegrid.scss`

### infolist
- YAML: `themes/kraken/common/particles/infolist.yaml`
- Twig: `themes/kraken/common/particles/infolist.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_infolist.scss`

### logo
- YAML: `themes/kraken/common/particles/logo.yaml`
- Twig: `themes/kraken/common/particles/logo.html.twig`
- SCSS: _none_

### newsletter
- YAML: `themes/kraken/common/particles/newsletter.yaml`
- Twig: `themes/kraken/common/particles/newsletter.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_newsletter.scss`

### promoimage
- YAML: `themes/kraken/common/particles/promoimage.yaml`
- Twig: `themes/kraken/common/particles/promoimage.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_promoimage.scss`

### sidemenu
- YAML: `themes/kraken/common/particles/sidemenu.yaml`
- Twig: `themes/kraken/common/particles/sidemenu.html.twig`
- SCSS: _none_

### social
- YAML: `themes/kraken/common/particles/social.yaml`
- Twig: `themes/kraken/common/particles/social.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_social.scss`

### swiper
- YAML: `themes/kraken/common/particles/swiper.yaml`
- Twig: `themes/kraken/common/particles/swiper.html.twig`
- SCSS: `themes/kraken/common/scss/kraken/_swiper.scss`

## Theme: lexicon

### aos
- YAML: `themes/lexicon/common/particles/aos.yaml`
- Twig: `themes/lexicon/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/lexicon/common/particles/blockcontent.yaml`
- Twig: `themes/lexicon/common/particles/blockcontent.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_blockcontent.scss`

### calendar
- YAML: `themes/lexicon/common/particles/calendar.yaml`
- Twig: `themes/lexicon/common/particles/calendar.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_calendar.scss`

### contact
- YAML: `themes/lexicon/common/particles/contact.yaml`
- Twig: `themes/lexicon/common/particles/contact.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_contact.scss`

### contentlist
- YAML: `themes/lexicon/common/particles/contentlist.yaml`
- Twig: `themes/lexicon/common/particles/contentlist.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/lexicon/common/particles/contenttabs.yaml`
- Twig: `themes/lexicon/common/particles/contenttabs.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_contenttabs.scss`

### custom
- YAML: `themes/lexicon/common/particles/custom.yaml`
- Twig: `themes/lexicon/common/particles/custom.html.twig`
- SCSS: _none_

### headlines
- YAML: `themes/lexicon/common/particles/headlines.yaml`
- Twig: `themes/lexicon/common/particles/headlines.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_headlines.scss`

### horizontalmenu
- YAML: `themes/lexicon/common/particles/horizontalmenu.yaml`
- Twig: `themes/lexicon/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_horizontalmenu.scss`

### iconlist
- YAML: `themes/lexicon/common/particles/iconlist.yaml`
- Twig: `themes/lexicon/common/particles/iconlist.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/lexicon/common/particles/imagegrid.yaml`
- Twig: `themes/lexicon/common/particles/imagegrid.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_imagegrid.scss`

### infolist
- YAML: `themes/lexicon/common/particles/infolist.yaml`
- Twig: `themes/lexicon/common/particles/infolist.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_infolist.scss`

### lists
- YAML: `themes/lexicon/common/particles/lists.yaml`
- Twig: `themes/lexicon/common/particles/lists.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_lists.scss`

### mailchimp
- YAML: `themes/lexicon/common/particles/mailchimp.yaml`
- Twig: `themes/lexicon/common/particles/mailchimp.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_mailchimp.scss`

### mosaic
- YAML: `themes/lexicon/common/particles/mosaic.yaml`
- Twig: `themes/lexicon/common/particles/mosaic.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_mosaic.scss`

### parallax
- YAML: `themes/lexicon/common/particles/parallax.yaml`
- Twig: `themes/lexicon/common/particles/parallax.html.twig`
- SCSS: _none_

### pricingtable
- YAML: `themes/lexicon/common/particles/pricingtable.yaml`
- Twig: `themes/lexicon/common/particles/pricingtable.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/lexicon/common/particles/promoimage.yaml`
- Twig: `themes/lexicon/common/particles/promoimage.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_promoimage.scss`

### search
- YAML: `themes/lexicon/common/particles/search.yaml`
- Twig: `themes/lexicon/common/particles/search.html.twig`
- SCSS: _none_

### showcasetabs
- YAML: `themes/lexicon/common/particles/showcasetabs.yaml`
- Twig: `themes/lexicon/common/particles/showcasetabs.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_showcasetabs.scss`

### slider
- YAML: `themes/lexicon/common/particles/slider.yaml`
- Twig: `themes/lexicon/common/particles/slider.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_slider.scss`

### social
- YAML: `themes/lexicon/common/particles/social.yaml`
- Twig: `themes/lexicon/common/particles/social.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_social.scss`

### stripsslider
- YAML: `themes/lexicon/common/particles/stripsslider.yaml`
- Twig: `themes/lexicon/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/lexicon/common/particles/swiper.yaml`
- Twig: `themes/lexicon/common/particles/swiper.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_swiper.scss`

### testimonials
- YAML: `themes/lexicon/common/particles/testimonials.yaml`
- Twig: `themes/lexicon/common/particles/testimonials.html.twig`
- SCSS: `themes/lexicon/common/scss/lexicon/particles/_testimonials.scss`

### totop
- YAML: `themes/lexicon/common/particles/totop.yaml`
- Twig: `themes/lexicon/common/particles/totop.html.twig`
- SCSS: _none_

### verticalmenu
- YAML: `themes/lexicon/common/particles/verticalmenu.yaml`
- Twig: `themes/lexicon/common/particles/verticalmenu.html.twig`
- SCSS: _none_

## Theme: manticore

### aos
- YAML: `themes/manticore/common/particles/aos.yaml`
- Twig: `themes/manticore/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/manticore/common/particles/blockcontent.yaml`
- Twig: `themes/manticore/common/particles/blockcontent.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_blockcontent.scss`

### featuredvideos
- YAML: `themes/manticore/common/particles/featuredvideos.yaml`
- Twig: `themes/manticore/common/particles/featuredvideos.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_featuredvideos.scss`

### fixedheader
- YAML: `themes/manticore/common/particles/fixedheader.yaml`
- Twig: `themes/manticore/common/particles/fixedheader.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/manticore/common/particles/gridstatistic.yaml`
- Twig: `themes/manticore/common/particles/gridstatistic.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_gridstatistic.scss`

### heading
- YAML: `themes/manticore/common/particles/heading.yaml`
- Twig: `themes/manticore/common/particles/heading.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_heading.scss`

### imagegrid
- YAML: `themes/manticore/common/particles/imagegrid.yaml`
- Twig: `themes/manticore/common/particles/imagegrid.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_imagegrid.scss`

### infolist
- YAML: `themes/manticore/common/particles/infolist.yaml`
- Twig: `themes/manticore/common/particles/infolist.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_infolist.scss`

### latestnews
- YAML: `themes/manticore/common/particles/latestnews.yaml`
- Twig: `themes/manticore/common/particles/latestnews.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_latestnews.scss`

### logo
- YAML: `themes/manticore/common/particles/logo.yaml`
- Twig: `themes/manticore/common/particles/logo.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/styles/_logo.scss`

### logos
- YAML: `themes/manticore/common/particles/logos.yaml`
- Twig: `themes/manticore/common/particles/logos.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_logos.scss`

### newsletter
- YAML: `themes/manticore/common/particles/newsletter.yaml`
- Twig: `themes/manticore/common/particles/newsletter.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_newsletter.scss`

### particlesjs
- YAML: `themes/manticore/common/particles/particlesjs.yaml`
- Twig: `themes/manticore/common/particles/particlesjs.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_particlesjs.scss`

### popupmodule
- YAML: `themes/manticore/common/particles/popupmodule.yaml`
- Twig: `themes/manticore/common/particles/popupmodule.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/manticore/common/particles/pricingtable.yaml`
- Twig: `themes/manticore/common/particles/pricingtable.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_pricingtable.scss`

### promo
- YAML: `themes/manticore/common/particles/promo.yaml`
- Twig: `themes/manticore/common/particles/promo.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_promo.scss`

### recentreviews
- YAML: `themes/manticore/common/particles/recentreviews.yaml`
- Twig: `themes/manticore/common/particles/recentreviews.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_recentreviews.scss`

### search
- YAML: `themes/manticore/common/particles/search.yaml`
- Twig: `themes/manticore/common/particles/search.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_search.scss`

### simplecontent
- YAML: `themes/manticore/common/particles/simplecontent.yaml`
- Twig: `themes/manticore/common/particles/simplecontent.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/manticore/common/particles/simplemenu.yaml`
- Twig: `themes/manticore/common/particles/simplemenu.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_simplemenu.scss`

### slideshow
- YAML: `themes/manticore/common/particles/slideshow.yaml`
- Twig: `themes/manticore/common/particles/slideshow.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_slideshow.scss`
- SCSS: `themes/manticore/common/scss/manticore/sections/_slideshow.scss`

### social
- YAML: `themes/manticore/common/particles/social.yaml`
- Twig: `themes/manticore/common/particles/social.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_social.scss`

### swiper
- YAML: `themes/manticore/common/particles/swiper.yaml`
- Twig: `themes/manticore/common/particles/swiper.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_swiper.scss`

### testimonials
- YAML: `themes/manticore/common/particles/testimonials.yaml`
- Twig: `themes/manticore/common/particles/testimonials.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_testimonials.scss`

### toprated
- YAML: `themes/manticore/common/particles/toprated.yaml`
- Twig: `themes/manticore/common/particles/toprated.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_toprated.scss`

### upcgames
- YAML: `themes/manticore/common/particles/upcgames.yaml`
- Twig: `themes/manticore/common/particles/upcgames.html.twig`
- SCSS: `themes/manticore/common/scss/manticore/particles/_upcgames.scss`

## Theme: myriad

### aos
- YAML: `themes/myriad/common/particles/aos.yaml`
- Twig: `themes/myriad/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/myriad/common/particles/blockcontent.yaml`
- Twig: `themes/myriad/common/particles/blockcontent.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_blockcontent.scss`

### calendar
- YAML: `themes/myriad/common/particles/calendar.yaml`
- Twig: `themes/myriad/common/particles/calendar.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_calendar.scss`

### casestudies
- YAML: `themes/myriad/common/particles/casestudies.yaml`
- Twig: `themes/myriad/common/particles/casestudies.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_casestudies.scss`

### contact
- YAML: `themes/myriad/common/particles/contact.yaml`
- Twig: `themes/myriad/common/particles/contact.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_contact.scss`

### contentlist
- YAML: `themes/myriad/common/particles/contentlist.yaml`
- Twig: `themes/myriad/common/particles/contentlist.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_contentlist.scss`

### featuresslider
- YAML: `themes/myriad/common/particles/featuresslider.yaml`
- Twig: `themes/myriad/common/particles/featuresslider.html.twig`
- SCSS: _none_

### fixedheader
- YAML: `themes/myriad/common/particles/fixedheader.yaml`
- Twig: `themes/myriad/common/particles/fixedheader.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_fixedheader.scss`

### horizontalmenu
- YAML: `themes/myriad/common/particles/horizontalmenu.yaml`
- Twig: `themes/myriad/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/myriad/common/particles/imagegrid.yaml`
- Twig: `themes/myriad/common/particles/imagegrid.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_imagegrid.scss`

### infolist
- YAML: `themes/myriad/common/particles/infolist.yaml`
- Twig: `themes/myriad/common/particles/infolist.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_infolist.scss`

### lists
- YAML: `themes/myriad/common/particles/lists.yaml`
- Twig: `themes/myriad/common/particles/lists.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_lists.scss`

### logo
- YAML: `themes/myriad/common/particles/logo.yaml`
- Twig: `themes/myriad/common/particles/logo.html.twig`
- SCSS: _none_

### newsletter
- YAML: `themes/myriad/common/particles/newsletter.yaml`
- Twig: `themes/myriad/common/particles/newsletter.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_newsletter.scss`

### promoimage
- YAML: `themes/myriad/common/particles/promoimage.yaml`
- Twig: `themes/myriad/common/particles/promoimage.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_promoimage.scss`

### search
- YAML: `themes/myriad/common/particles/search.yaml`
- Twig: `themes/myriad/common/particles/search.html.twig`
- SCSS: _none_

### social
- YAML: `themes/myriad/common/particles/social.yaml`
- Twig: `themes/myriad/common/particles/social.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_social.scss`

### stripsslider
- YAML: `themes/myriad/common/particles/stripsslider.yaml`
- Twig: `themes/myriad/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/myriad/common/particles/swiper.yaml`
- Twig: `themes/myriad/common/particles/swiper.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_swiper.scss`

### testimonials
- YAML: `themes/myriad/common/particles/testimonials.yaml`
- Twig: `themes/myriad/common/particles/testimonials.html.twig`
- SCSS: `themes/myriad/common/scss/myriad/_testimonials.scss`

### totop
- YAML: `themes/myriad/common/particles/totop.yaml`
- Twig: `themes/myriad/common/particles/totop.html.twig`
- SCSS: _none_

## Theme: notio

### accordion
- YAML: `themes/notio/common/particles/accordion.yaml`
- Twig: `themes/notio/common/particles/accordion.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_accordion.scss`

### aos
- YAML: `themes/notio/common/particles/aos.yaml`
- Twig: `themes/notio/common/particles/aos.html.twig`
- SCSS: _none_

### articletabs
- YAML: `themes/notio/common/particles/articletabs.yaml`
- Twig: `themes/notio/common/particles/articletabs.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_articletabs.scss`

### authorslist
- YAML: `themes/notio/common/particles/authorslist.yaml`
- Twig: `themes/notio/common/particles/authorslist.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_authorslist.scss`

### blockcontent
- YAML: `themes/notio/common/particles/blockcontent.yaml`
- Twig: `themes/notio/common/particles/blockcontent.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_blockcontent.scss`

### calendar
- YAML: `themes/notio/common/particles/calendar.yaml`
- Twig: `themes/notio/common/particles/calendar.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_calendar.scss`

### cards
- YAML: `themes/notio/common/particles/cards.yaml`
- Twig: `themes/notio/common/particles/cards.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_cards.scss`

### carousel
- YAML: `themes/notio/common/particles/carousel.yaml`
- Twig: `themes/notio/common/particles/carousel.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_carousel.scss`

### contentshowcase
- YAML: `themes/notio/common/particles/contentshowcase.yaml`
- Twig: `themes/notio/common/particles/contentshowcase.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_contentshowcase.scss`

### contenttabs
- YAML: `themes/notio/common/particles/contenttabs.yaml`
- Twig: `themes/notio/common/particles/contenttabs.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_contenttabs.scss`

### fixedheader
- YAML: `themes/notio/common/particles/fixedheader.yaml`
- Twig: `themes/notio/common/particles/fixedheader.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_fixedheader.scss`

### gridcontent
- YAML: `themes/notio/common/particles/gridcontent.yaml`
- Twig: `themes/notio/common/particles/gridcontent.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/notio/common/particles/gridstatistic.yaml`
- Twig: `themes/notio/common/particles/gridstatistic.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/notio/common/particles/imagegrid.yaml`
- Twig: `themes/notio/common/particles/imagegrid.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_imagegrid.scss`

### infolist
- YAML: `themes/notio/common/particles/infolist.yaml`
- Twig: `themes/notio/common/particles/infolist.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_infolist.scss`

### newsletter
- YAML: `themes/notio/common/particles/newsletter.yaml`
- Twig: `themes/notio/common/particles/newsletter.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_newsletter.scss`

### newsslider
- YAML: `themes/notio/common/particles/newsslider.yaml`
- Twig: `themes/notio/common/particles/newsslider.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_newsslider.scss`

### newstabs
- YAML: `themes/notio/common/particles/newstabs.yaml`
- Twig: `themes/notio/common/particles/newstabs.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_newstabs.scss`

### polldaddy
- YAML: `themes/notio/common/particles/polldaddy.yaml`
- Twig: `themes/notio/common/particles/polldaddy.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_polldaddy.scss`

### popupmodule
- YAML: `themes/notio/common/particles/popupmodule.yaml`
- Twig: `themes/notio/common/particles/popupmodule.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/notio/common/particles/pricingtable.yaml`
- Twig: `themes/notio/common/particles/pricingtable.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_pricingtable.scss`

### search
- YAML: `themes/notio/common/particles/search.yaml`
- Twig: `themes/notio/common/particles/search.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_search.scss`

### simplecontent
- YAML: `themes/notio/common/particles/simplecontent.yaml`
- Twig: `themes/notio/common/particles/simplecontent.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/notio/common/particles/simplemenu.yaml`
- Twig: `themes/notio/common/particles/simplemenu.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_simplemenu.scss`

### swiper
- YAML: `themes/notio/common/particles/swiper.yaml`
- Twig: `themes/notio/common/particles/swiper.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_swiper.scss`

### videocarousel
- YAML: `themes/notio/common/particles/videocarousel.yaml`
- Twig: `themes/notio/common/particles/videocarousel.html.twig`
- SCSS: `themes/notio/common/scss/notio/particles/_videocarousel.scss`

## Theme: orion

### aos
- YAML: `themes/orion/common/particles/aos.yaml`
- Twig: `themes/orion/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/orion/common/particles/blockcontent.yaml`
- Twig: `themes/orion/common/particles/blockcontent.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_blockcontent.scss`

### comparisontable
- YAML: `themes/orion/common/particles/comparisontable.yaml`
- Twig: `themes/orion/common/particles/comparisontable.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_comparisontable.scss`

### fixedheader
- YAML: `themes/orion/common/particles/fixedheader.yaml`
- Twig: `themes/orion/common/particles/fixedheader.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/orion/common/particles/gridstatistic.yaml`
- Twig: `themes/orion/common/particles/gridstatistic.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_gridstatistic.scss`

### heading
- YAML: `themes/orion/common/particles/heading.yaml`
- Twig: `themes/orion/common/particles/heading.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_heading.scss`

### iconpromo
- YAML: `themes/orion/common/particles/iconpromo.yaml`
- Twig: `themes/orion/common/particles/iconpromo.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_iconpromo.scss`

### image
- YAML: `themes/orion/common/particles/image.yaml`
- Twig: `themes/orion/common/particles/image.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/orion/common/particles/imagegrid.yaml`
- Twig: `themes/orion/common/particles/imagegrid.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_imagegrid.scss`

### infolist
- YAML: `themes/orion/common/particles/infolist.yaml`
- Twig: `themes/orion/common/particles/infolist.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_infolist.scss`

### latestnews
- YAML: `themes/orion/common/particles/latestnews.yaml`
- Twig: `themes/orion/common/particles/latestnews.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_latestnews.scss`

### logo
- YAML: `themes/orion/common/particles/logo.yaml`
- Twig: `themes/orion/common/particles/logo.html.twig`
- SCSS: `themes/orion/common/scss/orion/styles/_logo.scss`

### logos
- YAML: `themes/orion/common/particles/logos.yaml`
- Twig: `themes/orion/common/particles/logos.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_logos.scss`

### newsletter
- YAML: `themes/orion/common/particles/newsletter.yaml`
- Twig: `themes/orion/common/particles/newsletter.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/orion/common/particles/popupmodule.yaml`
- Twig: `themes/orion/common/particles/popupmodule.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/orion/common/particles/pricingtable.yaml`
- Twig: `themes/orion/common/particles/pricingtable.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_pricingtable.scss`

### promo
- YAML: `themes/orion/common/particles/promo.yaml`
- Twig: `themes/orion/common/particles/promo.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_promo.scss`

### quote
- YAML: `themes/orion/common/particles/quote.yaml`
- Twig: `themes/orion/common/particles/quote.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_quote.scss`

### search
- YAML: `themes/orion/common/particles/search.yaml`
- Twig: `themes/orion/common/particles/search.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_search.scss`

### showcase
- YAML: `themes/orion/common/particles/showcase.yaml`
- Twig: `themes/orion/common/particles/showcase.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_showcase.scss`
- SCSS: `themes/orion/common/scss/orion/sections/_showcase.scss`

### simplecontent
- YAML: `themes/orion/common/particles/simplecontent.yaml`
- Twig: `themes/orion/common/particles/simplecontent.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/orion/common/particles/simplemenu.yaml`
- Twig: `themes/orion/common/particles/simplemenu.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_simplemenu.scss`

### slider
- YAML: `themes/orion/common/particles/slider.yaml`
- Twig: `themes/orion/common/particles/slider.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_slider.scss`

### social
- YAML: `themes/orion/common/particles/social.yaml`
- Twig: `themes/orion/common/particles/social.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_social.scss`

### stories
- YAML: `themes/orion/common/particles/stories.yaml`
- Twig: `themes/orion/common/particles/stories.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_stories.scss`

### swiper
- YAML: `themes/orion/common/particles/swiper.yaml`
- Twig: `themes/orion/common/particles/swiper.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_swiper.scss`

### testimonials
- YAML: `themes/orion/common/particles/testimonials.yaml`
- Twig: `themes/orion/common/particles/testimonials.html.twig`
- SCSS: `themes/orion/common/scss/orion/particles/_testimonials.scss`

## Theme: phoenix

### activities
- YAML: `themes/phoenix/common/particles/activities.yaml`
- Twig: `themes/phoenix/common/particles/activities.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_activities.scss`

### aos
- YAML: `themes/phoenix/common/particles/aos.yaml`
- Twig: `themes/phoenix/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/phoenix/common/particles/blockcontent.yaml`
- Twig: `themes/phoenix/common/particles/blockcontent.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_blockcontent.scss`

### fixedheader
- YAML: `themes/phoenix/common/particles/fixedheader.yaml`
- Twig: `themes/phoenix/common/particles/fixedheader.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/phoenix/common/particles/gridstatistic.yaml`
- Twig: `themes/phoenix/common/particles/gridstatistic.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_gridstatistic.scss`

### heading
- YAML: `themes/phoenix/common/particles/heading.yaml`
- Twig: `themes/phoenix/common/particles/heading.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_heading.scss`

### image
- YAML: `themes/phoenix/common/particles/image.yaml`
- Twig: `themes/phoenix/common/particles/image.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/phoenix/common/particles/imagegrid.yaml`
- Twig: `themes/phoenix/common/particles/imagegrid.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_imagegrid.scss`

### infolist
- YAML: `themes/phoenix/common/particles/infolist.yaml`
- Twig: `themes/phoenix/common/particles/infolist.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_infolist.scss`

### latestnews
- YAML: `themes/phoenix/common/particles/latestnews.yaml`
- Twig: `themes/phoenix/common/particles/latestnews.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_latestnews.scss`

### logo
- YAML: `themes/phoenix/common/particles/logo.yaml`
- Twig: `themes/phoenix/common/particles/logo.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/styles/_logo.scss`

### logos
- YAML: `themes/phoenix/common/particles/logos.yaml`
- Twig: `themes/phoenix/common/particles/logos.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_logos.scss`

### newsletter
- YAML: `themes/phoenix/common/particles/newsletter.yaml`
- Twig: `themes/phoenix/common/particles/newsletter.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/phoenix/common/particles/popupmodule.yaml`
- Twig: `themes/phoenix/common/particles/popupmodule.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/phoenix/common/particles/pricingtable.yaml`
- Twig: `themes/phoenix/common/particles/pricingtable.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_pricingtable.scss`

### promo
- YAML: `themes/phoenix/common/particles/promo.yaml`
- Twig: `themes/phoenix/common/particles/promo.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_promo.scss`

### quote
- YAML: `themes/phoenix/common/particles/quote.yaml`
- Twig: `themes/phoenix/common/particles/quote.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_quote.scss`

### search
- YAML: `themes/phoenix/common/particles/search.yaml`
- Twig: `themes/phoenix/common/particles/search.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_search.scss`

### simplecontent
- YAML: `themes/phoenix/common/particles/simplecontent.yaml`
- Twig: `themes/phoenix/common/particles/simplecontent.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/phoenix/common/particles/simplemenu.yaml`
- Twig: `themes/phoenix/common/particles/simplemenu.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_simplemenu.scss`

### slider
- YAML: `themes/phoenix/common/particles/slider.yaml`
- Twig: `themes/phoenix/common/particles/slider.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_slider.scss`

### slideshow
- YAML: `themes/phoenix/common/particles/slideshow.yaml`
- Twig: `themes/phoenix/common/particles/slideshow.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_slideshow.scss`
- SCSS: `themes/phoenix/common/scss/phoenix/sections/_slideshow.scss`

### social
- YAML: `themes/phoenix/common/particles/social.yaml`
- Twig: `themes/phoenix/common/particles/social.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_social.scss`

### swiper
- YAML: `themes/phoenix/common/particles/swiper.yaml`
- Twig: `themes/phoenix/common/particles/swiper.html.twig`
- SCSS: `themes/phoenix/common/scss/phoenix/particles/_swiper.scss`

## Theme: photon

### accordion
- YAML: `themes/photon/common/particles/accordion.yaml`
- Twig: `themes/photon/common/particles/accordion.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_accordion.scss`

### aos
- YAML: `themes/photon/common/particles/aos.yaml`
- Twig: `themes/photon/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/photon/common/particles/blockcontent.yaml`
- Twig: `themes/photon/common/particles/blockcontent.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_blockcontent.scss`

### calendar
- YAML: `themes/photon/common/particles/calendar.yaml`
- Twig: `themes/photon/common/particles/calendar.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_calendar.scss`

### contenttabs
- YAML: `themes/photon/common/particles/contenttabs.yaml`
- Twig: `themes/photon/common/particles/contenttabs.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_contenttabs.scss`

### flexslider
- YAML: `themes/photon/common/particles/flexslider.yaml`
- Twig: `themes/photon/common/particles/flexslider.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_flexslider.scss`

### gridcontent
- YAML: `themes/photon/common/particles/gridcontent.yaml`
- Twig: `themes/photon/common/particles/gridcontent.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/photon/common/particles/gridstatistic.yaml`
- Twig: `themes/photon/common/particles/gridstatistic.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/photon/common/particles/imagegrid.yaml`
- Twig: `themes/photon/common/particles/imagegrid.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_imagegrid.scss`

### infolist
- YAML: `themes/photon/common/particles/infolist.yaml`
- Twig: `themes/photon/common/particles/infolist.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_infolist.scss`

### mailchimp
- YAML: `themes/photon/common/particles/mailchimp.yaml`
- Twig: `themes/photon/common/particles/mailchimp.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_mailchimp.scss`

### mosaicgrid
- YAML: `themes/photon/common/particles/mosaicgrid.yaml`
- Twig: `themes/photon/common/particles/mosaicgrid.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_mosaicgrid.scss`

### newsletter
- YAML: `themes/photon/common/particles/newsletter.yaml`
- Twig: `themes/photon/common/particles/newsletter.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_newsletter.scss`

### newsslider
- YAML: `themes/photon/common/particles/newsslider.yaml`
- Twig: `themes/photon/common/particles/newsslider.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_newsslider.scss`

### popupmodule
- YAML: `themes/photon/common/particles/popupmodule.yaml`
- Twig: `themes/photon/common/particles/popupmodule.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/photon/common/particles/pricingtable.yaml`
- Twig: `themes/photon/common/particles/pricingtable.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/photon/common/particles/simplecontent.yaml`
- Twig: `themes/photon/common/particles/simplecontent.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_simplecontent.scss`

### swiper
- YAML: `themes/photon/common/particles/swiper.yaml`
- Twig: `themes/photon/common/particles/swiper.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/photon/common/particles/swipercarousel.yaml`
- Twig: `themes/photon/common/particles/swipercarousel.html.twig`
- SCSS: `themes/photon/common/scss/photon/particles/_swipercarousel.scss`

## Theme: protean

### accordion
- YAML: `themes/protean/common/particles/accordion.yaml`
- Twig: `themes/protean/common/particles/accordion.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_accordion.scss`

### aos
- YAML: `themes/protean/common/particles/aos.yaml`
- Twig: `themes/protean/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/protean/common/particles/blockcontent.yaml`
- Twig: `themes/protean/common/particles/blockcontent.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_blockcontent.scss`

### calendar
- YAML: `themes/protean/common/particles/calendar.yaml`
- Twig: `themes/protean/common/particles/calendar.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_calendar.scss`

### contenttabs
- YAML: `themes/protean/common/particles/contenttabs.yaml`
- Twig: `themes/protean/common/particles/contenttabs.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_contenttabs.scss`

### eventlist
- YAML: `themes/protean/common/particles/eventlist.yaml`
- Twig: `themes/protean/common/particles/eventlist.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_eventlist.scss`

### flipster
- YAML: `themes/protean/common/particles/flipster.yaml`
- Twig: `themes/protean/common/particles/flipster.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_flipster.scss`

### gridcontent
- YAML: `themes/protean/common/particles/gridcontent.yaml`
- Twig: `themes/protean/common/particles/gridcontent.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/protean/common/particles/gridstatistic.yaml`
- Twig: `themes/protean/common/particles/gridstatistic.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/protean/common/particles/imagegrid.yaml`
- Twig: `themes/protean/common/particles/imagegrid.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_imagegrid.scss`

### infolist
- YAML: `themes/protean/common/particles/infolist.yaml`
- Twig: `themes/protean/common/particles/infolist.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_infolist.scss`

### mailchimp
- YAML: `themes/protean/common/particles/mailchimp.yaml`
- Twig: `themes/protean/common/particles/mailchimp.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/protean/common/particles/newsletter.yaml`
- Twig: `themes/protean/common/particles/newsletter.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/protean/common/particles/popupmodule.yaml`
- Twig: `themes/protean/common/particles/popupmodule.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/protean/common/particles/pricingtable.yaml`
- Twig: `themes/protean/common/particles/pricingtable.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/protean/common/particles/simplecontent.yaml`
- Twig: `themes/protean/common/particles/simplecontent.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/protean/common/particles/simplemenu.yaml`
- Twig: `themes/protean/common/particles/simplemenu.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_simplemenu.scss`

### simpleweather
- YAML: `themes/protean/common/particles/simpleweather.yaml`
- Twig: `themes/protean/common/particles/simpleweather.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_simpleweather.scss`

### swiper
- YAML: `themes/protean/common/particles/swiper.yaml`
- Twig: `themes/protean/common/particles/swiper.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/protean/common/particles/swipercarousel.yaml`
- Twig: `themes/protean/common/particles/swipercarousel.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_swipercarousel.scss`

### videogrid
- YAML: `themes/protean/common/particles/videogrid.yaml`
- Twig: `themes/protean/common/particles/videogrid.html.twig`
- SCSS: `themes/protean/common/scss/protean/particles/_videogrid.scss`

## Theme: reiko

### aos
- YAML: `themes/reiko/common/particles/aos.yaml`
- Twig: `themes/reiko/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/reiko/common/particles/blockcontent.yaml`
- Twig: `themes/reiko/common/particles/blockcontent.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_blockcontent.scss`

### calendar
- YAML: `themes/reiko/common/particles/calendar.yaml`
- Twig: `themes/reiko/common/particles/calendar.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_calendar.scss`

### featuredvideos
- YAML: `themes/reiko/common/particles/featuredvideos.yaml`
- Twig: `themes/reiko/common/particles/featuredvideos.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_featuredvideos.scss`

### fixedheader
- YAML: `themes/reiko/common/particles/fixedheader.yaml`
- Twig: `themes/reiko/common/particles/fixedheader.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/reiko/common/particles/gridstatistic.yaml`
- Twig: `themes/reiko/common/particles/gridstatistic.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_gridstatistic.scss`

### heading
- YAML: `themes/reiko/common/particles/heading.yaml`
- Twig: `themes/reiko/common/particles/heading.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_heading.scss`

### imagegrid
- YAML: `themes/reiko/common/particles/imagegrid.yaml`
- Twig: `themes/reiko/common/particles/imagegrid.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_imagegrid.scss`

### infolist
- YAML: `themes/reiko/common/particles/infolist.yaml`
- Twig: `themes/reiko/common/particles/infolist.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_infolist.scss`

### latestnews
- YAML: `themes/reiko/common/particles/latestnews.yaml`
- Twig: `themes/reiko/common/particles/latestnews.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_latestnews.scss`

### logo
- YAML: `themes/reiko/common/particles/logo.yaml`
- Twig: `themes/reiko/common/particles/logo.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/styles/_logo.scss`

### logos
- YAML: `themes/reiko/common/particles/logos.yaml`
- Twig: `themes/reiko/common/particles/logos.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_logos.scss`

### mediaquotes
- YAML: `themes/reiko/common/particles/mediaquotes.yaml`
- Twig: `themes/reiko/common/particles/mediaquotes.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_mediaquotes.scss`

### newsletter
- YAML: `themes/reiko/common/particles/newsletter.yaml`
- Twig: `themes/reiko/common/particles/newsletter.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_newsletter.scss`

### photocollage
- YAML: `themes/reiko/common/particles/photocollage.yaml`
- Twig: `themes/reiko/common/particles/photocollage.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_photocollage.scss`

### popupmodule
- YAML: `themes/reiko/common/particles/popupmodule.yaml`
- Twig: `themes/reiko/common/particles/popupmodule.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/reiko/common/particles/pricingtable.yaml`
- Twig: `themes/reiko/common/particles/pricingtable.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_pricingtable.scss`

### profile
- YAML: `themes/reiko/common/particles/profile.yaml`
- Twig: `themes/reiko/common/particles/profile.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_profile.scss`

### scoreblock
- YAML: `themes/reiko/common/particles/scoreblock.yaml`
- Twig: `themes/reiko/common/particles/scoreblock.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_scoreblock.scss`

### search
- YAML: `themes/reiko/common/particles/search.yaml`
- Twig: `themes/reiko/common/particles/search.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_search.scss`

### simplecontent
- YAML: `themes/reiko/common/particles/simplecontent.yaml`
- Twig: `themes/reiko/common/particles/simplecontent.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/reiko/common/particles/simplemenu.yaml`
- Twig: `themes/reiko/common/particles/simplemenu.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_simplemenu.scss`

### slideshow
- YAML: `themes/reiko/common/particles/slideshow.yaml`
- Twig: `themes/reiko/common/particles/slideshow.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_slideshow.scss`
- SCSS: `themes/reiko/common/scss/reiko/sections/_slideshow.scss`

### swiper
- YAML: `themes/reiko/common/particles/swiper.yaml`
- Twig: `themes/reiko/common/particles/swiper.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_swiper.scss`

### table-tabs
- YAML: `themes/reiko/common/particles/table-tabs.yaml`
- Twig: `themes/reiko/common/particles/table-tabs.html.twig`
- SCSS: _none_

### team
- YAML: `themes/reiko/common/particles/team.yaml`
- Twig: `themes/reiko/common/particles/team.html.twig`
- SCSS: `themes/reiko/common/scss/reiko/particles/_team.scss`

## Theme: remnant

### accordion
- YAML: `themes/remnant/common/particles/accordion.yaml`
- Twig: `themes/remnant/common/particles/accordion.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_accordion.scss`

### aos
- YAML: `themes/remnant/common/particles/aos.yaml`
- Twig: `themes/remnant/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/remnant/common/particles/blockcontent.yaml`
- Twig: `themes/remnant/common/particles/blockcontent.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_blockcontent.scss`

### calendar
- YAML: `themes/remnant/common/particles/calendar.yaml`
- Twig: `themes/remnant/common/particles/calendar.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_calendar.scss`

### eventlist
- YAML: `themes/remnant/common/particles/eventlist.yaml`
- Twig: `themes/remnant/common/particles/eventlist.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_eventlist.scss`

### fixedheader
- YAML: `themes/remnant/common/particles/fixedheader.yaml`
- Twig: `themes/remnant/common/particles/fixedheader.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_fixedheader.scss`

### gridcontent
- YAML: `themes/remnant/common/particles/gridcontent.yaml`
- Twig: `themes/remnant/common/particles/gridcontent.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/remnant/common/particles/gridstatistic.yaml`
- Twig: `themes/remnant/common/particles/gridstatistic.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/remnant/common/particles/imagegrid.yaml`
- Twig: `themes/remnant/common/particles/imagegrid.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_imagegrid.scss`

### infolist
- YAML: `themes/remnant/common/particles/infolist.yaml`
- Twig: `themes/remnant/common/particles/infolist.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_infolist.scss`

### mailchimp
- YAML: `themes/remnant/common/particles/mailchimp.yaml`
- Twig: `themes/remnant/common/particles/mailchimp.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_mailchimp.scss`

### miniplayer
- YAML: `themes/remnant/common/particles/miniplayer.yaml`
- Twig: `themes/remnant/common/particles/miniplayer.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_miniplayer.scss`

### newsletter
- YAML: `themes/remnant/common/particles/newsletter.yaml`
- Twig: `themes/remnant/common/particles/newsletter.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/remnant/common/particles/popupmodule.yaml`
- Twig: `themes/remnant/common/particles/popupmodule.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/remnant/common/particles/pricingtable.yaml`
- Twig: `themes/remnant/common/particles/pricingtable.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/remnant/common/particles/simplecontent.yaml`
- Twig: `themes/remnant/common/particles/simplecontent.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/remnant/common/particles/simplemenu.yaml`
- Twig: `themes/remnant/common/particles/simplemenu.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_simplemenu.scss`

### simpleweather
- YAML: `themes/remnant/common/particles/simpleweather.yaml`
- Twig: `themes/remnant/common/particles/simpleweather.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_simpleweather.scss`

### swiper
- YAML: `themes/remnant/common/particles/swiper.yaml`
- Twig: `themes/remnant/common/particles/swiper.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/remnant/common/particles/swipercarousel.yaml`
- Twig: `themes/remnant/common/particles/swipercarousel.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_swipercarousel.scss`

### videogrid
- YAML: `themes/remnant/common/particles/videogrid.yaml`
- Twig: `themes/remnant/common/particles/videogrid.html.twig`
- SCSS: `themes/remnant/common/scss/remnant/particles/_videogrid.scss`

## Theme: requiem

### animatedblock
- YAML: `themes/requiem/common/particles/animatedblock.yaml`
- Twig: `themes/requiem/common/particles/animatedblock.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_animatedblock.scss`

### aos
- YAML: `themes/requiem/common/particles/aos.yaml`
- Twig: `themes/requiem/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/requiem/common/particles/blockcontent.yaml`
- Twig: `themes/requiem/common/particles/blockcontent.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_blockcontent.scss`

### calendar
- YAML: `themes/requiem/common/particles/calendar.yaml`
- Twig: `themes/requiem/common/particles/calendar.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_calendar.scss`

### contact
- YAML: `themes/requiem/common/particles/contact.yaml`
- Twig: `themes/requiem/common/particles/contact.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_contact.scss`

### contentlist
- YAML: `themes/requiem/common/particles/contentlist.yaml`
- Twig: `themes/requiem/common/particles/contentlist.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_contentlist.scss`

### copyright
- YAML: `themes/requiem/common/particles/copyright.yaml`
- Twig: `themes/requiem/common/particles/copyright.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_copyright.scss`

### gridcontent
- YAML: `themes/requiem/common/particles/gridcontent.yaml`
- Twig: `themes/requiem/common/particles/gridcontent.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_gridcontent.scss`

### gridpromogallery
- YAML: `themes/requiem/common/particles/gridpromogallery.yaml`
- Twig: `themes/requiem/common/particles/gridpromogallery.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_gridpromogallery.scss`

### gridstatistic
- YAML: `themes/requiem/common/particles/gridstatistic.yaml`
- Twig: `themes/requiem/common/particles/gridstatistic.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_gridstatistic.scss`

### horizontalmenu
- YAML: `themes/requiem/common/particles/horizontalmenu.yaml`
- Twig: `themes/requiem/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_horizontalmenu.scss`

### iconmenu
- YAML: `themes/requiem/common/particles/iconmenu.yaml`
- Twig: `themes/requiem/common/particles/iconmenu.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_iconmenu.scss`

### imagegrid
- YAML: `themes/requiem/common/particles/imagegrid.yaml`
- Twig: `themes/requiem/common/particles/imagegrid.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_imagegrid.scss`

### infolist
- YAML: `themes/requiem/common/particles/infolist.yaml`
- Twig: `themes/requiem/common/particles/infolist.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_infolist.scss`

### logo
- YAML: `themes/requiem/common/particles/logo.yaml`
- Twig: `themes/requiem/common/particles/logo.html.twig`
- SCSS: _none_

### mailchimp
- YAML: `themes/requiem/common/particles/mailchimp.yaml`
- Twig: `themes/requiem/common/particles/mailchimp.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_mailchimp.scss`

### newsletter
- YAML: `themes/requiem/common/particles/newsletter.yaml`
- Twig: `themes/requiem/common/particles/newsletter.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_newsletter.scss`

### promocontent
- YAML: `themes/requiem/common/particles/promocontent.yaml`
- Twig: `themes/requiem/common/particles/promocontent.html.twig`
- SCSS: _none_

### promoimage
- YAML: `themes/requiem/common/particles/promoimage.yaml`
- Twig: `themes/requiem/common/particles/promoimage.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_promoimage.scss`

### social
- YAML: `themes/requiem/common/particles/social.yaml`
- Twig: `themes/requiem/common/particles/social.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_social.scss`

### swiper
- YAML: `themes/requiem/common/particles/swiper.yaml`
- Twig: `themes/requiem/common/particles/swiper.html.twig`
- SCSS: `themes/requiem/common/scss/requiem/_swiper.scss`

### testimonial
- YAML: `themes/requiem/common/particles/testimonial.yaml`
- Twig: `themes/requiem/common/particles/testimonial.html.twig`
- SCSS: _none_

## Theme: salient

### animatedblock
- YAML: `themes/salient/common/particles/animatedblock.yaml`
- Twig: `themes/salient/common/particles/animatedblock.html.twig`
- SCSS: `themes/salient/common/scss/salient/_animatedblock.scss`

### aos
- YAML: `themes/salient/common/particles/aos.yaml`
- Twig: `themes/salient/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/salient/common/particles/blockcontent.yaml`
- Twig: `themes/salient/common/particles/blockcontent.html.twig`
- SCSS: `themes/salient/common/scss/salient/_blockcontent.scss`

### calendar
- YAML: `themes/salient/common/particles/calendar.yaml`
- Twig: `themes/salient/common/particles/calendar.html.twig`
- SCSS: `themes/salient/common/scss/salient/_calendar.scss`

### contact
- YAML: `themes/salient/common/particles/contact.yaml`
- Twig: `themes/salient/common/particles/contact.html.twig`
- SCSS: `themes/salient/common/scss/salient/_contact.scss`

### contentlist
- YAML: `themes/salient/common/particles/contentlist.yaml`
- Twig: `themes/salient/common/particles/contentlist.html.twig`
- SCSS: `themes/salient/common/scss/salient/_contentlist.scss`

### fixedheader
- YAML: `themes/salient/common/particles/fixedheader.yaml`
- Twig: `themes/salient/common/particles/fixedheader.html.twig`
- SCSS: `themes/salient/common/scss/salient/_fixedheader.scss`

### horizontalmenu
- YAML: `themes/salient/common/particles/horizontalmenu.yaml`
- Twig: `themes/salient/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/salient/common/scss/salient/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/salient/common/particles/imagegrid.yaml`
- Twig: `themes/salient/common/particles/imagegrid.html.twig`
- SCSS: `themes/salient/common/scss/salient/_imagegrid.scss`

### infolist
- YAML: `themes/salient/common/particles/infolist.yaml`
- Twig: `themes/salient/common/particles/infolist.html.twig`
- SCSS: `themes/salient/common/scss/salient/_infolist.scss`

### logo
- YAML: `themes/salient/common/particles/logo.yaml`
- Twig: `themes/salient/common/particles/logo.html.twig`
- SCSS: _none_

### mailchimp
- YAML: `themes/salient/common/particles/mailchimp.yaml`
- Twig: `themes/salient/common/particles/mailchimp.html.twig`
- SCSS: `themes/salient/common/scss/salient/_mailchimp.scss`

### newsletter
- YAML: `themes/salient/common/particles/newsletter.yaml`
- Twig: `themes/salient/common/particles/newsletter.html.twig`
- SCSS: `themes/salient/common/scss/salient/_newsletter.scss`

### promocontent
- YAML: `themes/salient/common/particles/promocontent.yaml`
- Twig: `themes/salient/common/particles/promocontent.html.twig`
- SCSS: _none_

### promoimage
- YAML: `themes/salient/common/particles/promoimage.yaml`
- Twig: `themes/salient/common/particles/promoimage.html.twig`
- SCSS: `themes/salient/common/scss/salient/_promoimage.scss`

### social
- YAML: `themes/salient/common/particles/social.yaml`
- Twig: `themes/salient/common/particles/social.html.twig`
- SCSS: `themes/salient/common/scss/salient/_social.scss`

### swiper
- YAML: `themes/salient/common/particles/swiper.yaml`
- Twig: `themes/salient/common/particles/swiper.html.twig`
- SCSS: `themes/salient/common/scss/salient/_swiper.scss`

### testimonial
- YAML: `themes/salient/common/particles/testimonial.yaml`
- Twig: `themes/salient/common/particles/testimonial.html.twig`
- SCSS: _none_

## Theme: sienna

### accordion
- YAML: `themes/sienna/common/particles/accordion.yaml`
- Twig: `themes/sienna/common/particles/accordion.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_accordion.scss`

### aos
- YAML: `themes/sienna/common/particles/aos.yaml`
- Twig: `themes/sienna/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/sienna/common/particles/blockcontent.yaml`
- Twig: `themes/sienna/common/particles/blockcontent.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_blockcontent.scss`

### bookblock
- YAML: `themes/sienna/common/particles/bookblock.yaml`
- Twig: `themes/sienna/common/particles/bookblock.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_bookblock.scss`

### bookingform
- YAML: `themes/sienna/common/particles/bookingform.yaml`
- Twig: `themes/sienna/common/particles/bookingform.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_bookingform.scss`

### calendar
- YAML: `themes/sienna/common/particles/calendar.yaml`
- Twig: `themes/sienna/common/particles/calendar.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_calendar.scss`

### gridcontent
- YAML: `themes/sienna/common/particles/gridcontent.yaml`
- Twig: `themes/sienna/common/particles/gridcontent.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/sienna/common/particles/gridstatistic.yaml`
- Twig: `themes/sienna/common/particles/gridstatistic.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/sienna/common/particles/imagegrid.yaml`
- Twig: `themes/sienna/common/particles/imagegrid.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_imagegrid.scss`

### infolist
- YAML: `themes/sienna/common/particles/infolist.yaml`
- Twig: `themes/sienna/common/particles/infolist.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_infolist.scss`

### mailchimp
- YAML: `themes/sienna/common/particles/mailchimp.yaml`
- Twig: `themes/sienna/common/particles/mailchimp.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/sienna/common/particles/newsletter.yaml`
- Twig: `themes/sienna/common/particles/newsletter.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/sienna/common/particles/popupmodule.yaml`
- Twig: `themes/sienna/common/particles/popupmodule.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/sienna/common/particles/pricingtable.yaml`
- Twig: `themes/sienna/common/particles/pricingtable.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_pricingtable.scss`

### simplebooking
- YAML: `themes/sienna/common/particles/simplebooking.yaml`
- Twig: `themes/sienna/common/particles/simplebooking.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_simplebooking.scss`

### simplecontent
- YAML: `themes/sienna/common/particles/simplecontent.yaml`
- Twig: `themes/sienna/common/particles/simplecontent.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/sienna/common/particles/simplemenu.yaml`
- Twig: `themes/sienna/common/particles/simplemenu.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_simplemenu.scss`

### simpleweather
- YAML: `themes/sienna/common/particles/simpleweather.yaml`
- Twig: `themes/sienna/common/particles/simpleweather.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_simpleweather.scss`

### swiper
- YAML: `themes/sienna/common/particles/swiper.yaml`
- Twig: `themes/sienna/common/particles/swiper.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/sienna/common/particles/swipercarousel.yaml`
- Twig: `themes/sienna/common/particles/swipercarousel.html.twig`
- SCSS: `themes/sienna/common/scss/sienna/particles/_swipercarousel.scss`

## Theme: studius

### aos
- YAML: `themes/studius/common/particles/aos.yaml`
- Twig: `themes/studius/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/studius/common/particles/blockcontent.yaml`
- Twig: `themes/studius/common/particles/blockcontent.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_blockcontent.scss`

### comments
- YAML: `themes/studius/common/particles/comments.yaml`
- Twig: `themes/studius/common/particles/comments.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_comments.scss`

### comparisontable
- YAML: `themes/studius/common/particles/comparisontable.yaml`
- Twig: `themes/studius/common/particles/comparisontable.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_comparisontable.scss`

### fixedheader
- YAML: `themes/studius/common/particles/fixedheader.yaml`
- Twig: `themes/studius/common/particles/fixedheader.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/studius/common/particles/gridstatistic.yaml`
- Twig: `themes/studius/common/particles/gridstatistic.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_gridstatistic.scss`

### heading
- YAML: `themes/studius/common/particles/heading.yaml`
- Twig: `themes/studius/common/particles/heading.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_heading.scss`

### horizmenu
- YAML: `themes/studius/common/particles/horizmenu.yaml`
- Twig: `themes/studius/common/particles/horizmenu.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_horizmenu.scss`

### iconpromo
- YAML: `themes/studius/common/particles/iconpromo.yaml`
- Twig: `themes/studius/common/particles/iconpromo.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_iconpromo.scss`

### image
- YAML: `themes/studius/common/particles/image.yaml`
- Twig: `themes/studius/common/particles/image.html.twig`
- SCSS: _none_

### imagegrid
- YAML: `themes/studius/common/particles/imagegrid.yaml`
- Twig: `themes/studius/common/particles/imagegrid.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_imagegrid.scss`

### infolist
- YAML: `themes/studius/common/particles/infolist.yaml`
- Twig: `themes/studius/common/particles/infolist.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_infolist.scss`

### latestnews
- YAML: `themes/studius/common/particles/latestnews.yaml`
- Twig: `themes/studius/common/particles/latestnews.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_latestnews.scss`

### logo
- YAML: `themes/studius/common/particles/logo.yaml`
- Twig: `themes/studius/common/particles/logo.html.twig`
- SCSS: `themes/studius/common/scss/studius/styles/_logo.scss`

### logos
- YAML: `themes/studius/common/particles/logos.yaml`
- Twig: `themes/studius/common/particles/logos.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_logos.scss`

### news
- YAML: `themes/studius/common/particles/news.yaml`
- Twig: `themes/studius/common/particles/news.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_news.scss`

### newsletter
- YAML: `themes/studius/common/particles/newsletter.yaml`
- Twig: `themes/studius/common/particles/newsletter.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/studius/common/particles/popupmodule.yaml`
- Twig: `themes/studius/common/particles/popupmodule.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/studius/common/particles/pricingtable.yaml`
- Twig: `themes/studius/common/particles/pricingtable.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_pricingtable.scss`

### promo
- YAML: `themes/studius/common/particles/promo.yaml`
- Twig: `themes/studius/common/particles/promo.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_promo.scss`

### quote
- YAML: `themes/studius/common/particles/quote.yaml`
- Twig: `themes/studius/common/particles/quote.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_quote.scss`

### search
- YAML: `themes/studius/common/particles/search.yaml`
- Twig: `themes/studius/common/particles/search.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_search.scss`

### showcase
- YAML: `themes/studius/common/particles/showcase.yaml`
- Twig: `themes/studius/common/particles/showcase.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_showcase.scss`
- SCSS: `themes/studius/common/scss/studius/sections/_showcase.scss`

### simplecontent
- YAML: `themes/studius/common/particles/simplecontent.yaml`
- Twig: `themes/studius/common/particles/simplecontent.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/studius/common/particles/simplemenu.yaml`
- Twig: `themes/studius/common/particles/simplemenu.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_simplemenu.scss`

### slider
- YAML: `themes/studius/common/particles/slider.yaml`
- Twig: `themes/studius/common/particles/slider.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_slider.scss`

### social
- YAML: `themes/studius/common/particles/social.yaml`
- Twig: `themes/studius/common/particles/social.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_social.scss`

### stories
- YAML: `themes/studius/common/particles/stories.yaml`
- Twig: `themes/studius/common/particles/stories.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_stories.scss`

### swiper
- YAML: `themes/studius/common/particles/swiper.yaml`
- Twig: `themes/studius/common/particles/swiper.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_swiper.scss`

### testimonials
- YAML: `themes/studius/common/particles/testimonials.yaml`
- Twig: `themes/studius/common/particles/testimonials.html.twig`
- SCSS: `themes/studius/common/scss/studius/particles/_testimonials.scss`

## Theme: supra

### accordion
- YAML: `themes/supra/common/particles/accordion.yaml`
- Twig: `themes/supra/common/particles/accordion.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_accordion.scss`

### aos
- YAML: `themes/supra/common/particles/aos.yaml`
- Twig: `themes/supra/common/particles/aos.html.twig`
- SCSS: _none_

### bgslideshow
- YAML: `themes/supra/common/particles/bgslideshow.yaml`
- Twig: `themes/supra/common/particles/bgslideshow.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_bgslideshow.scss`

### blockcontent
- YAML: `themes/supra/common/particles/blockcontent.yaml`
- Twig: `themes/supra/common/particles/blockcontent.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_blockcontent.scss`

### calendar
- YAML: `themes/supra/common/particles/calendar.yaml`
- Twig: `themes/supra/common/particles/calendar.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_calendar.scss`

### contenttabs
- YAML: `themes/supra/common/particles/contenttabs.yaml`
- Twig: `themes/supra/common/particles/contenttabs.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_contenttabs.scss`

### fixedheader
- YAML: `themes/supra/common/particles/fixedheader.yaml`
- Twig: `themes/supra/common/particles/fixedheader.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_fixedheader.scss`

### fullpage
- YAML: `themes/supra/common/particles/fullpage.yaml`
- Twig: `themes/supra/common/particles/fullpage.html.twig`
- SCSS: _none_

### gridcontent
- YAML: `themes/supra/common/particles/gridcontent.yaml`
- Twig: `themes/supra/common/particles/gridcontent.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/supra/common/particles/gridstatistic.yaml`
- Twig: `themes/supra/common/particles/gridstatistic.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/supra/common/particles/imagegrid.yaml`
- Twig: `themes/supra/common/particles/imagegrid.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_imagegrid.scss`

### infolist
- YAML: `themes/supra/common/particles/infolist.yaml`
- Twig: `themes/supra/common/particles/infolist.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_infolist.scss`

### mailchimp
- YAML: `themes/supra/common/particles/mailchimp.yaml`
- Twig: `themes/supra/common/particles/mailchimp.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/supra/common/particles/newsletter.yaml`
- Twig: `themes/supra/common/particles/newsletter.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_newsletter.scss`

### panelslider
- YAML: `themes/supra/common/particles/panelslider.yaml`
- Twig: `themes/supra/common/particles/panelslider.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_panelslider.scss`

### popupgrid
- YAML: `themes/supra/common/particles/popupgrid.yaml`
- Twig: `themes/supra/common/particles/popupgrid.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_popupgrid.scss`

### popupmodule
- YAML: `themes/supra/common/particles/popupmodule.yaml`
- Twig: `themes/supra/common/particles/popupmodule.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/supra/common/particles/pricingtable.yaml`
- Twig: `themes/supra/common/particles/pricingtable.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_pricingtable.scss`

### search
- YAML: `themes/supra/common/particles/search.yaml`
- Twig: `themes/supra/common/particles/search.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_search.scss`

### simplecontent
- YAML: `themes/supra/common/particles/simplecontent.yaml`
- Twig: `themes/supra/common/particles/simplecontent.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/supra/common/particles/simplemenu.yaml`
- Twig: `themes/supra/common/particles/simplemenu.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_simplemenu.scss`

### slider
- YAML: `themes/supra/common/particles/slider.yaml`
- Twig: `themes/supra/common/particles/slider.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_slider.scss`

### swiper
- YAML: `themes/supra/common/particles/swiper.yaml`
- Twig: `themes/supra/common/particles/swiper.html.twig`
- SCSS: `themes/supra/common/scss/supra/particles/_swiper.scss`

## Theme: topaz

### accordion
- YAML: `themes/topaz/common/particles/accordion.yaml`
- Twig: `themes/topaz/common/particles/accordion.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_accordion.scss`

### aos
- YAML: `themes/topaz/common/particles/aos.yaml`
- Twig: `themes/topaz/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/topaz/common/particles/blockcontent.yaml`
- Twig: `themes/topaz/common/particles/blockcontent.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_blockcontent.scss`

### bookblock
- YAML: `themes/topaz/common/particles/bookblock.yaml`
- Twig: `themes/topaz/common/particles/bookblock.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_bookblock.scss`

### calendar
- YAML: `themes/topaz/common/particles/calendar.yaml`
- Twig: `themes/topaz/common/particles/calendar.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_calendar.scss`

### gridcontent
- YAML: `themes/topaz/common/particles/gridcontent.yaml`
- Twig: `themes/topaz/common/particles/gridcontent.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/topaz/common/particles/gridstatistic.yaml`
- Twig: `themes/topaz/common/particles/gridstatistic.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/topaz/common/particles/imagegrid.yaml`
- Twig: `themes/topaz/common/particles/imagegrid.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_imagegrid.scss`

### infolist
- YAML: `themes/topaz/common/particles/infolist.yaml`
- Twig: `themes/topaz/common/particles/infolist.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_infolist.scss`

### mailchimp
- YAML: `themes/topaz/common/particles/mailchimp.yaml`
- Twig: `themes/topaz/common/particles/mailchimp.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/topaz/common/particles/newsletter.yaml`
- Twig: `themes/topaz/common/particles/newsletter.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/topaz/common/particles/popupmodule.yaml`
- Twig: `themes/topaz/common/particles/popupmodule.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/topaz/common/particles/pricingtable.yaml`
- Twig: `themes/topaz/common/particles/pricingtable.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_pricingtable.scss`

### simplecontent
- YAML: `themes/topaz/common/particles/simplecontent.yaml`
- Twig: `themes/topaz/common/particles/simplecontent.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/topaz/common/particles/simplemenu.yaml`
- Twig: `themes/topaz/common/particles/simplemenu.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_simplemenu.scss`

### swiper
- YAML: `themes/topaz/common/particles/swiper.yaml`
- Twig: `themes/topaz/common/particles/swiper.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_swiper.scss`

### swipercarousel
- YAML: `themes/topaz/common/particles/swipercarousel.yaml`
- Twig: `themes/topaz/common/particles/swipercarousel.html.twig`
- SCSS: `themes/topaz/common/scss/topaz/particles/_swipercarousel.scss`

## Theme: vermilion

### aos
- YAML: `themes/vermilion/common/particles/aos.yaml`
- Twig: `themes/vermilion/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/vermilion/common/particles/blockcontent.yaml`
- Twig: `themes/vermilion/common/particles/blockcontent.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_blockcontent.scss`

### calendar
- YAML: `themes/vermilion/common/particles/calendar.yaml`
- Twig: `themes/vermilion/common/particles/calendar.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_calendar.scss`

### contact
- YAML: `themes/vermilion/common/particles/contact.yaml`
- Twig: `themes/vermilion/common/particles/contact.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_contact.scss`

### contentlist
- YAML: `themes/vermilion/common/particles/contentlist.yaml`
- Twig: `themes/vermilion/common/particles/contentlist.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_contentlist.scss`

### contenttabs
- YAML: `themes/vermilion/common/particles/contenttabs.yaml`
- Twig: `themes/vermilion/common/particles/contenttabs.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_contenttabs.scss`

### custom
- YAML: `themes/vermilion/common/particles/custom.yaml`
- Twig: `themes/vermilion/common/particles/custom.html.twig`
- SCSS: _none_

### featureblocks
- YAML: `themes/vermilion/common/particles/featureblocks.yaml`
- Twig: `themes/vermilion/common/particles/featureblocks.html.twig`
- SCSS: _none_

### headlines
- YAML: `themes/vermilion/common/particles/headlines.yaml`
- Twig: `themes/vermilion/common/particles/headlines.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_headlines.scss`

### horizontalmenu
- YAML: `themes/vermilion/common/particles/horizontalmenu.yaml`
- Twig: `themes/vermilion/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/vermilion/common/particles/imagegrid.yaml`
- Twig: `themes/vermilion/common/particles/imagegrid.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_imagegrid.scss`

### infolist
- YAML: `themes/vermilion/common/particles/infolist.yaml`
- Twig: `themes/vermilion/common/particles/infolist.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_infolist.scss`

### lists
- YAML: `themes/vermilion/common/particles/lists.yaml`
- Twig: `themes/vermilion/common/particles/lists.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_lists.scss`

### logo
- YAML: `themes/vermilion/common/particles/logo.yaml`
- Twig: `themes/vermilion/common/particles/logo.html.twig`
- SCSS: _none_

### mailchimp
- YAML: `themes/vermilion/common/particles/mailchimp.yaml`
- Twig: `themes/vermilion/common/particles/mailchimp.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_mailchimp.scss`

### menu
- YAML: `themes/vermilion/common/particles/menu.yaml`
- Twig: `themes/vermilion/common/particles/menu.html.twig`
- SCSS: _none_

### mosaic
- YAML: `themes/vermilion/common/particles/mosaic.yaml`
- Twig: `themes/vermilion/common/particles/mosaic.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_mosaic.scss`

### parallax
- YAML: `themes/vermilion/common/particles/parallax.yaml`
- Twig: `themes/vermilion/common/particles/parallax.html.twig`
- SCSS: _none_

### pricingtable
- YAML: `themes/vermilion/common/particles/pricingtable.yaml`
- Twig: `themes/vermilion/common/particles/pricingtable.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_pricingtable.scss`

### promoimage
- YAML: `themes/vermilion/common/particles/promoimage.yaml`
- Twig: `themes/vermilion/common/particles/promoimage.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_promoimage.scss`

### search
- YAML: `themes/vermilion/common/particles/search.yaml`
- Twig: `themes/vermilion/common/particles/search.html.twig`
- SCSS: _none_

### showcase
- YAML: `themes/vermilion/common/particles/showcase.yaml`
- Twig: `themes/vermilion/common/particles/showcase.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/sections/_showcase.scss`

### slider
- YAML: `themes/vermilion/common/particles/slider.yaml`
- Twig: `themes/vermilion/common/particles/slider.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_slider.scss`

### social
- YAML: `themes/vermilion/common/particles/social.yaml`
- Twig: `themes/vermilion/common/particles/social.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_social.scss`

### stripsslider
- YAML: `themes/vermilion/common/particles/stripsslider.yaml`
- Twig: `themes/vermilion/common/particles/stripsslider.html.twig`
- SCSS: _none_

### swiper
- YAML: `themes/vermilion/common/particles/swiper.yaml`
- Twig: `themes/vermilion/common/particles/swiper.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_swiper.scss`

### testimonials
- YAML: `themes/vermilion/common/particles/testimonials.yaml`
- Twig: `themes/vermilion/common/particles/testimonials.html.twig`
- SCSS: `themes/vermilion/common/scss/vermilion/particles/_testimonials.scss`

### totop
- YAML: `themes/vermilion/common/particles/totop.yaml`
- Twig: `themes/vermilion/common/particles/totop.html.twig`
- SCSS: _none_

## Theme: versla

### accordion
- YAML: `themes/versla/common/particles/accordion.yaml`
- Twig: `themes/versla/common/particles/accordion.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_accordion.scss`

### aos
- YAML: `themes/versla/common/particles/aos.yaml`
- Twig: `themes/versla/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/versla/common/particles/blockcontent.yaml`
- Twig: `themes/versla/common/particles/blockcontent.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_blockcontent.scss`

### calendar
- YAML: `themes/versla/common/particles/calendar.yaml`
- Twig: `themes/versla/common/particles/calendar.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_calendar.scss`

### contenttabs
- YAML: `themes/versla/common/particles/contenttabs.yaml`
- Twig: `themes/versla/common/particles/contenttabs.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_contenttabs.scss`

### fixedheader
- YAML: `themes/versla/common/particles/fixedheader.yaml`
- Twig: `themes/versla/common/particles/fixedheader.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_fixedheader.scss`

### gridcontent
- YAML: `themes/versla/common/particles/gridcontent.yaml`
- Twig: `themes/versla/common/particles/gridcontent.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_gridcontent.scss`

### gridstatistic
- YAML: `themes/versla/common/particles/gridstatistic.yaml`
- Twig: `themes/versla/common/particles/gridstatistic.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_gridstatistic.scss`

### imagegrid
- YAML: `themes/versla/common/particles/imagegrid.yaml`
- Twig: `themes/versla/common/particles/imagegrid.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_imagegrid.scss`

### infolist
- YAML: `themes/versla/common/particles/infolist.yaml`
- Twig: `themes/versla/common/particles/infolist.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_infolist.scss`

### mailchimp
- YAML: `themes/versla/common/particles/mailchimp.yaml`
- Twig: `themes/versla/common/particles/mailchimp.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_mailchimp.scss`

### newsletter
- YAML: `themes/versla/common/particles/newsletter.yaml`
- Twig: `themes/versla/common/particles/newsletter.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_newsletter.scss`

### popupmodule
- YAML: `themes/versla/common/particles/popupmodule.yaml`
- Twig: `themes/versla/common/particles/popupmodule.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/versla/common/particles/pricingtable.yaml`
- Twig: `themes/versla/common/particles/pricingtable.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_pricingtable.scss`

### productlist
- YAML: `themes/versla/common/particles/productlist.yaml`
- Twig: `themes/versla/common/particles/productlist.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_productlist.scss`

### shoppingcart
- YAML: `themes/versla/common/particles/shoppingcart.yaml`
- Twig: `themes/versla/common/particles/shoppingcart.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_shoppingcart.scss`

### simplecontent
- YAML: `themes/versla/common/particles/simplecontent.yaml`
- Twig: `themes/versla/common/particles/simplecontent.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/versla/common/particles/simplemenu.yaml`
- Twig: `themes/versla/common/particles/simplemenu.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_simplemenu.scss`

### simpleweather
- YAML: `themes/versla/common/particles/simpleweather.yaml`
- Twig: `themes/versla/common/particles/simpleweather.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_simpleweather.scss`

### swiper
- YAML: `themes/versla/common/particles/swiper.yaml`
- Twig: `themes/versla/common/particles/swiper.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_swiper.scss`

### swiperpreview
- YAML: `themes/versla/common/particles/swiperpreview.yaml`
- Twig: `themes/versla/common/particles/swiperpreview.html.twig`
- SCSS: _none_

### swipershowcase
- YAML: `themes/versla/common/particles/swipershowcase.yaml`
- Twig: `themes/versla/common/particles/swipershowcase.html.twig`
- SCSS: _none_

### videogrid
- YAML: `themes/versla/common/particles/videogrid.yaml`
- Twig: `themes/versla/common/particles/videogrid.html.twig`
- SCSS: `themes/versla/common/scss/versla/particles/_videogrid.scss`

## Theme: xenon

### aos
- YAML: `themes/xenon/common/particles/aos.yaml`
- Twig: `themes/xenon/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/xenon/common/particles/blockcontent.yaml`
- Twig: `themes/xenon/common/particles/blockcontent.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_blockcontent.scss`

### calendar
- YAML: `themes/xenon/common/particles/calendar.yaml`
- Twig: `themes/xenon/common/particles/calendar.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_calendar.scss`

### chartist
- YAML: `themes/xenon/common/particles/chartist.yaml`
- Twig: `themes/xenon/common/particles/chartist.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_chartist.scss`

### contact
- YAML: `themes/xenon/common/particles/contact.yaml`
- Twig: `themes/xenon/common/particles/contact.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_contact.scss`

### contentlist
- YAML: `themes/xenon/common/particles/contentlist.yaml`
- Twig: `themes/xenon/common/particles/contentlist.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_contentlist.scss`

### copyright
- YAML: `themes/xenon/common/particles/copyright.yaml`
- Twig: `themes/xenon/common/particles/copyright.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_copyright.scss`

### flexslider
- YAML: `themes/xenon/common/particles/flexslider.yaml`
- Twig: `themes/xenon/common/particles/flexslider.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_flexslider.scss`

### gridcontent
- YAML: `themes/xenon/common/particles/gridcontent.yaml`
- Twig: `themes/xenon/common/particles/gridcontent.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_gridcontent.scss`

### horizontalmenu
- YAML: `themes/xenon/common/particles/horizontalmenu.yaml`
- Twig: `themes/xenon/common/particles/horizontalmenu.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_horizontalmenu.scss`

### imagegrid
- YAML: `themes/xenon/common/particles/imagegrid.yaml`
- Twig: `themes/xenon/common/particles/imagegrid.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_imagegrid.scss`

### infolist
- YAML: `themes/xenon/common/particles/infolist.yaml`
- Twig: `themes/xenon/common/particles/infolist.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_infolist.scss`

### logo
- YAML: `themes/xenon/common/particles/logo.yaml`
- Twig: `themes/xenon/common/particles/logo.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_logo.scss`

### newsletter
- YAML: `themes/xenon/common/particles/newsletter.yaml`
- Twig: `themes/xenon/common/particles/newsletter.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_newsletter.scss`

### newsslider
- YAML: `themes/xenon/common/particles/newsslider.yaml`
- Twig: `themes/xenon/common/particles/newsslider.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_newsslider.scss`

### newsticker
- YAML: `themes/xenon/common/particles/newsticker.yaml`
- Twig: `themes/xenon/common/particles/newsticker.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_newsticker.scss`

### overlaytoggle
- YAML: `themes/xenon/common/particles/overlaytoggle.yaml`
- Twig: `themes/xenon/common/particles/overlaytoggle.html.twig`
- SCSS: _none_

### popupgrid
- YAML: `themes/xenon/common/particles/popupgrid.yaml`
- Twig: `themes/xenon/common/particles/popupgrid.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_popupgrid.scss`

### popupmodule
- YAML: `themes/xenon/common/particles/popupmodule.yaml`
- Twig: `themes/xenon/common/particles/popupmodule.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_popupmodule.scss`

### pricingtable
- YAML: `themes/xenon/common/particles/pricingtable.yaml`
- Twig: `themes/xenon/common/particles/pricingtable.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_pricingtable.scss`

### promocontent
- YAML: `themes/xenon/common/particles/promocontent.yaml`
- Twig: `themes/xenon/common/particles/promocontent.html.twig`
- SCSS: _none_

### promoimage
- YAML: `themes/xenon/common/particles/promoimage.yaml`
- Twig: `themes/xenon/common/particles/promoimage.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_promoimage.scss`

### swiper
- YAML: `themes/xenon/common/particles/swiper.yaml`
- Twig: `themes/xenon/common/particles/swiper.html.twig`
- SCSS: `themes/xenon/common/scss/xenon/_swiper.scss`

### testimonial
- YAML: `themes/xenon/common/particles/testimonial.yaml`
- Twig: `themes/xenon/common/particles/testimonial.html.twig`
- SCSS: _none_

## Theme: zenith

### aos
- YAML: `themes/zenith/common/particles/aos.yaml`
- Twig: `themes/zenith/common/particles/aos.html.twig`
- SCSS: _none_

### blockcontent
- YAML: `themes/zenith/common/particles/blockcontent.yaml`
- Twig: `themes/zenith/common/particles/blockcontent.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_blockcontent.scss`

### bookblock
- YAML: `themes/zenith/common/particles/bookblock.yaml`
- Twig: `themes/zenith/common/particles/bookblock.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_bookblock.scss`

### calendar
- YAML: `themes/zenith/common/particles/calendar.yaml`
- Twig: `themes/zenith/common/particles/calendar.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_calendar.scss`

### fixedheader
- YAML: `themes/zenith/common/particles/fixedheader.yaml`
- Twig: `themes/zenith/common/particles/fixedheader.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_fixedheader.scss`

### gridstatistic
- YAML: `themes/zenith/common/particles/gridstatistic.yaml`
- Twig: `themes/zenith/common/particles/gridstatistic.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_gridstatistic.scss`

### heading
- YAML: `themes/zenith/common/particles/heading.yaml`
- Twig: `themes/zenith/common/particles/heading.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_heading.scss`

### imagegrid
- YAML: `themes/zenith/common/particles/imagegrid.yaml`
- Twig: `themes/zenith/common/particles/imagegrid.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_imagegrid.scss`

### infolist
- YAML: `themes/zenith/common/particles/infolist.yaml`
- Twig: `themes/zenith/common/particles/infolist.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_infolist.scss`

### latestnews
- YAML: `themes/zenith/common/particles/latestnews.yaml`
- Twig: `themes/zenith/common/particles/latestnews.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_latestnews.scss`

### logo
- YAML: `themes/zenith/common/particles/logo.yaml`
- Twig: `themes/zenith/common/particles/logo.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/styles/_logo.scss`

### logos
- YAML: `themes/zenith/common/particles/logos.yaml`
- Twig: `themes/zenith/common/particles/logos.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_logos.scss`

### newsletter
- YAML: `themes/zenith/common/particles/newsletter.yaml`
- Twig: `themes/zenith/common/particles/newsletter.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_newsletter.scss`

### photocollage
- YAML: `themes/zenith/common/particles/photocollage.yaml`
- Twig: `themes/zenith/common/particles/photocollage.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_photocollage.scss`

### popupmodule
- YAML: `themes/zenith/common/particles/popupmodule.yaml`
- Twig: `themes/zenith/common/particles/popupmodule.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_popupmodule.scss`

### pricingtable
- YAML: `themes/zenith/common/particles/pricingtable.yaml`
- Twig: `themes/zenith/common/particles/pricingtable.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_pricingtable.scss`

### promo
- YAML: `themes/zenith/common/particles/promo.yaml`
- Twig: `themes/zenith/common/particles/promo.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_promo.scss`

### search
- YAML: `themes/zenith/common/particles/search.yaml`
- Twig: `themes/zenith/common/particles/search.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_search.scss`

### simplecontent
- YAML: `themes/zenith/common/particles/simplecontent.yaml`
- Twig: `themes/zenith/common/particles/simplecontent.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_simplecontent.scss`

### simplemenu
- YAML: `themes/zenith/common/particles/simplemenu.yaml`
- Twig: `themes/zenith/common/particles/simplemenu.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_simplemenu.scss`

### slideshow
- YAML: `themes/zenith/common/particles/slideshow.yaml`
- Twig: `themes/zenith/common/particles/slideshow.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_slideshow.scss`
- SCSS: `themes/zenith/common/scss/zenith/sections/_slideshow.scss`

### swiper
- YAML: `themes/zenith/common/particles/swiper.yaml`
- Twig: `themes/zenith/common/particles/swiper.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_swiper.scss`

### testimonials
- YAML: `themes/zenith/common/particles/testimonials.yaml`
- Twig: `themes/zenith/common/particles/testimonials.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_testimonials.scss`

### timeline
- YAML: `themes/zenith/common/particles/timeline.yaml`
- Twig: `themes/zenith/common/particles/timeline.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_timeline.scss`

### verticalmenu
- YAML: `themes/zenith/common/particles/verticalmenu.yaml`
- Twig: `themes/zenith/common/particles/verticalmenu.html.twig`
- SCSS: `themes/zenith/common/scss/zenith/particles/_verticalmenu.scss`

