# Theme JavaScript Asset Register

**Status:** Phase 3 and Phase 4 reviewed set  
**Reviewed:** August 4, 2026

This register covers specialist runtimes intentionally retained after removing theme compatibility files and consolidating repeated first-party controllers. Theme-local files not listed here are unique first-party controllers tied to one particle or one markup contract.

| Runtime | Version/source | Deployment | Active consumer and decision |
|---|---|---|---|
| Swiper | 14.0.7, `swiper` npm package, MIT | `assets/common/js/swiper.js` | Shared carousel runtime for recovered theme sliders and core Swiper Carousel. Upgraded from copied Swiper 5.4.5 bundles. `swiper-legacy-init.js` maps the preserved `data-swiper-*` schema to the shared constructor. |
| Headroom | 0.10.3, headroom.js, MIT | `assets/common/js/headroom.min.js` | Fixed Header particle variants. Retained because the particles depend on its pin/unpin state machine; 34 copied files became one shared runtime. |
| Native particle field | Genesis ES6+ replacement | `assets/common/js/particles.min.js` | Acronym and Akuatik `particlesjs` particles. Replaces two copied particles.js runtimes while preserving the `particlesJS(id, configuration)` entry point used by saved particle markup. |
| Legacy Chart API | Chart.js 1.x-compatible recovered runtime, MIT | `assets/common/js/chart.js` | Saved demo/custom HTML uses `new Chart(context).Line(...)` and `.Bar(...)`. Retained as a shared compatibility runtime because replacing it would require migrating stored inline chart configuration. Eight identical copies became one shared asset. |
| Chartist | Recovered Chartist runtime, MIT | `themes/xenon/common/js/chartist.js` | Xenon `chartist` particle only. Retained as a specialist SVG chart renderer; it has no duplicate runtime. |
| Charming | Recovered Charming text-splitting runtime, MIT | `themes/calla/common/js/charming.min.js` | Calla Springboard tooltips only. The unreferenced Reiko copy was removed. |

Removed compatibility/runtime families: Modernizr 2.x builds, Classie, FastClick, Tiny Scrollbar, copied Length conversion, copied Swiper 5 bundles, copied smooth-scroll, and obsolete Microsoft/IE branches. Their active behavior now uses feature detection, `classList`, Pointer Events, native overflow, native smooth scrolling, or a shared maintained controller.

Shared first-party controllers use `genesis-assets://js/...`, guard repeated initialization with data attributes or instance maps, and observe inserted DOM where the particle can be introduced dynamically. Theme-local controllers remain only where markup or configuration differs.
