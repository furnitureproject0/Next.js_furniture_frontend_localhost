"use client";

/**
 * OSMMapPreview - Display OpenStreetMap preview using iframe embed
 * Shows a marker at the specified lat/lon coordinates
 * @param {string} lat - Latitude coordinate
 * @param {string} lon - Longitude coordinate
 * @param {string} fullAddress - Full formatted address string
 * @param {string} title - Title for the map section
 * @param {boolean} isLoading - Whether location is being updated
 */
export default function OSMMapPreview({ lat, lon, fullAddress, title, isLoading = false }) {
	// Don't show map if we don't have coordinates
	if (!lat || !lon) {
		return null;
	}

    // OpenStreetMap iframe embed URL
    // Using openstreetmap.org's standard embed with marker
    const zoom = 15;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${parseFloat(lon) + 0.01},${parseFloat(lat) + 0.01}&layer=mapnik&marker=${lat},${lon}`;

    return (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white border border-orange-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                <h5 className="text-xs sm:text-sm font-medium text-amber-800 flex items-center gap-1.5 sm:gap-2">
                    <svg 
                        className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" 
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
                    {title || "Location Preview"}
                </h5>
                <span className="text-[10px] sm:text-xs text-amber-600 bg-orange-50 px-2 py-0.5 sm:py-1 rounded">
                    Live Map
                </span>
            </div>

			{/* OpenStreetMap iframe embed */}
			<div className="relative w-full h-48 sm:h-56 lg:h-64 rounded-lg overflow-hidden border border-orange-200">
				<iframe
					width="100%"
					height="100%"
					frameBorder="0"
					scrolling="no"
					marginHeight="0"
					marginWidth="0"
					src={mapUrl}
					style={{ border: 0 }}
					title="OpenStreetMap Location Preview"
					className={isLoading ? "opacity-50" : ""}
				/>
				
				{/* Loading overlay */}
				{isLoading && (
					<div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
						<div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
							<div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 sm:border-3 border-orange-300 border-t-orange-600"></div>
							<span className="text-xs sm:text-sm font-medium text-amber-900">
								Updating location...
							</span>
						</div>
					</div>
				)}
			</div>

            {/* Address display */}
            <div className="mt-2 sm:mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-[10px] sm:text-xs text-amber-900">
                <p className="font-medium">📍 {fullAddress}</p>
                <p className="text-amber-600 mt-0.5 sm:mt-1">
                    Coordinates: {parseFloat(lat).toFixed(6)}, {parseFloat(lon).toFixed(6)}
                </p>
            </div>

            {/* Info message */}
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[10px] sm:text-xs text-blue-800 flex items-start gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                    This location will be saved with your order. Make sure it&apos;s accurate!
                </span>
            </div>
        </div>
    );
}

