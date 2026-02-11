export default function DashboardIcon({ className = "w-5 h-5" }) {
	return (
		<svg
			width="27"
			height="27"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<rect x="3" y="3" width="7" height="7" rx="2" />
			<rect x="14" y="3" width="7" height="7" rx="2" />
			<rect x="3" y="14" width="7" height="7" rx="2" />
			<rect x="14" y="14" width="7" height="7" rx="2" />
		</svg>
	);
}
