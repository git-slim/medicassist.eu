import { Tabs } from 'fluid-primitives/tabs';
import A11y from '@/utils/A11y';
import Elements from '@/utils/Elements';
import EmblaCarousel, {
	EmblaCarouselType,
	EmblaEventType,
	EmblaPluginType,
	EmblaOptionsType,
} from 'embla-carousel';
import { ComponentHydrator } from 'fluid-primitives';

export type CarouselOptions = {
	pattern?: 'carousel' | 'list';
	baseId?: string;
	skipLink?:
		| {
				text?: string;
				class?: string;
		  }
		| false;
	navigation?: {
		nextBtn?: HTMLElement | null;
		prevBtn?: HTMLElement | null;
	};
	tabs?: {
		element?: HTMLElement | null;
		className?: string;
		activeClassName?: string;
		label?: (index: number, length: number) => string;
		hideOnWrap?: boolean;
	};
} & EmblaOptionsType;

export type AutoscrollToggleWithTextConfig = {
	button: HTMLElement | null;
	startText: string;
	stopText: string;
};

export type AutoscrollToggleWithElementsConfig = {
	button: HTMLElement | null;
	startTextEl: HTMLElement | null;
	stopTextEl: HTMLElement | null;
};

const KEYS = {
	ArrowRight: 'ArrowRight',
	ArrowDown: 'ArrowDown',
	ArrowLeft: 'ArrowLeft',
	ArrowUp: 'ArrowUp',
	Home: 'Home',
	End: 'End',
};

export abstract class Carousel {
	SR_ONLY_CLASS = 'u-sr-only';
	SR_ONLY_FOCUS_CLASS = 'u-sr-only-focusable';
	root: HTMLElement;
	embla!: EmblaCarouselType;
	cleanups: (() => void)[] = [];
	destroyController = new AbortController();
	baseId!: string;
	skipLink:
		| {
				element: HTMLAnchorElement;
				target: HTMLElement;
		  }
		| undefined;
	autoscrollToggleElement: HTMLElement | null = null;
	hasNavigation = false;
	hasTabs = false;

	private _options!: CarouselOptions;
	private _plugins: EmblaPluginType[] = [];
	private _viewport: HTMLElement | null = null;
	private _autoscrollToggleWithText: AutoscrollToggleWithTextConfig | null = null;
	private _autoscrollToggleWithElements: AutoscrollToggleWithElementsConfig | null = null;

	set options(userOptions: CarouselOptions) {
		const userDuration = userOptions?.duration || 25;

		const userOptionsWithoutDuration = { ...userOptions };
		delete userOptionsWithoutDuration.duration;

		this._options = {
			pattern: 'carousel',
			inViewThreshold: 0.005, // ensure correct inview detection
			...userOptionsWithoutDuration,
			duration: A11y.prefersReducedMotion() ? 0 : userDuration,
		};
	}
	get options(): CarouselOptions {
		return this._options || {};
	}

	set plugins(plugins: EmblaPluginType[]) {
		this._plugins = plugins;
	}
	get plugins(): EmblaPluginType[] {
		return this._plugins;
	}

	set viewport(viewport: HTMLElement | null) {
		this._viewport = viewport;
	}
	get viewport(): HTMLElement {
		return this._viewport || <HTMLElement>this.root.querySelector('.embla__viewport');
	}

	set autoscrollToggleWithText(config: AutoscrollToggleWithTextConfig) {
		this._autoscrollToggleWithText = config;
	}
	set autoscrollToggleWithElements(config: AutoscrollToggleWithElementsConfig) {
		this._autoscrollToggleWithElements = config;
	}
	get autoscrollToggle():
		| {
				mode: 'text';
				config: AutoscrollToggleWithTextConfig;
		  }
		| {
				mode: 'elements';
				config: AutoscrollToggleWithElementsConfig;
		  }
		| null {
		if (this._autoscrollToggleWithText) {
			return {
				mode: 'text',
				config: this._autoscrollToggleWithText,
			};
		}
		if (this._autoscrollToggleWithElements) {
			return {
				mode: 'elements',
				config: this._autoscrollToggleWithElements,
			};
		}
		return null;
	}

	constructor(hydrator: ComponentHydrator) {
		this.root = hydrator.getElement<HTMLElement>('root')!;
		this.baseId = hydrator.rootId;
	}

