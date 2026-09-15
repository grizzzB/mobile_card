import { useEffect, useRef } from "react";

interface UseScrollFadeOptions {
	threshold?: number | number[];
	rootMargin?: string;
}

export const useScrollFade = (options: UseScrollFadeOptions = {}) => {
	const { threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = options;
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("fade-in-up");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold, rootMargin },
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, [threshold, rootMargin]);

	return ref;
};
