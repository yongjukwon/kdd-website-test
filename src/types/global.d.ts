/// <reference types="react" />

declare global {
	namespace JSX {
		interface IntrinsicElements {
			div: React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLDivElement>,
				HTMLDivElement
			>;
		}
	}
}
