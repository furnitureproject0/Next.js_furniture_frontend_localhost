import { STATUS_COLORS } from "@/constants/orderConstants";
import { formatOrderId, formatOrderIdShort } from "@/utils/orderUtils";
import { getTranslatedStatusLabel } from "@/utils/i18nUtils";

import { useState, useRef, useEffect } from "react";

export default function OrderHeader({ order, t, onCancelOrder }) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const hasCompletedServices = order.orderServices?.some(s => s.status === 'completed');
	const isCancelled = order.status === 'cancelled';
	const showMenu = !isCancelled && !hasCompletedServices;

	return (
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center">
					<span className="text-orange-600 font-bold text-sm">
						{formatOrderIdShort(order.id)}
					</span>
				</div>
				<div>
					<h3 className="font-semibold text-amber-900 text-lg">
						{formatOrderId(order.id)}
					</h3>
					<div className="flex items-center gap-2 mt-1">
						<span className="text-sm text-amber-700/70">
							{t("orderDetails.created")}: {formatDate(order.createdAt)}
						</span>
					</div>
				</div>
			</div>
			
			<div className="flex items-center gap-3">
				<div
					className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}
				>
					{getTranslatedStatusLabel(order.status, t)}
				</div>

				{showMenu && (
					<div className="relative" ref={dropdownRef}>
						<button 
							onClick={(e) => {
								e.stopPropagation();
								setIsDropdownOpen(!isDropdownOpen);
							}}
							className="p-1.5 rounded-full hover:bg-orange-100/50 text-amber-900/60 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
							</svg>
						</button>
						
						{isDropdownOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-orange-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
								<button
									onClick={(e) => {
										e.stopPropagation();
										setIsDropdownOpen(false);
										onCancelOrder();
									}}
									className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
									{t("common.buttons.cancelOrder") || "Cancel Order"}
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
