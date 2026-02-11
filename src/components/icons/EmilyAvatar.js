export default function EmilyAvatar({ className = "w-6 h-6" }) {
	return (
		<svg className={className} viewBox="0 0 26 26" fill="none">
			<rect width="26" height="26" rx="13" fill="#F2D5BA" />
			<rect width="26" height="26" rx="13" fill="url(#emily-gradient)" />

			{/* Pattern overlay */}
			<g opacity="0.5">
				<rect
					x="4"
					y="6"
					width="4"
					height="4"
					rx="1"
					fill="#9E7D84"
					opacity="0.7"
				/>
				<rect
					x="14"
					y="4"
					width="6"
					height="3"
					rx="1"
					fill="#AC7080"
					opacity="0.6"
				/>
				<rect
					x="6"
					y="16"
					width="8"
					height="2"
					rx="1"
					fill="#C2837B"
					opacity="0.8"
				/>
				<rect
					x="18"
					y="12"
					width="3"
					height="5"
					rx="1"
					fill="#AC7080"
					opacity="0.5"
				/>
				<circle cx="10" cy="10" r="1.5" fill="#F08130" opacity="0.9" />
			</g>

			{/* Lock icon */}
			<g transform="translate(9, 9)">
				<rect
					x="1"
					y="4"
					width="6"
					height="4"
					rx="1"
					fill="rgba(255,255,255,0.95)"
					stroke="#242220"
					strokeWidth="0.5"
				/>
				<path
					d="M2.5 4V2.5C2.5 1.67 3.17 1 4 1C4.83 1 5.5 1.67 5.5 2.5V4"
					stroke="#242220"
					strokeWidth="0.8"
					fill="none"
					strokeLinecap="round"
				/>
				<circle cx="4" cy="6" r="0.8" fill="#242220" />
			</g>

			<defs>
				<linearGradient
					id="emily-gradient"
					x1="0%"
					y1="0%"
					x2="100%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#F2D5BA" stopOpacity="0.8" />
					<stop offset="40%" stopColor="#C2837B" stopOpacity="0.6" />
					<stop offset="100%" stopColor="#9E7D84" stopOpacity="0.7" />
				</linearGradient>
			</defs>
		</svg>
	);
}