	initCarousel() {
		if (!this.root) {
			throw new Error('Root not found');
		}

		if (!this.viewport) {
			throw new Error('Viewport not found');
		}

		// this.baseId = this.options.baseId || this.root.dataset.baseId || '';
		if (!this.baseId) {
			throw new Error('Base ID not found');
		}

		this.embla = EmblaCarousel(this.viewport, this.options, this.plugins);
		this.embla.on('destroy', () => {
			this.cleanups.forEach(cleanup => cleanup());
			this.cleanups = [];
			this.destroyController.abort();
		});

		this.#initRoot();
		this.#initViewport();
		this.#initContainer();
		this.#initSlides();
		this.#initNavigation();
		this.#initTabs();
		this.#initSkipLink();
		if (this.embla.plugins().autoScroll) {
			if (this.isCarouselPattern()) {
				// TODO: things like aria-live toggle, ...
				throw new Error('Autoscroll not supported in carousel pattern yet');
			}
			this.#initAutoscrollToggle();
			this.#initAutoscrollStopBtns();
			if (A11y.prefersReducedMotion()) {
				(this.embla.plugins().autoScroll as any).stop();
			}
		}
		if (this.embla.plugins().autoPlay) {
			// TODO: things like already done for autoscroll, ...
			throw new Error('Autoplay plugin is not supported yet');
		}
	}

