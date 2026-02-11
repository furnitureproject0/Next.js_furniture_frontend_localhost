export default function ErikAvatar({ className = "w-6 h-6" }) {
	return (
		<svg className={className} viewBox="0 0 26 26" fill="none">
			<rect width="26" height="26" rx="13" fill="#F2BABA" />
			<rect width="26" height="26" rx="13" fill="url(#erik-gradient)" />

			{/* Pattern overlay */}
			<g opacity="0.6">
				<circle cx="8" cy="8" r="2" fill="#C4948E" opacity="0.8" />
				<circle cx="18" cy="10" r="1.5" fill="#AC7080" opacity="0.7" />
				<circle cx="13" cy="18" r="2.5" fill="#C2837B" opacity="0.6" />
				<circle cx="6" cy="16" r="1" fill="#9E7D84" opacity="0.9" />
				<circle cx="20" cy="20" r="1.8" fill="#AC7080" opacity="0.5" />
			</g>

			{/* Number badge */}
			<circle cx="13" cy="13" r="4" fill="rgba(255,255,255,0.9)" />
			<text
				x="13"
				y="16"
				textAnchor="middle"
				fontSize="8"
				fontWeight="600"
				fill="#242220"
			>
				2
			</text>

			<defs>
				<linearGradient
					id="erik-gradient"
					x1="0%"
					y1="0%"
					x2="100%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#F2BABA" stopOpacity="0.9" />
					<stop offset="50%" stopColor="#C4948E" stopOpacity="0.7" />
					<stop offset="100%" stopColor="#AC7080" stopOpacity="0.8" />
				</linearGradient>
			</defs>
		</svg>
	);
}
