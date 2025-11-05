import { ComponentHydrator, getHydrationData, initAllComponentInstances } from 'fluid-primitives';
import { Carousel } from '../ui/Carousel/Carousel';
import AutoScroll from 'embla-carousel-auto-scroll';

class MarqueeRow extends Carousel {
	constructor(rootId: string, direction: 'forward' | 'backward' = 'forward') {
		const hydrator = new ComponentHydrator('carousel', rootId);
		// const root = hydrator.getElement<HTMLElement>('root')!;

		super(hydrator);

		this.options = {
			pattern: 'list',
			loop: true,
			watchDrag: false,
			navigation: {
				nextBtn: hydrator.getElement<HTMLElement>('next-trigger'),
				prevBtn: hydrator.getElement<HTMLElement>('prev-trigger'),
			},
			skipLink: {
				text: 'Liste überspringen',
				class: 'sr-only focus:not-sr-only',
			},
		};

		this.viewport = hydrator.getElement<HTMLElement>('viewport')!;

		this.plugins = [AutoScroll({ playOnInit: true, startDelay: 0, speed: 1, direction })];

		const toggle = hydrator.getElement<HTMLElement>('autoscroll-toggle');
		this.autoscrollToggleWithText = {
			button: toggle,
			startText: toggle?.getAttribute('data-play-text') || '',
			stopText: toggle?.getAttribute('data-stop-text') || '',
		};

		this.initCarousel();
		this.init();
	}

	init() {
		const autoscroll = this.embla.plugins().autoScroll;
		let autoscrollPlayedBeforeEnter = autoscroll.isPlaying();
		let pointerEntered = false;
		this.viewport.addEventListener(
			'pointerenter',
			() => {
				pointerEntered = true;
				setTimeout(() => {
					if (!pointerEntered) return;
					autoscrollPlayedBeforeEnter = autoscroll.isPlaying();
					autoscroll.stop();
				}, 100);
			},
			{ signal: this.destroyController.signal }
		);
		this.viewport.addEventListener(
			'pointerleave',
			() => {
				pointerEntered = false;
				autoscrollPlayedBeforeEnter ? autoscroll.play() : autoscroll.stop();
				autoscrollPlayedBeforeEnter = autoscroll.isPlaying();
			},
			{ signal: this.destroyController.signal }
		);
	}
}

(() => {
	initAllComponentInstances('marquee', ({ props }) => {
		const carouselProps = getHydrationData('carousel', 'marquee-' + props.id)!.props;
		new MarqueeRow(carouselProps.id, props.direction as 'forward' | 'backward');
	});
})();
