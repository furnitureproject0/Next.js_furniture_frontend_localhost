import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	items: [],
};

const notificationsSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		// Add a notification manually
		addNotification: (state, action) => {
			const notification = action.payload;
			// Check if notification already exists (prevent duplicates)
			const exists = state.items.find((n) => n.id === notification.id);
			
			const parsePayload = (p) => {
				if (typeof p === 'string') {
					try {
						return JSON.parse(p);
					} catch (e) {
						return {};
					}
				}
				return p || {};
			};

			const normalizedNotification = {
				...notification,
				read: !!(notification.is_read || notification.read || notification.read_at),
				is_read: !!(notification.is_read || notification.read || notification.read_at),
				show: notification.show !== undefined ? notification.show : true,
				userId: notification.user_id || notification.userId,
				user_id: notification.user_id || notification.userId,
				companyId: notification.company_id || notification.companyId,
				company_id: notification.company_id || notification.companyId,
				payload: parsePayload(notification.payload),
			};

			if (!exists) {
				state.items.unshift(normalizedNotification);
			} else {
				// Update existing notification
				const index = state.items.findIndex((n) => n.id === notification.id);
				if (index !== -1) {
					state.items[index] = {
						...state.items[index],
						...normalizedNotification
					};
				}
			}
		},

		// Set notifications (for fetching from API)
		setNotifications: (state, action) => {
			const notifications = action.payload || [];
			
			const parsePayload = (p) => {
				if (typeof p === 'string') {
					try {
						return JSON.parse(p);
					} catch (e) {
						return {};
					}
				}
				return p || {};
			};

			// Normalize all notifications
			state.items = notifications.map((notif) => ({
				...notif,
				read: !!(notif.is_read || notif.read || notif.read_at),
				is_read: !!(notif.is_read || notif.read || notif.read_at),
				show: notif.show !== undefined ? notif.show : true,
				userId: notif.user_id || notif.userId,
				user_id: notif.user_id || notif.userId,
				companyId: notif.company_id || notif.companyId,
				company_id: notif.company_id || notif.company_id,
				payload: parsePayload(notif.payload),
			}));
		},

		// Mark a notification as read
		markAsRead: (state, action) => {
			const notif = state.items.find((n) => n.id === action.payload);
			if (notif) {
				notif.read = true;
				notif.is_read = true;
			}
		},

		// Mark all notifications as read
		markAllAsRead: (state) => {
			state.items.forEach((n) => {
				n.read = true;
				n.is_read = true;
			});
		},

		// Hide a notification
		hideNotification: (state, action) => {
			const notif = state.items.find((n) => n.id === action.payload);
			if (notif) {
				notif.show = false;
			}
		},

		// Hide all notifications
		hideAllNotifications: (state) => {
			state.items.forEach((n) => {
				n.show = false;
			});
		},

		// Mark all notifications for a role as read (kept for backward compatibility)
		markAllAsReadForRole: (state, action) => {
			const role = action.payload;
			state.items.forEach((n) => {
				if (n.role === role) {
					n.read = true;
					n.is_read = true;
				}
			});
		},

		// Clear all notifications for a role
		clearForRole: (state, action) => {
			const role = action.payload;
			state.items = state.items.filter((n) => n.role !== role);
		},

		// Clear all notifications
		clearAllNotifications: (state) => {
			state.items = [];
		},
	},
});

export const {
	addNotification,
	markAsRead,
	markAllAsRead,
	markAllAsReadForRole,
	hideNotification,
	hideAllNotifications,
	clearForRole,
	clearAllNotifications,
	setNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
