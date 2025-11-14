import { ComponentHydrator, initAllComponentInstances } from 'fluid-primitives';
import { scroll } from 'motion';

(() => {
	initAllComponentInstances('compare-table', ({ props }) => {
		const hydrator = new ComponentHydrator('compare-table', props.id);
		const textItems = hydrator.getElements<HTMLElement>('item-text');

		function updateShadow(title: HTMLElement) {
			const rect = title.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			const position = rect.top / viewportHeight;

			const maxOffset = 40;
			// const offsetY = (0.5 - position) * 2 * maxOffset;
			const offsetY = (position - 0.5) * 2 * maxOffset;

			title.style.textShadow = `15px ${offsetY}px 10px rgba(0,0,0,0.9), 15px ${offsetY}px 20px rgba(0,0,0,0.9)`;
		}

		window.addEventListener('scroll', () => {
			textItems.forEach(item => updateShadow(item));
		});
		textItems.forEach(item => updateShadow(item));
	});
})();
