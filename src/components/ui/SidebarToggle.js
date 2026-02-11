export default function SidebarToggle({
	isCollapsed,
	onClick,
	position = "left",
	title,
}) {
	return (
		<button
			onClick={onClick}
			className={`absolute top-4 sm:top-6 z-50 w-4 h-8 sm:w-5 sm:h-10 flex items-center justify-center transition-all duration-200 cursor-pointer group ${
				position === "left"
					? "-left-0 rounded-r-lg"
					: "-right-0 rounded-l-lg"
			} bg-orange-100/60 hover:bg-orange-200/80 border border-orange-200/60 hover:border-orange-300 shadow-sm hover:shadow-md`}
			title={title}
			aria-label={title}
		>
			<svg
				className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600 transition-transform duration-300 group-hover:scale-110 ${
					position === "left"
						? isCollapsed
							? ""
							: "rotate-180"
						: isCollapsed
						? "rotate-180"
						: ""
				}`}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2.5}
					d="M15 19l-7-7 7-7"
				/>
			</svg>
		</button>
	);
}
