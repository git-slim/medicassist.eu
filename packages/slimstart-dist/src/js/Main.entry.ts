import '@fontsource-variable/manrope';
import '../css/main.css';
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { animate, inView, mapValue, motionValue, stagger, svgEffect, transformValue } from 'motion';
import Splitting from 'splitting';

setTimeout(() => {
	const results = Splitting();
	results.forEach(result => {
		const el = result.el as HTMLElement;
		const textContent = el.textContent || '';
		el.ariaLabel = textContent;

		const isInsideAnimateEl = el.closest('[data-animate]');
		if (isInsideAnimateEl) return;

		inView(
			el,
			() => {
				el.style.visibility = 'visible';
				if (result.words) {
					animate(
						result.words,
						{ opacity: [0, 1], y: ['10px', '0px'], filter: ['blur(4px)', 'blur(0px)'] },
						{ delay: stagger(0.03), type: 'spring', duration: 0.5 }
					);
				}
			},
			{ margin: '-50px 0px -50px 0px' }
		);
	});

	const animateEls = document.querySelectorAll<HTMLElement>('[data-animate]');
	animateEls.forEach(el => {
		const animationType = el.dataset.animate;
		inView(
			el,
			() => {
				el.style.visibility = 'visible';
				if (animationType === 'fade-up') {
					animate(
						el,
						{ opacity: [0, 1], y: ['10px', '0px'], filter: ['blur(4px)', 'blur(0px)'] },
						{ type: 'spring', duration: 0.5 }
					);
				}
			},
			{ margin: '-50px 0px -50px 0px' }
		);
	});
}, 1000);

export const lenis = new Lenis({
	autoRaf: true,
});

(() => {
	const defiWrapper = document.getElementById('defi-wrapper');
	if (!defiWrapper) return;

	defiWrapper.style.setProperty('--wrapper-w-px', `${defiWrapper.clientWidth}px`);
	defiWrapper.style.setProperty('--wrapper-w', `${defiWrapper.clientWidth}`);

	const defiSvg = defiWrapper.querySelector('svg')!;

	// const defiImage = document.getElementById('defi-image') as HTMLImageElement;

	// let imageWidth = 0;
	// let imageHeight = 0;

	// const updateImageDimensions = () => {
	// 	if (defiImage.complete) {
	// 		imageWidth = defiImage.naturalWidth;
	// 		imageHeight = defiImage.naturalHeight;
	// 		defiWrapper.style.setProperty('--image-w', `${imageWidth}px`);
	// 		defiWrapper.style.setProperty('--image-h', `${imageHeight}px`);
	// 	} else {
	// 		defiImage.onload = () => {
	// 			imageWidth = defiImage.naturalWidth;
	// 			imageHeight = defiImage.naturalHeight;
	// 			defiWrapper.style.setProperty('--image-w', `${imageWidth}px`);
	// 			defiWrapper.style.setProperty('--image-h', `${imageHeight}px`);
	// 		};
	// 	}
	// };

	// const radialSpot = document.getElementById('radialSpot')!;
	// const cxV = motionValue(0);
	// const cx = transformValue(() => `${cxV.get()}%`);
	// const cyV = motionValue(0);
	// const cy = transformValue(() => `${cyV.get()}%`);
	// const fxV = motionValue(0);
	// const fx = transformValue(() => `${fxV.get()}%`);
	// const fyV = motionValue(0);
	// const fy = transformValue(() => `${fyV.get()}%`);
	// const rV = motionValue(80);
	// const r = transformValue(() => `${rV.get()}%`);
	// svgEffect(radialSpot, {
	// 	cx,
	// 	cy,
	// 	fx,
	// 	fy,
	// 	r,
	// });

	const shimmerGradient = defiSvg.querySelector('[data-shimmer]')! as SVGLinearGradientElement;
	shimmerGradient.style.rotate = '10deg';

	const x = motionValue(0);
	const xScaled = mapValue(x, [0, 1], [-0.9, 0.9]);
	const gradientTransform = transformValue(() => `translate(${xScaled.get()}, 0)`);
	svgEffect(shimmerGradient, {
		gradientTransform,
	});

	setTimeout(() => {
		animate(
			defiSvg,
			{
				opacity: [0, 1],
				y: ['10px', '0px'],
				filter: ['blur(4px)', 'blur(0px)'],
			},
			{
				type: 'spring',
				duration: 1,
				bounce: 0,
			}
		);
		animate(x, [0, 1], { duration: 2, type: 'spring', delay: 1 });
	}, 1000);

	let boundingRef: DOMRect | null = null;

	defiSvg.addEventListener('mouseenter', () => {
		boundingRef = defiSvg.getBoundingClientRect();
	});

	defiSvg.addEventListener('mousemove', e => {
		if (!e.currentTarget) return;

		if (!boundingRef) {
			boundingRef = defiSvg.getBoundingClientRect();
		}
		// console.log(e.clientX, boun);

		x.set((e.clientX - boundingRef.left) / boundingRef.width);
		// x.set(e.clientX - boundingRef.left - boundingRef.width / 2);

		// const x = e.clientX - boundingRef.left;
		// const y = e.clientY - boundingRef.top;
		// const xPercentage = x / boundingRef.width;
		// const yPercentage = y / boundingRef.height;
		// const xRotation = (xPercentage - 0.5) * 20;
		// const yRotation = (0.5 - yPercentage) * 20;

		// const target = e.currentTarget as HTMLElement;
		// target.style.setProperty('--x-rotation', `${yRotation}deg`);
		// target.style.setProperty('--y-rotation', `${xRotation}deg`);
		// target.style.setProperty('--x', `${xPercentage * 100}%`);
		// target.style.setProperty('--y', `${yPercentage * 100}%`);

		// const xPercentValue = xPercentage * 100;
		// const yPercentValue = yPercentage * 100;
		// cxV.set(xPercentValue);
		// cyV.set(yPercentValue);
		// fxV.set(xPercentValue);
		// fyV.set(yPercentValue);
	});
})();
