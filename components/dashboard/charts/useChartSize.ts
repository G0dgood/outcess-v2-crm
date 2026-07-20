'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Measures a container element so charts can render at its real pixel size —
 * filling the container (never letterboxed) and re-drawing on resize.
 */
export function useChartSize<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const update = () => {
			const rect = el.getBoundingClientRect();
			setSize((prev) =>
				prev.width === rect.width && prev.height === rect.height
					? prev
					: { width: rect.width, height: rect.height }
			);
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return { ref, width: size.width, height: size.height };
}

export default useChartSize;
