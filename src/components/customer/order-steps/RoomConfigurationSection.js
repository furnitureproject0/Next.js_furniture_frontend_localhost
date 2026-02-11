"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getTranslatedRoomTypes } from "@/utils/i18nUtils";
import { useMemo, useCallback } from "react";

/**
 * Room Configuration Section
 * Allows users to add and configure rooms for a specific location
 * Separated for reusability across different address sections
 */
export default function RoomConfigurationSection({ 
	addressType,
	roomConfigurations = [],
	expectedRoomCount,
	onUpdate,
	t 
}) {
	const ROOM_TYPES = getTranslatedRoomTypes(t);
	
	// Calculate total configured room count
	const totalConfiguredRooms = useMemo(() => {
		return roomConfigurations.reduce((sum, room) => sum + (room.quantity || 0), 0);
	}, [roomConfigurations]);
	
	// Add a new room configuration entry
	const handleAddRoom = useCallback(() => {
		if (totalConfiguredRooms >= expectedRoomCount) return;
		onUpdate([...roomConfigurations, { roomType: "", quantity: 1 }]);
	}, [roomConfigurations, totalConfiguredRooms, expectedRoomCount, onUpdate]);
	
	// Remove a room configuration entry
	const handleRemoveRoom = useCallback((index) => {
		onUpdate(roomConfigurations.filter((_, i) => i !== index));
	}, [roomConfigurations, onUpdate]);
	
	// Update room type
	const handleRoomTypeChange = useCallback((index, roomType) => {
		const updated = [...roomConfigurations];
		updated[index] = { ...updated[index], roomType };
		onUpdate(updated);
	}, [roomConfigurations, onUpdate]);
	
	// Update room quantity
	const handleQuantityChange = useCallback((index, delta) => {
		const updated = [...roomConfigurations];
		const currentQuantity = updated[index]?.quantity || 1;
		const newQuantity = currentQuantity + delta;
		
		// Calculate total if we apply this change
		const currentTotal = updated.reduce((sum, room, i) => {
			if (i === index) return sum + newQuantity;
			return sum + (room.quantity || 0);
		}, 0);
		
		// Validate change
		if (delta > 0 && currentTotal > expectedRoomCount) return;
		if (delta < 0 && newQuantity < 1) return;
		
		updated[index] = { ...updated[index], quantity: newQuantity };
		onUpdate(updated);
	}, [roomConfigurations, expectedRoomCount, onUpdate]);
	
	// Generate room summary text
	const roomSummary = useMemo(() => {
		if (roomConfigurations.length === 0) return "";
		
		return roomConfigurations
			.filter(room => room.roomType)
			.map(room => {
				const roomTypeName = ROOM_TYPES.find(rt => rt.id === room.roomType)?.name || room.roomType;
				return `${room.quantity} ${roomTypeName}`;
			})
			.join(", ");
	}, [roomConfigurations, ROOM_TYPES]);

	if (expectedRoomCount === 0) return null;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<label className="block text-xs sm:text-sm font-medium text-amber-800">
					{t("orderSteps.roomConfiguration")}
				</label>
				<span className="text-xs text-amber-600">
					{totalConfiguredRooms} / {expectedRoomCount}
				</span>
			</div>

			{/* Room Configuration Inputs */}
			<div className="space-y-2">
				{roomConfigurations.map((room, index) => {
					const otherRoomsTotal = roomConfigurations.reduce((sum, r, i) => {
						if (i !== index) return sum + (r.quantity || 0);
						return sum;
					}, 0);
					const canIncrement = (otherRoomsTotal + (room.quantity || 1) + 1) <= expectedRoomCount;
					const isAtLimit = totalConfiguredRooms >= expectedRoomCount;
					
					return (
						<div
							key={index}
							className="flex gap-2 items-center p-2 bg-white border border-orange-200 rounded-lg"
						>
							{/* Room Type Dropdown */}
							<select
								value={room.roomType || ""}
								onChange={(e) => handleRoomTypeChange(index, e.target.value)}
								className="flex-1 px-2 py-1.5 text-xs border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white cursor-pointer"
							>
								<option value="">{t("orderSteps.selectRoomType")}</option>
								{ROOM_TYPES.map((type) => (
									<option key={type.id} value={type.id}>
										{type.name}
									</option>
								))}
							</select>

							{/* Quantity Selector */}
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={() => handleQuantityChange(index, -1)}
									disabled={room.quantity <= 1}
									className="w-7 h-7 flex items-center justify-center border border-orange-300 rounded bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-orange-600 font-semibold text-sm"
								>
									−
								</button>
								<span className="w-8 text-center text-sm font-medium text-amber-900">
									{room.quantity || 1}
								</span>
								<button
									type="button"
									onClick={() => handleQuantityChange(index, 1)}
									disabled={isAtLimit || !canIncrement}
									className="w-7 h-7 flex items-center justify-center border border-orange-300 rounded bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-orange-600 font-semibold text-sm"
								>
									+
								</button>
							</div>

							{/* Remove Button */}
							<button
								type="button"
								onClick={() => handleRemoveRoom(index)}
								className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					);
				})}
			</div>

			{/* Add Room Button */}
			{totalConfiguredRooms < expectedRoomCount && (
				<button
					type="button"
					onClick={handleAddRoom}
					className="w-full px-3 py-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					{t("orderSteps.addRoom")}
				</button>
			)}

			{/* Room Summary */}
			{roomSummary && (
				<div className="p-2 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-xs text-green-800">{roomSummary}</p>
					{totalConfiguredRooms === expectedRoomCount && (
						<p className="text-xs text-green-700 mt-1 font-medium">
							✓ {t("orderSteps.allRoomsConfigured")}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
