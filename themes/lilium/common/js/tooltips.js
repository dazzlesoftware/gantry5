/**
 * demo1.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
	const easing = {
		linear: 'linear',
		easeInQuad: 'cubic-bezier(.55,.085,.68,.53)',
		easeOutQuad: 'cubic-bezier(.25,.46,.45,.94)',
		easeInOutQuad: 'cubic-bezier(.455,.03,.515,.955)',
		easeInQuint: 'cubic-bezier(.755,.05,.855,.06)',
		easeInOutQuint: 'cubic-bezier(.86,0,.07,1)',
		easeInExpo: 'cubic-bezier(.95,.05,.795,.035)',
		easeInOutSine: 'cubic-bezier(.445,.05,.55,.95)',
		easeOutQuint: 'cubic-bezier(.23,1,.32,1)',
		easeOutExpo: 'cubic-bezier(.19,1,.22,1)',
		easeOutBack: 'cubic-bezier(.175,.885,.32,1.275)',
		easeOutElastic: 'cubic-bezier(.34,1.56,.64,1)'
	};
	const transformProperties = {
		translateX: ['--tooltip-x', (value) => typeof value === 'number' ? `${value}px` : value],
		translateY: ['--tooltip-y', (value) => typeof value === 'number' ? `${value}px` : value],
		scale: ['--tooltip-scale', String],
		rotate: ['--tooltip-rotate', (value) => typeof value === 'number' ? `${value}deg` : value]
	};
	const activeAnimations = new WeakMap();

	if (window.CSS?.registerProperty) {
		[
			['--tooltip-x', '<length-percentage>', '0px'],
			['--tooltip-y', '<length-percentage>', '0px'],
			['--tooltip-scale', '<number>', '1'],
			['--tooltip-rotate', '<angle>', '0deg']
		].forEach(([name, syntax, initialValue]) => {
			try { CSS.registerProperty({ name, syntax, inherits: false, initialValue }); } catch (error) { /* already registered */ }
		});
	}

	const animationTargets = (targets) => targets instanceof Element ? [targets] : [...targets || []];
	const resolve = (value, target, index, total) => typeof value === 'function' ? value(target, index, total) : value;
	const timing = (settings, target, index, total) => ({
		duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Number(resolve(settings.duration, target, index, total) ?? 400),
		delay: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Number(resolve(settings.delay, target, index, total) ?? 0),
		easing: Array.isArray(settings.easing) ? `cubic-bezier(${settings.easing.join(',')})` : (easing[settings.easing] || settings.easing || 'ease'),
		fill: 'forwards'
	});
	const dashOffset = (target) => {
		const length = target.getTotalLength?.() || 0;
		target.style.strokeDasharray = String(length);
		return length;
	};

	const nativeRemove = (targets) => animationTargets(targets).forEach((target) => {
		(activeAnimations.get(target) || []).forEach((animation) => {
			animation.commitStyles?.();
			animation.cancel();
		});
		activeAnimations.delete(target);
	});

	const nativeAnimate = ({ targets, ...settings }) => animationTargets(targets).forEach((target, index, all) => {
		target.style.transform = 'translate(var(--tooltip-x, 0), var(--tooltip-y, 0)) scale(var(--tooltip-scale, 1)) rotate(var(--tooltip-rotate, 0deg))';
		const animations = [];
		const reserved = new Set(['duration', 'delay', 'easing', 'elasticity']);

		Object.entries(settings).filter(([property]) => !reserved.has(property)).forEach(([property, definition]) => {
			const propertySettings = definition && !Array.isArray(definition) && typeof definition === 'object'
				? { ...settings, ...definition }
				: settings;
			const values = propertySettings.value ?? definition;
			const steps = Array.isArray(values) && values.every((value) => value && typeof value === 'object') ? values : null;
			const [cssProperty, format = String] = transformProperties[property] || [property, String];
			let elapsed = 0;

			const animate = (value, stepSettings) => {
				const resolved = resolve(value, target, index, all.length);
				const finalValue = resolved === dashOffset ? dashOffset(target) : resolved;
				const keyframes = Array.isArray(finalValue)
					? [{ [cssProperty]: format(resolve(finalValue[0], target, index, all.length)) }, { [cssProperty]: format(resolve(finalValue[1], target, index, all.length)) }]
					: [{ [cssProperty]: getComputedStyle(target).getPropertyValue(cssProperty) || undefined }, { [cssProperty]: format(finalValue) }];
				const options = timing(stepSettings, target, index, all.length);
				const stepDelay = options.delay;
				options.delay = stepDelay + elapsed;
				const animation = target.animate(keyframes, options);
				animations.push(animation);
				elapsed += stepDelay + options.duration;
			};

			if (steps) steps.forEach((step) => animate(step.value, { ...propertySettings, ...step }));
			else animate(values, propertySettings);
		});

		activeAnimations.set(target, animations);
	});

	const config = {
		cora: {
			in: {
				base: {
					duration: 600,
					easing: 'easeOutQuint',
					scale: [0,1],
					rotate: [-180,0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				content: {
					duration: 300,
					delay: 250,
					easing: 'easeOutQuint',
					translateY: [20,0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					duration: 300,
					easing: 'easeOutExpo',
					scale: [1,0.9],
					color: '#6fbb95'
				}
			},
			out: {
				base: {
					duration: 150,
					delay: 50,
					easing: 'easeInQuad',
					scale: 0,
					opacity: {
						delay: 100,
						value: 0,
						easing: 'linear'
					}
				},
				content: {
					duration: 100,
					easing: 'easeInQuad',
					translateY: 20,
					opacity: {
						value: 0,
						easing: 'linear'
					}
				},
				trigger: {
					duration: 300,
					delay: 50,
					easing: 'easeOutExpo',
					scale: 1,
					color: '#666'
				}
			}
		},
		smaug: {
			in: {
				base: {
					duration: 200,
					easing: 'easeOutQuad',
					rotate: [35,0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				content: {
					duration: 1000,
					delay: 50,
					easing: 'easeOutElastic',
					translateX: [50,0],
					rotate: [10, 0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateX: [
						{value: '-30%', duration: 130, easing: 'easeInQuad'},
						{value: ['30%','0%'], duration: 900, easing: 'easeOutElastic'}
					],
					opacity: [
						{value: 0, duration: 130, easing: 'easeInQuad'},
						{value: 1, duration: 130, easing: 'easeOutQuad'}
					],
					color: [
						{value: '#6fbb95', duration: 1, delay: 130, easing: 'easeOutQuad'}
					]
				}
			},
			out: {
				base: {
					duration: 200,
					delay: 100,
					easing: 'easeInQuad',
					rotate: -35,
					opacity: 0
				},
				content: {
					duration: 200,
					easing: 'easeInQuad',
					translateX: -30,
					rotate: -10,
					opacity: 0
				},
				trigger: {
					translateX: [
						{value: '-30%', duration: 200, easing: 'easeInQuad'},
						{value: ['30%','0%'], duration: 200, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 200, easing: 'easeInQuad'},
						{value: 1, duration: 200, easing: 'easeOutQuad'}
					],
					color: [
						{value: '#666', duration: 1, delay: 200, easing: 'easeOutQuad'}
					]
				}
			}
		},
		uldor: {
			in: {
				base: {
					duration: 400,
					easing: 'easeOutExpo',
					scale: [0.5,1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				path: {
					duration: 900,
					easing: 'easeOutElastic',
					d: 'M 33.5,31 C 33.5,31 145,31 200,31 256,31 367,31 367,31 367,31 367,110 367,150 367,190 367,269 367,269 367,269 256,269 200,269 145,269 33.5,269 33.5,269 33.5,269 33.5,190 33.5,150 33.5,110 33.5,31 33.5,31 Z'
				},
				content: {
					duration: 900,
					easing: 'easeOutElastic',
					delay: 100,
					scale: [0.8,1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateY: [
						{value: '-50%', duration: 100, easing: 'easeInQuad'},
						{value: ['50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#6fbb95',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			},
			out: {
				base: {
					duration: 200,
					easing: 'easeInExpo',
					scale: 0.5,
					opacity: {
						value: 0,
						duration: 75,
						easing: 'linear'
					}
				},
				path: {
					duration: 200,
					easing: 'easeOutQuint',
					d: 'M 79.5,66 C 79.5,66 128,106 202,105 276,104 321,66 321,66 321,66 287,84 288,155 289,226 318,232 318,232 318,232 258,198 200,198 142,198 80.5,230 80.5,230 80.5,230 112,222 111,152 110,82 79.5,66 79.5,66 Z'
				},
				content: {
					duration: 100,
					easing: 'easeOutQuint',
					scale: 0.8,
					opacity: {
						value: 0,
						duration: 50,
						easing: 'linear'
					}
				},
				trigger: {
					translateY: [
						{value: '50%', duration: 100, easing: 'easeInQuad'},
						{value: ['-50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#666',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			}
		},
		dori: {
			in: {
				base: {
					duration: 800,
					easing: 'easeOutElastic',
					translateY: [60,0],
					scale: [0.5,1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				path: {
					duration: 1200,
					delay: 50,
					easing: 'easeOutElastic',
					elasticity: 700,
					d: 'M 22,74.2 22,202 C 22,202 82,202 103,202 124,202 184,202 184,202 L 200,219 216,202 C 216,202 274,202 297,202 320,202 378,202 378,202 L 378,74.2 C 378,74.2 318,73.7 200,73.7 82,73.7 22,74.2 22,74.2 Z'
				},
				content: {
					duration: 300,
					delay: 100,
					easing: 'easeOutQuint',
					translateY: [20,0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateY: [
						{value: '-50%', duration: 100, easing: 'easeInQuad'},
						{value: ['50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#6fbb95',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			},
			out: {
				base: {
					duration: 200,
					easing: 'easeInQuad',
					translateY: 60,
					scale: 0.5,
					opacity: {
						value: 0,
						delay: 100,
						duration: 100,
						easing: 'linear'
					}
				},
				path: {
					duration: 200,
					easing: 'easeInQuad',
					d: 'M 22,108 22,236 C 22,236 64,216 103,212 142,208 184,212 184,212 L 200,229 216,212 C 216,212 258,207 297,212 336,217 378,236 378,236 L 378,108 C 378,108 318,83.7 200,83.7 82,83.7 22,108 22,108 Z'
				},
				content: {
					duration: 100,
					easing: 'easeInQuad',
					translateY: 20,
					opacity: {
						value: 0,
						easing: 'linear'
					}
				},
				trigger: {
					translateY: [
						{value: '-50%', duration: 100, easing: 'easeInQuad'},
						{value: ['50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#666',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			}
		},
		walda: {
			in: {
				base: {
					duration: 100,
					easing: 'linear',
					opacity: 1
				},
				deco: {
					duration: 500,
					easing: 'easeOutExpo',
					scaleY: [0,1]
				},
				content: {
					duration: 125,
					easing: 'easeOutExpo',
					delay: function(t,i) {
						return i*15;
					},
					easing: 'linear',
					translateY: ['50%','0%'],
					opacity: [0,1]
				},
				trigger: {
					translateX: [
						{value: '30%', duration: 100, easing: 'easeInQuad'},
						{value: ['-30%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: [
						{value: '#6fbb95', duration: 1, delay: 100, easing: 'easeOutQuad'}
					]
				}
			},
			out: {
				base: {
					duration: 100,
					delay: 100,
					easing: 'linear',
					opacity: 0
				},
				deco: {
					duration: 400,
					easing: 'easeOutExpo',
					scaleY: 0
				},
				content: {
					duration: 1,
					easing: 'linear',
					opacity: 0
				},
				trigger: {
					translateX: [
						{value: '30%', duration: 100, easing: 'easeInQuad'},
						{value: ['-30%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: [
						{value: '#666', duration: 1, delay: 100, easing: 'easeOutQuad'}
					]
				}
			},
		},
		gram: {
			in: {
				base: {
					duration: 400,
					easing: 'easeOutQuint',
					scaleX: [1.2,1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 50
					}
				},
				path: {
					duration: 600,
					easing: 'easeOutQuint',
					d: 'M 92.4,79 C 136,79 156,79.1 200,79.4 244,79.7 262,79 308,79 354,79 381,111 381,150 381,189 346,220 308,221 270,222 236,221 200,221 164,221 130,222 92.4,221 54.4,220 19,189 19,150 19,111 48.6,79 92.4,79 Z'
				},
				content: {
					delay: 100,
					scale: {
						value: [0.8,1],
						duration: 300,
						easing: 'easeOutQuint'
					},
					opacity: {
						value: [0,1],
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					duration: 300,
					easing: 'easeOutQuint',
					scale: [1,0.9],
					color: '#6fbb95'
				}
			},
			out: {
				base: {
					duration: 200,
					easing: 'easeInQuint',
					scaleX: 1.1,
					scaleY: 0.9,
					opacity: {
						value: 0,
						delay: 100,
						duration: 150,
						easing: 'linear'
					}
				},
				path: {
					duration: 200,
					easing: 'easeInQuint',
					d: 'M 92.4,79 C 136,79 154,115 200,116 246,117 263,80.4 308,79 353,77.6 381,111 381,150 381,189 346,220 308,221 270,222 236,188 200,188 164,188 130,222 92.4,221 54.4,220 19,189 19,150 19,111 48.6,79 92.4,79 Z'
				},
				content: {
					duration: 150,
					easing: 'easeInQuint',
					scale: 0.8,
					opacity: {
						value: 0,
						duration: 100,
						easing: 'linear'
					}
				},
				trigger: {
					duration: 200,
					easing: 'easeInQuint',
					scale: 1,
					color: '#666'
				}
			}
		},
		narvi: {
			in: {
				base: {
					duration: 1,
					easing: 'linear',
					opacity: 1
				},
				path: {
					duration: 800,
					easing: 'easeOutQuint',
					rotate: [0,90],
					opacity: {
						value: 1,
						duration: 200,
						easing: 'linear'
					}
				},
				content: {
					duration: 600,
					easing: 'easeOutQuint',
					translateX: [50,0],
					opacity: {
						value: 1,
						duration: 100,
						easing: 'linear'
					}
				},
				trigger: {
					translateX: [
						{value: '-30%', duration: 100, easing: 'easeInQuint'},
						{value: ['30%','0%'], duration: 250, easing: 'easeOutQuint'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuint'},
						{value: 1, duration: 250, easing: 'easeOutQuint'}
					],
					color: [
						{value: '#6fbb95', duration: 1, delay: 100, easing: 'easeOutQuint'}
					]
				}
			},
			out: {
				base: {
					duration: 100,
					delay: 400,
					easing: 'linear',
					opacity: 0
				},
				path: {
					duration: 500,
					delay: 0,
					easing: 'easeInOutQuint',
					rotate: 0,
					opacity: {
						value: 0,
						duration: 50,
						delay: 210,
						easing: 'linear'
					}
				},
				content: {
					duration: 500,
					easing: 'easeInOutQuint',
					translateX: 100,
					opacity: {
						value: 0,
						duration: 50,
						delay: 210,
						easing: 'linear'
					}
				},
				trigger: {
					translateX: [
						{value: '30%', duration: 200, easing: 'easeInQuint'},
						{value: ['-30%','0%'], duration: 200, easing: 'easeOutQuint'}
					],
					opacity: [
						{value: 0, duration: 200, easing: 'easeInQuint'},
						{value: 1, duration: 200, easing: 'easeOutQuint'}
					],
					color: [
						{value: '#666', duration: 1, delay: 200, easing: 'easeOutQuint'}
					]
				}
			}
		},
		indis: {
			in: {
				base: {
					duration: 500,
					easing: 'easeOutQuint',
					translateY: [100,0],
					opacity: {
						value: 1,
						duration: 50,
						easing: 'linear'
					}
				},
				shape: {
					duration: 350,
					easing: 'easeOutBack',
					scaleY:  {
						value: [1.3,1],
						duration: 1300,
						easing: 'easeOutElastic',
						elasticity: 500
					},
					scaleX: {
						value: [0.3,1],
						duration: 1300,
						easing: 'easeOutElastic',
						elasticity: 500
					},
				},
				path: {
					duration: 450,
					easing: 'easeInOutQuad',
					d: 'M 44.5,24 C 148,24 252,24 356,24 367,24 376,32.9 376,44 L 376,256 C 376,267 367,276 356,276 252,276 148,276 44.5,276 33.4,276 24.5,267 24.5,256 L 24.5,44 C 24.5,32.9 33.4,24 44.5,24 Z'
				},
				content: {
					duration: 300,
					delay: 50,
					easing: 'easeOutQuad',
					translateY: [10,0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateY: [
						{value: '-50%', duration: 100, easing: 'easeInQuad'},
						{value: ['50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#6fbb95',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			},
			out: {
				base: {
					duration: 320,
					delay: 50,
					easing: 'easeInOutQuint',
					scaleY: 1.5,
					scaleX: 0,
					translateY: -100,
					opacity: {
						value: 0,
						duration: 100,
						delay: 130,
						easing: 'linear'
					}
				},
				path: {
					duration: 300,
					delay: 50,
					easing: 'easeInOutQuint',
					d: 'M 44.5,24 C 138,4.47 246,-6.47 356,24 367,26.9 376,32.9 376,44 L 376,256 C 376,267 367,279 356,276 231,240 168,241 44.5,276 33.8,279 24.5,267 24.5,256 L 24.5,44 C 24.5,32.9 33.6,26.3 44.5,24 Z'
				},
				content: {
					duration: 300,
					easing: 'easeInOutQuad',
					translateY: -40,
					opacity: {
						value: 0,
						duration: 100,
						delay: 135,
						easing: 'linear'
					}
				},
				trigger: {
					translateY: [
						{value: '-50%', duration: 100, easing: 'easeInQuad'},
						{value: ['50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#666',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			}
		},
		amras: {
			in: {
				base: {
					duration: 1,
					delay: 50,
					easing: 'linear',
					opacity: 1
				},
				path: {
					duration: 800,
					delay: 100,
					easing: 'easeOutElastic',
					delay: function(t,i) {
						return i*20;
					},
					scale: [0,1],
				},
				content: {
					duration: 300,
					delay: 250,
					easing: 'easeOutExpo',
					scale: [0.7,1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateY: [
						{value: '50%', duration: 100, easing: 'easeInQuad'},
						{value: ['-50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#6fbb95',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			},
			out: {
				base: {
					duration: 1,
					delay: 450,
					easing: 'linear',
					opacity: 0
				},
				path: {
					duration: 500,
					easing: 'easeOutExpo',
					delay: function(t,i,c) {
						return (c-i-1)*40;
					},
					scale: 0
				},
				content: {
					duration: 300,
					easing: 'easeOutExpo',
					scale: 0.7,
					opacity: {
						value: 0,
						duration: 100,
						easing: 'linear'
					}
				},
				trigger: {
					translateY: [
						{value: '-50%', duration: 100, easing: 'easeInQuad'},
						{value: ['50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#666',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			}
		},
		hador: {
			in: {
				base: {
					duration: 1,
					delay: 100,
					easing: 'linear',
					opacity: 1
				},
				path: {
					duration: 1000,
					easing: 'easeOutExpo',
					delay: function(t,i) {
						return i*150;
					},
					scale: [0,1],
					translateY: function(t,i,c) {
						return i === c-1 ? ['50%','0%'] : 0;
					},
					rotate: function(t,i,c) {
						return i === c-1 ? [90,0] : 0;
					}
				},
				content: {
					duration: 600,
					delay: 750,
					easing: 'easeOutExpo',
					scale: [0.5,1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 400
					}
				},
				trigger: {
					translateX: [
						{value: '30%', duration: 200, easing: 'easeInExpo'},
						{value: ['-30%','0%'], duration: 200, easing: 'easeOutExpo'}
					],
					opacity: [
						{value: 0, duration: 200, easing: 'easeInExpo'},
						{value: 1, duration: 200, easing: 'easeOutExpo'}
					],
					color: [
						{value: '#6fbb95', duration: 1, delay: 200, easing: 'easeOutExpo'}
					]
				}
			},
			out: {
				base: {
					duration: 1,
					delay: 450,
					easing: 'linear',
					opacity: 0
				},
				path: {
					duration: 300,
					easing: 'easeOutExpo',
					delay: function(t,i,c) {
						return (c-i-1)*50;
					},
					scale: 0
				},
				content: {
					duration: 200,
					easing: 'easeOutExpo',
					scale: 0.7,
					opacity: {
						value: 0,
						duration: 50,
						easing: 'linear'
					}
				},
				trigger: {
					translateX: [
						{value: '30%', duration: 100, easing: 'easeInQuad'},
						{value: ['-30%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: [
						{value: '#666', duration: 1, delay: 100, easing: 'easeOutQuad'}
					]
				}
			}
		},
		malva: {
			in: {
				base: {
					translateX: [
						{value: 3, duration: 100, delay: 150, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 0, duration: 100, easing: [0.1,1,0.3,1]},
					],
					translateY: [
						{value: -3, duration: 100, delay: 150, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: -3, duration: 100, easing: 'linear'},
						{value: 3, duration: 100, easing: 'linear'},
						{value: 0, duration: 100, easing: [0.1,1,0.3,1]},
					],
					scale: [
						{value: [0,1.1], duration: 150,easing: [0.1,1,0.3,1]},
						{value: 1.4, duration: 800,easing: 'linear'},
						{value: 1, duration: 150, easing: [0.1,1,0.3,1] },
					],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 1
					}
				},
				content: {
					duration: 100,
					easing: 'linear',
					opacity: 1
				},
				trigger: {
					duration: 300,
					easing: 'easeOutExpo',
					scale: [1,0.9],
					color: '#6fbb95'
				}
			},
			out: {
				base: {
					duration: 150,
					delay: 50,
					easing: 'easeInQuad',
					scale: 0,
					opacity: {
						delay: 100,
						value: 0,
						easing: 'linear'
					}
				},
				content: {
					duration: 100,
					easing: 'easeInQuad',
					opacity: {
						value: 0,
						easing: 'linear'
					}
				},
				trigger: {
					duration: 300,
					delay: 50,
					easing: 'easeOutExpo',
					scale: 1,
					color: '#666'
				}
			}
		},
		sadoc: {
			in: {
				base: {
					duration: 1,
					delay: 100,
					easing: 'linear',
					opacity: 1,
					translateY: {
						value: [-40,0],
						duration: 800,
						easing: 'easeOutElastic'
					}
				},
				path: {
					duration: 600,
					easing: 'easeInOutSine',
					strokeDashoffset: [dashOffset, 0],
					fill: {
						value: '#141514',
						duration: 400,
						delay: 500,
						easing: 'linear'
					}
				},
				content: {
					duration: 800,
					delay: 420,
					easing: 'easeOutElastic',
					translateY: [20,0],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateY: [
						{value: '50%', duration: 100, easing: 'easeInQuad'},
						{value: ['-50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#6fbb95',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			},
			out: {
				base: {
					duration: 1,
					delay: 400,
					easing: 'linear',
					opacity: 0
				},
				path: {
					duration: 300,
					easing: 'easeInOutSine',
					strokeDashoffset: dashOffset,
					fill: {
						value: '#1d1f1e',
						duration: 400,
						easing: 'linear'
					}
				},
				content: {
					duration: 200,
					easing: 'easeOutExpo',
					translateY: 20,
					opacity: {
						value: 0,
						easing: 'linear',
						duration: 50
					}
				},
				trigger: {
					translateY: [
						{value: '50%', duration: 100, easing: 'easeInQuad'},
						{value: ['-50%','0%'], duration: 100, easing: 'easeOutQuad'}
					],
					opacity: [
						{value: 0, duration: 100, easing: 'easeInQuad'},
						{value: 1, duration: 100, easing: 'easeOutQuad'}
					],
					color: {
						value: '#666',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			}
		}
	};

	const tooltips = Array.from(document.querySelectorAll('.tooltip'));

	class Tooltip {
		constructor(el) {
			this.DOM = {};
			this.DOM.el = el;
			this.type = this.DOM.el.getAttribute('data-type');
			this.DOM.trigger = this.DOM.el.querySelector('.tooltip__trigger');
			this.DOM.triggerSpan = this.DOM.el.querySelector('.tooltip__trigger-text');
			this.DOM.base = this.DOM.el.querySelector('.tooltip__base');
			this.DOM.shape = this.DOM.base.querySelector('.tooltip__shape');
			if( this.DOM.shape ) {
				this.DOM.path = this.DOM.shape.childElementCount > 1 ? Array.from(this.DOM.shape.querySelectorAll('path')) : this.DOM.shape.querySelector('path');
			}
			this.DOM.deco = this.DOM.base.querySelector('.tooltip__deco');
			this.DOM.content = this.DOM.base.querySelector('.tooltip__content');

            if(this.DOM.content) {
                this.DOM.letters = this.DOM.content.querySelector('.tooltip__letters');
                if (this.DOM.letters) {
                    // Create spans for each letter.
                    charming(this.DOM.letters);
                    // Redefine content.
                    this.DOM.content = this.DOM.letters.querySelectorAll('span');
                }
            }
			this.initEvents();
		}
		initEvents() {
			this.mouseenterFn = () => {
				this.mouseTimeout = setTimeout(() => {
					this.isShown = true;
					this.show();
				}, 75);
			}
			this.mouseleaveFn = () => {
				clearTimeout(this.mouseTimeout);
				if( this.isShown ) {
					this.isShown = false;
					this.hide();
				}
			}
			this.DOM.trigger.addEventListener('mouseenter', this.mouseenterFn);
			this.DOM.trigger.addEventListener('mouseleave', this.mouseleaveFn);
			this.DOM.trigger.addEventListener('touchstart', this.mouseenterFn);
			this.DOM.trigger.addEventListener('touchend', this.mouseleaveFn);
		}
		show() {
			this.animate('in');
		}
		hide() {
			this.animate('out');
		}
		animate(dir) {
			if ( config[this.type][dir].base ) {
				nativeRemove(this.DOM.base);
				let baseAnimOpts = {targets: this.DOM.base};
				nativeAnimate(Object.assign(baseAnimOpts, config[this.type][dir].base));
			}
			if ( config[this.type][dir].shape ) {
				nativeRemove(this.DOM.shape);
				let shapeAnimOpts = {targets: this.DOM.shape};
				nativeAnimate(Object.assign(shapeAnimOpts, config[this.type][dir].shape));
			}
			if ( config[this.type][dir].path ) {
				nativeRemove(this.DOM.path);
				let shapeAnimOpts = {targets: this.DOM.path};
				nativeAnimate(Object.assign(shapeAnimOpts, config[this.type][dir].path));
			}
			if ( config[this.type][dir].content ) {
				nativeRemove(this.DOM.content);
				let contentAnimOpts = {targets: this.DOM.content};
				nativeAnimate(Object.assign(contentAnimOpts, config[this.type][dir].content));
			}
			if ( config[this.type][dir].trigger ) {
				nativeRemove(this.DOM.triggerSpan);
				let triggerAnimOpts = {targets: this.DOM.triggerSpan};
				nativeAnimate(Object.assign(triggerAnimOpts, config[this.type][dir].trigger));
			}
			if ( config[this.type][dir].deco ) {
				nativeRemove(this.DOM.deco);
				let decoAnimOpts = {targets: this.DOM.deco};
				nativeAnimate(Object.assign(decoAnimOpts, config[this.type][dir].deco));
			}
		}
		destroy() {
			this.DOM.trigger.removeEventListener('mouseenter', this.mouseenterFn);
			this.DOM.trigger.removeEventListener('mouseleave', this.mouseleaveFn);
			this.DOM.trigger.removeEventListener('touchstart', this.mouseenterFn);
			this.DOM.trigger.removeEventListener('touchend', this.mouseleaveFn);
		}
	}

	const init = (() => tooltips.forEach(t => new Tooltip(t)))();
};
