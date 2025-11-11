import { ComponentHydrator, getHydrationData, initAllComponentInstances } from 'fluid-primitives';
import { animate, spring, scroll, motionValue, styleEffect } from 'motion';

const NAME = 'home-feature-card';

(() => {
	const checkmarkPath = document.querySelector<SVGPathElement>('#checkmark-path-inner');
	if (!checkmarkPath) return;

	const svg = checkmarkPath.ownerSVGElement!;
	const pathLength = checkmarkPath.getTotalLength();

	const cardIds = Object.keys(getHydrationData(NAME) || {});
	const cardsCount = cardIds.length;

	const hideIconsTrigger = document.getElementById('hide-check-icons');

	const getPathPoint = (index: number) =>
		checkmarkPath.getPointAtLength((index / (cardsCount - 1)) * pathLength);

	const svgPointToScreen = (pt: DOMPoint) => {
		const ctm = svg.getScreenCTM();
		if (!ctm) return { x: 0, y: 0 };
		const screenPoint = pt.matrixTransform(ctm);
		return { x: screenPoint.x, y: screenPoint.y };
	};

	const clones = new Map<string, SVGElement>();

	initAllComponentInstances(NAME, ({ props }) => {
		const hydrator = new ComponentHydrator(NAME, props.id, props.ids);
		const rootEl = hydrator.getElement('root');
		const iconEl = hydrator.getElement<SVGElement>('icon');
		if (!rootEl || !iconEl) return;

		const index = cardIds.indexOf(props.id);

		const iconClone = iconEl.cloneNode(true) as SVGElement;
		iconClone.classList.remove(...iconEl.classList);
		iconClone.classList.add(
			...'fixed grid place-items-center pointer-events-none size-20 origin-center translate-y-[-50%] translate-x-[-50%] *:[svg]:size-30 *:[svg]:absolute *:[svg]:left-1/2 *:[svg]:top-1/2 *:[svg]:-translate-x-1/2 *:[svg]:-translate-y-1/2'.split(
				' '
			)
		);
		iconClone.style.opacity = '0';

		document.body.appendChild(iconClone);
		clones.set(props.id, iconClone);

		const opacity = motionValue(0);

		styleEffect(iconClone, { opacity });

		scroll(
			progress => {
				if (progress === 1) {
					// animate(iconClone, { opacity: 0 });
					animate(opacity, 0);
				} else {
					// animate(iconClone, { opacity: 1 });
					animate(opacity, 1);
				}
			},
			{
				target: hideIconsTrigger!,
				offset: JSON.parse(hideIconsTrigger!.getAttribute('data-offset') || ''),
			}
		);

		scroll(
			progress => {
				const svgPoint = getPathPoint(index);
				const screenCoords = svgPointToScreen(svgPoint);

				Object.assign(iconClone.style, {
					left: `${screenCoords.x}px`,
					top: `${screenCoords.y}px`,
					// color: progress === 1 ? 'red' : '',
				});
				if (progress === 1) {
					animate(
						iconClone,
						{
							// opacity: [0, 1],
							scale: [0.5, 1],
							filter: ['blur(4px)', 'blur(0px)'],
							// rotate: [-20, 0],
						},
						{ type: spring, bounce: 0.3, duration: 0.3 }
					);
					animate(opacity, 1, { type: spring, bounce: 0.3, duration: 0.3 });
				} else {
					// animation.stop();
					animate(
						iconClone,
						{
							// opacity: 0,
							scale: 0.5,
							filter: 'blur(4px)',
						},
						{ type: spring, bounce: 0.3, duration: 0.3 }
					);
					animate(opacity, 0, { type: spring, bounce: 0.3, duration: 0.3 });
				}
			},
			{
				target: rootEl,
				offset: ['start start', 'start start'],
			}
		);
	});
})();
