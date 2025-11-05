import { ComponentHydrator, getHydrationData, initAllComponentInstances } from 'fluid-primitives';
import { Carousel } from '../ui/Carousel/Carousel';
import AutoHeight from 'embla-carousel-auto-height';

class Testimonials extends Carousel {
	constructor(rootId: string) {
		const hydrator = new ComponentHydrator('carousel', rootId);
		super(hydrator);

		this.options = {
			navigation: {
				nextBtn: hydrator.getElement<HTMLElement>('next-trigger'),
				prevBtn: hydrator.getElement<HTMLElement>('prev-trigger'),
			},
			skipLink: {
				class: 'sr-only focus:not-sr-only',
			},
			loop: true,
		};

		this.viewport = hydrator.getElement<HTMLElement>('viewport')!;

		this.plugins = [AutoHeight()];

		this.initCarousel();
		this.init();
	}

	init() {}
}

(() => {
	initAllComponentInstances('testimonials', ({ props }) => {
		const carouselProps = getHydrationData('carousel', 'testimonials-' + props.id)!.props;
		new Testimonials(carouselProps.id);
	});
})();
