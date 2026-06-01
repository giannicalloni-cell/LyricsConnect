// ==================== SOCKET.IO CLIENT ==================== 

let socket = null;
let currentUser = null;
let isConnected = false;
let onlineUsers = [];

// Initialize Socket.io connection
function initSocket() {
  if (socket) return;

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  socket = io('http://localhost:5000', {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to server');
    isConnected = true;
    updateOnlineStatus(true);
    socket.emit('user-online', currentUser?._id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    isConnected = false;
    updateOnlineStatus(false);
  });

  socket.on('users-online', (users) => {
    onlineUsers = users;
    console.log('👥 Online users:', users);
  });

  // Message events
  socket.on('receive-message', (data) => {
    console.log('💬 Received message:', data);
    handleReceivedMessage(data);
  });

  // Notification events
  socket.on('receive-notification', (notification) => {
    console.log('🔔 Received notification:', notification);
    handleNotification(notification);
  });

  // Typing indicator
  socket.on('user-typing', (data) => {
    showTypingIndicator(data.senderId);
  });
}

// Send message through Socket
function sendMessageSocket(recipientId, message) {
  if (!socket || !isConnected) {
    console.error('Socket not connected');
    return;
  }

  socket.emit('send-message', {
    senderId: currentUser._id,
    recipientId: recipientId,
    message: message,
    timestamp: new Date()
  });
}

// Show typing indicator
function emitTyping(recipientId) {
  if (socket && isConnected) {
    socket.emit('typing', {
      senderId: currentUser._id,
      recipientId: recipientId
    });
  }
}

// Send notification
function sendNotificationSocket(userId, notification) {
  if (socket && isConnected) {
    socket.emit('send-notification', {
      userId: userId,
      notification: notification
    });
  }
}

// Update online status indicator
function updateOnlineStatus(online) {
  const statusElement = document.getElementById('onlineStatus');
  if (statusElement) {
    if (online) {
      statusElement.textContent = '🟢 Online';
      statusElement.style.color = '#10b981';
    } else {
      statusElement.textContent = '🔴 Offline';
      statusElement.style.color = '#999';
    }
  }
}

// Handle received message
function handleReceivedMessage(data) {
  // This will be handled in messages.js
  if (window.onMessageReceived) {
    window.onMessageReceived(data);
  }
}

// Handle notification
function handleNotification(notification) {
  // This will be handled in dashboard.js
  if (window.onNotificationReceived) {
    window.onNotificationReceived(notification);
  }
}

// Show typing indicator
function showTypingIndicator(userId) {
  // This will be handled in messages.js
  if (window.onUserTyping) {
    window.onUserTyping(userId);
  }
}

// Disconnect socket
function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    updateOnlineStatus(false);
  }
}
