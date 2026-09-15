const carouselIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<rect x="1" y="6" width="5" height="12" rx="1" fill="currentColor" fillOpacity="0.5" />
		<rect x="7" y="3" width="10" height="18" rx="1" fill="currentColor" />
		<rect x="18" y="6" width="5" height="12" rx="1" fill="currentColor" fillOpacity="0.5" />
	</svg>
);

// A cascading stack of slides, used where neither Slider nor Carousel is
// picked yet (e.g. the Sliderberg layout chooser).
const sliderbergIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<rect x="6" y="1" width="16" height="12" rx="1" fill="currentColor" fillOpacity="0.35" />
		<rect x="3" y="6" width="16" height="12" rx="1" fill="currentColor" fillOpacity="0.65" />
		<rect x="0" y="11" width="16" height="12" rx="1" fill="currentColor" />
	</svg>
);

export { carouselIcon, sliderbergIcon };
