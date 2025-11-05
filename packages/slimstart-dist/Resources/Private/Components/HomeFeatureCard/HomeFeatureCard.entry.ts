import { ComponentHydrator, getHydrationData, initAllComponentInstances } from 'fluid-primitives';
import { inView, animate, spring } from 'motion';

const NAME = 'home-feature-card';

(() => {
	const checkmarkPath = document.querySelector<SVGPathElement>('#checkmark-path-inner');
	if (!checkmarkPath) return;

	const svg = checkmarkPath.ownerSVGElement!;
	const pathLength = checkmarkPath.getTotalLength();

	const cardIds = Object.keys(getHydrationData(NAME) || {});
	const cardsCount = cardIds.length;

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
		const isLast = index === cardsCount - 1;

		const iconClone = iconEl.cloneNode(true) as SVGElement;
		iconClone.classList.remove(...iconEl.classList);
		iconClone.classList.add(
			...'fixed grid place-items-center pointer-events-none size-20 origin-center translate-y-[-50%] translate-x-[-50%]'.split(
				' '
			)
		);
		iconClone.style.opacity = '0';

		document.body.appendChild(iconClone);
		clones.set(props.id, iconClone);

		// TODO: currently not working when items are visible or above the viewport on load
		// maybe simply use intersection observer directly
		inView(rootEl, () => {
			iconClone.style.opacity = '0';
			console.log({ rootEl, inView: true });

			return () => {
				const isBelowViewport =
					window.scrollY + window.innerHeight <
					rootEl.getBoundingClientRect().top + window.scrollY;
				console.log({ rootEl, inView: false, isBelowViewport });

				if (isBelowViewport) {
					iconClone.style.opacity = '0';
					return;
				}

				const svgPoint = getPathPoint(index);
				const screenCoords = svgPointToScreen(svgPoint);

				Object.assign(iconClone.style, {
					left: `${screenCoords.x}px`,
					top: `${screenCoords.y}px`,
				});

				animate(
					iconClone,
					{
						opacity: [0, 1],
						scale: [0.5, 1],
						filter: ['blur(4px)', 'blur(0px)'],
						// rotate: [-20, 0],
					},
					{ type: spring, bounce: 0.3, duration: 0.3 }
				);
			};
		});

		inView('#hide-checkmark', () => {
			svg.style.opacity = '0';

			const iconClone = clones.get(props.id);
			if (!iconClone) return;
			iconClone.setAttribute('hidden', 'true'); // we set hidden for now, if we animate we need to check/cancel ongoing animations like the show animation
			return () => {
				svg.style.opacity = '1';
				iconClone.removeAttribute('hidden');
			};
		});
	});
})();