	#initRoot() {
		this.root.setAttribute('role', 'region');
		Elements.safelySetAttribute(this.root, 'aria-roledescription', 'Karussell');
		if (this.isListPattern()) {
			this.root.setAttribute('tabindex', '0');
			this.root.addEventListener(
				'keydown',
				event => {
					const target = event.target;
					if (
						Array.from(this.root.querySelectorAll<HTMLElement>('button')).includes(
							target as HTMLButtonElement
						)
					)
						return;

					this.handleKeyboardControls(event, this.embla.internalEngine().options.axis);
				},
				{ signal: this.destroyController.signal }
			);
		}
	}

	#initViewport() {
		this.viewport!.id = `${this.baseId}-viewport`;
		if (this.isCarouselPattern()) {
			this.viewport.setAttribute('aria-live', 'polite');
		}
	}

	#initContainer() {
		if (this.isListPattern()) {
			const container = this.embla.containerNode();
			container.setAttribute('role', 'list');
		}
	}

	#initSlides() {
		const slides = this.embla.slideNodes();
		slides.forEach((slide, index) => {
			if (this.isCarouselPattern()) {
				slide.setAttribute('role', 'group');
				Elements.safelySetAttribute(slide, 'aria-roledescription', 'Element');
				if (!Elements.hasLabelOrLabelledBy(slide)) {
					Elements.safelySetAttribute(
						slide,
						'aria-label',
						`${index + 1} von ${slides.length}`
					);
				}
			}
			if (this.isListPattern()) {
				slide.setAttribute('role', 'listitem');
			}
		});

		if (this.isCarouselPattern()) {
			const handleSlidesVisibility = () => {
				this.embla.slideNodes().forEach((slide, index) => {
					const inView = this.embla.slidesInView().includes(index);
					const isSelected = inView && this.embla.selectedScrollSnap() === index;
					if (inView) {
						slide.style.visibility = 'visible';
						if (isSelected) {
							slide.setAttribute('aria-hidden', 'false');
						}
					} else {
						if (
							document.activeElement === slide ||
							slide.contains(document.activeElement)
						) {
							return;
						}
						if (isSelected) {
							slide.setAttribute('aria-hidden', 'true');
						}
						slide.style.visibility = 'hidden';
					}
				});
			};
			this.registerEmblaEventWithCleanup('slidesInView', handleSlidesVisibility);
			this.cleanups.push(() => {
				this.embla.slideNodes().forEach(slide => {
					slide.style.visibility = '';
					slide.removeAttribute('aria-hidden');
				});
			});
		}
	}

	#initNavigation() {
		if (!this.options.navigation) return;

		const { nextBtn, prevBtn } = this.options.navigation;
		if (!nextBtn || !prevBtn) {
			console.warn('Navigation elements not found');
			return;
		}

		nextBtn.setAttribute('aria-controls', this.viewport!.id);
		prevBtn.setAttribute('aria-controls', this.viewport!.id);

		const togglePrevNextBtnsState = () => {
			if (this.embla.canScrollPrev()) prevBtn.setAttribute('aria-disabled', 'false');
			else prevBtn.setAttribute('aria-disabled', 'true');

			if (this.embla.canScrollNext()) nextBtn.setAttribute('aria-disabled', 'false');
			else nextBtn.setAttribute('aria-disabled', 'true');
		};

		this.registerEmblaEventWithCleanup(['select', 'init', 'reInit'], togglePrevNextBtnsState);

		const scrollPrev = () => {
			if (Elements.isDisabled(prevBtn)) return;
			this.embla.scrollPrev();
		};
		const scrollNext = () => {
			if (Elements.isDisabled(nextBtn)) return;
			this.embla.scrollNext();
		};
		prevBtn.addEventListener('click', scrollPrev, { signal: this.destroyController.signal });
		nextBtn.addEventListener('click', scrollNext, { signal: this.destroyController.signal });

		this.cleanups.push(() => {
			prevBtn.removeAttribute('aria-disabled');
			nextBtn.removeAttribute('aria-disabled');
		});

		this.hasNavigation = true;
	}

	#initTabs() {
		if (!this.options.tabs || this.hasTabs) return;

		const { element, className, activeClassName, label, hideOnWrap } = this.options.tabs;
		if (!element) {
			throw new Error('Tabs element not found');
		}

		if (this.isListPattern()) {
			throw new Error('Tabs not supported in list pattern');
		}

		const slides = this.embla.slideNodes();

		if (slides.length <= 1) {
			element.style.display = 'none';
			return;
		}

		slides.forEach((slide, i) => {
			slide.classList.add('js-tabs-content');
			slide.setAttribute('data-value', `${this.baseId}-tab-${i + 1}`);
		});

		const triggers = slides.map((_, i) => {
			const dot = document.createElement('button');
			dot.className = `js-tabs-trigger ${className || ''}`;
			dot.setAttribute('data-value', `${this.baseId}-tab-${i + 1}`);
			dot.setAttribute('data-index', i.toString());
			if (label) {
				dot.innerHTML = `
					<span class="${this.SR_ONLY_CLASS}">
						${label(i, slides.length)}
					</span>`;
			} else {
				throw new Error('Label function not found');
			}
			dot.setAttribute('tabindex', '0');
			dot.addEventListener('click', () => this.embla.scrollTo(i), {
				signal: this.destroyController.signal,
			});
			return dot;
		});

		element.classList.add('js-tabs-list');
		element.append(...triggers);

		let prevValue = '';
		let isSyncing = false;
		const tabsMachine = new Tabs({
			id: this.baseId + '-tabs',
			defaultValue: `${this.baseId}-tab-1`,
			loopFocus: this.options.loop || false,
			orientation:
				this.embla.internalEngine().options.axis === 'y' ? 'vertical' : 'horizontal',
			onValueChange: details => {
				if (isSyncing) return;

				if (details.value === prevValue) return;

				const index = details.value.split('-').pop();
				if (index === undefined) return;

				const indexNum = +index - 1;
				if (indexNum === this.embla.selectedScrollSnap()) return;

				isSyncing = true;
				this.embla.scrollTo(indexNum);
				prevValue = details.value;

				requestAnimationFrame(() => {
					isSyncing = false;
				});
			},
		});

		const updateTabs = () => {
			const index = this.embla.selectedScrollSnap();
			const tabValue = `${this.baseId}-tab-${index + 1}`;

			if (tabsMachine.api.value === tabValue) return;

			isSyncing = true;
			tabsMachine.api.setValue(tabValue);
			prevValue = tabValue;

			requestAnimationFrame(() => {
				isSyncing = false;
			});
		};

		const updateDots = () => {
			const selected = this.embla.selectedScrollSnap();
			requestAnimationFrame(() => {
				triggers.forEach((dot, i) => {
					const isSelected = i === selected;
					dot.classList.toggle(activeClassName || 'is-active', isSelected);
				});
			});
		};

		// tabs machine sets hidden attribute, so we counter that here
		this.embla.slideNodes().forEach(slide => (slide.style.display = 'block'));

		tabsMachine.init();

		this.embla.slideNodes().forEach(slide => slide.removeAttribute('aria-labelledby'));

		this.registerEmblaEventWithCleanup(['select', 'init', 'reInit'], () => {
			updateTabs();
			updateDots();
		});

		this.cleanups.push(() => {
			triggers.forEach(dot => dot.remove());
			tabsMachine.destroy();
			this.hasTabs = false;
		});

		if (hideOnWrap) {
			if (!this.hasNavigation) {
				console.error('Tabs with hideOnWrap option requires navigation to be enabled.');
				return;
			}

			const resizeObserver = new ResizeObserver(() => {
				element.classList.remove('u-sr-only-focusable');

				if (triggers[0].offsetTop !== triggers[triggers.length - 1].offsetTop) {
					element.classList.add('u-sr-only-focusable');
				} else {
					element.classList.remove('u-sr-only-focusable');
				}
			});
			resizeObserver.observe(this.root);

			this.cleanups.push(() => {
				resizeObserver.disconnect();
				element.classList.remove('u-sr-only-focusable');
			});
		}

		this.hasTabs = true;
	}

	#initAutoscrollStopBtns() {
		const autoScroll = this.embla?.plugins()?.autoScroll;
		if (!autoScroll) return;

		let buttonsThatStopAutoscroll = Array.from(
			this.root.querySelectorAll<HTMLElement>('button')
		);
		buttonsThatStopAutoscroll = buttonsThatStopAutoscroll.filter(button => {
			return button !== this.autoscrollToggleElement;
		});

		const onNavClick = () => {
			const resetOrStop =
				autoScroll.options.stopOnInteraction === false ? autoScroll.reset : autoScroll.stop;
			resetOrStop();
		};

		buttonsThatStopAutoscroll.forEach(button =>
			button.addEventListener('click', onNavClick, { signal: this.destroyController.signal })
		);
	}

	#initAutoscrollToggle() {
		const autoScroll = this.embla?.plugins()?.autoScroll;
		if (!autoScroll) return;

		const toggle = this.autoscrollToggle;
		if (!toggle) {
			throw new Error('Autoscroll toggle options not found');
		}

		const mode = toggle.mode;

		this.autoscrollToggleElement = toggle.config.button;
		if (!this.autoscrollToggleElement) {
			throw new Error('Autoscroll toggle button not found');
		}

		let startTextEl: AutoscrollToggleWithElementsConfig['startTextEl'] = null;
		let stopTextEl: AutoscrollToggleWithElementsConfig['stopTextEl'] = null;
		let startText: AutoscrollToggleWithTextConfig['startText'] = '';
		let stopText: AutoscrollToggleWithTextConfig['stopText'] = '';

		if (mode === 'elements') {
			startTextEl = toggle.config.startTextEl;
			stopTextEl = toggle.config.stopTextEl;
			if (!startTextEl || !stopTextEl) {
				throw new Error('Autoscroll toggle elements not found');
			}
		}
		if (mode === 'text') {
			startText = toggle.config.startText;
			stopText = toggle.config.stopText;
			if (!startText || !stopText) {
				throw new Error('Autoscroll toggle text not found');
			}
		}

		const togglePlayBtnState = () => {
			requestAnimationFrame(() => {
				if (mode === 'elements') {
					if (autoScroll.isPlaying()) {
						startTextEl?.setAttribute('hidden', 'true');
						stopTextEl?.removeAttribute('hidden');
					} else {
						startTextEl?.removeAttribute('hidden');
						stopTextEl?.setAttribute('hidden', 'true');
					}
				}
				if (mode === 'text') {
					const buttonText = autoScroll.isPlaying() ? startText : stopText;
					this.autoscrollToggleElement!.innerText = buttonText;
				}
			});
		};

		const onPlayBtnClick = () => {
			const playOrStop = autoScroll.isPlaying() ? autoScroll.stop : autoScroll.play;
			playOrStop();
		};

		this.autoscrollToggleElement.addEventListener('click', onPlayBtnClick, {
			signal: this.destroyController.signal,
		});
		this.registerEmblaEventWithCleanup(
			['autoScroll:play', 'autoScroll:stop', 'reInit'],
			togglePlayBtnState
		);
	}

	#initSkipLink() {
		let skipLinkOptions = this.options.skipLink;
		if (skipLinkOptions === false) return;

		const element = document.createElement('a');
		const target = document.createElement('div');

		target.id = `${this.baseId}-skip-link-target`;
		target.style.display = 'contents';
		target.setAttribute('tabindex', '-1');

		element.className = skipLinkOptions?.class || this.SR_ONLY_FOCUS_CLASS;
		element.setAttribute('href', `#${target.id}`);
		element.textContent = skipLinkOptions?.text || 'Karussell überspringen';

		this.root.insertAdjacentElement('afterbegin', element);
		this.root.insertAdjacentElement('afterend', target);

		this.skipLink = {
			element,
			target,
		};
	}

	registerEmblaEventWithCleanup(
		events: EmblaEventType[] | EmblaEventType,
		callback: (embla: EmblaCarouselType, eventName: EmblaEventType) => void
	) {
		if (!Array.isArray(events)) {
			events = [events];
		}
		events.forEach(event => {
			this.embla.on(event, callback);
			this.cleanups.push(() => this.embla.off(event, callback));
		});
	}

	isCarouselPattern() {
		return this.options.pattern === 'carousel';
	}
	isListPattern() {
		return this.options.pattern === 'list';
	}

	handleKeyboardControls(event: KeyboardEvent, orientation: 'x' | 'y') {
		const isHorizontal = orientation === 'x';
		const isVertical = orientation === 'y';

		if (!isHorizontal && !isVertical) {
			return;
		}

		if (Object.values(KEYS).includes(event.key)) {
			event.preventDefault();
			this.embla.plugins()?.autoScroll?.stop();
		}

		if (event.key === KEYS.ArrowRight && isHorizontal) this.embla.scrollNext();
		if (event.key === KEYS.ArrowDown && isVertical) this.embla.scrollNext();
		if (event.key === KEYS.ArrowLeft && isHorizontal) this.embla.scrollPrev();
		if (event.key === KEYS.ArrowUp && isVertical) this.embla.scrollPrev();

		if (event.key === KEYS.Home) this.embla.scrollTo(0);
		if (event.key === KEYS.End) this.embla.scrollTo(this.embla.slideNodes().length - 1);
	}
}
