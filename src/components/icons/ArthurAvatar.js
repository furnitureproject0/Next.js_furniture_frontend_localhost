export default function ArthurAvatar({ className = "w-6 h-6" }) {
	return (
		<svg className={className} viewBox="0 0 26 26" fill="none">
			<rect width="26" height="26" rx="13" fill="#F2BAE2" />
			<rect width="26" height="26" rx="13" fill="url(#arthur-gradient)" />

			{/* Pattern overlay */}
			<g opacity="0.6">
				<polygon
					points="6,8 10,6 12,10 8,12"
					fill="#C4948E"
					opacity="0.7"
				/>
				<polygon
					points="16,4 20,6 18,10 14,8"
					fill="#AC7080"
					opacity="0.8"
				/>
				<polygon
					points="4,16 8,18 6,22 2,20"
					fill="#AC7080"
					opacity="0.6"
				/>
				<polygon
					points="18,14 22,16 20,20 16,18"
					fill="#C2837B"
					opacity="0.7"
				/>
				<circle cx="13" cy="8" r="2" fill="#AC7080" opacity="0.5" />
				<circle cx="8" cy="20" r="1.5" fill="#9E7D84" opacity="0.8" />
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
				3
			</text>

			<defs>
				<linearGradient
					id="arthur-gradient"
					x1="0%"
					y1="0%"
					x2="100%"
					y2="100%"
				>
					<stop offset="0%" stopColor="#F2BAE2" stopOpacity="0.9" />
					<stop offset="30%" stopColor="#C4948E" stopOpacity="0.6" />
					<stop offset="70%" stopColor="#AC7080" stopOpacity="0.8" />
					<stop offset="100%" stopColor="#9E7D84" stopOpacity="0.7" />
				</linearGradient>
			</defs>
		</svg>
	);
}
