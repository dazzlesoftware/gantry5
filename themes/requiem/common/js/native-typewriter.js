(() => {
    'use strict';

    class NativeTypewriter {
        constructor(target, options = {}) {
            this.target = typeof target === 'string' ? document.querySelector(target) : target;
            this.options = {
                typeSpeed: 20,
                backSpeed: 20,
                startDelay: 500,
                backDelay: 700,
                ...options
            };
            const source = typeof this.options.stringsElement === 'string'
                ? document.querySelector(this.options.stringsElement)
                : this.options.stringsElement;
            this.strings = [...source?.children || []].map((element) => element.innerHTML.trim());

            if (!this.target || !this.strings.length) return;
            source.hidden = true;

            if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.target.innerHTML = this.strings.at(-1);
                return;
            }

            this.cursor = document.createElement('span');
            this.cursor.className = 'native-typewriter-cursor';
            this.cursor.textContent = '|';
            this.target.after(this.cursor);
            this.addStyles();
            setTimeout(() => this.type(0, 0), this.options.startDelay);
        }

        addStyles() {
            if (document.querySelector('[data-native-typewriter-css]')) return;
            const style = document.createElement('style');
            style.dataset.nativeTypewriterCss = '';
            style.textContent = '.native-typewriter-cursor{animation:native-typewriter-blink .7s infinite}@keyframes native-typewriter-blink{50%{opacity:0}}';
            document.head.append(style);
        }

        render(html, length) {
            const template = document.createElement('template');
            template.innerHTML = html;
            const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
            let remaining = length;
            let node;

            while ((node = walker.nextNode())) {
                const text = node.textContent;
                node.textContent = remaining > 0 ? text.slice(0, remaining) : '';
                remaining -= text.length;
            }

            this.target.replaceChildren(template.content.cloneNode(true));
        }

        type(stringIndex, length) {
            const html = this.strings[stringIndex];
            const textLength = new DOMParser().parseFromString(html, 'text/html').body.textContent.length;
            this.render(html, length);

            if (length < textLength) {
                setTimeout(() => this.type(stringIndex, length + 1), this.options.typeSpeed);
            } else if (stringIndex < this.strings.length - 1) {
                setTimeout(() => this.erase(stringIndex, length), this.options.backDelay);
            }
        }

        erase(stringIndex, length) {
            this.render(this.strings[stringIndex], length);

            if (length > 0) {
                setTimeout(() => this.erase(stringIndex, length - 1), this.options.backSpeed);
            } else {
                this.type(stringIndex + 1, 0);
            }
        }
    }

    window.NativeTypewriter = NativeTypewriter;
})();
