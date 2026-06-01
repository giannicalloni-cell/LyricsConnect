// ==================== MESSAGES.JS ==================== 

const API_URL = 'http://localhost:5000/api';
let currentChat = null;
let conversations = [];
let allMessages = {};

// Initialize messages page
document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  initSocket();
  
  loadConversations();
  
  // Get user from URL params if present
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('user');
  if (userId) {
    openConversation(userId);
  }
  
  // Setup message input
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (currentChat) {
        emitTyping(currentChat);
      }
    });
  }
});

// Load conversations
async function loadConversations() {
  try {
    const response = await fetch(`${API_URL}/messages/inbox/all`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    conversations = await response.json();
    renderConversations();
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
}

// Render conversations list
function renderConversations() {
  const list = document.getElementById('conversationsList');
  
  if (conversations.length === 0) {
    list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No conversations yet</p>';
    return;
  }
  
  list.innerHTML = '';
  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    if (currentChat === conv._id) {
      item.classList.add('active');
    }
    
    item.innerHTML = `
      <div class="conversation-name">${conv.name || 'User'}</div>
      <div class="conversation-preview">${conv.lastMessage || 'No messages'}</div>
      ${conv.unreadCount > 0 ? `<div class="unread-badge">${conv.unreadCount}</div>` : ''}
    `;
    
    item.onclick = () => openConversation(conv._id);
    list.appendChild(item);
  });
}

// Open conversation
async function openConversation(userId) {
  currentChat = userId;
  
  // Show chat container
  document.getElementById('chatContainer').style.display = 'flex';
  document.getElementById('chatEmpty').style.display = 'none';
  
  // Load messages
  loadMessages(userId);
  
  // Update UI
  updateConversationUI(userId);
  
  // Reload conversations to clear badge
  loadConversations();
}

// Load messages
async function loadMessages(userId) {
  try {
    const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const messages = await response.json();
    allMessages[userId] = messages;
    renderMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Render messages
function renderMessages(messages) {
  const area = document.getElementById('messagesArea');
  area.innerHTML = '';
  
  messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.sender._id === currentUser._id ? 'sent' : 'received'}`;
    
    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <div>
        <div class="message-bubble">${msg.content}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    
    area.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  area.scrollTop = area.scrollHeight;
}

// Send message
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  try {
    // Send via REST API
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        recipientId: currentChat,
        content: message
      })
    });
    
    if (response.ok) {
      const newMessage = await response.json();
      
      // Also send via Socket.io for real-time
      sendMessageSocket(currentChat, message);
      
      // Update local messages
      if (!allMessages[currentChat]) {
        allMessages[currentChat] = [];
      }
      allMessages[currentChat].push(newMessage.data);
      renderMessages(allMessages[currentChat]);
      
      input.value = '';
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Handle received message (Socket.io)
window.onMessageReceived = function(data) {
  if (data.senderId === currentChat) {
    if (!allMessages[currentChat]) {
      allMessages[currentChat] = [];
    }
    
    allMessages[currentChat].push({
      sender: { _id: data.senderId },
      content: data.message,
      createdAt: data.timestamp
    });
    
    renderMessages(allMessages[currentChat]);
  }
};

// Handle typing indicator
window.onUserTyping = function(userId) {
  if (userId === currentChat) {
    const indicator = document.getElementById('typingIndicator');
    indicator.style.display = 'flex';
    
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      indicator.style.display = 'none';
    }, 3000);
  }
};

// Update conversation UI
function updateConversationUI(userId) {
  // This would load user info from API
  document.getElementById('chatWith').textContent = 'User Chat';
  
  // Update user status
  const status = onlineUsers.includes(userId) ? 'online' : 'offline';
  const statusElement = document.getElementById('userStatus');
  statusElement.textContent = status === 'online' ? '🟢 Online' : '🔴 Offline';
  statusElement.className = `user-status ${status}`;
}

// Handle message keypress
function handleMessageKeypress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
}

// Close chat
function closeChat() {
  currentChat = null;
  document.getElementById('chatContainer').style.display = 'none';
  document.getElementById('chatEmpty').style.display = 'flex';
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  disconnectSocket();
  window.location.href = 'index.html';
}

function toggleUserMenu() {
  alert(`Logged in as: ${currentUser.firstName} ${currentUser.lastName}`);
}
