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
        const response = await notificationsApi.getNotifications({ 
          limit: 50,
          show: true
        });
        
        let notifications = [];
        if (response?.data?.notifications && Array.isArray(response.data.notifications)) {
          notifications = response.data.notifications;
        } else if (response?.data && Array.isArray(response.data)) {
          notifications = response.data;
        } else if (Array.isArray(response)) {
          notifications = response;
        }
        
        // Always dispatch, even if empty, to sync state with server
        dispatch(setNotifications(notifications));
        
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error fetching notifications:', error.message);
        }
      }
    };

    // Try to fetch notifications immediately
    fetchOldNotifications();

    // Connect to production API Socket.IO server
    // Base URL: http://localhost:5000
    let socketUrl = "http://localhost:5000";
    
    // Connect to the backend Socket.IO server
    const socketOptions = {
      withCredentials: true,
      transports: ['websocket', 'polling'], // WebSocket first to avoid 400 issues
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      timeout: 30000,
      autoConnect: false,
    };
    
    const socket = io(socketUrl, socketOptions);
    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      isConnectedRef.current = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Socket.IO connected. Transport:', socket.io?.engine?.transport?.name);
      }
      fetchOldNotifications();
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      isConnectedRef.current = false;
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Socket.IO connection error:', error.message);
      }
    });

    // Listen for notifications
    socket.on('notification', (notificationData) => {
      // Normalize notification data structure
      const notification = {
        ...notificationData,
        id: notificationData.id,
        user_id: notificationData.user_id || notificationData.userId,
        userId: notificationData.user_id || notificationData.userId,
        is_read: !!(notificationData.is_read || notificationData.read || notificationData.read_at),
        read: !!(notificationData.is_read || notificationData.read || notificationData.read_at),
        show: notificationData.show !== undefined ? notificationData.show : true,
      };

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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Socket.IO disconnected. Reason:', reason);
      }
      
      // Attempt to reconnect if it was an unexpected disconnect
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need to reconnect manually
        socket.connect();
      }
    });

    // Handle reconnection
    socket.on('reconnect', (attemptNumber) => {
      isConnectedRef.current = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 Socket.IO reconnected after', attemptNumber, 'attempts');
      }
      
      // Fetch notifications again after reconnection
      fetchOldNotifications();
    });

    // Now connect explicitly
    socket.connect();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [user?.id, dispatch]); // Removed toast from dependencies to prevent constant reconnections

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