import { ComponentHydrator, getHydrationData, initAllComponentInstances } from 'fluid-primitives';
import { Dialog } from 'fluid-primitives/dialog';

(() => {
	initAllComponentInstances('navigation', ({ props }) => {
		console.log('hello');
		const dialogProps = getHydrationData('dialog', 'nav-drawer-' + props.id)!.props;
		console.log(dialogProps);
		const hydrator = new ComponentHydrator('navigation', props.id);
		const root = hydrator.getElement('root')!;

		const dialog = new Dialog({
			...dialogProps,
			persistentElements: Array.from(root.querySelectorAll('[data-persistent]')).map(
				el => () => el
			),
		});
		dialog.init();

		window.addEventListener('resize', () => {
			dialog.api.setOpen(false);
		});
	});
})();
