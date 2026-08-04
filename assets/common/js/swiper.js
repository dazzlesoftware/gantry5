(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // assets/common/node_modules/swiper/shared/utils.mjs
  function classesToTokens(classes2 = "") {
    return classes2.trim().split(" ").filter((c) => !!c.trim());
  }
  function deleteProps(obj) {
    Object.keys(obj).forEach((key) => {
      try {
        obj[key] = null;
      } catch (e) {
      }
      try {
        delete obj[key];
      } catch (e) {
      }
    });
  }
  function nextTick(callback, delay = 0) {
    return setTimeout(callback, delay);
  }
  function now() {
    return Date.now();
  }
  function getComputedStyle2(el) {
    return window.getComputedStyle(el, null);
  }
  function getTranslate(el, axis = "x") {
    const style = getComputedStyle2(el);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === "none")
      return 0;
    const matrix = new DOMMatrixReadOnly(transform);
    return axis === "x" ? matrix.m41 : matrix.m42;
  }
  function isObject(o) {
    return typeof o === "object" && o !== null && o.constructor === Object && Object.prototype.toString.call(o).slice(8, -1) === "Object";
  }
  function isNode(node) {
    if (typeof HTMLElement !== "undefined" && node instanceof HTMLElement)
      return true;
    return !!node && typeof node === "object" && (node.nodeType === 1 || node.nodeType === 11);
  }
  function extend(target, ...sources) {
    const to = Object(target);
    for (let i = 0; i < sources.length; i += 1) {
      const nextSource = sources[i];
      if (nextSource === void 0 || nextSource === null || isNode(nextSource))
        continue;
      const sourceObj = nextSource;
      const keysArray = Object.keys(Object(sourceObj)).filter((key) => key !== "__proto__" && key !== "constructor" && key !== "prototype");
      for (const nextKey of keysArray) {
        const desc = Object.getOwnPropertyDescriptor(sourceObj, nextKey);
        if (!desc || !desc.enumerable)
          continue;
        const sourceVal = sourceObj[nextKey];
        if (isObject(to[nextKey]) && isObject(sourceVal)) {
          if (sourceVal.__swiper__) {
            to[nextKey] = sourceVal;
          } else {
            extend(to[nextKey], sourceVal);
          }
        } else if (!isObject(to[nextKey]) && isObject(sourceVal)) {
          to[nextKey] = {};
          if (sourceVal.__swiper__) {
            to[nextKey] = sourceVal;
          } else {
            extend(to[nextKey], sourceVal);
          }
        } else {
          to[nextKey] = sourceVal;
        }
      }
    }
    return to;
  }
  function setCSSProperty(el, varName, varValue) {
    el.style.setProperty(varName, varValue);
  }
  function getSlideTransformEl(slideEl) {
    const direct = slideEl.querySelector(".swiper-slide-transform");
    if (direct)
      return direct;
    if (slideEl.shadowRoot) {
      const shadowed = slideEl.shadowRoot.querySelector(".swiper-slide-transform");
      if (shadowed)
        return shadowed;
    }
    return slideEl;
  }
  function elementChildren(element, selector2 = "") {
    const children = [...element.children];
    if (element instanceof HTMLSlotElement) {
      children.push(...element.assignedElements());
    }
    return selector2 ? children.filter((el) => el.matches(selector2)) : children;
  }
  function elementIsChildOfSlot(el, slot) {
    const queue = [slot];
    while (queue.length > 0) {
      const cur = queue.shift();
      if (el === cur)
        return true;
      queue.push(...cur.children, ...cur.shadowRoot ? cur.shadowRoot.children : [], ...cur.assignedElements ? cur.assignedElements() : []);
    }
    return false;
  }
  function elementIsChildOf(el, parent) {
    let isChild = parent.contains(el);
    if (!isChild && parent instanceof HTMLSlotElement) {
      const children = [...parent.assignedElements()];
      isChild = children.includes(el);
      if (!isChild)
        isChild = elementIsChildOfSlot(el, parent);
    }
    return isChild;
  }
  function showWarning(text) {
    try {
      console.warn(text);
    } catch (e) {
    }
  }
  function createElement(tag, classes2 = []) {
    const el = document.createElement(tag);
    el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
    return el;
  }
  function elementOffset(el) {
    const box = el.getBoundingClientRect();
    return {
      top: box.top + window.scrollY - (el.clientTop || 0),
      left: box.left + window.scrollX - (el.clientLeft || 0)
    };
  }
  function elementPrevAll(el, selector2) {
    const prevEls = [];
    let prev = el.previousElementSibling;
    while (prev) {
      if (!selector2 || prev.matches(selector2))
        prevEls.push(prev);
      prev = prev.previousElementSibling;
    }
    return prevEls;
  }
  function elementNextAll(el, selector2) {
    const nextEls = [];
    let next = el.nextElementSibling;
    while (next) {
      if (!selector2 || next.matches(selector2))
        nextEls.push(next);
      next = next.nextElementSibling;
    }
    return nextEls;
  }
  function elementStyle(el, prop) {
    return window.getComputedStyle(el, null).getPropertyValue(prop);
  }
  function elementIndex(el) {
    if (!el || !el.parentNode)
      return void 0;
    return [...el.parentNode.children].indexOf(el);
  }
  function elementParents(el, selector2) {
    const parents = [];
    let parent = el.parentElement;
    while (parent) {
      if (!selector2 || parent.matches(selector2))
        parents.push(parent);
      parent = parent.parentElement;
    }
    return parents;
  }
  function elementTransitionEnd(el, callback) {
    if (!callback)
      return;
    el.addEventListener("transitionend", function fireCallBack(e) {
      if (e.target !== el)
        return;
      callback.call(el, e);
    }, { once: true });
  }
  function elementOuterSize(el, size, includeMargins) {
    {
      const style = window.getComputedStyle(el, null);
      return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(style.getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(style.getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
    }
  }
  function makeElementsArray(el) {
    return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
  }
  function setInnerHTML(el, html = "") {
    const tt = globalThis.trustedTypes;
    if (typeof tt !== "undefined") {
      el.innerHTML = tt.createPolicy("html", { createHTML: (s) => s }).createHTML(html);
    } else {
      el.innerHTML = html;
    }
  }

  // assets/common/node_modules/swiper/shared/swiper-core.mjs
  var supportCached;
  function calcSupport() {
    if (typeof window === "undefined")
      return { touch: false };
    return {
      touch: "ontouchstart" in window || navigator.maxTouchPoints > 0
    };
  }
  function getSupport() {
    if (!supportCached)
      supportCached = calcSupport();
    return supportCached;
  }
  var deviceCached;
  function calcDevice({ userAgent } = {}) {
    if (typeof window === "undefined")
      return { ios: false, android: false };
    const support = getSupport();
    const platform = navigator.platform;
    const ua = userAgent || navigator.userAgent;
    const device = { ios: false, android: false };
    const isAndroid = /(Android);?[\s/]+([\d.]+)?/.test(ua);
    const isIPhoneOrIPod = /(iPhone\sOS|iOS|iPod)/.test(ua);
    const isIPadDirect = /iPad/.test(ua);
    const isIPadMasquerade = platform === "MacIntel" && support.touch && navigator.maxTouchPoints > 1;
    const isIPad = isIPadDirect || isIPadMasquerade;
    const isWindows = platform === "Win32";
    if (isAndroid && !isWindows) {
      device.os = "android";
      device.android = true;
    }
    if (isIPad || isIPhoneOrIPod) {
      device.os = "ios";
      device.ios = true;
    }
    return device;
  }
  function getDevice(overrides = {}) {
    if (!deviceCached)
      deviceCached = calcDevice(overrides);
    return deviceCached;
  }
  var browserCached;
  function calcBrowser() {
    if (typeof window === "undefined") {
      return { isSafari: false, isWebView: false, need3dFix: false };
    }
    const device = getDevice();
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();
    const isSafari = uaLower.includes("safari") && !uaLower.includes("chrome") && !uaLower.includes("android");
    const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
    const need3dFix = isSafari || isWebView && device.ios;
    return { isSafari, isWebView, need3dFix };
  }
  function getBrowser() {
    if (!browserCached)
      browserCached = calcBrowser();
    return browserCached;
  }
  var processLazyPreloader = (swiper, imageEl) => {
    if (!swiper || swiper.destroyed || !swiper.params)
      return;
    const slideSelector = () => swiper.isElement ? "swiper-slide" : `.${swiper.params.slideClass}`;
    const slideEl = imageEl.closest(slideSelector());
    if (slideEl) {
      let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
      if (!lazyEl && swiper.isElement) {
        if (slideEl.shadowRoot) {
          lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
        } else {
          requestAnimationFrame(() => {
            if (slideEl.shadowRoot) {
              const innerLazy = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
              if (innerLazy && !innerLazy.lazyPreloaderManaged)
                innerLazy.remove();
            }
          });
        }
      }
      if (lazyEl && !lazyEl.lazyPreloaderManaged)
        lazyEl.remove();
    }
  };
  var unlazy = (swiper, index) => {
    if (!swiper.slides[index])
      return;
    const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
    if (imageEl)
      imageEl.removeAttribute("loading");
  };
  var preload = (swiper) => {
    var _a;
    if (!swiper || swiper.destroyed || !swiper.params)
      return;
    let amount = swiper.params.lazyPreloadPrevNext;
    const len = swiper.slides.length;
    if (!len || !amount || amount < 0)
      return;
    amount = Math.min(amount, len);
    const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
    const activeIndex = swiper.activeIndex;
    if (swiper.params.grid && ((_a = swiper.params.grid.rows) != null ? _a : 1) > 1) {
      const activeColumn = activeIndex;
      const preloadColumns = [activeColumn - amount];
      preloadColumns.push(...Array.from({ length: amount }).map((_, i) => activeColumn + slidesPerView + i));
      swiper.slides.forEach((slideEl, i) => {
        if (slideEl.column !== void 0 && preloadColumns.includes(slideEl.column))
          unlazy(swiper, i);
      });
      return;
    }
    const slideIndexLastInView = activeIndex + slidesPerView - 1;
    if (swiper.params.rewind || swiper.params.loop) {
      for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
        const realIndex = (i % len + len) % len;
        if (realIndex < activeIndex || realIndex > slideIndexLastInView)
          unlazy(swiper, realIndex);
      }
    } else {
      for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
        if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
          unlazy(swiper, i);
        }
      }
    }
  };
  function getBreakpoint(breakpoints2, base = "window", containerEl) {
    if (!breakpoints2 || base === "container" && !containerEl)
      return void 0;
    let breakpoint = false;
    const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
    const points = Object.keys(breakpoints2).map((point) => {
      if (typeof point === "string" && point.indexOf("@") === 0) {
        const minRatio = parseFloat(point.substr(1));
        const value = currentHeight * minRatio;
        return { value, point };
      }
      return { value: point, point };
    });
    points.sort((a, b) => parseInt(String(a.value), 10) - parseInt(String(b.value), 10));
    for (let i = 0; i < points.length; i += 1) {
      const { point, value } = points[i];
      if (base === "window") {
        if (window.matchMedia(`(min-width: ${value}px)`).matches) {
          breakpoint = point;
        }
      } else if (value <= containerEl.clientWidth) {
        breakpoint = point;
      }
    }
    return breakpoint || "max";
  }
  var isGridEnabled = (swiper, params) => {
    return !!(swiper.grid && params.grid && params.grid.rows > 1);
  };
  function setBreakpoint() {
    const swiper = this;
    const { realIndex, initialized, params, el } = swiper;
    const breakpoints2 = params.breakpoints;
    if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0)
      return;
    const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
    const breakpointContainer = ["window", "container"].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document.querySelector(params.breakpointsBase);
    const breakpoint = swiper.getBreakpoint(breakpoints2, breakpointsBase, breakpointContainer);
    if (!breakpoint || swiper.currentBreakpoint === breakpoint)
      return;
    const breakpointsRecord = breakpoints2;
    const breakpointOnlyParams = breakpoint in breakpointsRecord ? breakpointsRecord[breakpoint] : void 0;
    const breakpointParams = breakpointOnlyParams || swiper.originalParams;
    const wasMultiRow = isGridEnabled(swiper, params);
    const isMultiRow = isGridEnabled(swiper, breakpointParams);
    const wasGrabCursor = swiper.params.grabCursor;
    const isGrabCursor = breakpointParams.grabCursor;
    const wasEnabled = params.enabled;
    if (wasMultiRow && !isMultiRow) {
      el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
      swiper.emitContainerClasses();
    } else if (!wasMultiRow && isMultiRow) {
      el.classList.add(`${params.containerModifierClass}grid`);
      if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
        el.classList.add(`${params.containerModifierClass}grid-column`);
      }
      swiper.emitContainerClasses();
    }
    if (wasGrabCursor && !isGrabCursor) {
      swiper.unsetGrabCursor();
    } else if (!wasGrabCursor && isGrabCursor) {
      swiper.setGrabCursor();
    }
    const moduleOpt = (opts, prop) => opts[prop];
    ["navigation", "pagination", "scrollbar"].forEach((prop) => {
      var _a, _b;
      const bpOpts = moduleOpt(breakpointParams, prop);
      if (typeof bpOpts === "undefined")
        return;
      const paramsOpts = moduleOpt(params, prop);
      const wasModuleEnabled = typeof paramsOpts === "object" && paramsOpts !== null && paramsOpts.enabled;
      const isModuleEnabled = typeof bpOpts === "object" && bpOpts !== null && bpOpts.enabled;
      const moduleApi = swiper[prop];
      if (wasModuleEnabled && !isModuleEnabled)
        (_a = moduleApi == null ? void 0 : moduleApi.disable) == null ? void 0 : _a.call(moduleApi);
      if (!wasModuleEnabled && isModuleEnabled)
        (_b = moduleApi == null ? void 0 : moduleApi.enable) == null ? void 0 : _b.call(moduleApi);
    });
    const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
    const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
    const wasLoop = params.loop;
    if (directionChanged && initialized) {
      swiper.changeDirection();
    }
    extend(swiper.params, breakpointParams);
    const isEnabled = swiper.params.enabled;
    const hasLoop = swiper.params.loop;
    Object.assign(swiper, {
      allowTouchMove: swiper.params.allowTouchMove,
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev
    });
    if (wasEnabled && !isEnabled) {
      swiper.disable();
    } else if (!wasEnabled && isEnabled) {
      swiper.enable();
    }
    swiper.currentBreakpoint = breakpoint;
    swiper.emit("_beforeBreakpoint", breakpointParams);
    if (initialized) {
      if (needsReLoop) {
        swiper.loopDestroy();
        swiper.loopCreate(realIndex);
        swiper.updateSlides();
      } else if (!wasLoop && hasLoop) {
        swiper.loopCreate(realIndex);
        swiper.updateSlides();
      } else if (wasLoop && !hasLoop) {
        swiper.loopDestroy();
      }
    }
    swiper.emit("breakpoint", breakpointParams);
  }
  var breakpoints = { setBreakpoint, getBreakpoint };
  function checkOverflow() {
    const swiper = this;
    const { isLocked: wasLocked, params } = swiper;
    const { slidesOffsetBefore } = params;
    if (slidesOffsetBefore) {
      const lastSlideIndex = swiper.slides.length - 1;
      const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
      swiper.isLocked = swiper.size > lastSlideRightEdge;
    } else {
      swiper.isLocked = swiper.snapGrid.length === 1;
    }
    if (params.allowSlideNext === true) {
      swiper.allowSlideNext = !swiper.isLocked;
    }
    if (params.allowSlidePrev === true) {
      swiper.allowSlidePrev = !swiper.isLocked;
    }
    if (wasLocked && wasLocked !== swiper.isLocked) {
      swiper.isEnd = false;
    }
    if (wasLocked !== swiper.isLocked) {
      swiper.emit(swiper.isLocked ? "lock" : "unlock");
    }
  }
  var checkOverflow$1 = { checkOverflow };
  function prepareClasses(entries, prefix) {
    const resultClasses = [];
    entries.forEach((item) => {
      if (typeof item === "object") {
        Object.keys(item).forEach((classNames) => {
          if (item[classNames]) {
            resultClasses.push(prefix + classNames);
          }
        });
      } else if (typeof item === "string") {
        resultClasses.push(prefix + item);
      }
    });
    return resultClasses;
  }
  function addClasses() {
    const swiper = this;
    const { classNames, params, rtl, el, device } = swiper;
    const suffixes = prepareClasses([
      "initialized",
      params.direction,
      { "free-mode": swiper.params.freeMode && params.freeMode.enabled },
      { "autoheight": params.autoHeight },
      { "rtl": rtl },
      { "grid": params.grid && params.grid.rows > 1 },
      { "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column" },
      { "android": device.android },
      { "ios": device.ios },
      { "css-mode": params.cssMode },
      { "centered": params.cssMode && params.centeredSlides },
      { "watch-progress": params.watchSlidesProgress }
    ], params.containerModifierClass);
    classNames.push(...suffixes);
    el.classList.add(...classNames);
    swiper.emitContainerClasses();
  }
  function removeClasses() {
    const swiper = this;
    const { el, classNames } = swiper;
    if (!el || typeof el === "string")
      return;
    el.classList.remove(...classNames);
    swiper.emitContainerClasses();
  }
  var classes = { addClasses, removeClasses };
  var defaults = {
    init: true,
    direction: "horizontal",
    oneWayMovement: false,
    swiperElementNodeName: "SWIPER-CONTAINER",
    touchEventsTarget: "wrapper",
    initialSlide: 0,
    speed: 300,
    cssMode: false,
    updateOnWindowResize: true,
    resizeObserver: true,
    nested: false,
    createElements: false,
    eventsPrefix: "swiper",
    enabled: true,
    focusableElements: "input, select, option, textarea, button, video, label",
    // Overrides
    width: null,
    height: null,
    //
    preventInteractionOnTransition: false,
    // ssr
    userAgent: null,
    url: null,
    // To support iOS's swipe-to-go-back gesture (when being used in-app).
    edgeSwipeDetection: false,
    edgeSwipeThreshold: 20,
    // Autoheight
    autoHeight: false,
    // Set wrapper width
    setWrapperSize: false,
    // Virtual Translate
    virtualTranslate: false,
    // Effects
    effect: "slide",
    // Breakpoints
    breakpoints: void 0,
    breakpointsBase: "window",
    // Slides grid
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerGroup: 1,
    slidesPerGroupSkip: 0,
    slidesPerGroupAuto: false,
    centeredSlides: false,
    centeredSlidesBounds: false,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    normalizeSlideIndex: true,
    centerInsufficientSlides: false,
    snapToSlideEdge: false,
    // Disable swiper and hide navigation when container not overflow
    watchOverflow: true,
    // Round length
    roundLengths: false,
    // Touches
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    shortSwipes: true,
    longSwipes: true,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: true,
    allowTouchMove: true,
    threshold: 5,
    touchMoveStopPropagation: false,
    touchStartPreventDefault: true,
    touchStartForcePreventDefault: false,
    touchReleaseOnEdges: false,
    // Unique Navigation Elements
    uniqueNavElements: true,
    // Resistance
    resistance: true,
    resistanceRatio: 0.85,
    // Progress
    watchSlidesProgress: false,
    // Cursor
    grabCursor: false,
    // Clicks
    preventClicks: true,
    preventClicksPropagation: true,
    slideToClickedSlide: false,
    // loop
    loop: false,
    loopAddBlankSlides: true,
    loopAdditionalSlides: 0,
    loopPreventsSliding: true,
    // rewind
    rewind: false,
    // Swiping/no swiping
    allowSlidePrev: true,
    allowSlideNext: true,
    swipeHandler: null,
    noSwiping: true,
    noSwipingClass: "swiper-no-swiping",
    noSwipingSelector: null,
    // Passive Listeners
    passiveListeners: true,
    maxBackfaceHiddenSlides: 10,
    // NS
    containerModifierClass: "swiper-",
    slideClass: "swiper-slide",
    slideBlankClass: "swiper-slide-blank",
    slideActiveClass: "swiper-slide-active",
    slideVisibleClass: "swiper-slide-visible",
    slideFullyVisibleClass: "swiper-slide-fully-visible",
    slideNextClass: "swiper-slide-next",
    slidePrevClass: "swiper-slide-prev",
    wrapperClass: "swiper-wrapper",
    lazyPreloaderClass: "swiper-lazy-preloader",
    lazyPreloadPrevNext: 0,
    // Callbacks
    runCallbacksOnInit: true,
    // Internals
    _emitClasses: false
  };
  var eventsEmitter = {
    on(events2, handler, priority) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (typeof handler !== "function")
        return self;
      const method = priority ? "unshift" : "push";
      events2.split(" ").forEach((event) => {
        if (!self.eventsListeners[event])
          self.eventsListeners[event] = [];
        self.eventsListeners[event][method](handler);
      });
      return self;
    },
    once(events2, handler, priority) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (typeof handler !== "function")
        return self;
      const onceHandler = function onceHandlerFn(...args) {
        self.off(events2, onceHandler);
        if (onceHandler.__emitterProxy) {
          delete onceHandler.__emitterProxy;
        }
        handler.apply(self, args);
      };
      onceHandler.__emitterProxy = handler;
      return self.on(events2, onceHandler, priority);
    },
    onAny(handler, priority) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (typeof handler !== "function")
        return self;
      const method = priority ? "unshift" : "push";
      if (self.eventsAnyListeners.indexOf(handler) < 0) {
        self.eventsAnyListeners[method](handler);
      }
      return self;
    },
    offAny(handler) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (!self.eventsAnyListeners)
        return self;
      const index = self.eventsAnyListeners.indexOf(handler);
      if (index >= 0) {
        self.eventsAnyListeners.splice(index, 1);
      }
      return self;
    },
    off(events2, handler) {
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (!self.eventsListeners)
        return self;
      events2.split(" ").forEach((event) => {
        if (typeof handler === "undefined") {
          self.eventsListeners[event] = [];
        } else if (self.eventsListeners[event]) {
          self.eventsListeners[event].forEach((eventHandler, index) => {
            if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
              self.eventsListeners[event].splice(index, 1);
            }
          });
        }
      });
      return self;
    },
    emit(...args) {
      var _a;
      const self = this;
      if (!self.eventsListeners || self.destroyed)
        return self;
      if (!self.eventsListeners)
        return self;
      let events2;
      let data;
      let context;
      if (typeof args[0] === "string" || Array.isArray(args[0])) {
        events2 = args[0];
        data = args.slice(1, args.length);
        context = self;
      } else {
        const opts = args[0];
        events2 = opts.events;
        data = (_a = opts.data) != null ? _a : [];
        context = opts.context || self;
      }
      data.unshift(context);
      const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
      eventsArray.forEach((event) => {
        if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
          self.eventsAnyListeners.forEach((eventHandler) => {
            eventHandler.apply(context, [event, ...data]);
          });
        }
        if (self.eventsListeners && self.eventsListeners[event]) {
          self.eventsListeners[event].forEach((eventHandler) => {
            eventHandler.apply(context, data);
          });
        }
      });
      return self;
    }
  };
  function onClick(e) {
    const swiper = this;
    if (swiper.destroyed)
      return;
    if (!swiper.enabled)
      return;
    if (!swiper.allowClick) {
      if (swiper.params.preventClicks)
        e.preventDefault();
      if (swiper.params.preventClicksPropagation && swiper.animating) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }
  function onDocumentTouchStart() {
    const swiper = this;
    if (swiper.destroyed)
      return;
    if (swiper.documentTouchHandlerProceeded)
      return;
    swiper.documentTouchHandlerProceeded = true;
    if (swiper.params.touchReleaseOnEdges) {
      swiper.el.style.touchAction = "auto";
    }
  }
  function onLoad(e) {
    const swiper = this;
    if (swiper.destroyed)
      return;
    processLazyPreloader(swiper, e.target);
    if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) {
      return;
    }
    swiper.update();
  }
  function onResize() {
    var _a;
    const swiper = this;
    const { params, el } = swiper;
    if (el && el.offsetWidth === 0)
      return;
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }
    const { allowSlideNext, allowSlidePrev, snapGrid } = swiper;
    const isVirtual = swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled);
    swiper.allowSlideNext = true;
    swiper.allowSlidePrev = true;
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateSlidesClasses();
    const isVirtualLoop = isVirtual && params.loop;
    if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
      const slidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
      swiper.slideTo(slidesLength - 1, 0, false, true);
    } else {
      if (swiper.params.loop && !isVirtual) {
        swiper.slideToLoop(swiper.realIndex, 0, false, true);
      } else {
        swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
    }
    if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
      const autoplay = swiper.autoplay;
      clearTimeout(autoplay.resizeTimeout);
      autoplay.resizeTimeout = setTimeout(() => {
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
          swiper.autoplay.resume();
        }
      }, 500);
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
      swiper.checkOverflow();
    }
  }
  function onScroll() {
    const swiper = this;
    if (swiper.destroyed)
      return;
    const { wrapperEl, rtlTranslate, enabled: enabled2 } = swiper;
    if (!enabled2)
      return;
    swiper.previousTranslate = swiper.translate;
    if (swiper.isHorizontal()) {
      swiper.translate = -wrapperEl.scrollLeft;
    } else {
      swiper.translate = -wrapperEl.scrollTop;
    }
    if (swiper.translate === 0)
      swiper.translate = 0;
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
    let newProgress;
    const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    if (translatesDiff === 0) {
      newProgress = 0;
    } else {
      newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
    }
    if (newProgress !== swiper.progress) {
      swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
    }
    swiper.emit("setTranslate", swiper.translate, false);
  }
  function onTouchEnd(event) {
    var _a, _b, _c, _d;
    const swiper = this;
    if (swiper.destroyed)
      return;
    const data = swiper.touchEventsData;
    let e = (_a = event.originalEvent) != null ? _a : event;
    const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
    if (!isTouchEvent) {
      if (data.touchId !== null)
        return;
      const pe = e;
      if (pe.pointerId !== data.pointerId)
        return;
    } else {
      const te = e;
      const found = [...te.changedTouches].find((t) => t.identifier === data.touchId);
      if (!found || found.identifier !== data.touchId)
        return;
    }
    if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
      const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
      if (!proceed) {
        return;
      }
    }
    data.pointerId = null;
    data.touchId = null;
    const { params, touches, rtlTranslate: rtl, slidesGrid, enabled: enabled2 } = swiper;
    if (!enabled2)
      return;
    if (!params.simulateTouch && e.pointerType === "mouse")
      return;
    if (data.allowTouchCallbacks) {
      swiper.emit("touchEnd", e);
    }
    data.allowTouchCallbacks = false;
    if (!data.isTouched) {
      if (data.isMoved && params.grabCursor) {
        swiper.setGrabCursor(false);
      }
      data.isMoved = false;
      data.startMoving = false;
      return;
    }
    if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(false);
    }
    const touchEndTime = now();
    const timeDiff = touchEndTime - data.touchStartTime;
    if (swiper.allowClick) {
      const pathTree = (_b = e.path) != null ? _b : e.composedPath && e.composedPath();
      swiper.updateClickedSlide(pathTree && pathTree[0], pathTree);
      swiper.emit("tap click", e);
      if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
        swiper.emit("doubleTap doubleClick", e);
      }
    }
    data.lastClickTime = now();
    nextTick(() => {
      if (!swiper.destroyed)
        swiper.allowClick = true;
    });
    if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;
      return;
    }
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    let currentPos;
    if (params.followFinger) {
      currentPos = rtl ? swiper.translate : -swiper.translate;
    } else {
      currentPos = -((_c = data.currentTranslate) != null ? _c : 0);
    }
    if (params.cssMode) {
      return;
    }
    if (params.freeMode && params.freeMode.enabled) {
      swiper.freeMode.onTouchEnd({ currentPos });
      return;
    }
    const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
    let stopIndex = 0;
    let groupSize = swiper.slidesSizesGrid[0];
    for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
      const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
      if (typeof slidesGrid[i + increment2] !== "undefined") {
        if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
          stopIndex = i;
          groupSize = slidesGrid[i + increment2] - slidesGrid[i];
        }
      } else if (swipeToLast || currentPos >= slidesGrid[i]) {
        stopIndex = i;
        groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
      }
    }
    let rewindFirstIndex = null;
    let rewindLastIndex = null;
    if (params.rewind) {
      if (swiper.isBeginning) {
        rewindLastIndex = ((_d = params.virtual) == null ? void 0 : _d.enabled) && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
      } else if (swiper.isEnd) {
        rewindFirstIndex = 0;
      }
    }
    const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
    const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (timeDiff > params.longSwipesMs) {
      if (!params.longSwipes) {
        swiper.slideTo(swiper.activeIndex);
        return;
      }
      if (swiper.swipeDirection === "next") {
        if (ratio >= params.longSwipesRatio)
          swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
        else
          swiper.slideTo(stopIndex);
      }
      if (swiper.swipeDirection === "prev") {
        if (ratio > 1 - params.longSwipesRatio) {
          swiper.slideTo(stopIndex + increment);
        } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
          swiper.slideTo(rewindLastIndex);
        } else {
          swiper.slideTo(stopIndex);
        }
      }
    } else {
      if (!params.shortSwipes) {
        swiper.slideTo(swiper.activeIndex);
        return;
      }
      const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
      if (!isNavButtonTarget) {
        if (swiper.swipeDirection === "next") {
          swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
        }
        if (swiper.swipeDirection === "prev") {
          swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
        }
      } else if (e.target === swiper.navigation.nextEl) {
        swiper.slideTo(stopIndex + increment);
      } else {
        swiper.slideTo(stopIndex);
      }
    }
  }
  function onTouchMove(event) {
    var _a, _b, _c, _d, _e;
    const swiper = this;
    if (swiper.destroyed)
      return;
    const data = swiper.touchEventsData;
    const { params, touches, rtlTranslate: rtl, enabled: enabled2 } = swiper;
    if (!enabled2)
      return;
    if (!params.simulateTouch && event.pointerType === "mouse")
      return;
    const wrapped = event;
    const e = (_a = wrapped.originalEvent) != null ? _a : wrapped;
    if (e.type === "pointermove") {
      if (data.touchId !== null)
        return;
      const pe = e;
      if (pe.pointerId !== data.pointerId)
        return;
    }
    let targetTouch;
    if (e.type === "touchmove") {
      const te = e;
      const found = [...te.changedTouches].find((t) => t.identifier === data.touchId);
      if (!found || found.identifier !== data.touchId)
        return;
      targetTouch = found;
    } else {
      targetTouch = e;
    }
    if (!data.isTouched) {
      if (data.startMoving && data.isScrolling) {
        swiper.emit("touchMoveOpposite", e);
      }
      return;
    }
    const pageX = targetTouch.pageX;
    const pageY = targetTouch.pageY;
    if (e.preventedByNestedSwiper) {
      touches.startX = pageX;
      touches.startY = pageY;
      return;
    }
    if (!swiper.allowTouchMove) {
      if (!e.target.matches(data.focusableElements)) {
        swiper.allowClick = false;
      }
      if (data.isTouched) {
        Object.assign(touches, {
          startX: pageX,
          startY: pageY,
          currentX: pageX,
          currentY: pageY
        });
        data.touchStartTime = now();
      }
      return;
    }
    if (params.touchReleaseOnEdges && !params.loop) {
      if (swiper.isVertical()) {
        if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
          data.isTouched = false;
          data.isMoved = false;
          return;
        }
      } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) {
        return;
      } else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) {
        return;
      }
    }
    if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== e.target && e.pointerType !== "mouse") {
      document.activeElement.blur();
    }
    if (document.activeElement) {
      if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
        data.isMoved = true;
        swiper.allowClick = false;
        return;
      }
    }
    if (data.allowTouchCallbacks) {
      swiper.emit("touchMove", e);
    }
    touches.previousX = touches.currentX;
    touches.previousY = touches.currentY;
    touches.currentX = pageX;
    touches.currentY = pageY;
    const diffX = touches.currentX - touches.startX;
    const diffY = touches.currentY - touches.startY;
    if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold)
      return;
    if (typeof data.isScrolling === "undefined") {
      let touchAngle;
      if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
        data.isScrolling = false;
      } else {
        if (diffX * diffX + diffY * diffY >= 25) {
          touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
          data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
        }
      }
    }
    if (data.isScrolling) {
      swiper.emit("touchMoveOpposite", e);
    }
    if (typeof data.startMoving === "undefined") {
      if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
        data.startMoving = true;
      }
    }
    if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
      data.isTouched = false;
      return;
    }
    if (!data.startMoving) {
      return;
    }
    swiper.allowClick = false;
    if (!params.cssMode && e.cancelable) {
      e.preventDefault();
    }
    if (params.touchMoveStopPropagation && !params.nested) {
      e.stopPropagation();
    }
    let diff = swiper.isHorizontal() ? diffX : diffY;
    let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
    if (params.oneWayMovement) {
      diff = Math.abs(diff) * (rtl ? 1 : -1);
      touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
    }
    touches.diff = diff;
    diff *= params.touchRatio;
    if (rtl) {
      diff = -diff;
      touchesDiff = -touchesDiff;
    }
    const prevTouchesDirection = swiper.touchesDirection;
    swiper.swipeDirection = diff > 0 ? "prev" : "next";
    swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
    const isLoop = swiper.params.loop && !params.cssMode;
    const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
    if (!data.isMoved) {
      if (isLoop && allowLoopFix) {
        swiper.loopFix({ direction: swiper.swipeDirection });
      }
      data.startTranslate = swiper.getTranslate();
      swiper.setTransition(0);
      if (swiper.animating) {
        const evt = new window.CustomEvent("transitionend", {
          bubbles: true,
          cancelable: true,
          detail: {
            bySwiperTouchMove: true
          }
        });
        swiper.wrapperEl.dispatchEvent(evt);
      }
      data.allowMomentumBounce = false;
      if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(true);
      }
      swiper.emit("sliderFirstMove", e);
    }
    (/* @__PURE__ */ new Date()).getTime();
    if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY,
        startTranslate: data.currentTranslate
      });
      data.loopSwapReset = true;
      data.startTranslate = data.currentTranslate;
      return;
    }
    swiper.emit("sliderMove", e);
    data.isMoved = true;
    const startTranslate = (_b = data.startTranslate) != null ? _b : 0;
    data.currentTranslate = diff + startTranslate;
    let disableParentSwiper = true;
    let resistanceRatio = params.resistanceRatio;
    if (params.touchReleaseOnEdges) {
      resistanceRatio = 0;
    }
    if (diff > 0) {
      if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
        swiper.loopFix({ direction: "prev", setTranslate: true, activeSlideIndex: 0 });
      }
      if (data.currentTranslate > swiper.minTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) {
          data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + startTranslate + diff) ** resistanceRatio;
        }
      }
    } else if (diff < 0) {
      if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
        swiper.loopFix({
          direction: "next",
          setTranslate: true,
          activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(String(params.slidesPerView))))
        });
      }
      if (data.currentTranslate < swiper.maxTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) {
          data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - startTranslate - diff) ** resistanceRatio;
        }
      }
    }
    if (disableParentSwiper) {
      e.preventedByNestedSwiper = true;
    }
    if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && ((_c = data.currentTranslate) != null ? _c : 0) < startTranslate) {
      data.currentTranslate = startTranslate;
    }
    if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && ((_d = data.currentTranslate) != null ? _d : 0) > startTranslate) {
      data.currentTranslate = startTranslate;
    }
    if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
      data.currentTranslate = startTranslate;
    }
    if (params.threshold > 0) {
      if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
        if (!data.allowThresholdMove) {
          data.allowThresholdMove = true;
          touches.startX = touches.currentX;
          touches.startY = touches.currentY;
          data.currentTranslate = data.startTranslate;
          touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
          return;
        }
      } else {
        data.currentTranslate = data.startTranslate;
        return;
      }
    }
    if (!params.followFinger || params.cssMode)
      return;
    if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
      swiper.freeMode.onTouchMove();
    }
    swiper.updateProgress(data.currentTranslate);
    swiper.setTranslate((_e = data.currentTranslate) != null ? _e : 0);
  }
  function closestElement(selector2, base) {
    function __closestFrom(el) {
      if (!el || el === document || el === window)
        return null;
      let cur = el;
      if (cur.assignedSlot)
        cur = cur.assignedSlot;
      const found = cur.closest(selector2);
      if (!found && !cur.getRootNode) {
        return null;
      }
      const root = cur.getRootNode();
      return found || __closestFrom(root.host);
    }
    return __closestFrom(base);
  }
  function preventEdgeSwipe(swiper, event, startX) {
    const { params } = swiper;
    const edgeSwipeDetection = params.edgeSwipeDetection;
    const edgeSwipeThreshold = params.edgeSwipeThreshold;
    if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
      if (edgeSwipeDetection === "prevent") {
        event.preventDefault();
        return true;
      }
      return false;
    }
    return true;
  }
  function onTouchStart(event) {
    var _a;
    const swiper = this;
    if (swiper.destroyed)
      return;
    const e = (_a = event.originalEvent) != null ? _a : event;
    const data = swiper.touchEventsData;
    if (e.type === "pointerdown") {
      const pe2 = e;
      if (data.pointerId !== null && data.pointerId !== pe2.pointerId) {
        return;
      }
      data.pointerId = pe2.pointerId;
    } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
      data.touchId = e.targetTouches[0].identifier;
    }
    if (e.type === "touchstart") {
      preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
      return;
    }
    const { params, touches, enabled: enabled2 } = swiper;
    if (!enabled2)
      return;
    if (!params.simulateTouch && e.pointerType === "mouse")
      return;
    if (swiper.animating && params.preventInteractionOnTransition) {
      return;
    }
    if (!swiper.animating && params.cssMode && params.loop) {
      swiper.loopFix();
    }
    let targetEl = e.target;
    if (params.touchEventsTarget === "wrapper") {
      if (!elementIsChildOf(targetEl, swiper.wrapperEl))
        return;
    }
    const mouseLike = e;
    if (typeof mouseLike.which === "number" && mouseLike.which === 3)
      return;
    if (typeof mouseLike.button === "number" && mouseLike.button > 0)
      return;
    if (data.isTouched && data.isMoved)
      return;
    const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
    const eventPath = e.composedPath ? e.composedPath() : e.path;
    if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
      targetEl = eventPath[0];
    }
    const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
    const isTargetShadow = !!(e.target && e.target.shadowRoot);
    if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
      swiper.allowClick = true;
      return;
    }
    if (params.swipeHandler) {
      if (typeof params.swipeHandler === "string" && !targetEl.closest(params.swipeHandler))
        return;
    }
    const pe = e;
    touches.currentX = pe.pageX;
    touches.currentY = pe.pageY;
    const startX = touches.currentX;
    const startY = touches.currentY;
    if (!preventEdgeSwipe(swiper, e, startX)) {
      return;
    }
    Object.assign(data, {
      isTouched: true,
      isMoved: false,
      allowTouchCallbacks: true,
      isScrolling: void 0,
      startMoving: void 0
    });
    touches.startX = startX;
    touches.startY = startY;
    data.touchStartTime = now();
    swiper.allowClick = true;
    swiper.updateSize();
    swiper.swipeDirection = void 0;
    if (params.threshold > 0)
      data.allowThresholdMove = false;
    let preventDefault = true;
    if (targetEl.matches(data.focusableElements)) {
      preventDefault = false;
      if (targetEl.nodeName === "SELECT") {
        data.isTouched = false;
      }
    }
    if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl && (pe.pointerType === "mouse" || pe.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) {
      document.activeElement.blur();
    }
    const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
    if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
      e.preventDefault();
    }
    if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
      swiper.freeMode.onTouchStart();
    }
    swiper.emit("touchStart", e);
  }
  var events = (swiper, method) => {
    const { params, el, wrapperEl, device } = swiper;
    const capture = !!params.nested;
    const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
    const swiperMethod = method;
    if (!el || typeof el === "string")
      return;
    document[domMethod]("touchstart", swiper.onDocumentTouchStart, {
      passive: false,
      capture
    });
    el[domMethod]("touchstart", swiper.onTouchStart, { passive: false });
    el[domMethod]("pointerdown", swiper.onTouchStart, { passive: false });
    document[domMethod]("touchmove", swiper.onTouchMove, {
      passive: false,
      capture
    });
    document[domMethod]("pointermove", swiper.onTouchMove, {
      passive: false,
      capture
    });
    document[domMethod]("touchend", swiper.onTouchEnd, { passive: true });
    document[domMethod]("pointerup", swiper.onTouchEnd, { passive: true });
    document[domMethod]("pointercancel", swiper.onTouchEnd, { passive: true });
    document[domMethod]("touchcancel", swiper.onTouchEnd, { passive: true });
    document[domMethod]("pointerout", swiper.onTouchEnd, { passive: true });
    document[domMethod]("pointerleave", swiper.onTouchEnd, { passive: true });
    document[domMethod]("contextmenu", swiper.onTouchEnd, { passive: true });
    if (params.preventClicks || params.preventClicksPropagation) {
      el[domMethod]("click", swiper.onClick, true);
    }
    if (params.cssMode) {
      wrapperEl[domMethod]("scroll", swiper.onScroll);
    }
    const subscribe = (events2) => {
      swiper[swiperMethod](events2, onResize, true);
    };
    if (params.updateOnWindowResize) {
      subscribe(device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate");
    } else {
      subscribe("observerUpdate");
    }
    el[domMethod]("load", swiper.onLoad, { capture: true });
  };
  function attachEvents() {
    const swiper = this;
    const { params } = swiper;
    swiper.onTouchStart = onTouchStart.bind(swiper);
    swiper.onTouchMove = onTouchMove.bind(swiper);
    swiper.onTouchEnd = onTouchEnd.bind(swiper);
    swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
    if (params.cssMode) {
      swiper.onScroll = onScroll.bind(swiper);
    }
    swiper.onClick = onClick.bind(swiper);
    swiper.onLoad = onLoad.bind(swiper);
    events(swiper, "on");
  }
  function detachEvents() {
    const swiper = this;
    events(swiper, "off");
  }
  var events$1 = {
    attachEvents,
    detachEvents
  };
  function setGrabCursor(moving) {
    const swiper = this;
    if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode)
      return;
    const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
    if (swiper.isElement) {
      swiper.__preventObserver__ = true;
    }
    el.style.cursor = "move";
    el.style.cursor = moving ? "grabbing" : "grab";
    if (swiper.isElement) {
      requestAnimationFrame(() => {
        swiper.__preventObserver__ = false;
      });
    }
  }
  function unsetGrabCursor() {
    const swiper = this;
    if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
      return;
    }
    if (swiper.isElement) {
      swiper.__preventObserver__ = true;
    }
    swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
    if (swiper.isElement) {
      requestAnimationFrame(() => {
        swiper.__preventObserver__ = false;
      });
    }
  }
  var grabCursor = {
    setGrabCursor,
    unsetGrabCursor
  };
  function loopCreate(slideRealIndex, initial) {
    var _a;
    const swiper = this;
    const { params, slidesEl } = swiper;
    if (!params.loop || swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled))
      return;
    const initSlides = () => {
      const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
      slides.forEach((el, index) => {
        el.setAttribute("data-swiper-slide-index", String(index));
      });
    };
    const clearBlankSlides = () => {
      const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
      slides.forEach((el) => {
        el.remove();
      });
      if (slides.length > 0) {
        swiper.recalcSlides();
        swiper.updateSlides();
      }
    };
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
      clearBlankSlides();
    }
    const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
    const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
    const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
    const addBlankSlides = (amountOfSlides) => {
      for (let i = 0; i < amountOfSlides; i += 1) {
        const slideEl = swiper.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
        swiper.slidesEl.append(slideEl);
      }
    };
    if (shouldFillGroup) {
      if (params.loopAddBlankSlides) {
        const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
        addBlankSlides(slidesToAdd);
        swiper.recalcSlides();
        swiper.updateSlides();
      } else {
        showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
      }
      initSlides();
    } else if (shouldFillGrid) {
      if (params.loopAddBlankSlides) {
        const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
        addBlankSlides(slidesToAdd);
        swiper.recalcSlides();
        swiper.updateSlides();
      } else {
        showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
      }
      initSlides();
    } else {
      initSlides();
    }
    const bothDirections = params.centeredSlides || !!params.slidesOffsetBefore || !!params.slidesOffsetAfter;
    swiper.loopFix({
      slideRealIndex,
      direction: bothDirections ? void 0 : "next",
      initial
    });
  }
  function loopDestroy() {
    var _a;
    const swiper = this;
    const { params, slidesEl } = swiper;
    if (!params.loop || !slidesEl || swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled))
      return;
    swiper.recalcSlides();
    const newSlidesOrder = [];
    swiper.slides.forEach((slideEl) => {
      const loopSlideEl = slideEl;
      const index = typeof loopSlideEl.swiperSlideIndex === "undefined" ? Number(slideEl.getAttribute("data-swiper-slide-index")) : loopSlideEl.swiperSlideIndex;
      newSlidesOrder[index] = slideEl;
    });
    swiper.slides.forEach((slideEl) => {
      slideEl.removeAttribute("data-swiper-slide-index");
    });
    newSlidesOrder.forEach((slideEl) => {
      slidesEl.append(slideEl);
    });
    swiper.recalcSlides();
    swiper.slideTo(swiper.realIndex, 0);
  }
  function loopFix(options = {}) {
    var _a, _b, _c, _d;
    const { slideRealIndex, slideTo: slideTo2 = true, direction, setTranslate: setTranslate2, activeSlideIndex: activeSlideIndexParam, initial, byController, byMousewheel } = options;
    let activeSlideIndex = activeSlideIndexParam;
    const swiper = this;
    if (!swiper.params.loop)
      return;
    swiper.emit("beforeLoopFix");
    const { slides, allowSlidePrev, allowSlideNext, slidesEl, params } = swiper;
    const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter, initialSlide } = params;
    const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
    swiper.allowSlidePrev = true;
    swiper.allowSlideNext = true;
    if (swiper.virtual && ((_a = params.virtual) == null ? void 0 : _a.enabled)) {
      if (slideTo2) {
        const virtualSlidesLength = swiper.virtual.slides.length;
        const virtualSlidesBefore = (_b = swiper.virtual.slidesBefore) != null ? _b : 0;
        if (!bothDirections && swiper.snapIndex === 0) {
          swiper.slideTo(virtualSlidesLength, 0, false, true);
        } else if (bothDirections && swiper.snapIndex < params.slidesPerView) {
          swiper.slideTo(virtualSlidesLength + swiper.snapIndex, 0, false, true);
        } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
          swiper.slideTo(virtualSlidesBefore, 0, false, true);
        }
      }
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;
      swiper.emit("loopFix");
      return;
    }
    let slidesPerView = params.slidesPerView;
    if (slidesPerView === "auto") {
      slidesPerView = swiper.slidesPerViewDynamic();
    } else {
      slidesPerView = Math.ceil(parseFloat(String(params.slidesPerView)));
      if (bothDirections && slidesPerView % 2 === 0) {
        slidesPerView = slidesPerView + 1;
      }
    }
    const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
    let loopedSlides = bothDirections ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2)) : slidesPerGroup;
    if (loopedSlides % slidesPerGroup !== 0) {
      loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
    }
    loopedSlides += params.loopAdditionalSlides;
    swiper.loopedSlides = loopedSlides;
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
      showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
    } else if (gridEnabled && params.grid.fill === "row") {
      showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
    }
    const prependSlidesIndexes = [];
    const appendSlidesIndexes = [];
    const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
    const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !bothDirections;
    let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
    if (typeof activeSlideIndex === "undefined") {
      activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
    } else {
      activeIndex = activeSlideIndex;
    }
    const isNext = direction === "next" || !direction;
    const isPrev = direction === "prev" || !direction;
    let slidesPrepended = 0;
    let slidesAppended = 0;
    const activeColIndex = gridEnabled ? (_c = slides[activeSlideIndex].column) != null ? _c : 0 : activeSlideIndex;
    const activeColIndexWithShift = activeColIndex + (bothDirections && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
    if (activeColIndexWithShift < loopedSlides) {
      slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
      for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
        const index = i - Math.floor(i / cols) * cols;
        if (gridEnabled) {
          const colIndexToPrepend = cols - index - 1;
          for (let j = slides.length - 1; j >= 0; j -= 1) {
            if (slides[j].column === colIndexToPrepend)
              prependSlidesIndexes.push(j);
          }
        } else {
          prependSlidesIndexes.push(cols - index - 1);
        }
      }
    } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
      slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
      if (isInitialOverflow) {
        slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
      }
      for (let i = 0; i < slidesAppended; i += 1) {
        const index = i - Math.floor(i / cols) * cols;
        if (gridEnabled) {
          slides.forEach((slide2, slideIndex) => {
            if (slide2.column === index)
              appendSlidesIndexes.push(slideIndex);
          });
        } else {
          appendSlidesIndexes.push(index);
        }
      }
    }
    swiper.__preventObserver__ = true;
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
    if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
      if (appendSlidesIndexes.includes(activeSlideIndex)) {
        appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
      }
      if (prependSlidesIndexes.includes(activeSlideIndex)) {
        prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
      }
    }
    if (isPrev) {
      prependSlidesIndexes.forEach((index) => {
        const slideEl = slides[index];
        slideEl.swiperLoopMoveDOM = true;
        slidesEl.prepend(slideEl);
        slideEl.swiperLoopMoveDOM = false;
      });
    }
    if (isNext) {
      appendSlidesIndexes.forEach((index) => {
        const slideEl = slides[index];
        slideEl.swiperLoopMoveDOM = true;
        slidesEl.append(slideEl);
        slideEl.swiperLoopMoveDOM = false;
      });
    }
    swiper.recalcSlides();
    if (params.slidesPerView === "auto") {
      swiper.updateSlides();
    } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
      swiper.slides.forEach((slide2, slideIndex) => {
        swiper.grid.updateSlide(slideIndex, slide2, swiper.slides);
      });
    }
    if (params.watchSlidesProgress) {
      swiper.updateSlidesOffset();
    }
    if (slideTo2) {
      if (prependSlidesIndexes.length > 0 && isPrev) {
        if (typeof slideRealIndex === "undefined") {
          const currentSlideTranslate = swiper.slidesGrid[activeIndex];
          const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
          const diff = newSlideTranslate - currentSlideTranslate;
          if (byMousewheel) {
            swiper.setTranslate(swiper.translate - diff);
          } else {
            swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
            if (setTranslate2) {
              swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
              swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
            }
          }
        } else {
          if (setTranslate2) {
            const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
            swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
            swiper.touchEventsData.currentTranslate = swiper.translate;
          }
        }
      } else if (appendSlidesIndexes.length > 0 && isNext) {
        if (typeof slideRealIndex === "undefined") {
          const currentSlideTranslate = swiper.slidesGrid[activeIndex];
          const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
          const diff = newSlideTranslate - currentSlideTranslate;
          if (byMousewheel) {
            swiper.setTranslate(swiper.translate - diff);
          } else {
            swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
            if (setTranslate2) {
              swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
              swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
            }
          }
        } else {
          const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
          swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
        }
      }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    const controlled = (_d = swiper.controller) == null ? void 0 : _d.control;
    if (controlled && !byController) {
      const loopParams = {
        slideRealIndex,
        direction,
        setTranslate: setTranslate2,
        activeSlideIndex,
        byController: true
      };
      if (Array.isArray(controlled)) {
        controlled.forEach((c) => {
          if (!c.destroyed && c.params.loop)
            c.loopFix({
              ...loopParams,
              slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
            });
        });
      } else if (controlled instanceof swiper.constructor && controlled.params.loop) {
        controlled.loopFix({
          ...loopParams,
          slideTo: controlled.params.slidesPerView === params.slidesPerView ? slideTo2 : false
        });
      }
    }
    swiper.emit("loopFix");
  }
  var loop = {
    loopCreate,
    loopFix,
    loopDestroy
  };
  function moduleExtendParams(params, allModulesParams) {
    return function extendParams(obj = {}) {
      const moduleParamName = Object.keys(obj)[0];
      const moduleParams = obj[moduleParamName];
      if (typeof moduleParams !== "object" || moduleParams === null) {
        extend(allModulesParams, obj);
        return;
      }
      if (params[moduleParamName] === true) {
        params[moduleParamName] = { enabled: true };
      }
      if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
        params[moduleParamName].auto = true;
      }
      if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
        params[moduleParamName].auto = true;
      }
      if (!(moduleParamName in params && "enabled" in moduleParams)) {
        extend(allModulesParams, obj);
        return;
      }
      if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
        params[moduleParamName].enabled = true;
      }
      if (!params[moduleParamName])
        params[moduleParamName] = { enabled: false };
      extend(allModulesParams, obj);
    };
  }
  var Observer = ({ swiper, extendParams, on }) => {
    const observers = [];
    const attach = (target, options = {}) => {
      const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
      if (!ObserverFunc)
        return;
      const observer = new ObserverFunc((mutations) => {
        if (swiper.__preventObserver__)
          return;
        if (mutations.length === 1) {
          swiper.emit("observerUpdate", mutations[0]);
          return;
        }
        const observerUpdate = function observerUpdate2() {
          swiper.emit("observerUpdate", mutations[0]);
        };
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(observerUpdate);
        } else {
          window.setTimeout(observerUpdate, 0);
        }
      });
      observer.observe(target, {
        attributes: typeof options.attributes === "undefined" ? true : options.attributes,
        childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options.childList),
        characterData: typeof options.characterData === "undefined" ? true : options.characterData
      });
      observers.push(observer);
    };
    const init = () => {
      if (!swiper.params.observer)
        return;
      if (swiper.params.observeParents) {
        const containerParents = elementParents(swiper.hostEl);
        for (let i = 0; i < containerParents.length; i += 1) {
          attach(containerParents[i]);
        }
      }
      attach(swiper.hostEl, {
        childList: swiper.params.observeSlideChildren
      });
      attach(swiper.wrapperEl, { attributes: false });
    };
    const destroy = () => {
      observers.forEach((observer) => {
        observer.disconnect();
      });
      observers.splice(0, observers.length);
    };
    extendParams({
      observer: false,
      observeParents: false,
      observeSlideChildren: false
    });
    on("init", init);
    on("destroy", destroy);
  };
  var Resize = ({ swiper, on, emit }) => {
    let observer = null;
    let animationFrame = null;
    const resizeHandler = () => {
      if (!swiper || swiper.destroyed || !swiper.initialized)
        return;
      emit("beforeResize");
      emit("resize");
    };
    const createObserver = () => {
      if (!swiper || swiper.destroyed || !swiper.initialized)
        return;
      observer = new ResizeObserver((entries) => {
        animationFrame = window.requestAnimationFrame(() => {
          const { width, height } = swiper;
          let newWidth = width;
          let newHeight = height;
          entries.forEach(({ contentBoxSize, contentRect, target }) => {
            if (target && target !== swiper.el)
              return;
            const box = Array.isArray(contentBoxSize) ? contentBoxSize[0] : contentBoxSize;
            newWidth = contentRect ? contentRect.width : box.inlineSize;
            newHeight = contentRect ? contentRect.height : box.blockSize;
          });
          if (newWidth !== width || newHeight !== height) {
            resizeHandler();
          }
        });
      });
      observer.observe(swiper.el);
    };
    const removeObserver = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (observer && observer.unobserve && swiper.el) {
        observer.unobserve(swiper.el);
        observer = null;
      }
    };
    const orientationChangeHandler = () => {
      if (!swiper || swiper.destroyed || !swiper.initialized)
        return;
      emit("orientationchange");
    };
    on("init", () => {
      if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
        createObserver();
        return;
      }
      window.addEventListener("resize", resizeHandler);
      window.addEventListener("orientationchange", orientationChangeHandler);
    });
    on("destroy", () => {
      removeObserver();
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("orientationchange", orientationChangeHandler);
    });
  };
  function slideNext(speed, runCallbacks = true, internal) {
    var _a;
    const swiper = this;
    const { enabled: enabled2, params, animating } = swiper;
    if (!enabled2 || swiper.destroyed)
      return swiper;
    if (typeof speed === "undefined") {
      speed = swiper.params.speed;
    }
    let perGroup = params.slidesPerGroup;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
    }
    const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
    const isVirtual = swiper.virtual && ((_a = params.virtual) == null ? void 0 : _a.enabled);
    if (params.loop) {
      if (animating && !isVirtual && params.loopPreventsSliding)
        return false;
      swiper.loopFix({ direction: "next" });
      swiper._clientLeft = swiper.wrapperEl.clientLeft;
      if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
        requestAnimationFrame(() => {
          swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
        });
        return true;
      }
    }
    if (params.rewind && swiper.isEnd) {
      return swiper.slideTo(0, speed, runCallbacks, internal);
    }
    return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
  }
  function slidePrev(speed, runCallbacks = true, internal) {
    var _a, _b;
    const swiper = this;
    const { params, snapGrid, slidesGrid, rtlTranslate, enabled: enabled2, animating } = swiper;
    if (!enabled2 || swiper.destroyed)
      return swiper;
    if (typeof speed === "undefined") {
      speed = swiper.params.speed;
    }
    const isVirtual = swiper.virtual && ((_a = params.virtual) == null ? void 0 : _a.enabled);
    if (params.loop) {
      if (animating && !isVirtual && params.loopPreventsSliding)
        return false;
      swiper.loopFix({ direction: "prev" });
      swiper._clientLeft = swiper.wrapperEl.clientLeft;
    }
    const translate2 = rtlTranslate ? swiper.translate : -swiper.translate;
    function normalize(val) {
      if (val < 0)
        return -Math.floor(Math.abs(val));
      return Math.floor(val);
    }
    const normalizedTranslate = normalize(translate2);
    const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
    const isFreeMode = params.freeMode && params.freeMode.enabled;
    let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
    if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
      let prevSnapIndex;
      snapGrid.forEach((snap, snapIndex) => {
        if (normalizedTranslate >= snap) {
          prevSnapIndex = snapIndex;
        }
      });
      if (typeof prevSnapIndex !== "undefined") {
        prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
      }
    }
    let prevIndex = 0;
    if (typeof prevSnap !== "undefined") {
      prevIndex = slidesGrid.indexOf(prevSnap);
      if (prevIndex < 0)
        prevIndex = swiper.activeIndex - 1;
      if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
        prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
        prevIndex = Math.max(prevIndex, 0);
      }
    }
    if (params.rewind && swiper.isBeginning) {
      const lastIndex = ((_b = swiper.params.virtual) == null ? void 0 : _b.enabled) && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
      return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
    } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(prevIndex, speed, runCallbacks, internal);
      });
      return true;
    }
    return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
  }
  function slideReset(speed, runCallbacks = true, internal) {
    const swiper = this;
    if (swiper.destroyed)
      return;
    if (typeof speed === "undefined") {
      speed = swiper.params.speed;
    }
    return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
  }
  function slideTo(index = 0, speed, runCallbacks = true, internal, initial) {
    var _a, _b;
    if (typeof index === "string") {
      index = parseInt(index, 10);
    }
    const swiper = this;
    let slideIndex = index;
    if (slideIndex < 0)
      slideIndex = 0;
    const { params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled: enabled2 } = swiper;
    if (!enabled2 && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
      return false;
    }
    if (typeof speed === "undefined") {
      speed = swiper.params.speed;
    }
    const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
    let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
    if (snapIndex >= snapGrid.length)
      snapIndex = snapGrid.length - 1;
    const translate2 = -snapGrid[snapIndex];
    if (params.normalizeSlideIndex) {
      for (let i = 0; i < slidesGrid.length; i += 1) {
        const normalizedTranslate = -Math.floor(translate2 * 100);
        const normalizedGrid = Math.floor(slidesGrid[i] * 100);
        const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
        if (typeof slidesGrid[i + 1] !== "undefined") {
          if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
            slideIndex = i;
          } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
            slideIndex = i + 1;
          }
        } else if (normalizedTranslate >= normalizedGrid) {
          slideIndex = i;
        }
      }
    }
    if (swiper.initialized && slideIndex !== activeIndex) {
      if (!swiper.allowSlideNext && (rtl ? translate2 > swiper.translate && translate2 > swiper.minTranslate() : translate2 < swiper.translate && translate2 < swiper.minTranslate())) {
        return false;
      }
      if (!swiper.allowSlidePrev && translate2 > swiper.translate && translate2 > swiper.maxTranslate()) {
        if ((activeIndex || 0) !== slideIndex) {
          return false;
        }
      }
    }
    if (slideIndex !== (previousIndex || 0) && runCallbacks) {
      swiper.emit("beforeSlideChangeStart");
    }
    swiper.updateProgress(translate2);
    let direction;
    if (slideIndex > activeIndex)
      direction = "next";
    else if (slideIndex < activeIndex)
      direction = "prev";
    else
      direction = "reset";
    const isVirtual = swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled);
    const isInitialVirtual = isVirtual && initial;
    if (!isInitialVirtual && (rtl && -translate2 === swiper.translate || !rtl && translate2 === swiper.translate)) {
      swiper.updateActiveIndex(slideIndex);
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
      swiper.updateSlidesClasses();
      if (params.effect !== "slide") {
        swiper.setTranslate(translate2);
      }
      if (direction !== "reset") {
        swiper.transitionStart(runCallbacks, direction);
        swiper.transitionEnd(runCallbacks, direction);
      }
      return false;
    }
    if (params.cssMode) {
      const isH = swiper.isHorizontal();
      const t = rtl ? translate2 : -translate2;
      if (speed === 0) {
        if (isVirtual) {
          swiper.wrapperEl.style.scrollSnapType = "none";
          swiper._immediateVirtual = true;
        }
        if (isVirtual && !swiper._cssModeVirtualInitialSet && ((_b = swiper.params.initialSlide) != null ? _b : 0) > 0) {
          swiper._cssModeVirtualInitialSet = true;
          requestAnimationFrame(() => {
            wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
          });
        } else {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        }
        if (isVirtual) {
          requestAnimationFrame(() => {
            swiper.wrapperEl.style.scrollSnapType = "";
            swiper._immediateVirtual = false;
          });
        }
      } else {
        wrapperEl.scrollTo({
          [isH ? "left" : "top"]: t,
          behavior: "smooth"
        });
      }
      return true;
    }
    const browser = getBrowser();
    const isSafari = browser.isSafari;
    if (isVirtual && !initial && isSafari && swiper.isElement) {
      swiper.virtual.update(false, false, slideIndex);
    }
    swiper.setTransition(speed);
    swiper.setTranslate(translate2);
    swiper.updateActiveIndex(slideIndex);
    swiper.updateSlidesClasses();
    swiper.emit("beforeTransitionStart", speed, internal);
    swiper.transitionStart(runCallbacks, direction);
    if (speed === 0) {
      swiper.transitionEnd(runCallbacks, direction);
    } else if (!swiper.animating) {
      swiper.animating = true;
      if (!swiper.onSlideToWrapperTransitionEnd) {
        swiper.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper || swiper.destroyed)
            return;
          if (e.target !== this)
            return;
          swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
          swiper.onSlideToWrapperTransitionEnd = null;
          delete swiper.onSlideToWrapperTransitionEnd;
          swiper.transitionEnd(runCallbacks, direction);
        };
      }
      swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
    }
    return true;
  }
  function slideToClickedSlide() {
    const swiper = this;
    if (swiper.destroyed)
      return;
    const { params, slidesEl, clickedSlide, clickedIndex } = swiper;
    if (clickedSlide === void 0 || clickedIndex === void 0)
      return;
    const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
    let slideToIndex = swiper.getSlideIndexWhenGrid(clickedIndex);
    let realIndex;
    const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
    const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
    if (params.loop) {
      if (swiper.animating)
        return;
      realIndex = parseInt(clickedSlide.getAttribute("data-swiper-slide-index"), 10);
      if (params.centeredSlides) {
        swiper.slideToLoop(realIndex);
      } else if (slideToIndex > (isGrid ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1) : swiper.slides.length - slidesPerView)) {
        swiper.loopFix();
        slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
        nextTick(() => {
          swiper.slideTo(slideToIndex);
        });
      } else {
        swiper.slideTo(slideToIndex);
      }
    } else {
      swiper.slideTo(slideToIndex);
    }
  }
  function slideToClosest(speed, runCallbacks = true, internal, threshold = 0.5) {
    const swiper = this;
    if (swiper.destroyed)
      return;
    if (typeof speed === "undefined") {
      speed = swiper.params.speed;
    }
    let index = swiper.activeIndex;
    const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
    const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
    const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
    if (translate2 >= swiper.snapGrid[snapIndex]) {
      const currentSnap = swiper.snapGrid[snapIndex];
      const nextSnap = swiper.snapGrid[snapIndex + 1];
      if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
        index += swiper.params.slidesPerGroup;
      }
    } else {
      const prevSnap = swiper.snapGrid[snapIndex - 1];
      const currentSnap = swiper.snapGrid[snapIndex];
      if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
        index -= swiper.params.slidesPerGroup;
      }
    }
    index = Math.max(index, 0);
    index = Math.min(index, swiper.slidesGrid.length - 1);
    return swiper.slideTo(index, speed, runCallbacks, internal);
  }
  function slideToLoop(index = 0, speed, runCallbacks = true, internal) {
    var _a, _b, _c, _d;
    if (typeof index === "string") {
      const indexAsNumber = parseInt(index, 10);
      index = indexAsNumber;
    }
    const swiper = this;
    if (swiper.destroyed)
      return;
    if (typeof speed === "undefined") {
      speed = swiper.params.speed;
    }
    const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
    let newIndex = index;
    if (swiper.params.loop) {
      if (swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled)) {
        newIndex = newIndex + ((_b = swiper.virtual.slidesBefore) != null ? _b : 0);
      } else {
        let targetSlideIndex;
        if (gridEnabled) {
          const slideIndex = newIndex * swiper.params.grid.rows;
          const targetSlideEl = swiper.slides.find((slideEl) => Number(slideEl.getAttribute("data-swiper-slide-index")) === slideIndex);
          targetSlideIndex = (_c = targetSlideEl == null ? void 0 : targetSlideEl.column) != null ? _c : 0;
        } else {
          targetSlideIndex = swiper.getSlideIndexByData(newIndex);
        }
        const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
        const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter } = swiper.params;
        const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
        let slidesPerView;
        if (swiper.params.slidesPerView === "auto") {
          slidesPerView = swiper.slidesPerViewDynamic();
        } else {
          slidesPerView = Math.ceil(parseFloat(String(swiper.params.slidesPerView)));
          if (bothDirections && slidesPerView % 2 === 0) {
            slidesPerView = slidesPerView + 1;
          }
        }
        let needLoopFix = cols - targetSlideIndex < slidesPerView;
        if (bothDirections) {
          needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
        }
        if (internal && bothDirections && swiper.params.slidesPerView !== "auto" && !gridEnabled) {
          needLoopFix = false;
        }
        if (needLoopFix) {
          const direction = bothDirections ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
          swiper.loopFix({
            direction,
            slideTo: true,
            activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
            slideRealIndex: direction === "next" ? swiper.realIndex : void 0
          });
        }
        if (gridEnabled) {
          const slideIndex = newIndex * swiper.params.grid.rows;
          const targetSlideEl = swiper.slides.find((slideEl) => Number(slideEl.getAttribute("data-swiper-slide-index")) === slideIndex);
          newIndex = (_d = targetSlideEl == null ? void 0 : targetSlideEl.column) != null ? _d : 0;
        } else {
          newIndex = swiper.getSlideIndexByData(newIndex);
        }
      }
    }
    requestAnimationFrame(() => {
      swiper.slideTo(newIndex, speed, runCallbacks, internal);
    });
    return swiper;
  }
  var slide = {
    slideTo,
    slideToLoop,
    slideNext,
    slidePrev,
    slideReset,
    slideToClosest,
    slideToClickedSlide
  };
  function setTransition(duration, byController) {
    const swiper = this;
    if (!swiper.params.cssMode) {
      swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
      swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
    }
    swiper.emit("setTransition", duration, byController);
  }
  function transitionEmit({ swiper, runCallbacks, direction, step }) {
    const { activeIndex, previousIndex } = swiper;
    let dir = direction;
    if (!dir) {
      if (activeIndex > previousIndex)
        dir = "next";
      else if (activeIndex < previousIndex)
        dir = "prev";
      else
        dir = "reset";
    }
    swiper.emit(`transition${step}`);
    if (runCallbacks && dir === "reset") {
      swiper.emit(`slideResetTransition${step}`);
    } else if (runCallbacks && activeIndex !== previousIndex) {
      swiper.emit(`slideChangeTransition${step}`);
      if (dir === "next") {
        swiper.emit(`slideNextTransition${step}`);
      } else {
        swiper.emit(`slidePrevTransition${step}`);
      }
    }
  }
  function transitionEnd(runCallbacks = true, direction) {
    const swiper = this;
    const { params } = swiper;
    swiper.animating = false;
    if (params.cssMode)
      return;
    swiper.setTransition(0);
    transitionEmit({ swiper, runCallbacks, direction, step: "End" });
  }
  function transitionStart(runCallbacks = true, direction) {
    const swiper = this;
    const { params } = swiper;
    if (params.cssMode)
      return;
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    transitionEmit({ swiper, runCallbacks, direction, step: "Start" });
  }
  var transition = {
    setTransition,
    transitionStart,
    transitionEnd
  };
  function getSwiperTranslate(axis = this.isHorizontal() ? "x" : "y") {
    const swiper = this;
    const { params, rtlTranslate: rtl, translate: translate2, wrapperEl } = swiper;
    if (params.virtualTranslate) {
      return rtl ? -translate2 : translate2;
    }
    if (params.cssMode) {
      return translate2;
    }
    let currentTranslate = getTranslate(wrapperEl, axis);
    currentTranslate += swiper.cssOverflowAdjustment();
    if (rtl)
      currentTranslate = -currentTranslate;
    return currentTranslate || 0;
  }
  function maxTranslate() {
    return -this.snapGrid[this.snapGrid.length - 1];
  }
  function minTranslate() {
    return -this.snapGrid[0];
  }
  function setTranslate(translate2, byController) {
    const swiper = this;
    const { rtlTranslate: rtl, params, wrapperEl, progress } = swiper;
    let x = 0;
    let y = 0;
    const z = 0;
    if (swiper.isHorizontal()) {
      x = rtl ? -translate2 : translate2;
    } else {
      y = translate2;
    }
    if (params.roundLengths) {
      x = Math.floor(x);
      y = Math.floor(y);
    }
    swiper.previousTranslate = swiper.translate;
    swiper.translate = swiper.isHorizontal() ? x : y;
    if (params.cssMode) {
      wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y;
    } else if (!params.virtualTranslate) {
      if (swiper.isHorizontal()) {
        x -= swiper.cssOverflowAdjustment();
      } else {
        y -= swiper.cssOverflowAdjustment();
      }
      wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    }
    let newProgress;
    const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    if (translatesDiff === 0) {
      newProgress = 0;
    } else {
      newProgress = (translate2 - swiper.minTranslate()) / translatesDiff;
    }
    if (newProgress !== progress) {
      swiper.updateProgress(translate2);
    }
    swiper.emit("setTranslate", swiper.translate, byController);
  }
  function translateTo(translate2 = 0, speed = this.params.speed, runCallbacks = true, translateBounds = true, internal) {
    const swiper = this;
    const { params, wrapperEl } = swiper;
    if (swiper.animating && params.preventInteractionOnTransition) {
      return false;
    }
    const minTranslate2 = swiper.minTranslate();
    const maxTranslate2 = swiper.maxTranslate();
    let newTranslate;
    if (translateBounds && translate2 > minTranslate2)
      newTranslate = minTranslate2;
    else if (translateBounds && translate2 < maxTranslate2)
      newTranslate = maxTranslate2;
    else
      newTranslate = translate2;
    swiper.updateProgress(newTranslate);
    if (params.cssMode) {
      const isH = swiper.isHorizontal();
      if (speed === 0) {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
      } else {
        wrapperEl.scrollTo({
          [isH ? "left" : "top"]: -newTranslate,
          behavior: "smooth"
        });
      }
      return true;
    }
    if (speed === 0) {
      swiper.setTransition(0);
      swiper.setTranslate(newTranslate);
      if (runCallbacks) {
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.emit("transitionEnd");
      }
    } else {
      swiper.setTransition(speed);
      swiper.setTranslate(newTranslate);
      if (runCallbacks) {
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.emit("transitionStart");
      }
      if (!swiper.animating) {
        swiper.animating = true;
        if (!swiper.onTranslateToWrapperTransitionEnd) {
          swiper.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
            if (!swiper || swiper.destroyed)
              return;
            if (e.target !== this)
              return;
            swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
            swiper.onTranslateToWrapperTransitionEnd = null;
            delete swiper.onTranslateToWrapperTransitionEnd;
            swiper.animating = false;
            if (runCallbacks) {
              swiper.emit("transitionEnd");
            }
          };
        }
        swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
      }
    }
    return true;
  }
  var translate = {
    getTranslate: getSwiperTranslate,
    setTranslate,
    minTranslate,
    maxTranslate,
    translateTo
  };
  function getActiveIndexByTranslate(swiper) {
    const { slidesGrid, params } = swiper;
    const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
    let activeIndex;
    for (let i = 0; i < slidesGrid.length; i += 1) {
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
          activeIndex = i;
        } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
          activeIndex = i + 1;
        }
      } else if (translate2 >= slidesGrid[i]) {
        activeIndex = i;
      }
    }
    if (params.normalizeSlideIndex) {
      if (activeIndex < 0 || typeof activeIndex === "undefined")
        activeIndex = 0;
    }
    return activeIndex;
  }
  function updateActiveIndex(newActiveIndex) {
    var _a, _b;
    const swiper = this;
    const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
    const { snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex } = swiper;
    let activeIndex = newActiveIndex;
    let snapIndex;
    const getVirtualRealIndex = (aIndex) => {
      var _a2;
      const virtualSlides = swiper.virtual.slides;
      let realIndex2 = aIndex - ((_a2 = swiper.virtual.slidesBefore) != null ? _a2 : 0);
      if (realIndex2 < 0) {
        realIndex2 = virtualSlides.length + realIndex2;
      }
      if (realIndex2 >= virtualSlides.length) {
        realIndex2 -= virtualSlides.length;
      }
      return realIndex2;
    };
    if (typeof activeIndex === "undefined") {
      activeIndex = getActiveIndexByTranslate(swiper);
    }
    if (snapGrid.indexOf(translate2) >= 0) {
      snapIndex = snapGrid.indexOf(translate2);
    } else {
      const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
      snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
    }
    if (snapIndex >= snapGrid.length)
      snapIndex = snapGrid.length - 1;
    if (activeIndex === previousIndex && !swiper.params.loop) {
      if (snapIndex !== previousSnapIndex) {
        swiper.snapIndex = snapIndex;
        swiper.emit("snapIndexChange");
      }
      return;
    }
    if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled)) {
      swiper.realIndex = getVirtualRealIndex(activeIndex);
      return;
    }
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    let realIndex;
    if (swiper.virtual && ((_b = params.virtual) == null ? void 0 : _b.enabled)) {
      if (params.loop) {
        realIndex = getVirtualRealIndex(activeIndex);
      } else {
        realIndex = activeIndex;
      }
    } else if (gridEnabled) {
      const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
      let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
      if (Number.isNaN(activeSlideIndex)) {
        activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
      }
      realIndex = Math.floor(activeSlideIndex / params.grid.rows);
    } else if (swiper.slides[activeIndex]) {
      const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
      if (slideIndex) {
        realIndex = parseInt(slideIndex, 10);
      } else {
        realIndex = activeIndex;
      }
    } else {
      realIndex = activeIndex;
    }
    Object.assign(swiper, {
      previousSnapIndex,
      snapIndex,
      previousRealIndex,
      realIndex,
      previousIndex,
      activeIndex
    });
    if (swiper.initialized) {
      preload(swiper);
    }
    swiper.emit("activeIndexChange");
    swiper.emit("snapIndexChange");
    if (swiper.initialized || swiper.params.runCallbacksOnInit) {
      if (previousRealIndex !== realIndex) {
        swiper.emit("realIndexChange");
      }
      swiper.emit("slideChange");
    }
  }
  function updateAutoHeight(speed) {
    var _a;
    const swiper = this;
    const activeSlides = [];
    const isVirtual = swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled);
    let newHeight = 0;
    let i;
    if (typeof speed === "number") {
      swiper.setTransition(speed);
    } else if (speed === true) {
      swiper.setTransition(swiper.params.speed);
    }
    const getSlideByIndex = (index) => {
      if (isVirtual) {
        return swiper.slides[swiper.getSlideIndexByData(index)];
      }
      return swiper.slides[index];
    };
    if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) {
      if (swiper.params.centeredSlides) {
        (swiper.visibleSlides || []).forEach((slide2) => {
          activeSlides.push(slide2);
        });
      } else {
        for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
          const index = swiper.activeIndex + i;
          if (index > swiper.slides.length && !isVirtual)
            break;
          const slide2 = getSlideByIndex(index);
          if (slide2)
            activeSlides.push(slide2);
        }
      }
    } else {
      const slide2 = getSlideByIndex(swiper.activeIndex);
      if (slide2)
        activeSlides.push(slide2);
    }
    for (i = 0; i < activeSlides.length; i += 1) {
      if (typeof activeSlides[i] !== "undefined") {
        const height = activeSlides[i].offsetHeight;
        newHeight = height > newHeight ? height : newHeight;
      }
    }
    if (newHeight || newHeight === 0)
      swiper.wrapperEl.style.height = `${newHeight}px`;
  }
  function updateClickedSlide(el, path) {
    var _a;
    const swiper = this;
    const params = swiper.params;
    let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
    if (!slide2 && swiper.isElement && path && path.length > 1 && path.includes(el)) {
      [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
        if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
          slide2 = pathEl;
        }
      });
    }
    let slideFound = false;
    let slideIndex;
    if (slide2) {
      for (let i = 0; i < swiper.slides.length; i += 1) {
        if (swiper.slides[i] === slide2) {
          slideFound = true;
          slideIndex = i;
          break;
        }
      }
    }
    if (slide2 && slideFound) {
      swiper.clickedSlide = slide2;
      if (swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled)) {
        swiper.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
      } else {
        swiper.clickedIndex = slideIndex;
      }
    } else {
      swiper.clickedSlide = void 0;
      swiper.clickedIndex = void 0;
      return;
    }
    if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) {
      swiper.slideToClickedSlide();
    }
  }
  function updateProgress(translate2) {
    const swiper = this;
    if (typeof translate2 === "undefined") {
      const multiplier = swiper.rtlTranslate ? -1 : 1;
      translate2 = swiper && swiper.translate && swiper.translate * multiplier || 0;
    }
    const params = swiper.params;
    const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    let { progress, isBeginning, isEnd } = swiper;
    let progressLoop = swiper.progressLoop;
    const wasBeginning = isBeginning;
    const wasEnd = isEnd;
    if (translatesDiff === 0) {
      progress = 0;
      isBeginning = true;
      isEnd = true;
    } else {
      progress = (translate2 - swiper.minTranslate()) / translatesDiff;
      const isBeginningRounded = Math.abs(translate2 - swiper.minTranslate()) < 1;
      const isEndRounded = Math.abs(translate2 - swiper.maxTranslate()) < 1;
      isBeginning = isBeginningRounded || progress <= 0;
      isEnd = isEndRounded || progress >= 1;
      if (isBeginningRounded)
        progress = 0;
      if (isEndRounded)
        progress = 1;
    }
    if (params.loop) {
      const firstSlideIndex = swiper.getSlideIndexByData(0);
      const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
      const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
      const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
      const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
      const translateAbs = Math.abs(translate2);
      if (translateAbs >= firstSlideTranslate) {
        progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
      } else {
        progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
      }
      if (progressLoop > 1)
        progressLoop -= 1;
    }
    Object.assign(swiper, {
      progress,
      progressLoop,
      isBeginning,
      isEnd
    });
    if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight)
      swiper.updateSlidesProgress(translate2);
    if (isBeginning && !wasBeginning) {
      swiper.emit("reachBeginning toEdge");
    }
    if (isEnd && !wasEnd) {
      swiper.emit("reachEnd toEdge");
    }
    if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
      swiper.emit("fromEdge");
    }
    swiper.emit("progress", progress);
  }
  function updateSize() {
    const swiper = this;
    let width;
    let height;
    const el = swiper.el;
    if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) {
      width = swiper.params.width;
    } else {
      width = el.clientWidth;
    }
    if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) {
      height = swiper.params.height;
    } else {
      height = el.clientHeight;
    }
    if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
      return;
    }
    width = width - parseInt(elementStyle(el, "padding-left") || "0", 10) - parseInt(elementStyle(el, "padding-right") || "0", 10);
    height = height - parseInt(elementStyle(el, "padding-top") || "0", 10) - parseInt(elementStyle(el, "padding-bottom") || "0", 10);
    if (Number.isNaN(width))
      width = 0;
    if (Number.isNaN(height))
      height = 0;
    Object.assign(swiper, {
      width,
      height,
      size: swiper.isHorizontal() ? width : height
    });
  }
  function updateSlides() {
    var _a, _b, _c, _d;
    const swiper = this;
    function getDirectionPropertyValue(node, label) {
      return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || "0");
    }
    const params = swiper.params;
    const { wrapperEl, slidesEl, rtlTranslate: rtl, wrongRTL } = swiper;
    const isVirtual = !!(swiper.virtual && ((_a = params.virtual) == null ? void 0 : _a.enabled));
    const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
    const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
    const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
    let snapGrid = [];
    const slidesGrid = [];
    const slidesSizesGrid = [];
    const resolveOffset = (value) => typeof value === "function" ? value.call(swiper) : value;
    const offsetBefore = resolveOffset(params.slidesOffsetBefore);
    const offsetAfter = resolveOffset(params.slidesOffsetAfter);
    const previousSnapGridLength = swiper.snapGrid.length;
    const previousSlidesGridLength = swiper.slidesGrid.length;
    const swiperSize = swiper.size - offsetBefore - offsetAfter;
    let spaceBetween = params.spaceBetween;
    let slidePosition = -offsetBefore;
    let prevSlideSize = 0;
    let index = 0;
    if (typeof swiperSize === "undefined") {
      return;
    }
    if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
      spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
    } else if (typeof spaceBetween === "string") {
      spaceBetween = parseFloat(spaceBetween);
    }
    swiper.virtualSize = -spaceBetween - offsetBefore - offsetAfter;
    slides.forEach((slideEl) => {
      if (rtl) {
        slideEl.style.marginLeft = "";
      } else {
        slideEl.style.marginRight = "";
      }
      slideEl.style.marginBottom = "";
      slideEl.style.marginTop = "";
    });
    if (params.centeredSlides && params.cssMode) {
      setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
      setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
    }
    if (params.cssMode) {
      setCSSProperty(wrapperEl, "--swiper-slides-offset-before", `${offsetBefore}px`);
      setCSSProperty(wrapperEl, "--swiper-slides-offset-after", `${offsetAfter}px`);
    }
    const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
    if (gridEnabled) {
      swiper.grid.initSlides(slides);
    } else if (swiper.grid) {
      swiper.grid.unsetSlides();
    }
    let slideSize = 0;
    const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
      const bp = params.breakpoints[key];
      return typeof (bp == null ? void 0 : bp.slidesPerView) !== "undefined";
    }).length > 0;
    for (let i = 0; i < slidesLength; i += 1) {
      slideSize = 0;
      const slide2 = slides[i];
      if (slide2) {
        if (gridEnabled) {
          swiper.grid.updateSlide(i, slide2, slides);
        }
        if (elementStyle(slide2, "display") === "none")
          continue;
      }
      if (isVirtual && params.slidesPerView === "auto") {
        if ((_b = params.virtual) == null ? void 0 : _b.slidesPerViewAutoSlideSize) {
          slideSize = params.virtual.slidesPerViewAutoSlideSize;
        }
        if (slideSize && slide2) {
          if (params.roundLengths)
            slideSize = Math.floor(slideSize);
          slide2.style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
        }
      } else if (params.slidesPerView === "auto") {
        if (shouldResetSlideSize) {
          slide2.style[swiper.getDirectionLabel("width")] = ``;
        }
        const slideStyles = getComputedStyle(slide2);
        const currentTransform = slide2.style.transform;
        const currentWebKitTransform = slide2.style.webkitTransform;
        if (currentTransform) {
          slide2.style.transform = "none";
        }
        if (currentWebKitTransform) {
          slide2.style.webkitTransform = "none";
        }
        if (params.roundLengths) {
          slideSize = swiper.isHorizontal() ? elementOuterSize(slide2, "width") : elementOuterSize(slide2, "height");
        } else {
          const width = getDirectionPropertyValue(slideStyles, "width");
          const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
          const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
          const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
          const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
          const boxSizing = slideStyles.getPropertyValue("box-sizing");
          if (boxSizing && boxSizing === "border-box") {
            slideSize = width + marginLeft + marginRight;
          } else {
            const { clientWidth, offsetWidth } = slide2;
            slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
          }
        }
        if (currentTransform) {
          slide2.style.transform = currentTransform;
        }
        if (currentWebKitTransform) {
          slide2.style.webkitTransform = currentWebKitTransform;
        }
        if (params.roundLengths)
          slideSize = Math.floor(slideSize);
      } else {
        slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
        if (params.roundLengths)
          slideSize = Math.floor(slideSize);
        if (slide2) {
          slide2.style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
        }
      }
      if (slide2) {
        slide2.swiperSlideSize = slideSize;
      }
      slidesSizesGrid.push(slideSize);
      if (params.centeredSlides) {
        slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
        if (prevSlideSize === 0 && i !== 0)
          slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
        if (i === 0)
          slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
        if (Math.abs(slidePosition) < 1 / 1e3)
          slidePosition = 0;
        if (params.roundLengths)
          slidePosition = Math.floor(slidePosition);
        if (index % params.slidesPerGroup === 0)
          snapGrid.push(slidePosition);
        slidesGrid.push(slidePosition);
      } else {
        if (params.roundLengths)
          slidePosition = Math.floor(slidePosition);
        if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0)
          snapGrid.push(slidePosition);
        slidesGrid.push(slidePosition);
        slidePosition = slidePosition + slideSize + spaceBetween;
      }
      swiper.virtualSize += slideSize + spaceBetween;
      prevSlideSize = slideSize;
      index += 1;
    }
    swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
    if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
      wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
    }
    if (params.setWrapperSize) {
      wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
    }
    if (gridEnabled) {
      swiper.grid.updateWrapperSize(slideSize, snapGrid);
    }
    if (!params.centeredSlides) {
      const isFractionalSlidesPerView = params.slidesPerView !== "auto" && params.slidesPerView % 1 !== 0;
      const shouldSnapToSlideEdge = params.snapToSlideEdge && !params.loop && (params.slidesPerView === "auto" || isFractionalSlidesPerView);
      let lastAllowedSnapIndex = snapGrid.length;
      if (shouldSnapToSlideEdge) {
        let minVisibleSlides;
        if (params.slidesPerView === "auto") {
          minVisibleSlides = 1;
          let accumulatedSize = 0;
          for (let i = slidesSizesGrid.length - 1; i >= 0; i -= 1) {
            accumulatedSize += slidesSizesGrid[i] + (i < slidesSizesGrid.length - 1 ? spaceBetween : 0);
            if (accumulatedSize <= swiperSize) {
              minVisibleSlides = slidesSizesGrid.length - i;
            } else {
              break;
            }
          }
        } else {
          minVisibleSlides = Math.floor(params.slidesPerView);
        }
        lastAllowedSnapIndex = Math.max(slidesLength - minVisibleSlides, 0);
      }
      const newSlidesGrid = [];
      for (let i = 0; i < snapGrid.length; i += 1) {
        let slidesGridItem = snapGrid[i];
        if (params.roundLengths)
          slidesGridItem = Math.floor(slidesGridItem);
        if (shouldSnapToSlideEdge) {
          if (i <= lastAllowedSnapIndex) {
            newSlidesGrid.push(slidesGridItem);
          }
        } else if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
          newSlidesGrid.push(slidesGridItem);
        }
      }
      snapGrid = newSlidesGrid;
      if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
        if (!shouldSnapToSlideEdge) {
          snapGrid.push(swiper.virtualSize - swiperSize);
        }
      }
    }
    if (isVirtual && params.loop) {
      const size = slidesSizesGrid[0] + spaceBetween;
      const slidesBefore = (_c = swiper.virtual.slidesBefore) != null ? _c : 0;
      const slidesAfter = (_d = swiper.virtual.slidesAfter) != null ? _d : 0;
      const virtualLoopCount = slidesBefore + slidesAfter;
      if (params.slidesPerGroup > 1) {
        const groups = Math.ceil(virtualLoopCount / params.slidesPerGroup);
        const groupSize = size * params.slidesPerGroup;
        for (let i = 0; i < groups; i += 1) {
          snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
        }
      }
      for (let i = 0; i < virtualLoopCount; i += 1) {
        if (params.slidesPerGroup === 1) {
          snapGrid.push(snapGrid[snapGrid.length - 1] + size);
        }
        slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
        swiper.virtualSize += size;
      }
    }
    if (snapGrid.length === 0)
      snapGrid = [0];
    if (spaceBetween !== 0) {
      const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
      slides.filter((_, slideIndex) => {
        if (!params.cssMode || params.loop)
          return true;
        if (slideIndex === slides.length - 1) {
          return false;
        }
        return true;
      }).forEach((slideEl) => {
        slideEl.style[key] = `${spaceBetween}px`;
      });
    }
    if (params.centeredSlides && params.centeredSlidesBounds) {
      let allSlidesSize = 0;
      slidesSizesGrid.forEach((slideSizeValue) => {
        allSlidesSize += slideSizeValue + (spaceBetween || 0);
      });
      allSlidesSize -= spaceBetween;
      const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
      snapGrid = snapGrid.map((snap) => {
        if (snap <= 0)
          return -offsetBefore;
        if (snap > maxSnap)
          return maxSnap + offsetAfter;
        return snap;
      });
    }
    if (params.centerInsufficientSlides) {
      let allSlidesSize = 0;
      slidesSizesGrid.forEach((slideSizeValue) => {
        allSlidesSize += slideSizeValue + (spaceBetween || 0);
      });
      allSlidesSize -= spaceBetween;
      if (allSlidesSize < swiperSize) {
        const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
        snapGrid.forEach((snap, snapIndex) => {
          snapGrid[snapIndex] = snap - allSlidesOffset;
        });
        slidesGrid.forEach((snap, snapIndex) => {
          slidesGrid[snapIndex] = snap + allSlidesOffset;
        });
      }
    }
    Object.assign(swiper, {
      slides,
      snapGrid,
      slidesGrid,
      slidesSizesGrid
    });
    if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
      setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
      setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
      const addToSnapGrid = -swiper.snapGrid[0];
      const addToSlidesGrid = -swiper.slidesGrid[0];
      swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
      swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
    }
    if (slidesLength !== previousSlidesLength) {
      swiper.emit("slidesLengthChange");
    }
    if (snapGrid.length !== previousSnapGridLength) {
      if (swiper.params.watchOverflow)
        swiper.checkOverflow();
      swiper.emit("snapGridLengthChange");
    }
    if (slidesGrid.length !== previousSlidesGridLength) {
      swiper.emit("slidesGridLengthChange");
    }
    if (params.watchSlidesProgress) {
      swiper.updateSlidesOffset();
    }
    swiper.emit("slidesUpdated");
    if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
      const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
      const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
      if (slidesLength <= params.maxBackfaceHiddenSlides) {
        if (!hasClassBackfaceClassAdded)
          swiper.el.classList.add(backFaceHiddenClass);
      } else if (hasClassBackfaceClassAdded) {
        swiper.el.classList.remove(backFaceHiddenClass);
      }
    }
  }
  var toggleSlideClasses$1 = (slideEl, condition, className) => {
    if (condition && !slideEl.classList.contains(className)) {
      slideEl.classList.add(className);
    } else if (!condition && slideEl.classList.contains(className)) {
      slideEl.classList.remove(className);
    }
  };
  function updateSlidesClasses() {
    var _a, _b;
    const swiper = this;
    const { slides, params, slidesEl, activeIndex } = swiper;
    const isVirtual = !!(swiper.virtual && ((_a = params.virtual) == null ? void 0 : _a.enabled));
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    const getFilteredSlide = (selector2) => {
      return elementChildren(slidesEl, `.${params.slideClass}${selector2}, swiper-slide${selector2}`)[0];
    };
    let activeSlide;
    let prevSlide;
    let nextSlide;
    if (isVirtual) {
      if (params.loop) {
        const virtualSlides = swiper.virtual.slides;
        let slideIndex = activeIndex - ((_b = swiper.virtual.slidesBefore) != null ? _b : 0);
        if (slideIndex < 0)
          slideIndex = virtualSlides.length + slideIndex;
        if (slideIndex >= virtualSlides.length)
          slideIndex -= virtualSlides.length;
        activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
      } else {
        activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
      }
    } else if (gridEnabled) {
      activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
      nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
      prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
    } else {
      activeSlide = slides[activeIndex];
    }
    if (activeSlide) {
      if (!gridEnabled) {
        nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
        if (params.loop && !nextSlide) {
          nextSlide = slides[0];
        }
        prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
        if (params.loop && !prevSlide === 0) {
          prevSlide = slides[slides.length - 1];
        }
      }
    }
    slides.forEach((slideEl) => {
      toggleSlideClasses$1(slideEl, slideEl === activeSlide, params.slideActiveClass);
      toggleSlideClasses$1(slideEl, slideEl === nextSlide, params.slideNextClass);
      toggleSlideClasses$1(slideEl, slideEl === prevSlide, params.slidePrevClass);
    });
    swiper.emitSlidesClasses();
  }
  function updateSlidesOffset() {
    const swiper = this;
    const slides = swiper.slides;
    const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
    for (let i = 0; i < slides.length; i += 1) {
      slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
    }
  }
  var toggleSlideClasses = (slideEl, condition, className) => {
    if (condition && !slideEl.classList.contains(className)) {
      slideEl.classList.add(className);
    } else if (!condition && slideEl.classList.contains(className)) {
      slideEl.classList.remove(className);
    }
  };
  function updateSlidesProgress(translate2 = this && this.translate || 0) {
    var _a, _b, _c;
    const swiper = this;
    const params = swiper.params;
    const { slides, rtlTranslate: rtl, snapGrid } = swiper;
    if (slides.length === 0)
      return;
    if (typeof slides[0].swiperSlideOffset === "undefined")
      swiper.updateSlidesOffset();
    let offsetCenter = -translate2;
    if (rtl)
      offsetCenter = translate2;
    swiper.visibleSlidesIndexes = [];
    swiper.visibleSlides = [];
    let spaceBetween = params.spaceBetween;
    if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
      spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size;
    } else if (typeof spaceBetween === "string") {
      spaceBetween = parseFloat(spaceBetween);
    }
    for (let i = 0; i < slides.length; i += 1) {
      const slide2 = slides[i];
      let slideOffset = (_a = slide2.swiperSlideOffset) != null ? _a : 0;
      if (params.cssMode && params.centeredSlides) {
        slideOffset -= (_b = slides[0].swiperSlideOffset) != null ? _b : 0;
      }
      const slideSize = (_c = slide2.swiperSlideSize) != null ? _c : 0;
      const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slideSize + spaceBetween);
      const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slideSize + spaceBetween);
      const slideBefore = -(offsetCenter - slideOffset);
      const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
      const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
      const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
      if (isVisible) {
        swiper.visibleSlides.push(slide2);
        swiper.visibleSlidesIndexes.push(i);
      }
      toggleSlideClasses(slide2, isVisible, params.slideVisibleClass);
      toggleSlideClasses(slide2, isFullyVisible, params.slideFullyVisibleClass);
      slide2.progress = rtl ? -slideProgress : slideProgress;
      slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
    }
  }
  var update = {
    updateSize,
    updateSlides,
    updateAutoHeight,
    updateSlidesOffset,
    updateSlidesProgress,
    updateProgress,
    updateSlidesClasses,
    updateActiveIndex,
    updateClickedSlide
  };
  var prototypes = {
    eventsEmitter,
    update,
    translate,
    transition,
    slide,
    loop,
    grabCursor,
    events: events$1,
    breakpoints,
    checkOverflow: checkOverflow$1,
    classes
  };
  var extendedDefaults = {};
  var _Swiper = class _Swiper {
    constructor(...args) {
      var _a;
      let el;
      let params;
      if (args.length === 1 && args[0] !== null && typeof args[0] === "object" && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
        params = args[0];
      } else {
        [el, params] = args;
      }
      if (!params)
        params = {};
      params = extend({}, params);
      if (el && !params.el)
        params.el = el;
      if (params.el && typeof params.el === "string" && typeof document !== "undefined" && document.querySelectorAll(params.el).length > 1) {
        const swipers = [];
        document.querySelectorAll(params.el).forEach((containerEl) => {
          const newParams = extend({}, params, { el: containerEl });
          swipers.push(new _Swiper(newParams));
        });
        return swipers;
      }
      const swiper = this;
      swiper.__swiper__ = true;
      swiper.support = getSupport();
      swiper.device = getDevice({ userAgent: (_a = params.userAgent) != null ? _a : void 0 });
      swiper.browser = getBrowser();
      swiper.eventsListeners = {};
      swiper.eventsAnyListeners = [];
      swiper.modules = [...swiper.__modules__ || []];
      if (params.modules && Array.isArray(params.modules)) {
        params.modules.forEach((mod) => {
          const fn = mod;
          if (typeof fn === "function" && swiper.modules.indexOf(fn) < 0) {
            swiper.modules.push(fn);
          }
        });
      }
      const allModulesParams = {};
      swiper.modules.forEach((mod) => {
        mod({
          params,
          swiper,
          extendParams: moduleExtendParams(params, allModulesParams),
          on: swiper.on.bind(swiper),
          once: swiper.once.bind(swiper),
          off: swiper.off.bind(swiper),
          emit: swiper.emit.bind(swiper)
        });
      });
      const swiperParams = extend({}, defaults, allModulesParams);
      swiper.params = extend({}, swiperParams, extendedDefaults, params);
      swiper.originalParams = extend({}, swiper.params);
      swiper.passedParams = extend({}, params);
      if (swiper.params && swiper.params.on) {
        const onHandlers = swiper.params.on;
        Object.keys(onHandlers).forEach((eventName) => {
          const handler = onHandlers[eventName];
          if (handler)
            swiper.on(eventName, handler);
        });
      }
      if (swiper.params && swiper.params.onAny) {
        swiper.onAny(swiper.params.onAny);
      }
      Object.assign(swiper, {
        enabled: swiper.params.enabled,
        el,
        // Classes
        classNames: [],
        // Slides
        slides: [],
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],
        // isDirection
        isHorizontal() {
          return swiper.params.direction === "horizontal";
        },
        isVertical() {
          return swiper.params.direction === "vertical";
        },
        // Indexes
        activeIndex: 0,
        realIndex: 0,
        //
        isBeginning: true,
        isEnd: false,
        // Props
        translate: 0,
        previousTranslate: 0,
        progress: 0,
        velocity: 0,
        animating: false,
        cssOverflowAdjustment() {
          return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
        },
        // Locks
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev,
        // Touch Events
        touchEventsData: {
          isTouched: void 0,
          isMoved: void 0,
          allowTouchCallbacks: void 0,
          touchStartTime: void 0,
          isScrolling: void 0,
          currentTranslate: void 0,
          startTranslate: void 0,
          allowThresholdMove: void 0,
          // Form elements to match
          focusableElements: swiper.params.focusableElements,
          // Last click time
          lastClickTime: 0,
          clickTimeout: void 0,
          // Velocities
          velocities: [],
          allowMomentumBounce: void 0,
          startMoving: void 0,
          pointerId: null,
          touchId: null
        },
        // Clicks
        allowClick: true,
        // Touches
        allowTouchMove: swiper.params.allowTouchMove,
        touches: {
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          diff: 0
        },
        // Images
        imagesToLoad: [],
        imagesLoaded: 0
      });
      swiper.emit("_swiper");
      if (swiper.params.init) {
        swiper.init();
      }
      return swiper;
    }
    getDirectionLabel(property) {
      if (this.isHorizontal()) {
        return property;
      }
      return {
        "width": "height",
        "margin-top": "margin-left",
        "margin-bottom ": "margin-right",
        "margin-left": "margin-top",
        "margin-right": "margin-bottom",
        "padding-left": "padding-top",
        "padding-right": "padding-bottom",
        "marginRight": "marginBottom"
      }[property];
    }
    /**
     * !INTERNAL
     */
    isHorizontal() {
      return this.params.direction === "horizontal";
    }
    isVertical() {
      return this.params.direction === "vertical";
    }
    cssOverflowAdjustment() {
      return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
    }
    getSlideIndex(slideEl) {
      const { slidesEl, params } = this;
      const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
      const firstSlideIndex = elementIndex(slides[0]);
      return elementIndex(slideEl) - (firstSlideIndex != null ? firstSlideIndex : 0);
    }
    getSlideIndexByData(index) {
      return this.getSlideIndex(this.slides.find((slideEl) => Number(slideEl.getAttribute("data-swiper-slide-index")) === index));
    }
    getSlideIndexWhenGrid(index) {
      if (this.grid && this.params.grid && this.params.grid.rows > 1) {
        if (this.params.grid.fill === "column") {
          index = Math.floor(index / this.params.grid.rows);
        } else if (this.params.grid.fill === "row") {
          index = index % Math.ceil(this.slides.length / this.params.grid.rows);
        }
      }
      return index;
    }
    recalcSlides() {
      const { slidesEl, params } = this;
      this.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    }
    /**
     * Enable Swiper (if it was disabled)
     */
    enable() {
      if (this.enabled)
        return;
      this.enabled = true;
      if (this.params.grabCursor) {
        this.setGrabCursor();
      }
      this.emit("enable");
    }
    /**
     * Disable Swiper (if it was enabled). When Swiper is disabled, it will hide all navigation elements and won't respond to any events and interactions
     */
    disable() {
      if (!this.enabled)
        return;
      this.enabled = false;
      if (this.params.grabCursor) {
        this.unsetGrabCursor();
      }
      this.emit("disable");
    }
    /**
     * Set Swiper translate progress (from 0 to 1). Where 0 - its initial position (offset) on first slide, and 1 - its maximum position (offset) on last slide
     *
     * @param progress Swiper translate progress (from 0 to 1).
     * @param speed Transition duration (in ms).
     */
    setProgress(progress, speed) {
      progress = Math.min(Math.max(progress, 0), 1);
      const min = this.minTranslate();
      const max = this.maxTranslate();
      const current = (max - min) * progress + min;
      this.translateTo(current, typeof speed === "undefined" ? 0 : speed);
      this.updateActiveIndex();
      this.updateSlidesClasses();
    }
    emitContainerClasses() {
      if (!this.params._emitClasses || !this.el)
        return;
      const cls = this.el.className.split(" ").filter((className) => {
        return className.indexOf("swiper") === 0 || className.indexOf(this.params.containerModifierClass) === 0;
      });
      this.emit("_containerClasses", cls.join(" "));
    }
    getSlideClasses(slideEl) {
      if (this.destroyed)
        return "";
      return slideEl.className.split(" ").filter((className) => {
        return className.indexOf("swiper-slide") === 0 || className.indexOf(this.params.slideClass) === 0;
      }).join(" ");
    }
    emitSlidesClasses() {
      if (!this.params._emitClasses || !this.el)
        return;
      const updates = [];
      this.slides.forEach((slideEl) => {
        const classNames = this.getSlideClasses(slideEl);
        updates.push({ slideEl, classNames });
        this.emit("_slideClass", slideEl, classNames);
      });
      this.emit("_slideClasses", updates);
    }
    /**
     * Get dynamically calculated amount of slides per view, useful only when slidesPerView set to `auto`
     */
    slidesPerViewDynamic(view = "current", exact = false) {
      var _a, _b, _c;
      const { params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex } = this;
      let spv = 1;
      if (typeof params.slidesPerView === "number")
        return params.slidesPerView;
      if (!swiperSize)
        return spv;
      if (params.centeredSlides) {
        let slideSize = slides[activeIndex] ? Math.ceil((_a = slides[activeIndex].swiperSlideSize) != null ? _a : 0) : 0;
        let breakLoop = false;
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          if (slides[i] && !breakLoop) {
            slideSize += Math.ceil((_b = slides[i].swiperSlideSize) != null ? _b : 0);
            spv += 1;
            if (slideSize > swiperSize)
              breakLoop = true;
          }
        }
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          if (slides[i] && !breakLoop) {
            slideSize += (_c = slides[i].swiperSlideSize) != null ? _c : 0;
            spv += 1;
            if (slideSize > swiperSize)
              breakLoop = true;
          }
        }
      } else if (view === "current") {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
      return spv;
    }
    /**
     * You should call it after you add/remove slides
     * manually, or after you hide/show it, or do any
     * custom DOM modifications with Swiper
     * This method also includes subcall of the following
     * methods which you can use separately:
     */
    update() {
      var _a, _b;
      const swiper = this;
      if (!swiper || swiper.destroyed)
        return;
      const { snapGrid, params } = swiper;
      if (params.breakpoints) {
        swiper.setBreakpoint();
      }
      [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
        if (imageEl.complete) {
          processLazyPreloader(swiper, imageEl);
        }
      });
      swiper.updateSize();
      swiper.updateSlides();
      swiper.updateProgress();
      swiper.updateSlidesClasses();
      function setTranslate2() {
        const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
        const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
        swiper.setTranslate(newTranslate);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      let translated;
      if (((_a = params.freeMode) == null ? void 0 : _a.enabled) && !params.cssMode) {
        setTranslate2();
        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }
      } else {
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
          const slidesLength = swiper.virtual && ((_b = params.virtual) == null ? void 0 : _b.enabled) ? swiper.virtual.slides.length : swiper.slides.length;
          translated = swiper.slideTo(slidesLength - 1, 0, false, true);
        } else {
          translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
        }
        if (!translated) {
          setTranslate2();
        }
      }
      if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
      }
      swiper.emit("update");
    }
    /**
     * Changes slider direction from horizontal to vertical and back.
     *
     * @param direction New direction. If not specified, then will automatically changed to opposite direction
     * @param needUpdate Will call swiper.update(). Default true
     */
    changeDirection(newDirection, needUpdate = true) {
      const swiper = this;
      const currentDirection = swiper.params.direction;
      if (!newDirection) {
        newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
      }
      if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
        return swiper;
      }
      swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
      swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
      swiper.emitContainerClasses();
      swiper.params.direction = newDirection;
      swiper.slides.forEach((slideEl) => {
        if (newDirection === "vertical") {
          slideEl.style.width = "";
        } else {
          slideEl.style.height = "";
        }
      });
      swiper.emit("changeDirection");
      if (needUpdate)
        swiper.update();
      return swiper;
    }
    /**
     * Changes slider language
     *
     * @param direction New direction. Should be `rtl` or `ltr`
     */
    changeLanguageDirection(direction) {
      const swiper = this;
      if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr")
        return;
      swiper.rtl = direction === "rtl";
      swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
      if (swiper.rtl) {
        swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
        swiper.el.dir = "rtl";
      } else {
        swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
        swiper.el.dir = "ltr";
      }
      swiper.update();
    }
    mount(element) {
      const swiper = this;
      if (swiper.mounted)
        return true;
      if (typeof document === "undefined")
        return false;
      const initialEl = element != null ? element : swiper.params.el;
      let el = null;
      if (typeof initialEl === "string") {
        el = document.querySelector(initialEl);
      } else if (initialEl instanceof HTMLElement) {
        el = initialEl;
      }
      if (!el) {
        return false;
      }
      el.swiper = swiper;
      const parent = el.parentNode;
      if (parent && parent.host && parent.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
        swiper.isElement = true;
      }
      const getWrapperSelector = () => {
        return `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
      };
      const getWrapper = () => {
        if (el && el.shadowRoot) {
          const res = el.shadowRoot.querySelector(getWrapperSelector());
          return res;
        }
        return elementChildren(el, getWrapperSelector())[0];
      };
      let wrapperEl = getWrapper();
      if (!wrapperEl && swiper.params.createElements) {
        wrapperEl = createElement("div", swiper.params.wrapperClass);
        el.append(wrapperEl);
        elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
          wrapperEl.append(slideEl);
        });
      }
      const host = swiper.isElement ? el.parentNode.host : null;
      Object.assign(swiper, {
        el,
        wrapperEl,
        slidesEl: swiper.isElement && !host.slideSlots ? host : wrapperEl,
        hostEl: swiper.isElement ? host : el,
        mounted: true,
        // RTL
        rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
        rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
        wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
      });
      return true;
    }
    /**
     * Initialize slider
     */
    init(el) {
      var _a, _b, _c;
      const swiper = this;
      if (swiper.initialized)
        return swiper;
      const mounted = swiper.mount(el);
      if (mounted === false)
        return swiper;
      swiper.emit("beforeInit");
      if (swiper.params.breakpoints) {
        swiper.setBreakpoint();
      }
      swiper.addClasses();
      swiper.updateSize();
      swiper.updateSlides();
      if (swiper.params.watchOverflow) {
        swiper.checkOverflow();
      }
      if (swiper.params.grabCursor && swiper.enabled) {
        swiper.setGrabCursor();
      }
      if (swiper.params.loop && swiper.virtual && ((_a = swiper.params.virtual) == null ? void 0 : _a.enabled)) {
        swiper.slideTo(((_b = swiper.params.initialSlide) != null ? _b : 0) + ((_c = swiper.virtual.slidesBefore) != null ? _c : 0), 0, swiper.params.runCallbacksOnInit, false, true);
      } else {
        swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
      }
      if (swiper.params.loop) {
        swiper.loopCreate(void 0, true);
      }
      swiper.attachEvents();
      const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
      if (swiper.isElement) {
        lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
      }
      lazyElements.forEach((imageEl) => {
        if (imageEl.complete) {
          processLazyPreloader(swiper, imageEl);
        } else {
          imageEl.addEventListener("load", (e) => {
            processLazyPreloader(swiper, e.target);
          });
        }
      });
      preload(swiper);
      swiper.initialized = true;
      preload(swiper);
      swiper.emit("init");
      swiper.emit("afterInit");
      return swiper;
    }
    /**
     * Destroy slider instance and detach all events listeners
     *
     * @param deleteInstance Set it to false (by default it is true) to not to delete Swiper instance
     * @param cleanStyles Set it to true (by default it is true) and all custom styles will be removed from slides, wrapper and container.
     * Useful if you need to destroy Swiper and to init again with new options or in different direction
     */
    destroy(deleteInstance = true, cleanStyles = true) {
      const swiper = this;
      const { params, el, wrapperEl, slides } = swiper;
      if (typeof swiper.params === "undefined" || swiper.destroyed) {
        return null;
      }
      swiper.emit("beforeDestroy");
      swiper.initialized = false;
      swiper.detachEvents();
      if (params.loop) {
        swiper.loopDestroy();
      }
      if (cleanStyles) {
        swiper.removeClasses();
        if (el && typeof el !== "string") {
          el.removeAttribute("style");
        }
        if (wrapperEl) {
          wrapperEl.removeAttribute("style");
        }
        if (slides && slides.length) {
          slides.forEach((slideEl) => {
            slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
            slideEl.removeAttribute("style");
            slideEl.removeAttribute("data-swiper-slide-index");
          });
        }
      }
      swiper.emit("destroy");
      Object.keys(swiper.eventsListeners).forEach((eventName) => {
        swiper.off(eventName);
      });
      if (deleteInstance !== false) {
        if (swiper.el && typeof swiper.el !== "string") {
          swiper.el.swiper = null;
        }
        deleteProps(swiper);
      }
      swiper.destroyed = true;
      return null;
    }
    static extendDefaults(newDefaults) {
      extend(extendedDefaults, newDefaults);
    }
    static installModule(mod) {
      if (!_Swiper.prototype.__modules__)
        _Swiper.prototype.__modules__ = [];
      const modules = _Swiper.prototype.__modules__;
      if (typeof mod === "function" && modules.indexOf(mod) < 0) {
        modules.push(mod);
      }
    }
    static use(module) {
      if (Array.isArray(module)) {
        module.forEach((m) => _Swiper.installModule(m));
        return _Swiper;
      }
      _Swiper.installModule(module);
      return _Swiper;
    }
  };
  __publicField(_Swiper, "extendedDefaults");
  __publicField(_Swiper, "defaults");
  var Swiper = _Swiper;
  Object.defineProperty(Swiper, "extendedDefaults", {
    get() {
      return extendedDefaults;
    }
  });
  Object.defineProperty(Swiper, "defaults", {
    get() {
      return defaults;
    }
  });
  var prototypeRecord = prototypes;
  var swiperProto = Swiper.prototype;
  Object.keys(prototypeRecord).forEach((prototypeGroup) => {
    const group = prototypeRecord[prototypeGroup];
    Object.keys(group).forEach((protoMethod) => {
      swiperProto[protoMethod] = group[protoMethod];
    });
  });
  Swiper.use([Resize, Observer]);

  // assets/common/node_modules/swiper/modules/keyboard.mjs
  var Keyboard = ({ swiper, extendParams, on, emit }) => {
    extendParams({
      keyboard: {
        enabled: false,
        onlyInViewport: true,
        pageUpDown: true,
        speed: void 0
      }
    });
    function getParams() {
      return swiper.params.keyboard;
    }
    function handle(event) {
      if (!swiper.enabled)
        return;
      const { rtlTranslate: rtl } = swiper;
      const e = "originalEvent" in event && event.originalEvent ? event.originalEvent : event;
      const kc = e.keyCode || e.charCode;
      const params = getParams();
      const pageUpDown = !!params.pageUpDown;
      const isPageUp = pageUpDown && kc === 33;
      const isPageDown = pageUpDown && kc === 34;
      const isArrowLeft = kc === 37;
      const isArrowRight = kc === 39;
      const isArrowUp = kc === 38;
      const isArrowDown = kc === 40;
      if (!swiper.allowSlideNext && (swiper.isHorizontal() && isArrowRight || swiper.isVertical() && isArrowDown || isPageDown)) {
        return false;
      }
      if (!swiper.allowSlidePrev && (swiper.isHorizontal() && isArrowLeft || swiper.isVertical() && isArrowUp || isPageUp)) {
        return false;
      }
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
        return void 0;
      }
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.isContentEditable || activeElement.nodeName && (activeElement.nodeName.toLowerCase() === "input" || activeElement.nodeName.toLowerCase() === "textarea"))) {
        return void 0;
      }
      if (params.onlyInViewport && (isPageUp || isPageDown || isArrowLeft || isArrowRight || isArrowUp || isArrowDown)) {
        let inView = false;
        if (elementParents(swiper.el, `.${swiper.params.slideClass}, swiper-slide`).length > 0 && elementParents(swiper.el, `.${swiper.params.slideActiveClass}`).length === 0) {
          return void 0;
        }
        const el = swiper.el;
        const swiperWidth = el.clientWidth;
        const swiperHeight = el.clientHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const swiperOffset = elementOffset(el);
        if (rtl)
          swiperOffset.left -= el.scrollLeft;
        const swiperCoord = [
          [swiperOffset.left, swiperOffset.top],
          [swiperOffset.left + swiperWidth, swiperOffset.top],
          [swiperOffset.left, swiperOffset.top + swiperHeight],
          [swiperOffset.left + swiperWidth, swiperOffset.top + swiperHeight]
        ];
        for (let i = 0; i < swiperCoord.length; i += 1) {
          const point = swiperCoord[i];
          if (point[0] >= 0 && point[0] <= windowWidth && point[1] >= 0 && point[1] <= windowHeight) {
            if (point[0] === 0 && point[1] === 0)
              continue;
            inView = true;
          }
        }
        if (!inView)
          return void 0;
      }
      const speed = params.speed;
      if (swiper.isHorizontal()) {
        if (isPageUp || isPageDown || isArrowLeft || isArrowRight) {
          if (e.cancelable)
            e.preventDefault();
        }
        if ((isPageDown || isArrowRight) && !rtl || (isPageUp || isArrowLeft) && rtl)
          swiper.slideNext(speed);
        if ((isPageUp || isArrowLeft) && !rtl || (isPageDown || isArrowRight) && rtl)
          swiper.slidePrev(speed);
      } else {
        if (isPageUp || isPageDown || isArrowUp || isArrowDown) {
          if (e.cancelable)
            e.preventDefault();
        }
        if (isPageDown || isArrowDown)
          swiper.slideNext(speed);
        if (isPageUp || isArrowUp)
          swiper.slidePrev(speed);
      }
      emit("keyPress", kc);
      return void 0;
    }
    function enable() {
      if (swiper.keyboard.enabled)
        return;
      document.addEventListener("keydown", handle);
      swiper.keyboard.enabled = true;
    }
    function disable() {
      if (!swiper.keyboard.enabled)
        return;
      document.removeEventListener("keydown", handle);
      swiper.keyboard.enabled = false;
    }
    swiper.keyboard = {
      enabled: false,
      enable,
      disable
    };
    on("init", () => {
      if (getParams().enabled) {
        enable();
      }
    });
    on("destroy", () => {
      if (swiper.keyboard.enabled) {
        disable();
      }
    });
  };

  // assets/common/node_modules/swiper/shared/create-element-if-not-defined.mjs
  function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
    const target = params != null ? params : {};
    const original = originalParams != null ? originalParams : {};
    if (swiper.params.createElements) {
      Object.keys(checkProps).forEach((key) => {
        if (!target[key] && target.auto === true) {
          let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
          if (!element) {
            element = createElement("div", checkProps[key]);
            element.className = checkProps[key];
            swiper.el.append(element);
          }
          target[key] = element;
          original[key] = element;
        }
      });
    }
    return target;
  }

  // assets/common/node_modules/swiper/modules/navigation.mjs
  var arrowSvg = `<svg class="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"/></svg>`;
  var Navigation = ({ swiper, extendParams, on, emit }) => {
    extendParams({
      navigation: {
        nextEl: null,
        prevEl: null,
        addIcons: true,
        hideOnClick: false,
        disabledClass: "swiper-button-disabled",
        hiddenClass: "swiper-button-hidden",
        lockClass: "swiper-button-lock",
        navigationDisabledClass: "swiper-navigation-disabled"
      }
    });
    swiper.navigation = {
      nextEl: null,
      prevEl: null,
      arrowSvg
    };
    function getParams() {
      return swiper.params.navigation;
    }
    function getEl(el) {
      let res;
      if (el && typeof el === "string" && swiper.isElement) {
        res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
        if (res)
          return res;
      }
      if (el) {
        if (typeof el === "string")
          res = [...document.querySelectorAll(el)];
        if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
          res = swiper.el.querySelector(el);
        } else if (res && res.length === 1) {
          res = res[0];
        }
      }
      if (el && !res)
        return el;
      return res;
    }
    function toggleEl(el, disabled) {
      const params = getParams();
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        if (subEl) {
          subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
          if (subEl.tagName === "BUTTON")
            subEl.disabled = disabled;
          if (swiper.params.watchOverflow && swiper.enabled) {
            subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
          }
        }
      });
    }
    function update2() {
      const { nextEl, prevEl } = swiper.navigation;
      if (swiper.params.loop) {
        toggleEl(prevEl, false);
        toggleEl(nextEl, false);
        return;
      }
      toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
      toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
    }
    function onPrevClick(e) {
      e.preventDefault();
      if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind)
        return;
      swiper.slidePrev();
      emit("navigationPrev");
    }
    function onNextClick(e) {
      e.preventDefault();
      if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind)
        return;
      swiper.slideNext();
      emit("navigationNext");
    }
    function init() {
      swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
        nextEl: "swiper-button-next",
        prevEl: "swiper-button-prev"
      });
      const params = getParams();
      if (!(params.nextEl || params.prevEl))
        return;
      const nextEl = getEl(params.nextEl);
      const prevEl = getEl(params.prevEl);
      Object.assign(swiper.navigation, {
        nextEl,
        prevEl
      });
      const nextEls = makeElementsArray(nextEl);
      const prevEls = makeElementsArray(prevEl);
      const initButton = (el, dir) => {
        if (el) {
          if (params.addIcons && el.matches(".swiper-button-next,.swiper-button-prev") && !el.querySelector("svg")) {
            const tempEl = document.createElement("div");
            setInnerHTML(tempEl, arrowSvg);
            const svgEl = tempEl.querySelector("svg");
            if (svgEl)
              el.appendChild(svgEl);
            tempEl.remove();
          }
          el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
        }
        if (!swiper.enabled && el) {
          el.classList.add(...params.lockClass.split(" "));
        }
      };
      nextEls.forEach((el) => initButton(el, "next"));
      prevEls.forEach((el) => initButton(el, "prev"));
    }
    function destroy() {
      const params = getParams();
      const { nextEl, prevEl } = swiper.navigation;
      const nextEls = makeElementsArray(nextEl);
      const prevEls = makeElementsArray(prevEl);
      const destroyButton = (el, dir) => {
        el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
        el.classList.remove(...params.disabledClass.split(" "));
      };
      nextEls.forEach((el) => destroyButton(el, "next"));
      prevEls.forEach((el) => destroyButton(el, "prev"));
    }
    on("init", () => {
      if (getParams().enabled === false) {
        disable();
      } else {
        init();
        update2();
      }
    });
    on("toEdge fromEdge lock unlock", () => {
      update2();
    });
    on("destroy", () => {
      destroy();
    });
    on("enable disable", () => {
      const params = getParams();
      const { nextEl, prevEl } = swiper.navigation;
      const nextEls = makeElementsArray(nextEl);
      const prevEls = makeElementsArray(prevEl);
      if (swiper.enabled) {
        update2();
        return;
      }
      [...nextEls, ...prevEls].filter((el) => !!el).forEach((el) => el.classList.add(params.lockClass));
    });
    on("click", (_s, e) => {
      const params = getParams();
      const { nextEl, prevEl } = swiper.navigation;
      const nextEls = makeElementsArray(nextEl);
      const prevEls = makeElementsArray(prevEl);
      const targetEl = e.target;
      let targetIsButton = prevEls.includes(targetEl) || nextEls.includes(targetEl);
      if (swiper.isElement && !targetIsButton) {
        const path = e.composedPath ? e.composedPath() : [];
        if (path.length) {
          targetIsButton = path.find((pathEl) => nextEls.includes(pathEl) || prevEls.includes(pathEl));
        }
      }
      if (params.hideOnClick && !targetIsButton) {
        if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl)))
          return;
        let isHidden;
        if (nextEls.length) {
          isHidden = nextEls[0].classList.contains(params.hiddenClass);
        } else if (prevEls.length) {
          isHidden = prevEls[0].classList.contains(params.hiddenClass);
        }
        if (isHidden === true) {
          emit("navigationShow");
        } else {
          emit("navigationHide");
        }
        [...nextEls, ...prevEls].filter((el) => !!el).forEach((el) => el.classList.toggle(params.hiddenClass));
      }
    });
    const enable = () => {
      const params = getParams();
      swiper.el.classList.remove(...params.navigationDisabledClass.split(" "));
      init();
      update2();
    };
    const disable = () => {
      const params = getParams();
      swiper.el.classList.add(...params.navigationDisabledClass.split(" "));
      destroy();
    };
    Object.assign(swiper.navigation, {
      enable,
      disable,
      update: update2,
      init,
      destroy
    });
  };

  // assets/common/node_modules/swiper/shared/classes-to-selector.mjs
  function classesToSelector(classes2 = "") {
    return `.${classes2.trim().replace(/([.:!+/()[\]#>~*^$|=,'"@{}\\])/g, "\\$1").replace(/ /g, ".")}`;
  }

  // assets/common/node_modules/swiper/modules/pagination.mjs
  var isVirtualEnabled = (swiper) => {
    var _a;
    return !!swiper.virtual && !!((_a = swiper.params.virtual) == null ? void 0 : _a.enabled);
  };
  var isFreeModeEnabled = (swiper) => {
    var _a;
    return !!((_a = swiper.params.freeMode) == null ? void 0 : _a.enabled);
  };
  var getSlidesLength = (swiper) => {
    var _a;
    if (isVirtualEnabled(swiper))
      return swiper.virtual.slides.length;
    const gridRows = (_a = swiper.params.grid) == null ? void 0 : _a.rows;
    if (swiper.grid && gridRows && gridRows > 1) {
      return swiper.slides.length / Math.ceil(gridRows);
    }
    return swiper.slides.length;
  };
  var Pagination = ({ swiper, extendParams, on, emit }) => {
    const pfx = "swiper-pagination";
    extendParams({
      pagination: {
        el: null,
        bulletElement: "span",
        clickable: false,
        hideOnClick: false,
        renderBullet: null,
        renderProgressbar: null,
        renderFraction: null,
        renderCustom: null,
        progressbarOpposite: false,
        type: "bullets",
        // 'bullets' or 'progressbar' or 'fraction' or 'custom'
        dynamicBullets: false,
        dynamicMainBullets: 1,
        formatFractionCurrent: (number2) => number2,
        formatFractionTotal: (number2) => number2,
        bulletClass: `${pfx}-bullet`,
        bulletActiveClass: `${pfx}-bullet-active`,
        modifierClass: `${pfx}-`,
        currentClass: `${pfx}-current`,
        totalClass: `${pfx}-total`,
        hiddenClass: `${pfx}-hidden`,
        progressbarFillClass: `${pfx}-progressbar-fill`,
        progressbarOppositeClass: `${pfx}-progressbar-opposite`,
        clickableClass: `${pfx}-clickable`,
        lockClass: `${pfx}-lock`,
        horizontalClass: `${pfx}-horizontal`,
        verticalClass: `${pfx}-vertical`,
        paginationDisabledClass: `${pfx}-disabled`
      }
    });
    swiper.pagination = {
      el: null,
      bullets: []
    };
    let bulletSize;
    let dynamicBulletIndex = 0;
    function getParams() {
      return swiper.params.pagination;
    }
    function isPaginationDisabled() {
      const elParam = getParams().el;
      return !elParam || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
    }
    function setSideBullets(bulletEl, position) {
      const { bulletActiveClass } = getParams();
      if (!bulletEl)
        return;
      let current = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
      if (current) {
        current.classList.add(`${bulletActiveClass}-${position}`);
        current = current[`${position === "prev" ? "previous" : "next"}ElementSibling`];
        if (current) {
          current.classList.add(`${bulletActiveClass}-${position}-${position}`);
        }
      }
    }
    function getMoveDirection(prevIndex, nextIndex, length) {
      prevIndex = prevIndex % length;
      nextIndex = nextIndex % length;
      if (nextIndex === prevIndex + 1) {
        return "next";
      } else if (nextIndex === prevIndex - 1) {
        return "previous";
      }
      return void 0;
    }
    function onBulletClick(e) {
      var _a, _b;
      const targetEl = e.target;
      const bulletEl = targetEl.closest(classesToSelector(getParams().bulletClass));
      if (!bulletEl) {
        return;
      }
      e.preventDefault();
      const index = ((_a = elementIndex(bulletEl)) != null ? _a : 0) * ((_b = swiper.params.slidesPerGroup) != null ? _b : 1);
      if (swiper.params.loop) {
        if (swiper.realIndex === index)
          return;
        const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
        if (moveDirection === "next") {
          swiper.slideNext();
        } else if (moveDirection === "previous") {
          swiper.slidePrev();
        } else {
          swiper.slideToLoop(index);
        }
      } else {
        swiper.slideTo(index);
      }
    }
    function update2() {
      var _a, _b, _c;
      const rtl = swiper.rtl;
      const params = getParams();
      if (isPaginationDisabled())
        return;
      const els = makeElementsArray(swiper.pagination.el);
      let current;
      let previousIndex;
      const slidesLength = getSlidesLength(swiper);
      const total = swiper.params.loop ? Math.ceil(slidesLength / ((_a = swiper.params.slidesPerGroup) != null ? _a : 1)) : swiper.snapGrid.length;
      if (swiper.params.loop) {
        previousIndex = swiper.previousRealIndex || 0;
        current = ((_b = swiper.params.slidesPerGroup) != null ? _b : 1) > 1 ? Math.floor(swiper.realIndex / ((_c = swiper.params.slidesPerGroup) != null ? _c : 1)) : swiper.realIndex;
      } else if (typeof swiper.snapIndex !== "undefined") {
        current = swiper.snapIndex;
        previousIndex = swiper.previousSnapIndex;
      } else {
        previousIndex = swiper.previousIndex || 0;
        current = swiper.activeIndex || 0;
      }
      if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
        const bullets = swiper.pagination.bullets;
        let firstIndex = 0;
        let lastIndex = 0;
        let midIndex = 0;
        if (params.dynamicBullets) {
          bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height");
          const dim = swiper.isHorizontal() ? "width" : "height";
          els.forEach((subEl) => {
            subEl.style[dim] = `${(bulletSize != null ? bulletSize : 0) * (params.dynamicMainBullets + 4)}px`;
          });
          if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
            dynamicBulletIndex += current - (previousIndex || 0);
            if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
              dynamicBulletIndex = params.dynamicMainBullets - 1;
            } else if (dynamicBulletIndex < 0) {
              dynamicBulletIndex = 0;
            }
          }
          firstIndex = Math.max(current - dynamicBulletIndex, 0);
          lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
          midIndex = (lastIndex + firstIndex) / 2;
        }
        bullets.forEach((bulletEl) => {
          const classesToRemove = [
            "",
            "-next",
            "-next-next",
            "-prev",
            "-prev-prev",
            "-main"
          ].map((suffix) => `${params.bulletActiveClass}${suffix}`).flatMap((s) => typeof s === "string" && s.includes(" ") ? s.split(" ") : [s]);
          bulletEl.classList.remove(...classesToRemove);
        });
        if (els.length > 1) {
          bullets.forEach((bullet) => {
            const bulletIndex = elementIndex(bullet);
            if (bulletIndex === current) {
              bullet.classList.add(...params.bulletActiveClass.split(" "));
            } else if (swiper.isElement) {
              bullet.setAttribute("part", "bullet");
            }
            if (params.dynamicBullets && bulletIndex !== void 0) {
              if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
              }
              if (bulletIndex === firstIndex) {
                setSideBullets(bullet, "prev");
              }
              if (bulletIndex === lastIndex) {
                setSideBullets(bullet, "next");
              }
            }
          });
        } else {
          const bullet = bullets[current];
          if (bullet) {
            bullet.classList.add(...params.bulletActiveClass.split(" "));
          }
          if (swiper.isElement) {
            bullets.forEach((bulletEl, bulletIndex) => {
              bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
            });
          }
          if (params.dynamicBullets) {
            const firstDisplayedBullet = bullets[firstIndex];
            const lastDisplayedBullet = bullets[lastIndex];
            for (let i = firstIndex; i <= lastIndex; i += 1) {
              if (bullets[i]) {
                bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
              }
            }
            setSideBullets(firstDisplayedBullet, "prev");
            setSideBullets(lastDisplayedBullet, "next");
          }
        }
        if (params.dynamicBullets) {
          const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
          const bulletsOffset = ((bulletSize != null ? bulletSize : 0) * dynamicBulletsLength - (bulletSize != null ? bulletSize : 0)) / 2 - midIndex * (bulletSize != null ? bulletSize : 0);
          const offsetProp = rtl ? "right" : "left";
          const positionDim = swiper.isHorizontal() ? offsetProp : "top";
          bullets.forEach((bullet) => {
            bullet.style[positionDim] = `${bulletsOffset}px`;
          });
        }
      }
      els.forEach((subEl, subElIndex) => {
        if (params.type === "fraction") {
          subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach((fractionEl) => {
            fractionEl.textContent = String(params.formatFractionCurrent(current + 1));
          });
          subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach((totalEl) => {
            totalEl.textContent = String(params.formatFractionTotal(total));
          });
        }
        if (params.type === "progressbar") {
          let progressbarDirection;
          if (params.progressbarOpposite) {
            progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal";
          } else {
            progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
          }
          const scale = (current + 1) / total;
          let scaleX = 1;
          let scaleY = 1;
          if (progressbarDirection === "horizontal") {
            scaleX = scale;
          } else {
            scaleY = scale;
          }
          subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach((progressEl) => {
            progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
            progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
          });
        }
        if (params.type === "custom" && params.renderCustom) {
          setInnerHTML(subEl, params.renderCustom(swiper, current + 1, total));
          if (subElIndex === 0)
            emit("paginationRender", subEl);
        } else {
          if (subElIndex === 0)
            emit("paginationRender", subEl);
          emit("paginationUpdate", subEl);
        }
        if (swiper.params.watchOverflow && swiper.enabled) {
          subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
        }
      });
    }
    function render() {
      var _a;
      const params = getParams();
      if (isPaginationDisabled())
        return;
      const slidesLength = getSlidesLength(swiper);
      const els = makeElementsArray(swiper.pagination.el);
      let paginationHTML = "";
      if (params.type === "bullets") {
        let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / ((_a = swiper.params.slidesPerGroup) != null ? _a : 1)) : swiper.snapGrid.length;
        if (swiper.params.freeMode && isFreeModeEnabled(swiper) && numberOfBullets > slidesLength) {
          numberOfBullets = slidesLength;
        }
        for (let i = 0; i < numberOfBullets; i += 1) {
          if (params.renderBullet) {
            paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
          } else {
            paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
          }
        }
      }
      if (params.type === "fraction") {
        if (params.renderFraction) {
          paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
        } else {
          paginationHTML = `<span class="${params.currentClass}"></span> / <span class="${params.totalClass}"></span>`;
        }
      }
      if (params.type === "progressbar") {
        if (params.renderProgressbar) {
          paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
        } else {
          paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
        }
      }
      swiper.pagination.bullets = [];
      els.forEach((subEl) => {
        if (params.type !== "custom") {
          setInnerHTML(subEl, paginationHTML || "");
        }
        if (params.type === "bullets") {
          swiper.pagination.bullets.push(...Array.from(subEl.querySelectorAll(classesToSelector(params.bulletClass))));
        }
      });
      if (params.type !== "custom") {
        emit("paginationRender", els[0]);
      }
    }
    function init() {
      swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, { el: "swiper-pagination" });
      const params = getParams();
      if (!params.el)
        return;
      let el;
      if (typeof params.el === "string" && swiper.isElement) {
        el = swiper.el.querySelector(params.el);
      }
      if (!el && typeof params.el === "string") {
        el = [...document.querySelectorAll(params.el)];
      }
      if (!el) {
        el = params.el;
      }
      if (!el || Array.isArray(el) && el.length === 0)
        return;
      if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
        el = [...swiper.el.querySelectorAll(params.el)];
        if (el.length > 1) {
          const found = el.find((subEl) => {
            if (elementParents(subEl, ".swiper")[0] !== swiper.el)
              return false;
            return true;
          });
          if (found)
            el = found;
        }
      }
      if (Array.isArray(el) && el.length === 1)
        el = el[0];
      Object.assign(swiper.pagination, {
        el
      });
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        if (params.type === "bullets" && params.clickable) {
          subEl.classList.add(...(params.clickableClass || "").split(" "));
        }
        subEl.classList.add(params.modifierClass + params.type);
        subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (params.type === "bullets" && params.dynamicBullets) {
          subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
          dynamicBulletIndex = 0;
          if (params.dynamicMainBullets < 1) {
            params.dynamicMainBullets = 1;
          }
        }
        if (params.type === "progressbar" && params.progressbarOpposite) {
          subEl.classList.add(params.progressbarOppositeClass);
        }
        if (params.clickable) {
          subEl.addEventListener("click", onBulletClick);
        }
        if (!swiper.enabled) {
          subEl.classList.add(params.lockClass);
        }
      });
    }
    function destroy() {
      const params = getParams();
      if (isPaginationDisabled())
        return;
      const el = swiper.pagination.el;
      if (el) {
        const els = makeElementsArray(el);
        els.forEach((subEl) => {
          subEl.classList.remove(params.hiddenClass);
          subEl.classList.remove(params.modifierClass + params.type);
          subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
          if (params.clickable) {
            subEl.classList.remove(...(params.clickableClass || "").split(" "));
            subEl.removeEventListener("click", onBulletClick);
          }
        });
      }
      if (swiper.pagination.bullets)
        swiper.pagination.bullets.forEach((subEl) => subEl.classList.remove(...params.bulletActiveClass.split(" ")));
    }
    on("changeDirection", () => {
      if (!swiper.pagination || !swiper.pagination.el)
        return;
      const params = getParams();
      const els = makeElementsArray(swiper.pagination.el);
      els.forEach((subEl) => {
        subEl.classList.remove(params.horizontalClass, params.verticalClass);
        subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
      });
    });
    on("init", () => {
      if (getParams().enabled === false) {
        disable();
      } else {
        init();
        render();
        update2();
      }
    });
    on("activeIndexChange", () => {
      if (typeof swiper.snapIndex === "undefined") {
        update2();
      }
    });
    on("snapIndexChange", () => {
      update2();
    });
    on("snapGridLengthChange", () => {
      render();
      update2();
    });
    on("destroy", () => {
      destroy();
    });
    on("enable disable", () => {
      const { el } = swiper.pagination;
      if (el) {
        const params = getParams();
        const els = makeElementsArray(el);
        els.forEach((subEl) => subEl.classList[swiper.enabled ? "remove" : "add"](params.lockClass));
      }
    });
    on("lock unlock", () => {
      update2();
    });
    on("click", (_s, e) => {
      const targetEl = e.target;
      const els = makeElementsArray(swiper.pagination.el);
      const params = getParams();
      if (params.el && params.hideOnClick && els && els.length > 0 && !targetEl.classList.contains(params.bulletClass)) {
        if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl))
          return;
        const isHidden = els[0].classList.contains(params.hiddenClass);
        if (isHidden === true) {
          emit("paginationShow");
        } else {
          emit("paginationHide");
        }
        els.forEach((subEl) => subEl.classList.toggle(params.hiddenClass));
      }
    });
    const enable = () => {
      const params = getParams();
      swiper.el.classList.remove(params.paginationDisabledClass);
      const { el } = swiper.pagination;
      if (el) {
        const els = makeElementsArray(el);
        els.forEach((subEl) => subEl.classList.remove(params.paginationDisabledClass));
      }
      init();
      render();
      update2();
    };
    const disable = () => {
      const params = getParams();
      swiper.el.classList.add(params.paginationDisabledClass);
      const { el } = swiper.pagination;
      if (el) {
        const els = makeElementsArray(el);
        els.forEach((subEl) => subEl.classList.add(params.paginationDisabledClass));
      }
      destroy();
    };
    Object.assign(swiper.pagination, {
      enable,
      disable,
      render,
      update: update2,
      init,
      destroy
    });
  };

  // assets/common/node_modules/swiper/modules/a11y.mjs
  var isVirtualEnabled2 = (swiper) => {
    var _a;
    return !!swiper.virtual && !!((_a = swiper.params.virtual) == null ? void 0 : _a.enabled);
  };
  var A11y = ({ swiper, extendParams, on }) => {
    extendParams({
      a11y: {
        enabled: true,
        notificationClass: "swiper-notification",
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "This is the first slide",
        lastSlideMessage: "This is the last slide",
        paginationBulletMessage: "Go to slide {{index}}",
        slideLabelMessage: "{{index}} / {{slidesLength}}",
        containerMessage: null,
        containerRoleDescriptionMessage: null,
        containerRole: null,
        itemRoleDescriptionMessage: null,
        slideRole: "group",
        id: null,
        scrollOnFocus: true,
        wrapperLiveRegion: true
      }
    });
    swiper.a11y = {
      clicked: false
    };
    let liveRegion = null;
    let preventFocusHandler = false;
    let focusTargetSlideEl;
    let visibilityChangedTimestamp = (/* @__PURE__ */ new Date()).getTime();
    function getParams() {
      return swiper.params.a11y;
    }
    function notify(message) {
      const notification = liveRegion;
      if (!notification || !message)
        return;
      setInnerHTML(notification, message);
    }
    function getRandomNumber(size = 16) {
      const randomChar = () => Math.round(16 * Math.random()).toString(16);
      return "x".repeat(size).replace(/x/g, randomChar);
    }
    function makeElFocusable(el) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("tabIndex", "0");
      });
    }
    function makeElNotFocusable(el) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("tabIndex", "-1");
      });
    }
    function addElRole(el, role) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("role", role);
      });
    }
    function addElRoleDescription(el, description) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("aria-roledescription", description);
      });
    }
    function addElLabel(el, label) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("aria-label", label);
      });
    }
    function addElId(el, id) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("id", id);
      });
    }
    function addElLive(el, live) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("aria-live", live);
      });
    }
    function disableEl(el) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.setAttribute("aria-disabled", "true");
      });
    }
    function enableEl(el) {
      const els = makeElementsArray(el);
      els.forEach((subEl) => {
        subEl.removeAttribute("aria-disabled");
      });
    }
    function onEnterOrSpaceKey(e) {
      if (e.keyCode !== 13 && e.keyCode !== 32)
        return;
      const params = getParams();
      const paginationParams = swiper.params.pagination;
      const targetEl = e.target;
      if (swiper.pagination && swiper.pagination.el && (targetEl === swiper.pagination.el || swiper.pagination.el.contains(targetEl))) {
        if (!targetEl.matches(classesToSelector(paginationParams == null ? void 0 : paginationParams.bulletClass)))
          return;
      }
      if (swiper.navigation && swiper.navigation.prevEl && swiper.navigation.nextEl) {
        const prevEls = makeElementsArray(swiper.navigation.prevEl);
        const nextEls = makeElementsArray(swiper.navigation.nextEl);
        if (nextEls.includes(targetEl)) {
          if (!(swiper.isEnd && !swiper.params.loop)) {
            swiper.slideNext();
          }
          if (swiper.isEnd) {
            notify(params.lastSlideMessage);
          } else {
            notify(params.nextSlideMessage);
          }
        }
        if (prevEls.includes(targetEl)) {
          if (!(swiper.isBeginning && !swiper.params.loop)) {
            swiper.slidePrev();
          }
          if (swiper.isBeginning) {
            notify(params.firstSlideMessage);
          } else {
            notify(params.prevSlideMessage);
          }
        }
      }
      if (swiper.pagination && targetEl.matches(classesToSelector(paginationParams == null ? void 0 : paginationParams.bulletClass))) {
        targetEl.click();
      }
    }
    function updateNavigation() {
      if (swiper.params.loop || swiper.params.rewind || !swiper.navigation)
        return;
      const { nextEl, prevEl } = swiper.navigation;
      if (prevEl) {
        if (swiper.isBeginning) {
          disableEl(prevEl);
          makeElNotFocusable(prevEl);
        } else {
          enableEl(prevEl);
          makeElFocusable(prevEl);
        }
      }
      if (nextEl) {
        if (swiper.isEnd) {
          disableEl(nextEl);
          makeElNotFocusable(nextEl);
        } else {
          enableEl(nextEl);
          makeElFocusable(nextEl);
        }
      }
    }
    function hasPagination() {
      return !!(swiper.pagination && swiper.pagination.bullets && swiper.pagination.bullets.length);
    }
    function hasClickablePagination() {
      const paginationParams = swiper.params.pagination;
      return hasPagination() && !!(paginationParams == null ? void 0 : paginationParams.clickable);
    }
    function updatePagination() {
      const params = getParams();
      if (!hasPagination())
        return;
      const paginationParams = swiper.params.pagination;
      swiper.pagination.bullets.forEach((bulletEl) => {
        var _a;
        if (paginationParams.clickable) {
          makeElFocusable(bulletEl);
          if (!paginationParams.renderBullet) {
            addElRole(bulletEl, "button");
            addElLabel(bulletEl, params.paginationBulletMessage.replace(/\{\{index\}\}/, String(((_a = elementIndex(bulletEl)) != null ? _a : 0) + 1)));
          }
        }
        if (bulletEl.matches(classesToSelector(paginationParams.bulletActiveClass))) {
          bulletEl.setAttribute("aria-current", "true");
        } else {
          bulletEl.removeAttribute("aria-current");
        }
      });
    }
    const initNavEl = (el, _wrapperId, message) => {
      makeElFocusable(el);
      if (el.tagName !== "BUTTON") {
        addElRole(el, "button");
        el.addEventListener("keydown", onEnterOrSpaceKey);
      }
      addElLabel(el, message);
    };
    const handlePointerDown = (e) => {
      if (focusTargetSlideEl && focusTargetSlideEl !== e.target && !focusTargetSlideEl.contains(e.target)) {
        preventFocusHandler = true;
      }
      swiper.a11y.clicked = true;
    };
    const handlePointerUp = () => {
      preventFocusHandler = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!swiper.destroyed) {
            swiper.a11y.clicked = false;
          }
        });
      });
    };
    const onVisibilityChange = (_e) => {
      visibilityChangedTimestamp = (/* @__PURE__ */ new Date()).getTime();
    };
    const handleFocus = (e) => {
      const params = getParams();
      if (swiper.a11y.clicked || !params.scrollOnFocus)
        return;
      if ((/* @__PURE__ */ new Date()).getTime() - visibilityChangedTimestamp < 100)
        return;
      const target = e.target;
      const slideEl = target.closest(`.${swiper.params.slideClass}, swiper-slide`);
      if (!slideEl || !swiper.slides.includes(slideEl))
        return;
      focusTargetSlideEl = slideEl;
      const isVirtual = isVirtualEnabled2(swiper);
      const isActive = (isVirtual ? parseInt(slideEl.getAttribute("data-swiper-slide-index") || "0", 10) : swiper.slides.indexOf(slideEl)) === swiper.activeIndex;
      const isVisible = swiper.params.watchSlidesProgress && swiper.visibleSlides && swiper.visibleSlides.includes(slideEl);
      if (isActive || isVisible)
        return;
      const sourceCapabilities = e.sourceCapabilities;
      if (sourceCapabilities && sourceCapabilities.firesTouchEvents)
        return;
      if (swiper.isHorizontal()) {
        swiper.el.scrollLeft = 0;
      } else {
        swiper.el.scrollTop = 0;
      }
      requestAnimationFrame(() => {
        if (preventFocusHandler)
          return;
        if (swiper.params.loop) {
          swiper.slideToLoop(swiper.getSlideIndexWhenGrid(parseInt(slideEl.getAttribute("data-swiper-slide-index") || "0", 10)), 0);
        } else if (isVirtual) {
          swiper.slideTo(swiper.getSlideIndexWhenGrid(parseInt(slideEl.getAttribute("data-swiper-slide-index") || "0", 10)), 0);
        } else {
          swiper.slideTo(swiper.getSlideIndexWhenGrid(swiper.slides.indexOf(slideEl)), 0);
        }
        preventFocusHandler = false;
      });
    };
    const initSlides = () => {
      const params = getParams();
      if (params.itemRoleDescriptionMessage) {
        addElRoleDescription(swiper.slides, params.itemRoleDescriptionMessage);
      }
      if (params.slideRole) {
        addElRole(swiper.slides, params.slideRole);
      }
      const slidesLength = swiper.slides.length;
      const slideLabelMessage = params.slideLabelMessage;
      if (slideLabelMessage) {
        swiper.slides.forEach((slideEl, index) => {
          const slideIndex = swiper.params.loop ? parseInt(slideEl.getAttribute("data-swiper-slide-index") || "0", 10) : index;
          const ariaLabelMessage = slideLabelMessage.replace(/\{\{index\}\}/, String(slideIndex + 1)).replace(/\{\{slidesLength\}\}/, String(slidesLength));
          addElLabel(slideEl, ariaLabelMessage);
        });
      }
    };
    const init = () => {
      const params = getParams();
      if (liveRegion)
        swiper.el.append(liveRegion);
      const containerEl = swiper.el;
      if (params.containerRoleDescriptionMessage) {
        addElRoleDescription(containerEl, params.containerRoleDescriptionMessage);
      }
      if (params.containerMessage) {
        addElLabel(containerEl, params.containerMessage);
      }
      if (params.containerRole) {
        addElRole(containerEl, params.containerRole);
      }
      const wrapperEl = swiper.wrapperEl;
      const wrapperId = String(params.id || wrapperEl.getAttribute("id") || `swiper-wrapper-${getRandomNumber(16)}`);
      addElId(wrapperEl, wrapperId);
      if (params.wrapperLiveRegion) {
        const autoplayParams = swiper.params.autoplay;
        const live = swiper.params.autoplay && (autoplayParams == null ? void 0 : autoplayParams.enabled) ? "off" : "polite";
        addElLive(wrapperEl, live);
      }
      initSlides();
      const nav = swiper.navigation ? swiper.navigation : { nextEl: void 0, prevEl: void 0 };
      const nextEls = makeElementsArray(nav.nextEl);
      const prevEls = makeElementsArray(nav.prevEl);
      if (nextEls) {
        nextEls.forEach((el) => initNavEl(el, wrapperId, params.nextSlideMessage));
      }
      if (prevEls) {
        prevEls.forEach((el) => initNavEl(el, wrapperId, params.prevSlideMessage));
      }
      if (hasClickablePagination()) {
        const paginationEl = makeElementsArray(swiper.pagination.el);
        paginationEl.forEach((el) => {
          el.addEventListener("keydown", onEnterOrSpaceKey);
        });
      }
      document.addEventListener("visibilitychange", onVisibilityChange);
      swiper.el.addEventListener("focus", handleFocus, true);
      swiper.el.addEventListener("pointerdown", handlePointerDown, true);
      swiper.el.addEventListener("pointerup", handlePointerUp, true);
    };
    function destroy() {
      if (liveRegion)
        liveRegion.remove();
      const nav = swiper.navigation ? swiper.navigation : { nextEl: void 0, prevEl: void 0 };
      const nextEls = makeElementsArray(nav.nextEl);
      const prevEls = makeElementsArray(nav.prevEl);
      if (nextEls) {
        nextEls.forEach((el) => el.removeEventListener("keydown", onEnterOrSpaceKey));
      }
      if (prevEls) {
        prevEls.forEach((el) => el.removeEventListener("keydown", onEnterOrSpaceKey));
      }
      if (hasClickablePagination()) {
        const paginationEl = makeElementsArray(swiper.pagination.el);
        paginationEl.forEach((el) => {
          el.removeEventListener("keydown", onEnterOrSpaceKey);
        });
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (swiper.el && typeof swiper.el !== "string") {
        swiper.el.removeEventListener("focus", handleFocus, true);
        swiper.el.removeEventListener("pointerdown", handlePointerDown, true);
        swiper.el.removeEventListener("pointerup", handlePointerUp, true);
      }
    }
    on("beforeInit", () => {
      liveRegion = createElement("span", getParams().notificationClass);
      liveRegion.setAttribute("aria-live", "assertive");
      liveRegion.setAttribute("aria-atomic", "true");
    });
    on("afterInit", () => {
      if (!getParams().enabled)
        return;
      init();
    });
    on("slidesLengthChange snapGridLengthChange slidesGridLengthChange", () => {
      if (!getParams().enabled)
        return;
      initSlides();
    });
    on("fromEdge toEdge afterInit lock unlock", () => {
      if (!getParams().enabled)
        return;
      updateNavigation();
    });
    on("paginationUpdate", () => {
      if (!getParams().enabled)
        return;
      updatePagination();
    });
    on("destroy", () => {
      if (!getParams().enabled)
        return;
      destroy();
    });
  };

  // assets/common/node_modules/swiper/modules/autoplay.mjs
  var Autoplay = ({ swiper, extendParams, on, emit, params }) => {
    swiper.autoplay = {
      running: false,
      paused: false,
      timeLeft: 0
    };
    extendParams({
      autoplay: {
        enabled: false,
        delay: 3e3,
        waitForTransition: true,
        disableOnInteraction: false,
        stopOnLastSlide: false,
        reverseDirection: false,
        pauseOnMouseEnter: false
      }
    });
    function getParams() {
      return swiper.params.autoplay;
    }
    const initialAutoplayDelay = typeof params.autoplay === "object" && params.autoplay && typeof params.autoplay.delay === "number" ? params.autoplay.delay : 3e3;
    let timeout;
    let raf;
    let autoplayDelayTotal = initialAutoplayDelay;
    let autoplayDelayCurrent = initialAutoplayDelay;
    let autoplayTimeLeft = 0;
    let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    let wasPaused = false;
    let isTouched = false;
    let pausedByTouch = false;
    let touchStartTimeout;
    let pausedByInteraction = false;
    let pausedByPointerEnter = false;
    function onTransitionEnd(e) {
      if (!swiper || swiper.destroyed || !swiper.wrapperEl)
        return;
      if (e.target !== swiper.wrapperEl)
        return;
      swiper.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
      const detail = e.detail;
      if (pausedByPointerEnter || detail && detail.bySwiperTouchMove) {
        return;
      }
      resume();
    }
    const calcTimeLeft = () => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return;
      if (swiper.autoplay.paused) {
        wasPaused = true;
      } else if (wasPaused) {
        autoplayDelayCurrent = autoplayTimeLeft;
        wasPaused = false;
      }
      const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
      swiper.autoplay.timeLeft = timeLeft;
      emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
      raf = requestAnimationFrame(() => {
        calcTimeLeft();
      });
    };
    const getSlideDelay = () => {
      var _a;
      let activeSlideEl;
      const virtualEnabled = !!((_a = swiper.params.virtual) == null ? void 0 : _a.enabled);
      if (swiper.virtual && virtualEnabled) {
        activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains("swiper-slide-active"));
      } else {
        activeSlideEl = swiper.slides[swiper.activeIndex];
      }
      if (!activeSlideEl)
        return void 0;
      const attr = activeSlideEl.getAttribute("data-swiper-autoplay");
      if (attr == null)
        return void 0;
      return parseInt(attr, 10);
    };
    const getTotalDelay = () => {
      let totalDelay = getParams().delay;
      const currentSlideDelay = getSlideDelay();
      if (typeof currentSlideDelay === "number" && !Number.isNaN(currentSlideDelay) && currentSlideDelay > 0) {
        totalDelay = currentSlideDelay;
      }
      return totalDelay;
    };
    const run = (delayForce) => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return 0;
      if (raf !== void 0)
        cancelAnimationFrame(raf);
      calcTimeLeft();
      let delay = delayForce;
      if (typeof delay === "undefined") {
        delay = getTotalDelay();
        autoplayDelayTotal = delay;
        autoplayDelayCurrent = delay;
      }
      autoplayTimeLeft = delay;
      const speed = swiper.params.speed;
      const proceed = () => {
        if (!swiper || swiper.destroyed)
          return;
        const autoplayParams = getParams();
        if (autoplayParams.reverseDirection) {
          if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
            swiper.slidePrev(speed, true, true);
            emit("autoplay");
          } else if (!autoplayParams.stopOnLastSlide) {
            swiper.slideTo(swiper.slides.length - 1, speed, true, true);
            emit("autoplay");
          }
        } else {
          if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
            swiper.slideNext(speed, true, true);
            emit("autoplay");
          } else if (!autoplayParams.stopOnLastSlide) {
            swiper.slideTo(0, speed, true, true);
            emit("autoplay");
          }
        }
        if (swiper.params.cssMode) {
          autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
          requestAnimationFrame(() => {
            run();
          });
        }
      };
      if (delay > 0) {
        if (timeout !== void 0)
          clearTimeout(timeout);
        timeout = setTimeout(() => {
          proceed();
        }, delay);
      } else {
        requestAnimationFrame(() => {
          proceed();
        });
      }
      return delay;
    };
    const start = () => {
      autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
      swiper.autoplay.running = true;
      run();
      emit("autoplayStart");
      return true;
    };
    const stop = () => {
      swiper.autoplay.running = false;
      if (timeout !== void 0)
        clearTimeout(timeout);
      if (raf !== void 0)
        cancelAnimationFrame(raf);
      emit("autoplayStop");
      return true;
    };
    const pause = (internal, reset) => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return;
      if (timeout !== void 0)
        clearTimeout(timeout);
      if (!internal) {
        pausedByInteraction = true;
      }
      const proceed = () => {
        emit("autoplayPause");
        if (getParams().waitForTransition) {
          swiper.wrapperEl.addEventListener("transitionend", onTransitionEnd);
        } else {
          resume();
        }
      };
      swiper.autoplay.paused = true;
      if (reset) {
        proceed();
        return;
      }
      const delay = autoplayTimeLeft || getParams().delay;
      autoplayTimeLeft = delay - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
      if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop)
        return;
      if (autoplayTimeLeft < 0)
        autoplayTimeLeft = 0;
      proceed();
    };
    const resume = () => {
      if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running)
        return;
      autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
      if (pausedByInteraction) {
        pausedByInteraction = false;
        run(autoplayTimeLeft);
      } else {
        run();
      }
      swiper.autoplay.paused = false;
      emit("autoplayResume");
    };
    const onVisibilityChange = () => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return;
      if (document.visibilityState === "hidden") {
        pausedByInteraction = true;
        pause(true);
      }
      if (document.visibilityState === "visible") {
        resume();
      }
    };
    const onPointerEnter = (e) => {
      if (e.pointerType !== "mouse")
        return;
      pausedByInteraction = true;
      pausedByPointerEnter = true;
      if (swiper.animating || swiper.autoplay.paused)
        return;
      pause(true);
    };
    const onPointerLeave = (e) => {
      if (e.pointerType !== "mouse")
        return;
      pausedByPointerEnter = false;
      if (swiper.autoplay.paused) {
        resume();
      }
    };
    const attachMouseEvents = () => {
      if (getParams().pauseOnMouseEnter) {
        swiper.el.addEventListener("pointerenter", onPointerEnter);
        swiper.el.addEventListener("pointerleave", onPointerLeave);
      }
    };
    const detachMouseEvents = () => {
      if (swiper.el && typeof swiper.el !== "string") {
        swiper.el.removeEventListener("pointerenter", onPointerEnter);
        swiper.el.removeEventListener("pointerleave", onPointerLeave);
      }
    };
    const attachDocumentEvents = () => {
      document.addEventListener("visibilitychange", onVisibilityChange);
    };
    const detachDocumentEvents = () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    on("init", () => {
      if (getParams().enabled) {
        attachMouseEvents();
        attachDocumentEvents();
        start();
      }
    });
    on("destroy", () => {
      detachMouseEvents();
      detachDocumentEvents();
      if (swiper.autoplay.running) {
        stop();
      }
    });
    on("_freeModeStaticRelease", () => {
      if (pausedByTouch || pausedByInteraction) {
        resume();
      }
    });
    on("_freeModeNoMomentumRelease", () => {
      if (!getParams().disableOnInteraction) {
        pause(true, true);
      } else {
        stop();
      }
    });
    on("beforeTransitionStart", (_s, _speed, internal) => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return;
      if (internal || !getParams().disableOnInteraction) {
        pause(true, true);
      } else {
        stop();
      }
    });
    on("sliderFirstMove", () => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return;
      if (getParams().disableOnInteraction) {
        stop();
        return;
      }
      isTouched = true;
      pausedByTouch = false;
      pausedByInteraction = false;
      touchStartTimeout = setTimeout(() => {
        pausedByInteraction = true;
        pausedByTouch = true;
        pause(true);
      }, 200);
    });
    on("touchEnd", () => {
      if (swiper.destroyed || !swiper.autoplay.running || !isTouched)
        return;
      if (touchStartTimeout !== void 0)
        clearTimeout(touchStartTimeout);
      if (timeout !== void 0)
        clearTimeout(timeout);
      if (getParams().disableOnInteraction) {
        pausedByTouch = false;
        isTouched = false;
        return;
      }
      if (pausedByTouch && swiper.params.cssMode)
        resume();
      pausedByTouch = false;
      isTouched = false;
    });
    on("slideChange", () => {
      if (swiper.destroyed || !swiper.autoplay.running)
        return;
      if (swiper.autoplay.paused) {
        autoplayTimeLeft = getTotalDelay();
        autoplayDelayTotal = getTotalDelay();
      }
    });
    Object.assign(swiper.autoplay, {
      start,
      stop,
      pause,
      resume
    });
  };

  // assets/common/node_modules/swiper/shared/effect-init.mjs
  function effectInit(params) {
    const { effect, swiper, on, setTranslate: setTranslate2, setTransition: setTransition2, overwriteParams, perspective, recreateShadows, getEffectParams } = params;
    on("beforeInit", () => {
      if (swiper.params.effect !== effect)
        return;
      swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
      if (perspective && perspective()) {
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
      }
      const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
      Object.assign(swiper.params, overwriteParamsResult);
      Object.assign(swiper.originalParams, overwriteParamsResult);
    });
    on("setTranslate _virtualUpdated", () => {
      if (swiper.params.effect !== effect)
        return;
      setTranslate2();
    });
    on("setTransition", (_s, duration) => {
      if (swiper.params.effect !== effect)
        return;
      setTransition2(duration);
    });
    on("transitionEnd", () => {
      if (swiper.params.effect !== effect)
        return;
      if (recreateShadows) {
        const effectParams = getEffectParams ? getEffectParams() : void 0;
        if (!effectParams || !effectParams.slideShadows)
          return;
        swiper.slides.forEach((slideEl) => {
          slideEl.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((shadowEl) => shadowEl.remove());
        });
        recreateShadows();
      }
    });
    let requireUpdateOnVirtual = false;
    on("virtualUpdate", () => {
      if (swiper.params.effect !== effect)
        return;
      if (!swiper.slides.length) {
        requireUpdateOnVirtual = true;
      }
      requestAnimationFrame(() => {
        if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
          setTranslate2();
          requireUpdateOnVirtual = false;
        }
      });
    });
  }

  // assets/common/node_modules/swiper/shared/effect-target.mjs
  function effectTarget(_effectParams, slideEl) {
    const transformEl = getSlideTransformEl(slideEl);
    if (transformEl !== slideEl) {
      transformEl.style.backfaceVisibility = "hidden";
      transformEl.style.setProperty("-webkit-backface-visibility", "hidden");
    }
    return transformEl;
  }

  // assets/common/node_modules/swiper/shared/effect-virtual-transition-end.mjs
  function effectVirtualTransitionEnd({ swiper, duration, transformElements, allSlides }) {
    const { activeIndex } = swiper;
    const getSlide = (el) => {
      if (!el.parentElement) {
        return swiper.slides.find((slideEl) => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode);
      }
      if (el.parentElement instanceof HTMLElement)
        return el.parentElement;
      return void 0;
    };
    if (swiper.params.virtualTranslate && duration !== 0) {
      let eventTriggered = false;
      let transitionEndTarget;
      if (allSlides) {
        transitionEndTarget = transformElements;
      } else {
        transitionEndTarget = transformElements.filter((transformEl) => {
          const el = transformEl.classList.contains("swiper-slide-transform") ? getSlide(transformEl) : transformEl;
          return !!el && swiper.getSlideIndex(el) === activeIndex;
        });
      }
      transitionEndTarget.forEach((el) => {
        elementTransitionEnd(el, () => {
          if (eventTriggered)
            return;
          if (!swiper || swiper.destroyed)
            return;
          eventTriggered = true;
          swiper.animating = false;
          const evt = new CustomEvent("transitionend", { bubbles: true, cancelable: true });
          swiper.wrapperEl.dispatchEvent(evt);
        });
      });
    }
  }

  // assets/common/node_modules/swiper/modules/effect-fade.mjs
  var EffectFade = ({ swiper, extendParams, on }) => {
    extendParams({
      fadeEffect: {
        crossFade: false
      }
    });
    function getParams() {
      return swiper.params.fadeEffect;
    }
    const setTranslate2 = () => {
      var _a, _b;
      const { slides } = swiper;
      const params = getParams();
      for (let i = 0; i < slides.length; i += 1) {
        const slideEl = slides[i];
        const offset = (_a = slideEl.swiperSlideOffset) != null ? _a : 0;
        let tx = -offset;
        if (!swiper.params.virtualTranslate)
          tx -= swiper.translate;
        let ty = 0;
        if (!swiper.isHorizontal()) {
          ty = tx;
          tx = 0;
        }
        const slideProgress = (_b = slideEl.progress) != null ? _b : 0;
        const slideOpacity = params.crossFade ? Math.max(1 - Math.abs(slideProgress), 0) : 1 + Math.min(Math.max(slideProgress, -1), 0);
        const targetEl = effectTarget(params, slideEl);
        targetEl.style.opacity = String(slideOpacity);
        targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
      }
    };
    const setTransition2 = (duration) => {
      const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
      transformElements.forEach((el) => {
        el.style.transitionDuration = `${duration}ms`;
      });
      effectVirtualTransitionEnd({ swiper, duration, transformElements, allSlides: true });
    };
    effectInit({
      effect: "fade",
      swiper,
      on,
      setTranslate: setTranslate2,
      setTransition: setTransition2,
      overwriteParams: () => ({
        slidesPerView: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        spaceBetween: 0,
        virtualTranslate: !swiper.params.cssMode
      })
    });
  };

  // assets/common/application/swiper.js
  var selector = "[data-g-swiper]";
  var enabled = (value, fallback = false) => {
    if (value === void 0 || value === null || value === "") {
      return fallback;
    }
    return ["1", "true", "enable", "enabled", "yes"].includes(String(value).toLowerCase());
  };
  var number = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  var GantrySwiper = class {
    constructor(element) {
      this.element = element;
      this.prepareMarkup();
      this.instance = this.create();
      this.bindThumbnailNavigation();
    }
    prepareMarkup() {
      var _a, _b;
      let wrapper = this.element.querySelector(":scope > .swiper-wrapper");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "swiper-wrapper";
        Array.from(this.element.children).filter((child) => !child.matches(".swiper-navigation, .swiper-pagination")).forEach((slide2) => {
          slide2.classList.add("swiper-slide");
          wrapper.append(slide2);
        });
        this.element.prepend(wrapper);
      } else {
        Array.from(wrapper.children).forEach((slide2) => {
          slide2.classList.add("swiper-slide");
        });
      }
      const navigationEnabled = enabled(
        (_a = this.element.dataset.navigation) != null ? _a : this.findDataset(["carouselNav", "nav"]),
        true
      );
      this.navigationElement = this.element.querySelector(":scope > .swiper-navigation") || this.findExternalNavigation();
      if (navigationEnabled && !this.navigationElement) {
        const navigation = document.createElement("div");
        navigation.className = "swiper-navigation";
        this.navigationElement = navigation;
        this.element.append(navigation);
      }
      if (navigationEnabled && this.navigationElement && !this.navigationElement.querySelector(".swiper-button-prev, .swiper-button-next")) {
        this.navigationElement.classList.add("swiper-navigation");
        this.navigationElement.innerHTML = `
                <button class="swiper-button-prev" type="button" aria-label="${this.element.dataset.previousLabel || "Previous slide"}">
                    <i class="fa fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="swiper-button-next" type="button" aria-label="${this.element.dataset.nextLabel || "Next slide"}">
                    <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </button>
            `;
      } else if (navigationEnabled && this.navigationElement) {
        this.navigationElement.querySelectorAll(".swiper-button-prev, .swiper-button-next").forEach((button) => {
          if (button.tagName !== "BUTTON") {
            button.setAttribute("role", "button");
            button.setAttribute("tabindex", "0");
          }
        });
      }
      if (navigationEnabled && this.navigationElement && !this.navigationElement.querySelector(".swiper-button-prev")) {
        const previous = document.createElement("button");
        previous.className = "swiper-button-prev";
        previous.type = "button";
        previous.setAttribute("aria-label", this.element.dataset.previousLabel || "Previous slide");
        previous.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
        this.navigationElement.prepend(previous);
      }
      if (navigationEnabled && this.navigationElement && !this.navigationElement.querySelector(".swiper-button-next")) {
        const next = document.createElement("button");
        next.className = "swiper-button-next";
        next.type = "button";
        next.setAttribute("aria-label", this.element.dataset.nextLabel || "Next slide");
        next.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
        this.navigationElement.append(next);
      }
      if (navigationEnabled && this.navigationElement === this.element) {
        const navigation = document.createElement("div");
        navigation.className = "swiper-navigation";
        navigation.innerHTML = `
                <button class="swiper-button-prev" type="button" aria-label="${this.element.dataset.previousLabel || "Previous slide"}">
                    <i class="fa fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button class="swiper-button-next" type="button" aria-label="${this.element.dataset.nextLabel || "Next slide"}">
                    <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </button>
            `;
        this.element.append(navigation);
        this.navigationElement = navigation;
      }
      const paginationEnabled = enabled((_b = this.element.dataset.pagination) != null ? _b : this.findDataset(["dots"]));
      if (paginationEnabled && !this.getPaginationElement()) {
        const pagination = document.createElement("div");
        pagination.className = "swiper-pagination";
        this.element.append(pagination);
      }
    }
    findExternalNavigation() {
      var _a;
      const container = this.element.closest([
        "[data-carousel-id]",
        "[data-slider-id]",
        "[data-slideshow-id]",
        "[data-showcase-id]",
        "[data-panelslider-id]",
        "[data-bgslideshow-id]",
        "[data-featuredvideos-id]"
      ].join(", "));
      return (container == null ? void 0 : container.querySelector('.custom-swiper-navigation, [id^="g-swipercarousel-accordionslider-controls"]')) || ((_a = this.element.closest(".g-swipercarousel-accordionslider")) == null ? void 0 : _a.querySelector('[id^="g-swipercarousel-accordionslider-controls"]')) || null;
    }
    getPaginationElement() {
      const selector2 = this.element.dataset.paginationSelector;
      if (selector2) {
        try {
          return document.querySelector(selector2);
        } catch (error) {
          console.warn(`Invalid Swiper pagination selector: ${selector2}`, error);
        }
      }
      const internal = this.element.querySelector(":scope > .swiper-pagination");
      if (internal) {
        return internal;
      }
      const adjacent = this.element.nextElementSibling;
      return (adjacent == null ? void 0 : adjacent.matches(".swiper-pagination")) ? adjacent : null;
    }
    create() {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const { dataset } = this.element;
      const role = dataset.gSwiperRole || "";
      const slides = this.element.querySelectorAll(".swiper-slide").length;
      const isPrimarySlides = /(?:^|\s)g-(?:slider|slideshow|showcase|panelslider|bgslideshow)-slides(?:\s|$)/.test(this.element.className);
      const inferredItems = this.findDataset(["items", "itemsAmount", "displayitems"]);
      const slidesPerView = Math.max(1, number((_a = dataset.slidesPerView) != null ? _a : isPrimarySlides ? 1 : inferredItems, 1));
      const navigation = role === "main" ? false : enabled((_b = dataset.navigation) != null ? _b : this.findDataset(["carouselNav", "nav"]), true);
      const pagination = enabled((_c = dataset.pagination) != null ? _c : this.findDataset(["dots"]));
      const autoplay = role === "navigation" ? false : enabled((_d = dataset.autoplay) != null ? _d : this.findDataset(["autoplay"]));
      const requestedLoop = enabled((_e = dataset.loop) != null ? _e : this.findDataset(["loop"]), true);
      const effect = dataset.effect === "fade" && slidesPerView === 1 ? "fade" : "slide";
      const instance = new Swiper(this.element, {
        modules: [A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination],
        a11y: {
          enabled: true,
          prevSlideMessage: dataset.previousLabel || "Previous slide",
          nextSlideMessage: dataset.nextLabel || "Next slide",
          paginationBulletMessage: "Go to slide {{index}}"
        },
        autoHeight: enabled(dataset.autoHeight, true),
        autoplay: autoplay ? {
          delay: Math.max(1e3, number((_f = dataset.autoplayDelay) != null ? _f : this.findDataset(["autoplayInterval", "timeout", "delay"]), 5e3)),
          disableOnInteraction: false,
          pauseOnMouseEnter: enabled(dataset.pauseOnHover, true)
        } : false,
        breakpoints: this.getBreakpoints(slidesPerView),
        centeredSlides: enabled(dataset.centered),
        effect,
        fadeEffect: { crossFade: true },
        grabCursor: true,
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
        initialSlide: this.getInitialSlide(),
        loop: requestedLoop && slides > slidesPerView,
        navigation: navigation ? {
          addIcons: false,
          nextEl: (_g = this.navigationElement) == null ? void 0 : _g.querySelector(".swiper-button-next"),
          prevEl: (_h = this.navigationElement) == null ? void 0 : _h.querySelector(".swiper-button-prev")
        } : false,
        observer: true,
        observeParents: true,
        slidesPerGroup: Math.max(1, number(dataset.slidesPerGroup, 1)),
        spaceBetween: Math.max(0, number(dataset.spaceBetween, 0)),
        pagination: pagination ? {
          el: this.getPaginationElement(),
          bulletElement: "button",
          clickable: true,
          renderBullet(index, className) {
            return `<button class="${className}" type="button"><span></span></button>`;
          }
        } : false,
        slidesPerView,
        speed: Math.max(0, number(dataset.speed, 500)),
        watchOverflow: true,
        on: {
          init: (swiper) => this.syncState(swiper),
          slideChange: (swiper) => this.syncState(swiper),
          paginationUpdate: (swiper) => this.syncState(swiper)
        }
      });
      return instance;
    }
    findDataset(suffixes) {
      let current = this.element;
      const normalized = suffixes.map((suffix) => suffix.toLowerCase());
      while (current) {
        const match = Object.entries(current.dataset || {}).find(([key]) => {
          const lowerKey = key.toLowerCase();
          return normalized.some((suffix) => lowerKey === suffix || lowerKey.endsWith(suffix));
        });
        if (match) {
          return match[1];
        }
        current = current.parentElement;
      }
      return void 0;
    }
    getBreakpoints(slidesPerView) {
      if (slidesPerView <= 1) {
        return void 0;
      }
      const smallMobile = Math.max(1, number(this.findDataset(["itemsSmallmobile"]), 1));
      const mobile = Math.max(1, number(this.findDataset(["itemsMobile"]), Math.ceil(slidesPerView / 2)));
      const tablet = Math.max(1, number(this.findDataset(["itemsTablet"]), Math.ceil(slidesPerView / 2)));
      return {
        0: { slidesPerView: smallMobile },
        480: { slidesPerView: mobile },
        768: { slidesPerView: tablet },
        960: { slidesPerView }
      };
    }
    getInitialSlide() {
      if (this.element.dataset.initialSlide !== void 0) {
        return Math.max(0, number(this.element.dataset.initialSlide, 0));
      }
      const container = this.element.closest([
        "[data-carousel-id]",
        "[data-slider-id]",
        "[data-slideshow-id]",
        "[data-showcase-id]",
        "[data-eventlist-id]"
      ].join(", "));
      const selected = container == null ? void 0 : container.querySelector(".selected, .current, .swiper-current, .active");
      const itemClass = selected ? Array.from(selected.classList).find((className) => !["selected", "current", "swiper-current", "active"].includes(className)) : null;
      const selectable = (selected == null ? void 0 : selected.parentElement) && itemClass ? Array.from(selected.parentElement.children).filter((item) => item.classList.contains(itemClass)) : [];
      const selectedIndex = selected ? selectable.indexOf(selected) : -1;
      if (selectedIndex >= 0) {
        return selectedIndex;
      }
      const preset = this.findDataset(["preset", "presets"]);
      if (preset === false || preset === "false") {
        return 0;
      }
      const presetIndex = number(preset, 0);
      const oneBasedSliderPreset = (container == null ? void 0 : container.matches(".g-slider")) && container.querySelector("[data-slider-slides-id]");
      return Math.max(0, oneBasedSliderPreset ? presetIndex - 1 : presetIndex);
    }
    syncState(swiper) {
      var _a, _b, _c;
      this.element.classList.toggle("swiper-rtl", swiper.rtlTranslate);
      (_a = this.getPaginationElement()) == null ? void 0 : _a.querySelectorAll(".swiper-pagination-bullet").forEach((bullet, index) => {
        bullet.classList.toggle("active", index === swiper.realIndex);
      });
      (_b = this.thumbnailItems) == null ? void 0 : _b.forEach((thumbnail, index) => {
        const active = index === swiper.realIndex;
        thumbnail.classList.toggle("active", active);
        thumbnail.setAttribute("aria-current", active ? "true" : "false");
      });
      const activeSlide = ((_c = swiper.slides) == null ? void 0 : _c[swiper.activeIndex]) || null;
      this.element.dispatchEvent(new CustomEvent("g5:swiper:change", {
        bubbles: true,
        detail: {
          activeSlide,
          activeIndex: swiper.realIndex
        }
      }));
    }
    bindThumbnailNavigation() {
      if (String(this.element.dataset.pagination || "").toLowerCase() !== "thumbs") {
        return;
      }
      const container = this.element.closest(".g-swipercarousel-slider");
      this.thumbnailItems = Array.from((container == null ? void 0 : container.querySelectorAll(":scope > .swiper-thumbs .swiper-thumb")) || []);
      this.thumbnailItems.forEach((thumbnail, index) => {
        thumbnail.setAttribute("role", "button");
        thumbnail.setAttribute("tabindex", "0");
        thumbnail.setAttribute("aria-label", `Go to slide ${index + 1}`);
        const activate = () => {
          if (this.instance.params.loop) {
            this.instance.slideToLoop(index);
          } else {
            this.instance.slideTo(index);
          }
        };
        thumbnail.addEventListener("click", activate);
        thumbnail.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        });
      });
      this.syncState(this.instance);
    }
  };
  var bindSynchronizedCarousels = (root = document) => {
    var _a, _b;
    const containerSelector = [
      "[data-slider-id]",
      "[data-slideshow-id]",
      "[data-showcase-id]",
      "[data-panelslider-id]",
      "[data-bgslideshow-id]",
      "[data-newsslider-id]",
      "[data-eventlist-id]",
      "[data-featuredvideos-id]"
    ].join(", ");
    const containers = ((_a = root.matches) == null ? void 0 : _a.call(root, containerSelector)) ? [root] : Array.from(((_b = root.querySelectorAll) == null ? void 0 : _b.call(root, containerSelector)) || []);
    containers.forEach((container) => {
      if (container.dataset.gSwiperSyncReady === "true") {
        return;
      }
      const carousels = Array.from(container.querySelectorAll(":scope [data-g-swiper]")).filter((element) => {
        var _a2;
        return (_a2 = element.gantrySwiper) == null ? void 0 : _a2.instance;
      });
      if (carousels.length < 2) {
        return;
      }
      const mainElement = carousels.find((element) => /-slides(?:\s|$)/.test(element.className)) || carousels[0];
      const navigationElement = carousels.find((element) => element !== mainElement && /-carousel(?:\s|$)/.test(element.className)) || carousels[1];
      const main = mainElement.gantrySwiper.instance;
      const navigation = navigationElement.gantrySwiper.instance;
      const updateCurrent = () => {
        navigation.slides.forEach((slide2) => slide2.classList.remove("swiper-current"));
        const current = navigation.slides[main.realIndex];
        current == null ? void 0 : current.classList.add("swiper-current");
        navigation.slideTo(main.realIndex);
      };
      navigationElement.addEventListener("click", (event) => {
        const slide2 = event.target.closest(".swiper-slide");
        if (!slide2) {
          return;
        }
        const index = navigation.slides.indexOf(slide2);
        if (index >= 0) {
          main.slideToLoop(index);
        }
      });
      main.on("slideChange", updateCurrent);
      navigation.on("slideChange", () => {
        if (main.realIndex !== navigation.realIndex) {
          main.slideToLoop(navigation.realIndex);
        }
      });
      updateCurrent();
      container.dataset.gSwiperSyncReady = "true";
    });
  };
  var bindStaticNavigation = (root = document) => {
    const definitions = [
      {
        container: "[data-newsslider-id]",
        items: ".g-newsslider-carousel-item-container",
        active: "current"
      },
      {
        container: "[data-eventlist-id]",
        items: ".g-eventlist-item",
        active: "selected"
      }
    ];
    definitions.forEach((definition) => {
      var _a, _b;
      const containers = ((_a = root.matches) == null ? void 0 : _a.call(root, definition.container)) ? [root] : Array.from(((_b = root.querySelectorAll) == null ? void 0 : _b.call(root, definition.container)) || []);
      containers.forEach((container) => {
        var _a2;
        if (container.dataset.gSwiperStaticReady === "true") {
          return;
        }
        const swiperElement = container.querySelector("[data-g-swiper]");
        const swiper = (_a2 = swiperElement == null ? void 0 : swiperElement.gantrySwiper) == null ? void 0 : _a2.instance;
        const items = Array.from(container.querySelectorAll(definition.items));
        if (!swiper || !items.length) {
          return;
        }
        const update2 = () => {
          items.forEach((item) => item.classList.remove(definition.active));
          const current = items[swiper.realIndex];
          current == null ? void 0 : current.classList.add(definition.active);
          current == null ? void 0 : current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        };
        items.forEach((item, index) => {
          item.addEventListener("click", () => swiper.slideToLoop(index));
        });
        swiper.on("slideChange", update2);
        update2();
        container.dataset.gSwiperStaticReady = "true";
      });
    });
  };
  var bindShowcaseSets = (root = document) => {
    var _a, _b;
    const containers = ((_a = root.matches) == null ? void 0 : _a.call(root, "[data-showcase-id]")) ? [root] : Array.from(((_b = root.querySelectorAll) == null ? void 0 : _b.call(root, "[data-showcase-id]")) || []);
    containers.forEach((container) => {
      var _a2;
      if (container.dataset.gSwiperShowcaseReady === "true") {
        return;
      }
      const swiperElement = container.querySelector("[data-showcase-slides-id][data-g-swiper]");
      const swiper = (_a2 = swiperElement == null ? void 0 : swiperElement.gantrySwiper) == null ? void 0 : _a2.instance;
      const sets = Array.from(container.querySelectorAll(".g-showcase-slides.desktop .g-showcase-slides-set"));
      if (!swiper || !sets.length) {
        return;
      }
      const itemsPerSet = Math.max(1, number(container.dataset.showcaseItems, 1));
      const update2 = () => {
        var _a3, _b2;
        sets.forEach((set) => set.classList.remove("active"));
        const index = Math.min(sets.length - 1, Math.floor(swiper.realIndex / itemsPerSet));
        (_a3 = sets[index]) == null ? void 0 : _a3.classList.add("active");
        (_b2 = sets[index]) == null ? void 0 : _b2.querySelectorAll(".g-showcase-slides-slide").forEach((slide2) => {
          slide2.classList.add("finished");
        });
      };
      swiper.on("slideChangeTransitionStart", () => {
        sets.forEach((set) => {
          set.querySelectorAll(".g-showcase-slides-slide").forEach((slide2) => {
            slide2.classList.remove("finished");
          });
        });
      });
      swiper.on("slideChangeTransitionEnd", update2);
      update2();
      container.dataset.gSwiperShowcaseReady = "true";
    });
  };
  var bindBackgroundSlides = (root = document) => {
    var _a, _b;
    const containers = ((_a = root.matches) == null ? void 0 : _a.call(root, "[data-bgslideshow-id]")) ? [root] : Array.from(((_b = root.querySelectorAll) == null ? void 0 : _b.call(root, "[data-bgslideshow-id]")) || []);
    containers.forEach((container) => {
      var _a2;
      if (container.dataset.gSwiperBackgroundReady === "true") {
        return;
      }
      const swiperElement = container.querySelector("[data-bgslideshow-slides-id][data-g-swiper]");
      const swiper = (_a2 = swiperElement == null ? void 0 : swiperElement.gantrySwiper) == null ? void 0 : _a2.instance;
      const images = Array.from(container.querySelectorAll("[data-bgslideshow-carousel-id] img"));
      let target = null;
      try {
        target = document.querySelector(container.dataset.vegasElement);
      } catch (e) {
        target = null;
      }
      if (!swiper || !target || !images.length) {
        return;
      }
      const update2 = () => {
        var _a3, _b2;
        const image = ((_a3 = images[swiper.realIndex]) == null ? void 0 : _a3.currentSrc) || ((_b2 = images[swiper.realIndex]) == null ? void 0 : _b2.src);
        if (!image) {
          return;
        }
        if (typeof target.animate === "function") {
          target.animate([{ opacity: 0.85 }, { opacity: 1 }], {
            duration: Math.max(150, number(container.dataset.bgslideshowTransitionDuration, 500)),
            easing: "ease-out"
          });
        }
        target.style.backgroundImage = `url("${image.replaceAll('"', '\\"')}")`;
        target.style.backgroundRepeat = "no-repeat";
        target.style.backgroundSize = container.dataset.bgslideshowCover || "cover";
        target.style.backgroundPosition = [
          container.dataset.bgslideshowAlign || "center",
          container.dataset.bgslideshowValign || "center"
        ].join(" ");
      };
      swiper.on("slideChange", update2);
      update2();
      container.dataset.gSwiperBackgroundReady = "true";
    });
  };
  var bindAccordionSlides = (root = document) => {
    var _a, _b;
    const accordionSelector = '.g-swipercarousel-accordionslider, .g-swipercarousel-lists[data-g-accordion="true"]';
    const containers = ((_a = root.matches) == null ? void 0 : _a.call(root, accordionSelector)) ? [root] : Array.from(((_b = root.querySelectorAll) == null ? void 0 : _b.call(root, accordionSelector)) || []);
    containers.forEach((container) => {
      if (container.dataset.gSwiperAccordionReady === "true") {
        return;
      }
      const items = Array.from(container.querySelectorAll(".g-swipercarousel-item"));
      const updateSwiperHeight = () => {
        var _a2, _b2;
        const swiper = (_b2 = (_a2 = container.querySelector("[data-g-swiper]")) == null ? void 0 : _a2.gantrySwiper) == null ? void 0 : _b2.instance;
        if (!swiper) {
          return;
        }
        requestAnimationFrame(() => {
          swiper.update();
          swiper.updateAutoHeight(0);
          requestAnimationFrame(() => swiper.updateAutoHeight(0));
        });
      };
      const setItemOpen = (item, open) => {
        var _a2;
        const heading = item.querySelector(".g-swipercarousel-item-title");
        const content = item.querySelector(":scope > .g-swipercarousel-content");
        if (!heading || !content) {
          return;
        }
        heading.classList.toggle("ui-accordion-header-active", open);
        heading.classList.toggle("ui-state-active", open);
        heading.setAttribute("aria-expanded", String(open));
        content.classList.toggle("ui-accordion-content-active", open);
        content.hidden = !open;
        (_a2 = item.querySelector(".indicator span")) == null ? void 0 : _a2.replaceChildren(document.createTextNode(open ? "\u2212" : "+"));
      };
      items.forEach((item, index) => {
        const heading = item.querySelector(".g-swipercarousel-item-title");
        const content = item.querySelector(":scope > .g-swipercarousel-content");
        if (!heading || !content) {
          return;
        }
        heading.setAttribute("role", "button");
        heading.setAttribute("tabindex", "0");
        const toggle = () => {
          const open = content.hidden;
          if (open) {
            items.forEach((otherItem) => setItemOpen(otherItem, false));
          }
          setItemOpen(item, open);
          updateSwiperHeight();
        };
        heading.addEventListener("click", toggle);
        heading.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        });
        setItemOpen(item, index === 0);
      });
      container.dataset.gSwiperAccordionReady = "true";
    });
  };
  var initialize = (root = document) => {
    var _a, _b;
    const elements = ((_a = root.matches) == null ? void 0 : _a.call(root, selector)) ? [root] : Array.from(((_b = root.querySelectorAll) == null ? void 0 : _b.call(root, selector)) || []);
    elements.forEach((element) => {
      if (element.dataset.gSwiperReady === "true") {
        return;
      }
      element.dataset.gSwiperReady = "true";
      element.gantrySwiper = new GantrySwiper(element);
    });
    bindSynchronizedCarousels(root);
    bindStaticNavigation(root);
    bindShowcaseSets(root);
    bindBackgroundSlides(root);
    bindAccordionSlides(root);
  };
  var ready = () => {
    initialize();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            initialize(node);
          }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  } else {
    ready();
  }
  window.GenesisSwiper = { GantrySwiper, initialize };
  window.G5Swiper = window.GenesisSwiper;
})();
/*! Swiper 14.0.7 | Copyright 2014-2026 Vladimir Kharlampidi | MIT License */
//# sourceMappingURL=swiper.js.map
