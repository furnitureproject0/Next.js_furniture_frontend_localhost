import { ApiError, companyAdminApi, customerApi, servicesApi, siteAdminApi } from "@/lib/api";
import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";

// Helper function to generate order IDs (temporary - backend will provide real IDs)
const generateOrderId = () => {
	// Temporary ID generation - backend will provide real IDs
	return Date.now();
};

// Helper function to add history entry to an order
const addHistoryEntry = (order, type, byRole, byUserId, payload = null) => {
	return {
		...order,
		history: [
			...(order.history || []),
			{
				id: nanoid(),
				type,
				byRole,
				byUserId,
				at: new Date().toISOString(),
				payload,
			},
		],
		updatedAt: new Date().toISOString(),
	};
};

// Thunk: Fetch customer orders
export const fetchCustomerOrders = createAsyncThunk(
	"orders/fetchCustomerOrders",
	async (filters = {}, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			const currentUserId = state.auth.user?.id;
			
			const response = await customerApi.getOrders(filters);
			
			// Extract orders from API response structure: { success, message, data: { orders: [...] }, pagination: {...} }
			const ordersData = response?.data?.orders || [];
			
			// Collect all unique addition IDs from all orders
			const additionIds = new Set();
			ordersData.forEach((order) => {
				(order.orderServices || []).forEach((os) => {
					(os.orderServiceAdditions || os.additions || []).forEach((osa) => {
						const additionId = osa.addition?.id || osa.addition_id;
						if (additionId) {
							additionIds.add(additionId);
						}
					});
				});
			});
			
			// Fetch all addition details in parallel
			const additionsMap = new Map();
			await Promise.all(
				Array.from(additionIds).map(async (additionId) => {
					try {
						const additionResponse = await servicesApi.getAdditionById(additionId);
						if (additionResponse?.success && additionResponse?.data?.addition) {
							additionsMap.set(additionId, additionResponse.data.addition);
						}
					} catch (error) {
						console.warn(`Failed to fetch addition ${additionId}:`, error);
					}
				})
			);
			
			// Transform API orders to match frontend order structure
			const transformedOrders = Array.isArray(ordersData)
				? ordersData.map((order) => {
					// Extract services and their additions from orderServices array
					const servicesWithAdditions = (order.orderServices || []).map(os => {
						// Get latest offer (first in array) and all offers
						const latestOffer = os.offers?.[0] || null;
						const allOffers = os.offers || [];
						
						// Transform latest offer for backward compatibility
						const transformedOffer = latestOffer ? {
							id: latestOffer.id,
							status: latestOffer.status || "pending",
							hourly_rate: latestOffer.hourly_rate,
							currency: latestOffer.currency || "CHF",
							min_hours: latestOffer.min_hours,
							max_hours: latestOffer.max_hours,
							notes: latestOffer.notes || "",
							date: latestOffer.date || null,
							time: latestOffer.time || null,
							createdAt: latestOffer.createdAt,
							updatedAt: latestOffer.updatedAt,
							// Backward compatibility fields
							hourlyRate: latestOffer.hourly_rate,
							minHours: latestOffer.min_hours,
							maxHours: latestOffer.max_hours,
							scheduledDate: latestOffer.date,
							scheduledTime: latestOffer.time,
							price: latestOffer.price,
							estimatedHours: latestOffer.estimated_hours,
						} : null;
						
						// Transform all offers for modal display
						const transformedOffers = allOffers.map(offer => ({
							id: offer.id,
							status: offer.status || "pending",
							hourly_rate: offer.hourly_rate,
							currency: offer.currency || "CHF",
							min_hours: offer.min_hours,
							max_hours: offer.max_hours,
							notes: offer.notes || "",
							date: offer.date || null,
							time: offer.time || null,
							createdAt: offer.createdAt,
							updatedAt: offer.updatedAt,
						}));
						
						return {
							id: os.id,
							serviceId: os.service?.id || os.service_id,
							serviceName: os.service?.name || "Unknown Service",
							status: os.status,
							assignedCompanyId: os.company_id,
							assignedCompanyName: os.company?.name,
							offer: transformedOffer, // Latest offer for card display (one offer per service)
							offers: transformedOffers, // All offers for modal display
							additions: (os.orderServiceAdditions || os.additions || []).map(osa => {
								const additionId = osa.addition?.id || osa.addition_id;
								const additionDetails = additionsMap.get(additionId);
								return {
									id: additionId || osa.id,
									name: additionDetails?.name || osa.addition?.name || osa.addition?.title || "Unknown Addition",
									note: osa.note || "",
								};
							}),
						};
					});
					
					// Services array with both IDs and names
					const services = servicesWithAdditions.map(s => ({
						id: s.serviceId,
						name: s.serviceName,
					}));
					
					// Flatten all additions for easy access
					const allAdditions = servicesWithAdditions.flatMap(s => s.additions);
					
					// Extract offer from orderServices (get the latest offer from the first orderService)
					const latestOffer = order.orderServices?.[0]?.offers?.[0] || null;
					const offer = latestOffer ? {
						version: latestOffer.version || 1,
						price: latestOffer.price,
						currency: latestOffer.currency || "CHF",
						estimatedHours: latestOffer.estimated_hours,
						hourlyRate: latestOffer.hourly_rate,
						scheduledDate: latestOffer.scheduled_date,
						notes: latestOffer.notes,
						lastUpdatedBy: latestOffer.last_updated_by,
						lastUpdatedAt: latestOffer.last_updated_at || latestOffer.createdAt,
					} : null;
					
					// Get assigned company from orderServices (if any)
					const assignedOrderService = order.orderServices?.[0];
					const assignedCompanyId = assignedOrderService?.company_id || null;
					
					return {
						...order,
						// Ensure UI helper fields are present
						id: order.id,
						// Use current user ID as customerId (API endpoint already filters by client_id, but we need this for selector)
						customerId: currentUserId || order.client_id || order.customerId,
						customerName: state.auth.user?.name || order.customerName || "Unknown",
						
						// Address fields from location objects (API uses 'location' and 'destinationLocation')
						fromAddress: order.location?.address || order.fromAddress || "",
						toAddress: order.destinationLocation?.address || order.destination_location?.address || order.toAddress || "",
						addresses: {
							from: order.location?.address || order.fromAddress || "",
							to: order.destinationLocation?.address || order.destination_location?.address || order.toAddress || null,
						},
						
						// Services array extracted from orderServices (array of {id, name})
						services: services.map(s => s.id), // Keep IDs for backward compatibility
						// Services with full details
						servicesDetails: services, // Array of {id, name}
						// Services with additions structure
						servicesWithAdditions: servicesWithAdditions,
						// All additions flattened
						additions: allAdditions,
						
						// Offer information
						offer: offer,
						
						// Company assignment
						assignedCompanyId: assignedCompanyId,
						
						// History from timeline array
						history: (order.timeline || []).map(timelineItem => ({
							id: timelineItem.id,
							type: timelineItem.status || timelineItem.type || "status_change",
							byRole: timelineItem.by_role || "system",
							byUserId: timelineItem.by_user_id || null,
							at: timelineItem.createdAt || timelineItem.at,
							payload: timelineItem.payload || { message: timelineItem.message },
						})) || order.history || [],
						
						// Keep original API fields
						status: order.status,
						preferred_date: order.preferred_date,
						preferred_time: order.preferred_time,
						number_of_rooms: order.number_of_rooms,
						notes: order.notes,
						createdAt: order.createdAt,
						updatedAt: order.updatedAt,
						// Keep orderServices array for service-level assignments (transformed with serviceName, status, etc.)
						orderServices: servicesWithAdditions,
					};
				})
				: [];
			
			
			return transformedOrders;
		} catch (error) {
			let errorMessage = "Failed to fetch orders. Please try again.";
			
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Fetch site admin orders (all orders)
export const fetchSiteAdminOrders = createAsyncThunk(
	"orders/fetchSiteAdminOrders",
	async (filters = {}, { getState, rejectWithValue }) => {
		try {
			const response = await siteAdminApi.getOrders(filters);
			
			// Extract orders from API response structure: { success, message, data: { orders: [...] }, pagination: {...} }
			const ordersData = response?.data?.orders || [];
			
			// Collect all unique addition IDs from all orders
			const additionIds = new Set();
			ordersData.forEach((order) => {
				(order.orderServices || []).forEach((os) => {
					(os.orderServiceAdditions || os.additions || []).forEach((osa) => {
						const additionId = osa.addition?.id || osa.addition_id;
						if (additionId) {
							additionIds.add(additionId);
						}
					});
				});
			});
			
			// Fetch all addition details in parallel
			const additionsMap = new Map();
			await Promise.all(
				Array.from(additionIds).map(async (additionId) => {
					try {
						const additionResponse = await servicesApi.getAdditionById(additionId);
						if (additionResponse?.success && additionResponse?.data?.addition) {
							additionsMap.set(additionId, additionResponse.data.addition);
						} else if (additionResponse?.data) {
							additionsMap.set(additionId, additionResponse.data);
						} else if (additionResponse) {
							additionsMap.set(additionId, additionResponse);
						}
					} catch (error) {
						console.warn(`Failed to fetch addition ${additionId}:`, error);
					}
				})
			);
			
			// Transform API orders to match frontend order structure (same as fetchCustomerOrders)
			const transformedOrders = Array.isArray(ordersData)
				? ordersData.map((order) => {
					// Extract services and their additions from orderServices array
					const servicesWithAdditions = (order.orderServices || []).map(os => {
						// Get latest offer (first in array) and all offers
						const latestOffer = os.offers?.[0] || null;
						const allOffers = os.offers || [];
						
						// Transform latest offer for backward compatibility
						const transformedOffer = latestOffer ? {
							id: latestOffer.id,
							status: latestOffer.status || "pending",
							hourly_rate: latestOffer.hourly_rate,
							currency: latestOffer.currency || "CHF",
							min_hours: latestOffer.min_hours,
							max_hours: latestOffer.max_hours,
							notes: latestOffer.notes || "",
							date: latestOffer.date || null,
							time: latestOffer.time || null,
							createdAt: latestOffer.createdAt,
							updatedAt: latestOffer.updatedAt,
							// Backward compatibility fields
							hourlyRate: latestOffer.hourly_rate,
							minHours: latestOffer.min_hours,
							maxHours: latestOffer.max_hours,
							scheduledDate: latestOffer.date,
							scheduledTime: latestOffer.time,
							price: latestOffer.price,
							estimatedHours: latestOffer.estimated_hours,
						} : null;
						
						// Transform all offers for modal display
						const transformedOffers = allOffers.map(offer => ({
							id: offer.id,
							status: offer.status || "pending",
							hourly_rate: offer.hourly_rate,
							currency: offer.currency || "CHF",
							min_hours: offer.min_hours,
							max_hours: offer.max_hours,
							notes: offer.notes || "",
							date: offer.date || null,
							time: offer.time || null,
							createdAt: offer.createdAt,
							updatedAt: offer.updatedAt,
							hourlyRate: offer.hourly_rate,
							minHours: offer.min_hours,
							maxHours: offer.max_hours,
							scheduledDate: offer.date,
							scheduledTime: offer.time,
						}));
						
						// Get additions for this service
						const serviceAdditions = (os.orderServiceAdditions || os.additions || []).map(osa => {
							const additionId = osa.addition?.id || osa.addition_id;
							const additionDetails = additionsMap.get(additionId);
							return {
								id: additionId || osa.id,
								name: additionDetails?.name || additionDetails?.title || osa.addition?.name || osa.addition?.title || "Unknown Addition",
								note: osa.note || "",
							};
						});
						
						// Get service name
						const serviceName = os.service?.name || `Service ${os.service_id || os.service?.id}`;
						
						return {
							id: os.id,
							serviceId: os.service?.id || os.service_id,
							serviceName: serviceName,
							status: os.status,
							company: os.company || null,
							assignedCompanyId: os.company?.id || os.company_id || null,
							offer: transformedOffer,
							offers: transformedOffers,
							additions: serviceAdditions,
						};
					});
					
					// Extract service IDs and names
					const services = servicesWithAdditions.map(s => ({
						id: s.serviceId,
						name: s.serviceName,
					}));
					
					// Get latest offer from all services
					const allServiceOffers = servicesWithAdditions
						.filter(s => s.offer)
						.map(s => s.offer);
					const offer = allServiceOffers.length > 0 ? allServiceOffers[0] : null;
					
					// Get assigned company ID from first service with company
					const assignedCompanyId = servicesWithAdditions
						.find(s => s.assignedCompanyId)?.assignedCompanyId || null;
					
					// Flatten all additions
					const allAdditions = servicesWithAdditions.flatMap(s => s.additions);
					
					return {
						id: order.id,
						createdAt: order.createdAt || order.created_at,
						updatedAt: order.updatedAt || order.updated_at,
						
						// Customer information
						customerId: order.client?.id || order.client_id || order.customerId,
						customerName: order.client?.name || order.customerName || "Unknown",
						
						// Address fields from location objects (API uses 'location' and 'destinationLocation')
						fromAddress: order.location?.address || order.fromAddress || "",
						toAddress: order.destinationLocation?.address || order.destination_location?.address || order.toAddress || "",
						addresses: {
							from: order.location?.address || order.fromAddress || "",
							to: order.destinationLocation?.address || order.destination_location?.address || order.toAddress || null,
						},
						
						// Services array extracted from orderServices (array of {id, name})
						services: services.map(s => s.id), // Keep IDs for backward compatibility
						// Services with full details
						servicesDetails: services, // Array of {id, name}
						// Services with additions structure
						servicesWithAdditions: servicesWithAdditions,
						// All additions flattened
						additions: allAdditions,
						
						// Offer information
						offer: offer,
						
						// Company assignment
						assignedCompanyId: assignedCompanyId,
						
						// History from timeline array
						history: (order.timeline || []).map(timelineItem => ({
							id: timelineItem.id,
							type: timelineItem.status || timelineItem.type || "status_change",
							byRole: timelineItem.by_role || "system",
							byUserId: timelineItem.by_user_id || null,
							at: timelineItem.createdAt || timelineItem.at,
							payload: timelineItem.payload || { message: timelineItem.message },
						})) || order.history || [],
						
						// Keep original API fields
						status: order.status,
						preferred_date: order.preferred_date,
						preferred_time: order.preferred_time,
						number_of_rooms: order.number_of_rooms,
						notes: order.notes,
						images: order.images || [],
						
						// Order services (for detailed view)
						orderServices: servicesWithAdditions,
					};
				})
				: [];
			
			return {
				orders: transformedOrders,
				pagination: response?.pagination || response?.data?.pagination || null,
			};
		} catch (error) {
			let errorMessage = "Failed to fetch orders. Please try again.";
			
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	}
);

// Thunk: Customer creates a new order
export const createCustomerOrder = createAsyncThunk(
	"orders/createCustomerOrder",
	async (orderInput, { getState, rejectWithValue }) => {
		try {
			// Call API endpoint to create order
			const response = await customerApi.createOrder(orderInput);
			
			// Extract order data from API response structure: { success, message, data: { order: {...} } }
			const orderData = response?.data?.order || response?.data || response;
			
			const state = getState();
			const customerId = state.auth.user?.id;
			const customerName = state.auth.user?.name || "Unknown";

			// Transform API response to match frontend order structure
			const newOrder = {
				...orderData,
				// Ensure UI helper fields are present
				customerId: orderData.client_id || customerId,
				customerName: customerName,
				fromAddress: orderInput.address || "", // Use address string from input
				toAddress: orderInput.destination_address || "", // Use destination_address string from input
				addresses: {
					from: orderInput.address || "",
					to: orderInput.destination_address || null,
				},
				// Ensure history exists
				history: orderData.history || [
					{
						id: nanoid(),
						type: "order_created",
						byRole: "client",
						byUserId: customerId,
						at: new Date().toISOString(),
						payload: { 
							services: orderInput.services,
							address: orderInput.address,
						},
					},
				],
			};

			return newOrder;
		} catch (error) {
			// Extract detailed error message from API error
			let errorMessage = "Failed to create order. Please try again.";
			
			if (error instanceof ApiError) {
				// Handle API errors with detailed information
				if (error.data?.errors) {
					// Handle validation errors - format them nicely
					const validationErrors = error.data.errors;
					const errorMessages = [];
					
					// Flatten validation errors object
					Object.entries(validationErrors).forEach(([field, messages]) => {
						if (Array.isArray(messages)) {
							messages.forEach(msg => {
								errorMessages.push(`${field}: ${msg}`);
							});
						} else if (typeof messages === 'string') {
							errorMessages.push(`${field}: ${messages}`);
						}
					});
					
					errorMessage = errorMessages.length > 0 
						? `Validation Error:\n${errorMessages.join('\n')}`
						: error.data.message || error.message;
				} else if (error.data?.message) {
					errorMessage = error.data.message;
				} else if (error.message) {
					errorMessage = error.message;
				}
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Update customer order
export const updateCustomerOrder = createAsyncThunk(
	"orders/updateCustomerOrder",
	async ({ orderId, orderInput }, { getState, rejectWithValue }) => {
		try {
			// Call API endpoint to update order
			const response = await customerApi.updateOrder(orderId, orderInput);
			
			// Extract order data from API response structure: { success, message, data: { order: {...} } }
			const orderData = response?.data?.order || response?.data || response;
			
			const state = getState();
			const currentUserId = state.auth.user?.id;
			
			// Collect all unique addition IDs from order
			const additionIds = new Set();
			(orderData.orderServices || []).forEach((os) => {
				(os.orderServiceAdditions || os.additions || []).forEach((osa) => {
					const additionId = osa.addition?.id || osa.addition_id;
					if (additionId) {
						additionIds.add(additionId);
					}
				});
			});
			
			// Fetch all addition details in parallel
			const additionsMap = new Map();
			await Promise.all(
				Array.from(additionIds).map(async (additionId) => {
					try {
						const additionResponse = await servicesApi.getAdditionById(additionId);
						if (additionResponse?.success && additionResponse?.data?.addition) {
							additionsMap.set(additionId, additionResponse.data.addition);
						} else if (additionResponse?.data && !additionResponse?.data?.addition) {
							// Alternative structure: data IS the addition
							additionsMap.set(additionId, additionResponse.data);
						} else if (additionResponse?.addition) {
							// Direct addition structure
							additionsMap.set(additionId, additionResponse.addition);
						} else if (additionResponse && additionResponse.id) {
							// Addition data directly without wrapper
							additionsMap.set(additionId, additionResponse);
						}
					} catch (error) {
						console.warn(`Failed to fetch addition ${additionId}:`, error);
					}
				})
			);
			
			// Transform the updated order similar to fetchCustomerOrders
			// Extract services and their additions from orderServices array
			const servicesWithAdditions = (orderData.orderServices || []).map(os => {
				// Get latest offer (first in array) and all offers
				const latestOffer = os.offers?.[0] || null;
				const allOffers = os.offers || [];
				
				// Transform latest offer for backward compatibility
				const transformedOffer = latestOffer ? {
					id: latestOffer.id,
					status: latestOffer.status || "pending",
					hourly_rate: latestOffer.hourly_rate,
					currency: latestOffer.currency || "CHF",
					min_hours: latestOffer.min_hours,
					max_hours: latestOffer.max_hours,
					notes: latestOffer.notes || "",
					date: latestOffer.date || null,
					time: latestOffer.time || null,
					createdAt: latestOffer.createdAt,
					updatedAt: latestOffer.updatedAt,
					// Backward compatibility fields
					hourlyRate: latestOffer.hourly_rate,
					minHours: latestOffer.min_hours,
					maxHours: latestOffer.max_hours,
					scheduledDate: latestOffer.date,
					scheduledTime: latestOffer.time,
				} : null;
				
				// Transform all offers for modal display
				const transformedOffers = allOffers.map(offer => ({
					id: offer.id,
					status: offer.status || "pending",
					hourly_rate: offer.hourly_rate,
					currency: offer.currency || "CHF",
					min_hours: offer.min_hours,
					max_hours: offer.max_hours,
					notes: offer.notes || "",
					date: offer.date || null,
					time: offer.time || null,
					createdAt: offer.createdAt,
					updatedAt: offer.updatedAt,
				}));
				
				return {
					id: os.id,
					serviceId: os.service?.id || os.service_id,
					serviceName: os.service?.name || "Unknown Service",
					status: os.status,
					assignedCompanyId: os.company_id,
					assignedCompanyName: os.company?.name,
					offer: transformedOffer, // Latest offer for card display (one offer per service)
					offers: transformedOffers, // All offers for modal display
					additions: (os.orderServiceAdditions || os.additions || []).map(osa => {
						const additionId = osa.addition?.id || osa.addition_id;
						const additionDetails = additionsMap.get(additionId);
						return {
							id: additionId || osa.id,
							name: additionDetails?.name || additionDetails?.title || osa.addition?.name || osa.addition?.title || osa.note || "Unknown Addition",
							note: osa.note || "",
						};
					}),
				};
			});
			
			const services = servicesWithAdditions.map(s => ({
				id: s.serviceId,
				name: s.serviceName,
			}));
			
			const allAdditions = servicesWithAdditions.flatMap(s => s.additions);
			
			const latestOffer = orderData.orderServices?.[0]?.offers?.[0] || null;
			const offer = latestOffer ? {
				version: latestOffer.version || 1,
				price: latestOffer.price,
				currency: latestOffer.currency || "CHF",
				estimatedHours: latestOffer.estimated_hours,
				hourlyRate: latestOffer.hourly_rate,
				scheduledDate: latestOffer.scheduled_date,
				notes: latestOffer.notes,
				lastUpdatedBy: latestOffer.last_updated_by,
				lastUpdatedAt: latestOffer.last_updated_at || latestOffer.createdAt,
			} : null;
			
			const assignedOrderService = orderData.orderServices?.[0];
			const assignedCompanyId = assignedOrderService?.company_id || null;
			
			const transformedOrder = {
				...orderData,
				id: orderData.id,
				customerId: currentUserId || orderData.client_id || orderData.customerId,
				customerName: state.auth.user?.name || orderData.customerName || "Unknown",
				fromAddress: orderData.location?.address || orderData.fromAddress || "",
				toAddress: orderData.destinationLocation?.address || orderData.destination_location?.address || orderData.toAddress || "",
				addresses: {
					from: orderData.location?.address || orderData.fromAddress || "",
					to: orderData.destinationLocation?.address || orderData.destination_location?.address || orderData.toAddress || null,
				},
				services: services.map(s => s.id),
				servicesDetails: services,
				servicesWithAdditions: servicesWithAdditions,
				additions: allAdditions,
				offer: offer,
				assignedCompanyId: assignedCompanyId,
				orderServices: servicesWithAdditions, // Transformed orderServices with serviceName, status, etc.
				history: (orderData.timeline || []).map(timelineItem => ({
					id: timelineItem.id,
					type: timelineItem.status || timelineItem.type || "status_change",
					byRole: timelineItem.by_role || "system",
					byUserId: timelineItem.by_user_id || null,
					at: timelineItem.createdAt || timelineItem.at,
					payload: timelineItem.payload || { message: timelineItem.message },
				})) || orderData.history || [],
				status: orderData.status,
				preferred_date: orderData.preferred_date,
				preferred_time: orderData.preferred_time,
				number_of_rooms: orderData.number_of_rooms,
				notes: orderData.notes,
				createdAt: orderData.createdAt,
				updatedAt: orderData.updatedAt,
			};
			
			return transformedOrder;
		} catch (error) {
			let errorMessage = "Failed to update order. Please try again.";
			
			if (error instanceof ApiError) {
				if (error.data?.errors) {
					const validationErrors = error.data.errors;
					const errorMessages = [];
					
					Object.entries(validationErrors).forEach(([field, messages]) => {
						if (Array.isArray(messages)) {
							messages.forEach(msg => {
								errorMessages.push(`${field}: ${msg}`);
							});
						} else if (typeof messages === 'string') {
							errorMessages.push(`${field}: ${messages}`);
						}
					});
					
					errorMessage = errorMessages.length > 0 
						? `Validation Error:\n${errorMessages.join('\n')}`
						: error.data.message || error.message;
				} else if (error.data?.message) {
					errorMessage = error.data.message;
				} else if (error.message) {
					errorMessage = error.message;
				}
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Site admin creates a new order and assigns it to company
export const createSiteAdminOrder = createAsyncThunk(
	"orders/createSiteAdminOrder",
	async (orderInput, { getState }) => {
		const state = getState();
		const siteAdminId = state.auth.user?.id;
		const siteAdminName = state.auth.user?.name || "Site Admin";

		// Backend-compatible order structure
		const newOrder = {
			id: generateOrderId(), // Backend will provide this
			client_id: null, // Site admin orders don't have a customer
			customerId: null, // UI helper field
			customerName: siteAdminName, // UI helper field - shows who created it
			
			// Location data (will be saved to Location table in backend)
			location: orderInput.location || null, // From address location data
			destination_location: orderInput.destination_location || null, // To address location data
			extra_location: orderInput.extra_location || null, // Extra address location data
			
			// These will be set by backend after creating Location records
			location_id: orderInput.location_id || null, 
			destination_location_id: orderInput.destination_location_id || null,
			
			preferred_date: orderInput.schedule?.date || new Date().toISOString().split("T")[0],
			preferred_time: orderInput.schedule?.time || "09:00:00",
			number_of_rooms: parseFloat(orderInput.number_of_rooms) || parseFloat(orderInput.roomDetails) || 0,
			notes: orderInput.notes || null,
			images: orderInput.images || [],
			status: "pending", // Site admin orders start as pending, then get assigned
			
			// UI helper fields (not in backend schema)
			assignedCompanyId: null,
			assignedCompanyName: null,
			offer: null,
			services: orderInput.services || [], // Will be OrderService rows in backend
			addresses: orderInput.addresses || {}, // UI helper
			fromAddress: orderInput.addresses?.from || "", // UI helper for display
			toAddress: orderInput.addresses?.to || "", // UI helper for display
			extraAddress: orderInput.addresses?.extra || null, // UI helper for display
			addressDetails: orderInput.addresses?.details || {}, // UI helper for display
			schedule: orderInput.schedule || {}, // UI helper
			date: orderInput.schedule?.date || null, // UI helper for display
			roomDetails: orderInput.roomDetails || "", // UI helper
			roomDescription: orderInput.roomDetails || "", // UI helper alias
			createdBy: "site_admin", // Track who created the order
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			history: [
				{
					id: nanoid(),
					type: "order_created",
					byRole: "site_admin",
					byUserId: siteAdminId,
					at: new Date().toISOString(),
					payload: { 
						services: orderInput.services,
						location: orderInput.location,
						destination_location: orderInput.destination_location,
					},
				},
			],
		};

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		return newOrder;
	},
);

// Thunk: Company admin creates a new order (automatically assigned to their company)
export const createCompanyAdminOrder = createAsyncThunk(
	"orders/createCompanyAdminOrder",
	async (orderInput, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			// Get company ID from user
			const companyId = state.auth.user?.company_id;
			
			if (!companyId) {
				return rejectWithValue({ message: "Company ID not found" });
			}

			// Call API endpoint to create order
			const response = await companyAdminApi.createOrder(companyId, orderInput);
			
			
			// Extract order data from API response structure: { success, message, data: { order: {...} } }
			const orderData = response?.data?.order || response?.data || response;
			

			// Get company name from companies store
			const allCompanies = state.companies?.companies || [];
			const company = allCompanies.find((c) => c.id === companyId);
			const companyName = company?.name || "Unknown Company";

			// Transform orderServices to include company assignment
			const transformedOrderServices = (orderData.orderServices || []).map(os => ({
				...os,
				company_id: os.company_id || companyId, // Ensure company_id is set
				status: os.status || "assigned", // Set status to "assigned" if not set
			}));

			// Transform API response to match frontend order structure (similar to createCustomerOrder)
			const newOrder = {
				...orderData,
				// Ensure UI helper fields are present
				customerId: orderData.client_id || orderInput.customerId || null,
				customerName: orderData.client?.name || orderInput.customerName || "Unknown",
				fromAddress: orderData.location?.address || "",
				toAddress: orderData.destination_location?.address || orderData.destinationLocation?.address || "",
				addresses: {
					from: orderData.location?.address || "",
					to: orderData.destination_location?.address || orderData.destinationLocation?.address || null,
				},
				// Transform orderServices with company assignment
				orderServices: transformedOrderServices,
				// Ensure history exists
				history: orderData.timeline || orderData.history || [
					{
						id: nanoid(),
						type: "order_created",
						byRole: "company_admin",
						byUserId: state.auth.user?.id,
						at: new Date().toISOString(),
						payload: { 
							services: orderInput.services,
							location: orderInput.location,
						},
					},
				],
				// Company assignment info
				assignedCompanyId: companyId,
				assignedCompanyName: companyName,
			};


			return newOrder;
		} catch (error) {
			// Extract detailed error message from API error
			let errorMessage = "Failed to create order. Please try again.";
			
			if (error instanceof ApiError) {
				// Handle API errors with detailed information
				if (error.data?.errors) {
					// Handle validation errors - format them nicely
					const validationErrors = error.data.errors;
					const errorMessages = [];
					
					// Flatten validation errors object
					Object.entries(validationErrors).forEach(([field, messages]) => {
						if (Array.isArray(messages)) {
							messages.forEach(msg => {
								errorMessages.push(`${field}: ${msg}`);
							});
						} else if (typeof messages === 'string') {
							errorMessages.push(`${field}: ${messages}`);
						}
					});
					
					errorMessage = errorMessages.length > 0 
						? `Validation Error:\n${errorMessages.join('\n')}`
						: error.data.message || error.message;
				} else if (error.data?.message) {
					errorMessage = error.data.message;
				} else if (error.message) {
					errorMessage = error.message;
				}
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Site admin assigns order to company
export const assignOrderToCompany = createAsyncThunk(
	"orders/assignOrderToCompany",
	async ({ orderId, companyId, companyName }, { getState }) => {
		const state = getState();
		const siteAdminId = state.auth.user?.id;

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		return { orderId, companyId, companyName, siteAdminId };
	},
);

// Thunk: Fetch company admin orders
export const fetchCompanyAdminOrders = createAsyncThunk(
	"orders/fetchCompanyAdminOrders",
	async (filters = {}, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			const companyId = state.auth.user?.company_id;
			
			if (!companyId) {
				return rejectWithValue({ message: "Company ID not found" });
			}

			const response = await companyAdminApi.getOrders({ ...filters, company_id: companyId });
			
			
			// Extract orders from API response structure: { success, message, data: { orders: [...] }, pagination: {...} }
			const ordersData = response?.data?.orders || [];
			
			
			// Collect all unique addition IDs from all orders
			const additionIds = new Set();
			ordersData.forEach((order) => {
				(order.orderServices || []).forEach((os) => {
					(os.orderServiceAdditions || os.additions || []).forEach((osa) => {
						const additionId = osa.addition?.id || osa.addition_id;
						if (additionId) {
							additionIds.add(additionId);
						}
					});
				});
			});
			
			// Fetch all addition details in parallel
			const additionsMap = new Map();
			await Promise.all(
				Array.from(additionIds).map(async (additionId) => {
					try {
						const additionResponse = await servicesApi.getAdditionById(additionId);
						if (additionResponse?.success && additionResponse?.data?.addition) {
							additionsMap.set(additionId, additionResponse.data.addition);
						}
					} catch (error) {
						console.warn(`Failed to fetch addition ${additionId}:`, error);
					}
				})
			);
			
			// Transform API orders to match frontend order structure (same as fetchCustomerOrders)
			const transformedOrders = Array.isArray(ordersData)
				? ordersData.map((order) => {
					// Extract services and their additions from orderServices array
					const servicesWithAdditions = (order.orderServices || []).map(os => {
						// Get latest offer (first in array) and all offers
						const latestOffer = os.offers?.[0] || null;
						const allOffers = os.offers || [];
						
						// Transform latest offer for backward compatibility
						const transformedOffer = latestOffer ? {
							id: latestOffer.id,
							status: latestOffer.status || "pending",
							hourly_rate: latestOffer.hourly_rate,
							currency: latestOffer.currency || "CHF",
							min_hours: latestOffer.min_hours,
							max_hours: latestOffer.max_hours,
							notes: latestOffer.notes || "",
							date: latestOffer.date || null,
							time: latestOffer.time || null,
							createdAt: latestOffer.createdAt,
							updatedAt: latestOffer.updatedAt,
							// Backward compatibility fields
							hourlyRate: latestOffer.hourly_rate,
							minHours: latestOffer.min_hours,
							maxHours: latestOffer.max_hours,
							scheduledDate: latestOffer.date,
							scheduledTime: latestOffer.time,
						} : null;
						
						// Transform all offers for modal display
						const transformedOffers = allOffers.map(offer => ({
							id: offer.id,
							status: offer.status || "pending",
							hourly_rate: offer.hourly_rate,
							currency: offer.currency || "CHF",
							min_hours: offer.min_hours,
							max_hours: offer.max_hours,
							notes: offer.notes || "",
							date: offer.date || null,
							time: offer.time || null,
							createdAt: offer.createdAt,
							updatedAt: offer.updatedAt,
						}));
						
						return {
							id: os.id,
							serviceId: os.service?.id || os.service_id,
							serviceName: os.service?.name || "Unknown Service",
							status: os.status,
							assignedCompanyId: os.company_id,
							assignedCompanyName: os.company?.name,
							offer: transformedOffer, // Latest offer for card display (one offer per service)
							offers: transformedOffers, // All offers for modal display
							additions: (os.orderServiceAdditions || os.additions || []).map(osa => {
								const additionId = osa.addition?.id || osa.addition_id;
								const additionDetails = additionsMap.get(additionId);
								return {
									id: additionId || osa.id,
									name: additionDetails?.name || osa.addition?.name || osa.addition?.title || "Unknown Addition",
									note: osa.note || "",
								};
							}),
						};
					});
					
					// Services array with both IDs and names
					const services = servicesWithAdditions.map(s => ({
						id: s.serviceId,
						name: s.serviceName,
					}));
					
					// Flatten all additions for easy access
					const allAdditions = servicesWithAdditions.flatMap(s => s.additions);
					
					// Extract offer from orderServices (get the latest offer from the first orderService)
					const latestOffer = order.orderServices?.[0]?.offers?.[0] || null;
					const offer = latestOffer ? {
						version: latestOffer.version || 1,
						price: latestOffer.price,
						currency: latestOffer.currency || "CHF",
						estimatedHours: latestOffer.estimated_hours,
						hourlyRate: latestOffer.hourly_rate,
						scheduledDate: latestOffer.scheduled_date,
						notes: latestOffer.notes,
						lastUpdatedBy: latestOffer.last_updated_by,
						lastUpdatedAt: latestOffer.last_updated_at || latestOffer.createdAt,
					} : null;
					
					// Get assigned company from orderServices (if any)
					const assignedOrderService = order.orderServices?.[0];
					const assignedCompanyId = assignedOrderService?.company_id || companyId;
					
					
					return {
						...order,
						// Ensure UI helper fields are present
						id: order.id,
						customerId: order.client_id || order.customerId,
						customerName: order.client?.name || order.customerName || "Unknown",
						
						// Address fields from location objects (API uses 'location' and 'destinationLocation')
						fromAddress: order.location?.address || order.fromAddress || "",
						toAddress: order.destinationLocation?.address || order.destination_location?.address || order.toAddress || "",
						addresses: {
							from: order.location?.address || order.fromAddress || "",
							to: order.destinationLocation?.address || order.destination_location?.address || order.toAddress || null,
						},
						
						// Services array extracted from orderServices (array of {id, name})
						services: services.map(s => s.id), // Keep IDs for backward compatibility
						// Services with full details
						servicesDetails: services, // Array of {id, name}
						// Services with additions structure
						servicesWithAdditions: servicesWithAdditions,
						// All additions flattened
						additions: allAdditions,
						
						// Offer information
						offer: offer,
						
						// Company assignment
						assignedCompanyId: assignedCompanyId,
						assignedCompanyName: assignedOrderService?.company?.name || null,
						
						// History from timeline array
						history: (order.timeline || []).map(timelineItem => ({
							id: timelineItem.id,
							type: timelineItem.status || timelineItem.type || "status_change",
							byRole: timelineItem.by_role || "system",
							byUserId: timelineItem.by_user_id || null,
							at: timelineItem.createdAt || timelineItem.at,
							payload: timelineItem.payload || { message: timelineItem.message },
						})) || order.history || [],
						
						// Keep original API fields
						status: order.status,
						preferred_date: order.preferred_date,
						preferred_time: order.preferred_time,
						number_of_rooms: order.number_of_rooms,
						notes: order.notes,
						createdAt: order.createdAt,
						updatedAt: order.updatedAt,
						// Keep orderServices array for service-level assignments (transformed with serviceName, status, etc.)
						orderServices: servicesWithAdditions,
					};
				})
				: [];
			
			
			return transformedOrders;
		} catch (error) {
			let errorMessage = "Failed to fetch orders. Please try again.";
			
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Assign company to orderService
export const assignCompanyToOrderService = createAsyncThunk(
	"orders/assignCompanyToOrderService",
	async ({ orderId, orderServiceId, companyId }, { getState, rejectWithValue }) => {
		try {
			const response = await customerApi.assignCompanyToOrderService(orderId, orderServiceId, companyId);
			const orderServiceData = response?.data?.orderService || response?.data || response;

			return {
				orderId,
				orderServiceId,
				orderService: orderServiceData,
			};
		} catch (error) {
			let errorMessage = "Failed to assign company to service. Please try again.";

			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}

			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	}
);

// Thunk: Company admin sends or modifies an offer
export const sendOffer = createAsyncThunk(
	"orders/sendOffer",
	async ({ orderId, offerData }, { getState }) => {
		const state = getState();
		const companyAdminId = state.auth.user?.id;
		const order = state.orders.orders.find((o) => o.id === orderId);

		const isModification = order?.offer !== null;
		const nextVersion = order?.offer ? order.offer.version + 1 : 1;

		const offer = {
			version: nextVersion,
			price: offerData.totalPrice,
			currency: offerData.currency || "CHF",
			estimatedHours: offerData.hours,
			hourlyRate: offerData.hourlyRate,
			scheduledDate: offerData.scheduledDate || null,
			notes: offerData.notes || "",
			lastUpdatedBy: "company_admin",
			lastUpdatedAt: new Date().toISOString(),
		};

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 400));

		return { orderId, offer, companyAdminId, isModification };
	},
);

// Thunk: Customer or Site Admin accepts offer
export const acceptOffer = createAsyncThunk(
	"orders/acceptOffer",
	async ({ offerId }, { getState, rejectWithValue }) => {
		try {
			const response = await customerApi.acceptOffer(offerId);
			const acceptedOffer = response?.data?.offer || response?.data || response;
			const message = response?.message || "Offer accepted successfully";
			
			return {
				offerId,
				offer: acceptedOffer,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to accept offer. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({ message: errorMessage });
		}
	},
);

// Thunk: Customer or Site Admin rejects offer
export const rejectOffer = createAsyncThunk(
	"orders/rejectOffer",
	async ({ offerId, reason }, { getState, rejectWithValue }) => {
		try {
			const response = await customerApi.rejectOffer(offerId, reason);
			const rejectedOffer = response?.data?.offer || response?.data || response;
			const message = response?.message || "Offer rejected successfully";
			
			return {
				offerId,
				reason,
				offer: rejectedOffer,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to reject offer. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({ message: errorMessage });
		}
	},
);

// Thunk: Company Admin accepts orderService assignment
export const acceptOrderService = createAsyncThunk(
	"orders/acceptOrderService",
	async ({ orderId, orderServiceId }, { getState, rejectWithValue }) => {
		try {
			const response = await companyAdminApi.acceptOrderService(orderId, orderServiceId);
			const orderServiceData = response?.data?.orderService || response?.data || response;
			const message = response?.message || "Order service accepted successfully";
			
			return {
				orderId,
				orderServiceId,
				orderService: orderServiceData,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to accept order service. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Company Admin rejects orderService assignment
export const rejectOrderService = createAsyncThunk(
	"orders/rejectOrderService",
	async ({ orderId, orderServiceId }, { getState, rejectWithValue }) => {
		try {
			const response = await companyAdminApi.rejectOrderService(orderId, orderServiceId);
			const orderServiceData = response?.data?.orderService || response?.data || response;
			const message = response?.message || "Order service rejected successfully";
			
			return {
				orderId,
				orderServiceId,
				orderService: orderServiceData,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to reject order service. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Company Admin sends offer for orderService
export const sendOrderServiceOffer = createAsyncThunk(
	"orders/sendOrderServiceOffer",
	async ({ orderId, orderServiceId, offerData }, { getState, rejectWithValue }) => {
		try {
			// Ensure offerData matches API format
			const formattedOfferData = {
				hourly_rate: offerData.hourly_rate || offerData.hourlyRate,
				currency: offerData.currency || "CHF",
				min_hours: offerData.min_hours || offerData.minHours,
				max_hours: offerData.max_hours || offerData.maxHours,
				notes: offerData.notes || "",
				...(offerData.date && { date: offerData.date }),
				...(offerData.time && { time: offerData.time }),
			};
			
			const response = await companyAdminApi.sendOrderServiceOffer(orderId, orderServiceId, formattedOfferData);
			const offerDataResponse = response?.data?.offer || response?.data || response;
			const message = response?.message || "Offer sent successfully";
			
			return {
				orderId,
				orderServiceId,
				offer: offerDataResponse,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to send offer. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Company Admin cancels offer
export const cancelOffer = createAsyncThunk(
	"orders/cancelOffer",
	async ({ offerId, orderId, orderServiceId }, { getState, rejectWithValue }) => {
		try {
			const response = await companyAdminApi.cancelOffer(offerId);
			const cancelledOffer = response?.data?.offer || response?.data || response;
			const message = response?.message || "Offer cancelled successfully";
			
			return {
				offerId,
				orderId,
				orderServiceId,
				offer: cancelledOffer,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to cancel offer. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({
				message: errorMessage,
				status: error instanceof ApiError ? error.status : null,
				data: error instanceof ApiError ? error.data : null,
			});
		}
	},
);

// Thunk: Cancel order (Customer or Site Admin)
export const cancelOrder = createAsyncThunk(
	"orders/cancelOrder",
	async ({ orderId, reason }, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			const userRole = state.auth.user?.role;
			
			// Use siteAdminApi for site_admin, potentially add logic for others if needed
			// Since the endpoint is generic /orders/:id/cancel, siteAdminApi.cancelOrder works fine
			const response = await siteAdminApi.cancelOrder(orderId, reason);

			const cancelledOrder = response?.data?.order || response?.data || response;
			const message = response?.message || "Order cancelled successfully";
			
			return {
				orderId,
				order: cancelledOrder,
				message: message,
			};
		} catch (error) {
			let errorMessage = "Failed to cancel order. Please try again.";
			if (error instanceof ApiError) {
				errorMessage = error.data?.message || error.message || errorMessage;
			} else if (error.message) {
				errorMessage = error.message;
			}
			return rejectWithValue({ message: errorMessage });
		}
	},
);

const initialState = {
	orders: [],
	selectedFilter: "all",
	isLoading: false,
	error: null,
};

const ordersSlice = createSlice({
	name: "orders",
	initialState,
	reducers: {
		// Initialize orders from localStorage
		hydrateOrders: (state, action) => {
			state.orders = action.payload || [];
		},

		// Clear all orders (for testing)
		clearOrders: (state) => {
			state.orders = [];
		},

		// Set selected filter
		setSelectedFilter: (state, action) => {
			state.selectedFilter = action.payload;
		},

		// Manual order update (fallback)
		updateOrder: (state, action) => {
			const { id, updates } = action.payload;
			const orderIndex = state.orders.findIndex((order) => order.id === id);
			if (orderIndex !== -1) {
				state.orders[orderIndex] = {
					...state.orders[orderIndex],
					...updates,
					updatedAt: new Date().toISOString(),
				};
			}
		},
	},
	extraReducers: (builder) => {
		// Fetch customer orders
		builder
			.addCase(fetchCustomerOrders.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchCustomerOrders.fulfilled, (state, action) => {
				state.isLoading = false;
				// Replace orders with fetched orders (for client, these are only their orders)
				state.orders = action.payload;
			})
			.addCase(fetchCustomerOrders.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Fetch company admin orders
		builder
			.addCase(fetchCompanyAdminOrders.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchCompanyAdminOrders.fulfilled, (state, action) => {
				state.isLoading = false;
				// Replace orders with fetched orders (for company admin, these are only their company's orders)
				state.orders = action.payload;
			})
			.addCase(fetchCompanyAdminOrders.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			})
			.addCase(fetchSiteAdminOrders.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchSiteAdminOrders.fulfilled, (state, action) => {
				state.isLoading = false;
				state.orders = action.payload.orders;
			})
			.addCase(fetchSiteAdminOrders.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Create customer order
		builder
			.addCase(createCustomerOrder.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createCustomerOrder.fulfilled, (state, action) => {
				state.isLoading = false;
				state.orders.unshift(action.payload);
			})
			.addCase(createCustomerOrder.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Update customer order
		builder
			.addCase(updateCustomerOrder.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateCustomerOrder.fulfilled, (state, action) => {
				state.isLoading = false;
				const orderIndex = state.orders.findIndex((order) => order.id === action.payload.id);
				if (orderIndex !== -1) {
					state.orders[orderIndex] = action.payload;
				}
			})
			.addCase(updateCustomerOrder.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Create site admin order
		builder
			.addCase(createSiteAdminOrder.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createSiteAdminOrder.fulfilled, (state, action) => {
				state.isLoading = false;
				state.orders.unshift(action.payload);
			})
			.addCase(createSiteAdminOrder.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message;
			})
			.addCase(createCompanyAdminOrder.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createCompanyAdminOrder.fulfilled, (state, action) => {
				state.isLoading = false;
				state.orders.unshift(action.payload);
			})
			.addCase(createCompanyAdminOrder.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message;
			});

		// Assign order to company
		builder
			.addCase(assignOrderToCompany.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(assignOrderToCompany.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, companyId, companyName, siteAdminId } =
					action.payload;
				const orderIndex = state.orders.findIndex(
					(order) => order.id === orderId,
				);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					state.orders[orderIndex] = addHistoryEntry(
						{
							...order,
							status: "assigned",
							assignedCompanyId: companyId,
							assignedCompanyName: companyName,
						},
						"company_assigned",
						"site_admin",
						siteAdminId,
						{ companyId, companyName },
					);
				}
			})
			.addCase(assignOrderToCompany.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message;
			});

		// Send offer
		builder
			.addCase(sendOffer.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(sendOffer.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, offer, companyAdminId, isModification } =
					action.payload;
				const orderIndex = state.orders.findIndex(
					(order) => order.id === orderId,
				);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					state.orders[orderIndex] = addHistoryEntry(
						{
							...order,
							status: "offer_sent",
							offer,
						},
						isModification ? "offer_modified" : "offer_sent",
						"company_admin",
						companyAdminId,
						offer,
					);
				}
			})
			.addCase(sendOffer.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message;
			});

		// Accept offer
		builder
			.addCase(acceptOffer.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(acceptOffer.fulfilled, (state, action) => {
				state.isLoading = false;
				const { offerId, offer } = action.payload;
				
				// Find and update the offer in all orders
				state.orders.forEach((order) => {
					if (order.orderServices && Array.isArray(order.orderServices)) {
						order.orderServices.forEach((orderService) => {
							if (orderService.offers && Array.isArray(orderService.offers)) {
								const offerIndex = orderService.offers.findIndex(o => o.id === offerId);
								if (offerIndex !== -1) {
									// Update offer status to accepted
									orderService.offers[offerIndex] = {
										...orderService.offers[offerIndex],
										status: "accepted",
										...offer,
									};
									// Update latest offer if it's the first one
									if (offerIndex === 0 && orderService.offer) {
										orderService.offer = {
											...orderService.offer,
											status: "accepted",
											...offer,
										};
									}
								}
							}
						});
					}
				});
			})
			.addCase(acceptOffer.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Reject offer
		builder
			.addCase(rejectOffer.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(rejectOffer.fulfilled, (state, action) => {
				state.isLoading = false;
				const { offerId, reason, offer } = action.payload;
				
				// Find and update the offer in all orders
				state.orders.forEach((order) => {
					if (order.orderServices && Array.isArray(order.orderServices)) {
						order.orderServices.forEach((orderService) => {
							if (orderService.offers && Array.isArray(orderService.offers)) {
								const offerIndex = orderService.offers.findIndex(o => o.id === offerId);
								if (offerIndex !== -1) {
									// Update offer status to rejected
									orderService.offers[offerIndex] = {
										...orderService.offers[offerIndex],
										status: "rejected",
										rejection_reason: reason,
										...offer,
									};
									// Update latest offer if it's the first one
									if (offerIndex === 0 && orderService.offer) {
										orderService.offer = {
											...orderService.offer,
											status: "rejected",
											rejection_reason: reason,
											...offer,
										};
									}
								}
							}
						});
					}
				});
			})
			.addCase(rejectOffer.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			})
			.addCase(assignCompanyToOrderService.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(assignCompanyToOrderService.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, orderService } = action.payload;
				const orderIndex = state.orders.findIndex((order) => order.id === orderId);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					// Update orderServices array with transformed data
					const orderServices = (order.orderServices || []).map(os => {
						if (os.id === orderService.id || os.serviceId === orderService.service_id) {
							return {
								...os,
								id: orderService.id,
								status: orderService.status,
								assignedCompanyId: orderService.company_id,
								assignedCompanyName: orderService.company?.name,
							};
						}
						return os;
					});
					state.orders[orderIndex] = {
						...order,
						orderServices: orderServices,
					};
				}
			})
			.addCase(assignCompanyToOrderService.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Accept orderService
		builder
			.addCase(acceptOrderService.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(acceptOrderService.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, orderService } = action.payload;
				const orderIndex = state.orders.findIndex((order) => order.id === orderId);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					const updatedOrderServices = (order.orderServices || []).map(os =>
						os.id === orderService.id ? {
							...os,
							status: orderService.status || "accepted",
							serviceName: orderService.service?.name || os.serviceName,
						} : os
					);
					state.orders[orderIndex] = {
						...order,
						orderServices: updatedOrderServices,
					};
				}
			})
			.addCase(acceptOrderService.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Reject orderService
		builder
			.addCase(rejectOrderService.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(rejectOrderService.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, orderService } = action.payload;
				const orderIndex = state.orders.findIndex((order) => order.id === orderId);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					const updatedOrderServices = (order.orderServices || []).map(os =>
						os.id === orderService.id ? {
							...os,
							status: orderService.status || "rejected",
						} : os
					);
					state.orders[orderIndex] = {
						...order,
						orderServices: updatedOrderServices,
					};
				}
			})
			.addCase(rejectOrderService.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Send orderService offer
		builder
			.addCase(sendOrderServiceOffer.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(sendOrderServiceOffer.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, orderServiceId, offer } = action.payload;
				const orderIndex = state.orders.findIndex((order) => order.id === orderId);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					// Transform offer data to match frontend format
					const transformedOffer = {
						id: offer.id,
						status: offer.status || "pending",
						hourly_rate: offer.hourly_rate,
						currency: offer.currency || "CHF",
						min_hours: offer.min_hours,
						max_hours: offer.max_hours,
						notes: offer.notes || "",
						date: offer.date || null,
						time: offer.time || null,
						createdAt: offer.createdAt,
						updatedAt: offer.updatedAt,
						// Keep backward compatibility fields
						hourlyRate: offer.hourly_rate,
						minHours: offer.min_hours,
						maxHours: offer.max_hours,
						scheduledDate: offer.date,
						scheduledTime: offer.time,
					};
					// Update offer in orderService
					const updatedOrderServices = (order.orderServices || []).map(os =>
						os.id === orderServiceId ? {
							...os,
							offer: transformedOffer,
						} : os
					);
					state.orders[orderIndex] = {
						...order,
						orderServices: updatedOrderServices,
					};
				}
			})
			.addCase(sendOrderServiceOffer.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});

		// Cancel offer
		builder
			.addCase(cancelOffer.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(cancelOffer.fulfilled, (state, action) => {
				state.isLoading = false;
				const { orderId, orderServiceId, offer } = action.payload;
				const orderIndex = state.orders.findIndex((order) => order.id === orderId);
				if (orderIndex !== -1) {
					const order = state.orders[orderIndex];
					if (orderServiceId) {
						// Update orderService offer
						const updatedOrderServices = (order.orderServices || []).map(os =>
							os.id === orderServiceId ? {
								...os,
								offer: null,
							} : os
						);
						state.orders[orderIndex] = {
							...order,
							orderServices: updatedOrderServices,
						};
					} else {
						// Update main order offer
						state.orders[orderIndex] = {
							...order,
							offer: null,
						};
					}
				}
			})
			.addCase(cancelOffer.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload?.message || action.error.message;
			});
	},
});

export const { hydrateOrders, clearOrders, setSelectedFilter, updateOrder } = ordersSlice.actions;

export default ordersSlice.reducer;
