"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Simple Map Placeholder Component
 * This is a temporary placeholder that will be replaced with OpenStreetMap integration
 * 
 * TODO: Replace with OSM (OpenStreetMap) integration:
 * - Use Leaflet.js or similar library
 * - Implement geocoding for address-to-coordinates conversion
 * - Add interactive map with marker
 * - Add zoom controls
 */

export default function SimpleMapPlaceholder({ address, title }) {
	const { t } = useTranslation();
	// Check if we have address data to show the map
	const hasAddress = address?.fullAddress && address.fullAddress.trim();

	if (!hasAddress) {
		return null; // Don't show map if no address entered
	}

	// Get full address for display
	const fullAddress = address.fullAddress;

	return (
		<div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white border border-orange-200 rounded-lg">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
				<h5 className="text-xs sm:text-sm font-medium text-amber-800 flex items-center gap-1.5 sm:gap-2">
					<svg 
						className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
						/>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
						/>
					</svg>
					{title || t("mapPreview.locationPreview")}
				</h5>
				<span className="text-[10px] sm:text-xs text-amber-600 bg-orange-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
					{t("mapPreview.preview")}
				</span>
			</div>

			{/* Map Placeholder */}
			<div className="relative w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg overflow-hidden border border-orange-200">
				{/* Grid pattern overlay to simulate map */}
				<div className="absolute inset-0 opacity-20">
					<svg width="100%" height="100%">
						<defs>
							<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
								<path 
									d="M 40 0 L 0 0 0 40" 
									fill="none" 
									stroke="currentColor" 
									strokeWidth="0.5"
									className="text-orange-400"
								/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid)" />
					</svg>
				</div>

				{/* Decorative "roads" */}
				<div className="absolute inset-0">
					<div className="absolute top-1/2 left-0 right-0 h-1 bg-orange-200/40 transform -translate-y-1/2"></div>
					<div className="absolute top-0 bottom-0 left-1/2 w-1 bg-orange-200/40 transform -translate-x-1/2"></div>
				</div>

				{/* Center marker */}
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<div className="relative">
						{/* Pulsing circle animation */}
						<div className="absolute inset-0 animate-ping">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-400 rounded-full opacity-25"></div>
						</div>
						
						{/* Static marker */}
						<div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
							<svg 
								className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 drop-shadow-lg" 
								fill="currentColor" 
								viewBox="0 0 24 24"
							>
								<path d="M12 0C7.802 0 4.403 3.399 4.403 7.597c0 5.697 7.597 16.403 7.597 16.403s7.597-10.706 7.597-16.403C19.597 3.399 16.198 0 12 0zm0 11.75c-2.205 0-4-1.795-4-4s1.795-4 4-4 4 1.795 4 4-1.795 4-4 4z"/>
							</svg>
						</div>
					</div>
				</div>

				{/* Map label */}
				<div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg border border-orange-200/50">
					<p className="text-[10px] sm:text-xs font-medium text-amber-900 mb-0.5 sm:mb-1">
						📍 {title || t("mapPreview.location")}
					</p>
					<p className="text-[10px] sm:text-xs text-amber-700 line-clamp-2">
						{fullAddress}
					</p>
				</div>

				{/* "OSM Integration Coming Soon" badge */}
				<div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-orange-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
					{t("mapPreview.mapPreview")}
				</div>
			</div>

			{/* Info message */}
			<div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-blue-50 border border-blue-200 rounded text-[10px] sm:text-xs text-blue-800 flex items-start gap-1.5 sm:gap-2">
				<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>
					{t("mapPreview.infoMessage")}
				</span>
			</div>
		</div>
	);
}

