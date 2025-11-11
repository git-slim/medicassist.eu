import { ComponentHydrator, initAllComponentInstances } from 'fluid-primitives';
import { motionValue, scroll, styleEffect } from 'motion';

(() => {
	initAllComponentInstances('checkmark', ({ props }) => {
		const hydrator = new ComponentHydrator('checkmark', props.id, props.ids);

		const checkmark = document.getElementById('checkmark');
		const showTriggers = hydrator.getElements('show');
		const hideTriggers = hydrator.getElements('hide');

		const opacity = motionValue(0);
		styleEffect(checkmark!, { opacity });

		// TODO: this does not work if we start below where the checkmark would have been shown and hidden, its opacity 1 there at start
		hideTriggers.forEach(hideTrigger => {
			scroll(
				(progress: number) => {
					opacity.set(1 - progress);
				},
				{
					target: hideTrigger,
					offset: JSON.parse(hideTrigger.getAttribute('data-offset') || ''),
				}
			);
		});

		showTriggers.forEach(showTrigger => {
			scroll(
				(progress: number) => {
					opacity.set(progress);
				},
				{
					target: showTrigger,
					offset: JSON.parse(showTrigger.getAttribute('data-offset') || ''),
				}
			);
		});
	});
})();
