import __module0 from '../../utils/dom-effects.js';
import __module1 from '../../utils/create-element.js';
import __module2 from '../../utils/dom.js';
import __module3 from '../../utils/frame-listener.js';
import __module4 from '../../utils/get-ajax-suffix.js';
import __module5 from '../../utils/get-ajax-url.js';
import __module6 from '../../ui/index.js';
import __module7 from '../../utils/async-foreach.js';
import __module8 from '../../utils/translate.js';
import __module9 from '../../utils/elements.viewport.js';

"use strict";
// fonts list: https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB2yJM8DBwt66u2MVRgb6M4t9CqkW7_IRY
let dom             = __module0,
    zen           = __module1,
    storage       = new WeakMap(),
    ready         = __module2.ready,

    frameListener = __module3,

    getAjaxSuffix = __module4,
    parseAjaxURI  = __module5.parse,
    getAjaxURL    = __module5.global,

    modal         = __module6.modal,
    asyncForEach  = __module7,
    translate     = __module8,
    inViewport    = __module9;

const fontVariantLoads = new Map();

const parseFontRequest = request => {
    const parts = request.replace(/\+/g, ' ').split(':');
    const family = parts.shift().trim();
    const variants = parts.length ? parts.join(':').split(',') : ['regular'];

    return variants.map((variant) => {
        const normalized = variant === 'regular' ? '400' : (variant === 'italic' ? '400italic' : variant);
        const match = normalized.match(/^([1-9]00)(italic)?$/);
        const weight = match ? match[1] : '400';
        const style = match && match[2] ? 'italic' : 'normal';

        return {
            family: family,
            fvd: `${style === 'italic' ? 'i' : 'n'}${Number(weight) / 100}`,
            key: `${family}:${weight}:${style}`,
            style: style,
            weight: weight
        };
    });
};

