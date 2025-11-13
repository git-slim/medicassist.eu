import { initAllComponentInstances } from 'fluid-primitives';
import { ScrollArea } from 'fluid-primitives/scroll-area';

(() => {
	initAllComponentInstances('scroll-area', ({ props }) => {
		const scrollArea = new ScrollArea(props);
		scrollArea.init();
		return scrollArea;
	});
})();
