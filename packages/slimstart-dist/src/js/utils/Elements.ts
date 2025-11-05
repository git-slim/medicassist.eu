export default class Elements {
	static isDisabled(element: HTMLElement): boolean {
		return (
			element.classList.contains('disabled') ||
			element.hasAttribute('disabled') ||
			element.getAttribute('aria-disabled') === 'true'
		);
	}

	static hasLabelOrLabelledBy(element: HTMLElement) {
		return !!element.getAttribute('aria-label') || !!element.getAttribute('aria-labelledby');
	}

	static safelySetAttribute(element: HTMLElement, attribute: string, value: string) {
		if (!element) return;
		if (!element.getAttribute(attribute)) {
			element.setAttribute(attribute, value);
		}
	}

	static observeSticky(
		element: HTMLElement,
		topOffset: number = 0,
		callback: IntersectionObserverCallback = ([e]) => {
			e.target.classList.toggle(
				'is-sticky',
				e.intersectionRatio < 1 && Math.floor(e.boundingClientRect.top) <= topOffset
			);
		}
	) {
		if (!element) return () => {};

		const observer = new IntersectionObserver(callback, {
			threshold: 1,
			rootMargin: `-${topOffset + 1}px 0px 0px 0px`,
		});

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}

	static querySelectorOrThrow<T extends HTMLElement>(
		selector: string,
		element: HTMLElement | Document = document,
		message: string = `Element not found: ${selector}`
	): T {
		const el = element.querySelector<T>(selector);
		if (!el) {
			throw new Error(message);
		}
		return el;
	}
}
