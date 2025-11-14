import { ComponentHydrator, initAllComponentInstances } from 'fluid-primitives';
import { animate, scroll } from 'motion';

(() => {
	initAllComponentInstances('home-videos', ({ props }) => {
		const hydrator = new ComponentHydrator('home-videos', props.id, props.ids);

		const items = hydrator.getElements<HTMLElement>('item');
		const videos = hydrator.getElements<HTMLVideoElement>('video');
		console.log({ items, videos });

		items.forEach((item, index) => {
			const video = videos[index];

			scroll(
				animate(video, {
					opacity: [0, 0.3, 0.3, 0],
					filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'],
				}),
				{
					target: item,
					offset: [
						'50% end', // fade in when 50% visible
						'80% end', // Fully visible when 80% visible
						'50% start', // Start fade out when next 50% visible
						'20% start', // Fully invisible when next 80% visible
					],
				}
			);
		});
	});
})();
