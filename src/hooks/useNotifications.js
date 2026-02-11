import { useGlobalToast } from '@/hooks/useGlobalToast';
import { notificationsApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { addNotification, setNotifications } from '@/store/slices/notificationsSlice';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { toast } = useGlobalToast();
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || typeof window === 'undefined') {
      return;
    }

    // Fetch notifications from API (works independently of Socket.IO)
    const fetchOldNotifications = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
        }
        
        const response = await notificationsApi.getNotifications({ 
          limit: 50, // Fetch last 50 notifications
          show: true // Only fetch visible notifications
        });
        
        if (process.env.NODE_ENV === 'development') {
        }
        
        // Handle new API response structure: { success, message, data: { notifications }, pagination }
        let notifications = [];
        if (response?.data?.notifications && Array.isArray(response.data.notifications)) {
          notifications = response.data.notifications;
        } else if (response?.data && Array.isArray(response.data)) {
          notifications = response.data;
        } else if (Array.isArray(response)) {
          notifications = response;
        }
        
        if (process.env.NODE_ENV === 'development') {
        }
        
        if (notifications.length > 0) {
          // Normalize notifications structure - setNotifications will handle normalization
          dispatch(setNotifications(notifications));
          if (process.env.NODE_ENV === 'development') {
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
          }
        }
      } catch (error) {
        // Log all errors in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error fetching notifications:', {
            error,
            message: error?.message,
            status: error?.status,
            data: error?.data
          });
        }
        
        // Silently handle 404 or endpoint not available
        // API endpoint might not be implemented yet - this is expected
        if (error?.status === 404 || error?.data?.isNotifications404) {
          // Endpoint doesn't exist yet - this is fine, notifications will work via Socket.IO only
          if (process.env.NODE_ENV === 'development') {
          }
        }
      }
    };

    // Try to fetch notifications immediately (even if Socket.IO fails)
    // This ensures notifications work via API even if Socket.IO has CORS issues
    fetchOldNotifications();

    // Determine socket URL based on environment
    // Note: Socket.IO requires direct connection - Next.js proxy doesn't work well with WebSocket upgrade
    // The backend CORS must be configured to allow localhost:3000
    let socketUrl;
    
    if (window.location.hostname === 'localhost') {
      // Direct connection to backend (requires CORS to allow localhost:3000)
      socketUrl = 'http://localhost:5000';
    } else {
      // Production: direct connection
      socketUrl = "https://backend-production-3bcd.up.railway.app";
    }
    
    // Connect to the backend Socket.IO server
    const socketOptions = {
      withCredentials: true, // Include HTTP-only cookies
      transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
      reconnection: true, // Enable reconnection
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // Don't use path - Socket.IO uses default /socket.io/ path
    };
    
    if (process.env.NODE_ENV === 'development') {
    }
    
    const socket = io(socketUrl, socketOptions);

    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      isConnectedRef.current = true;
      
      // Fetch old notifications when connected
      fetchOldNotifications();
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      isConnectedRef.current = false;
      
      // If CORS error, show helpful message but keep trying
      if (error.message?.includes('CORS') || error.message?.includes('Access-Control') || 
          error.type === 'TransportError' || error.description?.includes('CORS')) {
        console.warn('⚠️ CORS error detected. Socket.IO cannot connect.');
        console.warn('💡 Solution: Update backend CORS to allow http://localhost:3000');
        console.warn('💡 Notifications will still work via API polling.');
        
        // Still try to fetch notifications via API
        fetchOldNotifications();
      }
    });

    // Listen for notifications
    socket.on('notification', (notificationData) => {
      
      // Normalize notification data structure to match API format
      const notification = {
        id: notificationData.id,
        user_id: notificationData.user_id || notificationData.userId,
        userId: notificationData.user_id || notificationData.userId,
        companyId: notificationData.company_id || notificationData.companyId,
        role: notificationData.role,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        payload: notificationData.payload || {},
        is_read: notificationData.is_read || notificationData.isRead || false,
        read: notificationData.is_read || notificationData.isRead || false,
        show: notificationData.show !== undefined ? notificationData.show : true,
        createdAt: notificationData.createdAt || notificationData.created_at || new Date().toISOString(),
        updatedAt: notificationData.updatedAt || notificationData.updated_at || new Date().toISOString(),
      };

      // Add notification to Redux store
      dispatch(addNotification(notification));
      
      if (process.env.NODE_ENV === 'development') {
      }

      // Show toast notification if show is true
      if (notification.show) {
        // Show notification with title and message
        const toastMessage = notification.title 
          ? `${notification.title}: ${notification.message}`
          : notification.message;
        toast.info(toastMessage, 5000);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      isConnectedRef.current = false;
      
      // Attempt to reconnect if it was an unexpected disconnect
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need to reconnect manually
        socket.connect();
      }
    });

    // Handle reconnection
    socket.on('reconnect', (attemptNumber) => {
      isConnectedRef.current = true;
      
      // Fetch notifications again after reconnection
      fetchOldNotifications();
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [user?.id, dispatch, toast]); // Re-run when user changes

  // Periodically fetch notifications if Socket.IO is not connected
  useEffect(() => {
    if (!user || typeof window === 'undefined') {
      return;
    }

    // If Socket.IO is not connected, poll for notifications every 30 seconds
    const pollInterval = setInterval(() => {
      if (!isConnectedRef.current) {
        if (process.env.NODE_ENV === 'development') {
        }
        notificationsApi.getNotifications({ limit: 50, show: true })
          .then((response) => {
            let notifications = [];
            if (response?.data?.notifications && Array.isArray(response.data.notifications)) {
              notifications = response.data.notifications;
            } else if (response?.data && Array.isArray(response.data)) {
              notifications = response.data;
            } else if (Array.isArray(response)) {
              notifications = response;
            }
            if (notifications.length > 0) {
              dispatch(setNotifications(notifications));
            }
          })
          .catch((error) => {
            // Silently handle errors
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to poll notifications:', error.message);
            }
          });
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user?.id, dispatch]);

  // Return connection status (optional, for components that need it)
  return {
    isConnected: isConnectedRef.current,
  };
};