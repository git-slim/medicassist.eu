export default class A11y {
	static prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	// https://www.tempertemper.net/blog/when-design-breaks-semantics
	static makeAnchorBehaveLikeButton(link: HTMLAnchorElement) {
		link.setAttribute('role', 'button');
		link.setAttribute('draggable', 'false');
		link.addEventListener('keydown', e => {
			if (e.code === 'Space' || e.key === ' ') {
				e.preventDefault();
				link.click();
			}
		});
	}

	static hasLabelOrTextContent(element: HTMLElement) {
		return (
			!!element.getAttribute('aria-label') ||
			!!element.getAttribute('aria-labelledby') ||
			!!element.textContent
		);
	}
}