const loadStylesheet = requests => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    const families = requests.map(request => request.trim().replace(/\s+/g, '+')).join('|');
    const timeout = window.setTimeout(() => {
        link.remove();
        reject(new Error('Google Fonts stylesheet request timed out'));
    }, 10000);
    const complete = callback => {
        window.clearTimeout(timeout);
        callback();
    };

    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css?family=${families}&display=swap`;
    link.dataset.genesisFontRequest = families;
    link.addEventListener('load', () => complete(resolve), { once: true });
    link.addEventListener('error', () => complete(() => {
        link.remove();
        reject(new Error('Unable to load Google Fonts stylesheet'));
    }), { once: true });
    document.head.appendChild(link);
});

const loadGoogleFonts = (families, fontactive) => {
    const requests = [...new Set(families)];
    const variants = requests.flatMap(parseFontRequest);
    const pending = variants.filter(variant => !fontVariantLoads.has(variant.key));

    if (pending.length) {
        const stylesheet = loadStylesheet(requests);

        pending.forEach((variant) => {
            const font = `${variant.style} ${variant.weight} 16px "${variant.family}"`;
            const loaded = stylesheet.then(() => (
                document.fonts && document.fonts.load
                    ? document.fonts.load(font)
                    : Promise.resolve()
            )).catch((error) => {
                fontVariantLoads.delete(variant.key);
                throw error;
            });

            fontVariantLoads.set(variant.key, loaded);
        });
    }

    variants.forEach((variant) => {
        const loaded = fontVariantLoads.get(variant.key);
        if (!loaded) return;

        loaded
            .then(() => fontactive(variant.family, variant.fvd))
            .catch((error) => console.warn(`Unable to load font variant ${variant.family}.`, error));
    });
};

let removeValue = function(array, value) {
    let index;
    while ((index = array.indexOf(value)) !== -1) {
        array.splice(index, 1);
    }
    return array;
};

let insertUnique = function(array, value) {
    if (!array.includes(value)) { array.push(value); }
    return array;
};

let labelize = function(value) {
    return String(value).replace(/-/g, ' ').replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
};

class Fonts {
    constructor() {
        this.previewSentence = {
        'latin': 'Wizard boy Jack loves the grumpy Queen\'s fox.',
        'latin-ext': 'Wizard boy Jack loves the grumpy Queen\'s fox.',
        'arabic': 'نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر ومغلف بجلد أزرق',
        'cyrillic': 'В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!',
        'cyrillic-ext': 'В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!',
        'devanagari': 'एक पल का क्रोध आपका भविष्य बिगाड सकता है',
        'greek': 'Τάχιστη αλώπηξ βαφής ψημένη γη, δρασκελίζει υπέρ νωθρού κυνός',
        'greek-ext': 'Τάχιστη αλώπηξ βαφής ψημένη γη, δρασκελίζει υπέρ νωθρού κυνός',
        'hebrew': 'דג סקרן שט בים מאוכזב ולפתע מצא חברה',
        'khmer': 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន ដោយគ្មានបញ្ហា',
        'telugu': 'దేశ భాషలందు తెలుగు లెస్స',
        'vietnamese': 'Tôi có thể ăn thủy tinh mà không hại gì.'
        };
        this.field = null;
        this.element = null;
        this.throttle = false;
        this.selected = null;
        this.loadedFonts = [];
        this.filters = {
            search: '',
            script: 'latin',
            categories: []
        };
    }

    open(event, element) {
        let data = element.data('genesis-fontpicker');
        if (!data) {
            throw new Error('No fontpicker data found');
        }

        data = JSON.parse(data);
        this.field = dom(data.field);

        modal.open({
            content: translate('GENESIS_PLATFORM_JS_LOADING'),
            className: 'genesis-dialog-theme-default genesis-modal-fonts',
            remote: parseAjaxURI(getAjaxURL('fontpicker') + getAjaxSuffix()),
            remoteLoaded: function(response, content) {
                let container = content.elements.content;

                this.attachEvents(container);
                this.updateCategories(container);

                this.search();

                this.scroll(container.find('ul.g-fonts-list'));
                this.updateTotal();
                this.selectFromValue();

                setTimeout(function() {
                    container.find('.particle-search-wrapper input')[0].focus();
                }, 5);
            }.bind(this)
        });
    }

    scroll(container) {
        clearTimeout(this.throttle);
        this.throttle = setTimeout(function() {
            if (!container) {
                clearTimeout(this.throttle);
                return;
            }

            // 550 = container height, 5 = pages
            let viewport = container.find('ul.g-fonts-list') || container,
                elements = inViewport(viewport, '> li:not(.g-font-hide)', 550 * 7),
                list     = [];

            if (!elements) { return; }

            dom(elements).forEach(function(element) {
                element = dom(element);
                let dataFont = element.data('font'),
                    variant  = element.data('variant');

                if (!this.loadedFonts.includes(dataFont) && variant) {
                    list.push(dataFont + (variant != 'regular' ? ':' + variant : ''));
                }
                else {
                    if (variant) {
                        element.find('[data-variant="' + variant + '"] .preview').style({
                            fontFamily: dataFont,
                            fontWeight: variant == 'regular' ? 'normal' : variant
                        });
                    }
                }
            }, this);

            if (!list || !list.length) { return; }

            loadGoogleFonts(list, function(family, fvd) {
                container.find('li[data-font="' + family + '"]:not(.g-variant-hide) > .preview').style(
                    this.fvdToStyle(family, fvd)
                );
                insertUnique(this.loadedFonts, family);
            }.bind(this));
        }.bind(this), 100);
    }

    unselect(selected) {
        selected = selected || this.selected;
        if (!selected) { return false; }

        let baseVariant = selected.element.data('variant');
        selected.element.removeClass('selected');
        selected.element.search('input[type=checkbox]').checked(false);
        selected.element.search('[data-font]').addClass('g-variant-hide');
        selected.element.find('[data-variant="' + baseVariant + '"]').removeClass('g-variant-hide');
        selected.variants = [selected.baseVariant];
        selected.selected = [];
    }

    selectFromValue() {
        let value = this.field.value(), name, variants, subset, isLocal = false;

        if (!value.match('family=')) {
            let locals = dom('[data-category="local-fonts"][data-font]') || [], intersect;
            locals = locals.map(function(l) { return dom(l).data('font'); });
            value = value.replace(/(\s{1,})?,(\s{1,})?/gi, ',').split(',');
            intersect = locals.filter(function(font, index) {
                return value.includes(font) && locals.indexOf(font) === index;
            });
            if (!intersect.length) { return false; }

            isLocal = true;
            name = intersect.shift();
        } else {
            let split  = value.split('&'),
                family = split[0],
                split2 = family.split(':');

            name = split2[0].replace('family=', '').replace(/\+/g, ' ');
            variants = split2[1] ? split2[1].split(',') : ['regular'];
            subset = split[1] ? split[1].replace('subset=', '').split(',') : ['latin'];
        }

        let noConflict = isLocal ? '[data-category="local-fonts"]' : ':not([data-category="local-fonts"])',
            element = dom('ul.g-fonts-list > [data-font="' + name + '"]' + noConflict);
        variants = variants || element.data('variants').split(',') || ['regular'];

        if (variants.includes('400')) {
            removeValue(variants, '400');
            insertUnique(variants, 'regular');
        }

        if (variants.includes('400italic')) {
            removeValue(variants, '400italic');
            insertUnique(variants, 'italic');
        }

        this.selected = {
            font: name,
            baseVariant: element.data('variant'),
            element: element,
            variants: variants,
            selected: [],
            local: isLocal,
            charsets: subset,
            availableVariants: element.data('variants').split(','),
            expanded: isLocal,
            loaded: isLocal
        };

        (isLocal ? [name] : variants).forEach(function(variant) {
            this.select(element, variant);
            variant = element.find('> ul > [data-variant="' + variant + '"]');
            if (variant) { variant.removeClass('g-variant-hide'); }
        }, this);

        let charsetSelected = element.find('.font-charsets-selected');
        if (charsetSelected) {
            let subsetsLength = element.data('subsets').split(',').length;
            charsetSelected.html('(<i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span class="font-charsets-details">' + subset.length + ' of ' + subsetsLength + '</span> selected)');
        }

        if (!isLocal) { dom('ul.g-fonts-list')[0].scrollTop = element[0].offsetTop; }

        this.toggleExpansion();
        setTimeout(function() { this.toggleExpansion(); }.bind(this), 50);
        if (!isLocal) { setTimeout(function() { dom('ul.g-fonts-list')[0].scrollTop = element[0].offsetTop; }.bind(this), 250); }
    }

    select(element, variant/*, target*/) {
        let baseVariant = element.data('variant'),
            isLocal     = !baseVariant;

        if (!this.selected || this.selected.element != element) {
            if (variant && this.selected) {
                let charsetSelected = this.selected.element.find('.font-charsets-selected');
                if (charsetSelected) {
                    let subsetsLength = element.data('subsets').split(',').length;
                    charsetSelected.html('(<i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span class="font-charsets-details">1 of ' + subsetsLength + '</span> selected)');
                }
            }
            this.selected = {
                font: element.data('font'),
                baseVariant: baseVariant,
                element: element,
                variants: [baseVariant],
                selected: [],
                local: isLocal,
                charsets: ['latin'],
                availableVariants: element.data('variants').split(','),
                expanded: isLocal,
                loaded: isLocal
            };
        }

        if (!variant) {
            this.toggleExpansion();
        }


        if (variant || isLocal) {
            let selected = (dom('ul.g-fonts-list > [data-font]:not([data-font="' + this.selected.font + '"]) input[type="checkbox"]:checked'));
            if (selected) {
                selected.checked(false);
                selected.parent('[data-variants]').removeClass('font-selected');
            }
            let checkbox = this.selected.element.find('input[type="checkbox"][value="' + (isLocal ? this.selected.font : variant) + '"]'),
                checked  = checkbox.checked();
            if (checkbox) {
                checkbox.checked(!checked);
            }

            if (!checked) {
                insertUnique(this.selected.variants, variant);
                insertUnique(this.selected.selected, variant);
            } else {
                if (variant != this.selected.baseVariant) { removeValue(this.selected.variants, variant); }
                removeValue(this.selected.selected, variant);
            }

            this.updateSelection();
        }
    }

    toggleExpansion() {
        if (this.selected.availableVariants.length <= 1) { return; }
        if (this.selected.local) {
            this.selected.expanded = true;
            return;
        }

        if (!this.selected.expanded) {
            let variants = this.selected.element.data('variants'), variant;
            if (variants.split(',').length > 1) {
                this.selected.element.search('[data-font]').removeClass('g-variant-hide');

                if (!this.selected.loaded) {
                    loadGoogleFonts([this.selected.font.replace(/\s/g, '+') + ':' + variants], function(family, fvd) {
                        let style  = this.fvdToStyle(family, fvd),
                            search = style.fontWeight;

                        if (search == '400') {
                            search = style.fontStyle == 'normal' ? 'regular' : 'italic';
                        } else if (style.fontStyle == 'italic') {
                            search += 'italic';
                        }

                        this.selected.element.find('li[data-variant="' + search + '"] .preview').style(style);
                        this.selected.loaded = true;
                    }.bind(this));
                }
            }
        } else {
            let exclude = ':not([data-variant="' + this.selected.variants.join('"]):not([data-variant="') + '"])';
            exclude = this.selected.element.search('[data-font]' + exclude);
            if (exclude) { exclude.addClass('g-variant-hide'); }
        }

        this.selected.expanded = !this.selected.expanded;
    }

    toggle(event, element) {
        element = dom(element);
        let target = dom(event.target);

        if (target.attribute('type') == 'checkbox') {
            target.checked(!target.checked());
        }

        this.select(element.parent('[data-font]') || element, element.parent('[data-font]') ? element.data('variant') : false, element);

        return false;
    }

    updateSelection() {
        let preview = dom('.g-particles-footer .font-selected'), selected, variants;
        if (!preview) { return; }

        if (!this.selected.selected.length) {
            preview[0].replaceChildren();
            this.selected.element.removeClass('font-selected');
            return;
        }

        selected = this.selected.selected.sort();
        variants = this.selected.local ? '(<small>local</small>)' : '(<small>' + selected.join(', ').replace('regular', 'normal') + '</small>)';
        this.selected.element.addClass('font-selected');
        preview.html('<strong>' + this.selected.font + '</strong> ' + variants);
    }

    updateTotal() {
        let totals = dom('.g-particles-header .particle-search-total'),
            count  = dom('.g-fonts-list > [data-font]:not(.g-font-hide)');

        totals.text(count ? count.length : 0);
    }

    updateCategories(container) {
        let categories = container.find('[data-font-categories]');
        if (!categories) { return; }

        this.filters.categories = categories.data('font-categories').split(',');
    }

    attachEvents(container) {
        let header  = container.find('.g-particles-header'),
            list    = container.find('.g-fonts-list'),
            search  = header.find('input.font-search'),
            preview = header.find('input.font-preview');

        frameListener(list, 'scroll', this.scroll.bind(this, list));
        container.delegate('click', '.g-fonts-list li[data-font]', this.toggle.bind(this));

        if (search) { search.on('keyup', this.search.bind(this, search)); }
        if (preview) { preview.on('keyup', this.updatePreview.bind(this, preview)); }

        this.attachCharsets(container);
        this.attachLocalVariants(container);
        this.attachFooter(container);
    }

    attachCharsets(container) {
        container.delegate('mouseover', '.font-charsets-selected', function(event, element) {
            if (!element.PopoverDefined) {
                let popover = element.getPopover({
                    placement: 'auto',
                    width: '200',
                    trigger: 'mouse',
                    style: 'font-categories, above-modal'
                });

                element.on('beforeshow.popover', function(popover) {
                    let subsets = element.parent('[data-subsets]').data('subsets').split(','),
                        content = popover.$target.find('.genesis-popover-content'),
                        checked;

                    content[0].replaceChildren();

                    let div, current;
                    subsets.forEach(function(cs) {
                        current = this.selected.charsets.includes(cs) ? (cs == 'latin' ? 'checked disabled' : 'checked') : '';
                        zen('div').html('<label><input type="checkbox" ' + current + ' value="' + cs + '"/> ' + labelize(cs.replace('ext', 'extended')) + '</label>').bottom(content);
                    }, this);

                    content[0].querySelectorAll('input[type="checkbox"]').forEach(function(input) {
                        input.addEventListener('change', function() {
                            checked = content[0].querySelectorAll('input[type="checkbox"]:checked');
                            this.selected.charsets = Array.from(checked, function(item) { return item.value; });

                            element.html('(<i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span class="font-charsets-details">' + this.selected.charsets.length + ' of ' + subsets.length + '</span> selected)');
                        }.bind(this));
                    }, this);

                    popover.displayContent();
                }.bind(this));

                element.getPopover().show();
            }
        }.bind(this));
    }

    attachLocalVariants(container) {
        container.delegate('mouseover', '.g-font-variants-list', function(event, element) {
            if (!element.PopoverDefined) {
                let popover = element.getPopover({
                    placement: 'auto',
                    width: '200',
                    trigger: 'mouse',
                    style: 'font-categories, above-modal'
                });

                element.on('beforeshow.popover', function(popover) {
                    let content  = popover.$target.find('.genesis-popover-content'),
                        variants = element.parent('[data-variants]').data('variants').split(',');

                    content[0].replaceChildren();

                    asyncForEach(variants, function(variant) {
                        variant = variant == '400' ? 'regular' : (variant == '400italic' ? 'italic' : variant + '');
                        zen('div').text(this.mapVariant(variant)).bottom(content);
                    }.bind(this));

                    popover.displayContent();
                }.bind(this));
            }
        }.bind(this));
    }

    attachFooter(container) {
        let footer     = container.find('.g-particles-footer'),
            select     = footer.find('button.button-primary'),
            categories = footer.find('.font-category'),
            subsets    = footer.find('.font-subsets'),
            current;

        select.on('click', function() {
            if (!dom('ul.g-fonts-list > [data-font] input[type="checkbox"]:checked')) {
                this.field.value('');
                modal.close();
                return;
            }

            let name      = this.selected.font.replace(/\s/g, '+'),
                variation = this.selected.selected,
                charset   = this.selected.charsets;

            if (variation && variation.length == 1 && variation[0] == 'regular') { variation = []; }
            if (charset && charset.length == 1 && charset[0] == 'latin') { charset = []; }

            if (variation.includes('regular')) {
                removeValue(variation, 'regular');
                insertUnique(variation, '400');
            }
            if (variation.includes('italic')) {
                removeValue(variation, 'italic');
                insertUnique(variation, '400italic');
            }

            if (!this.selected.local) {
                this.field.value('family=' + name + (variation.length ? ':' + variation.join(',') : '') + (charset.length ? '&subset=' + charset.join(',') : ''));
            } else {
                this.field.value(name);
            }

            this.field.emit('input');
            dom('body').emit('input', { target: this.field });

            modal.close();
        }.bind(this));

        categories.popover({
            placement: 'top',
            width: '200',
            trigger: 'mouse',
            style: 'font-categories, above-modal'
        }).on('beforeshow.popover', function(popover) {
            let cats    = categories.data('font-categories').split(','),
                content = popover.$target.find('.genesis-popover-content'),
                checked;

            content[0].replaceChildren();

            cats.forEach(function(category) {
                if (category == 'local-fonts') { return; }
                current = this.filters.categories.includes(category) ? 'checked' : '';
                zen('div').html('<label><input type="checkbox" ' + current + ' value="' + category + '"/> ' + labelize(category) + '</label>').bottom(content);
            }, this);

            content[0].querySelectorAll('input[type="checkbox"]').forEach(function(input) {
                input.addEventListener('change', function() {
                    checked = content[0].querySelectorAll('input[type="checkbox"]:checked');
                    this.filters.categories = Array.from(checked, function(item) { return item.value; });
                    categories.find('small').text(this.filters.categories.length);
                    this.search();
                }.bind(this));
            }, this);

            popover.displayContent();
        }.bind(this));

        subsets.popover({
            placement: 'top',
            width: '200',
            trigger: 'mouse',
            style: 'font-subsets, above-modal'
        }).on('beforeshow.popover', function(popover) {
            let subs    = subsets.data('font-subsets').split(','),
                content = popover.$target.find('.genesis-popover-content');

            content[0].replaceChildren();

            let div;
            subs.forEach(function(sub) {
                current = sub == this.filters.script ? 'checked' : '';
                zen('div').html('<label><input name="font-subset[]" type="radio" ' + current + ' value="' + sub + '"/> ' + labelize(sub.replace('ext', 'extended')) + '</label>').bottom(content);
            }, this);

            content[0].querySelectorAll('input[type="radio"]').forEach(function(input) {
                input.addEventListener('change', function() {
                    this.filters.script = input.value;
                    dom('.g-particles-header input.font-preview').value(this.previewSentence[this.filters.script]);
                    subsets.find('small').text(labelize(input.value.replace('ext', 'extended')));
                    this.search();
                    this.updatePreview();
                }.bind(this));
            }, this);

            popover.displayContent();
        }.bind(this));

        return container;
    }

    search(input) {
        input = input || dom('.g-particles-header input.font-search');
        let list  = dom('.g-fonts-list'),
            value = input.value(),
            name, subsets, category, data;

        list.search('> [data-font]').forEach(function(font) {
            font = dom(font);
            name = font.data('font');
            subsets = font.data('subsets').split(',');
            category = font.data('category');
            font.removeClass('g-font-hide');

            // We dont want to hide selected fonts
            if (this.selected && this.selected.font == name && this.selected.selected.length) { return; }

            // Filter by Subset
            if (!subsets.includes(this.filters.script)) {
                font.addClass('g-font-hide');
                return;
            }

            // Filter by Category
            if (!this.filters.categories.includes(category)) {
                font.addClass('g-font-hide');
                return;
            }

            // Filter by Name
            if (!name.match(new RegExp("^" + value + '|\\s' + value, 'gi'))) {
                font.addClass('g-font-hide');
            } else {
                font.removeClass('g-font-hide');
            }
        }, this);

        this.updateTotal();

        clearTimeout(input.refreshTimer);

        input.refreshTimer = setTimeout(function() {
            this.scroll(dom('ul.g-fonts-list'));
        }.bind(this), 400);

        input.previousValue = value;
    }

    updatePreview(input) {
        input = input || dom('.g-particles-header input.font-preview');

        clearTimeout(input.refreshTimer);

        let value = input.value(),
            list  = dom('.g-fonts-list');

        value = String(value || '').trim() || this.previewSentence[this.filters.script];

        if (input.previousValue == value) { return true; }

        list.search('[data-font] .preview').text(value);

        input.previousValue = value;
    }

    fvdToStyle(family, fvd) {
        let match = fvd.match(/([a-z])([0-9])/);
        if (!match) return '';

        let styleMap = {
            n: 'normal',
            i: 'italic',
            o: 'oblique'
        };
        return {
            fontFamily: family,
            fontStyle: styleMap[match[1]],
            fontWeight: (match[2] * 100).toString()
        }
    }

    mapVariant(variant) {
        switch (variant) {
            case '100':
                return 'Thin 100';
                break;
            case '100italic':
                return 'Thin 100 Italic';
                break;
            case '200':
                return 'Extra-Light 200';
                break;
            case '200italic':
                return 'Extra-Light 200 Italic';
                break;
            case '300':
                return 'Light 300';
                break;
            case '300italic':
                return 'Light 300 Italic';
                break;
            case '400':
            case 'regular':
                return 'Normal 400';
                break;
            case '400italic':
            case 'italic':
                return 'Normal 400 Italic';
                break;
            case '500':
                return 'Medium 500';
                break;
            case '500italic':
                return 'Medium 500 Italic';
                break;
            case '600':
                return 'Semi-Bold 600';
                break;
            case '600italic':
                return 'Semi-Bold 600 Italic';
                break;
            case '700':
                return 'Bold 700';
                break;
            case '700italic':
                return 'Bold 700 Italic';
                break;
            case '800':
                return 'Extra-Bold 800';
                break;
            case '800italic':
                return 'Extra-Bold 800 Italic';
                break;
            case '900':
                return 'Ultra-Bold 900';
                break;
            case '900italic':
                return 'Ultra-Bold 900 Italic';
                break;
            default:
                return 'Unknown Variant';
        }
    }
}

ready(function() {
    let body = dom('body');
    body.delegate('click', '[data-genesis-fontpicker]', function(event, element) {
        if (event && event.preventDefault) { event.preventDefault(); }
        let node = element[0],
            FontPicker = storage.get(node);
        if (!FontPicker) {
            FontPicker = new Fonts();
            storage.set(node, FontPicker);
        }

        FontPicker.open(event, element);
    });
});

export default Fonts;
