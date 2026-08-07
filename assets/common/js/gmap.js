(() => {
    'use strict';
    const instances = new WeakSet(), loaders = new Map(), loadedFonts = new Set();
    const loadGoogleMaps = apiKey => {
        if (window.google?.maps) return Promise.resolve(window.google.maps);
        if (loaders.has(apiKey)) return loaders.get(apiKey);
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
            script.async = true; script.defer = true;
            script.addEventListener('load', () => window.google?.maps ? resolve(window.google.maps) : reject(new Error('Google Maps API unavailable')), {once: true});
            script.addEventListener('error', () => reject(new Error('Google Maps API failed to load')), {once: true});
            document.head.append(script);
        });
        loaders.set(apiKey, promise); return promise;
    };
    const applyFont = root => { const font = String(root.dataset.titleFont || '').trim(); if (!font) return; let family = font; if (font.startsWith('family=')) { const params = new URLSearchParams(font); family = (params.get('family') || '').replace(/\+/g, ' ').split(':')[0]; const href = `https://fonts.googleapis.com/css?${font}`; if (family && !loadedFonts.has(href)) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.append(link); loadedFonts.add(href); } } const title = root.closest('.g-gmap')?.querySelector('.g-gmap-title'); if (title && family) title.style.fontFamily = `'${family.replace(/'/g, "\\'")}'`; };
    const fail = (root, error) => { root.classList.add('has-error'); root.querySelector('.g-gmap-status').textContent = root.dataset.errorText || error.message; console.error('[Google Map particle]', error); };
    const initMap = async root => {
        if (instances.has(root)) return; instances.add(root); applyFont(root);
        const apiKey = String(root.dataset.apiKey || '').trim(); if (!apiKey) { fail(root, new Error('A Google Maps API key is required.')); return; }
        try {
            const maps = await loadGoogleMaps(apiKey), lat = Number(root.dataset.lat), lng = Number(root.dataset.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('The primary latitude or longitude is invalid.');
            let styles; const stylesNode = root.querySelector('.g-gmap-styles'); if (stylesNode?.textContent.trim()) { try { styles = JSON.parse(stylesNode.textContent); } catch (error) { console.warn('[Google Map particle] Invalid styles JSON.', error); } }
            const map = new maps.Map(root.querySelector('.g-gmap-canvas'), {center: {lat, lng}, zoom: Math.max(0, +(root.dataset.zoom || 14)), mapTypeId: String(root.dataset.mapType || 'ROADMAP').toLowerCase(), scrollwheel: root.dataset.scroll === 'enable', disableDefaultUI: root.dataset.controls !== 'enable', draggable: root.dataset.draggable === 'enable', keyboardShortcuts: root.dataset.keyboard === 'enable', styles});
            const bounds = new maps.LatLngBounds(), info = new maps.InfoWindow(); let count = 0;
            root.querySelectorAll('.g-gmap-marker').forEach(node => { const position = {lat: Number(node.dataset.lat), lng: Number(node.dataset.lng)}; if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return; const marker = new maps.Marker({position, map, icon: node.dataset.icon || undefined, title: node.querySelector('template')?.content.textContent.trim() || undefined}); const content = node.querySelector('template')?.innerHTML.trim(); if (content) marker.addListener('click', () => { info.setContent(content); info.open({map, anchor: marker}); }); bounds.extend(position); count += 1; });
            if (root.dataset.fitBounds === 'enable' && count > 1) map.fitBounds(bounds); root.classList.add('is-ready');
        } catch (error) { fail(root, error); }
    };
    const init = (scope = document) => { const roots = scope.matches?.('[data-gmap]') ? [scope] : scope.querySelectorAll?.('[data-gmap]') || []; roots.forEach(initMap); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => init(), {once: true}) : init();
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => node.nodeType === 1 && init(node)))).observe(document.documentElement, {childList: true, subtree: true});
})();
