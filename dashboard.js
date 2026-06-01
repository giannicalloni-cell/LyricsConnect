// ==================== DASHBOARD.JS ==================== 

const API_URL = 'http://localhost:5000/api';
let userProfile = null;
let allLyrics = [];
let pendingRequests = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  initSocket();
  
  loadProfile();
  loadMyLyrics();
  loadCollaborations();
  loadBrowseLyrics();
  loadPendingRequests();
  
  // Setup hamburger menu
  const hamburger = document.getElementById('hamburger');
  hamburger?.addEventListener('click', toggleMobileMenu);
});

// Load user profile
async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/users/${currentUser._id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    userProfile = await response.json();
    
    document.getElementById('profileName').textContent = `${userProfile.firstName} ${userProfile.lastName}`;
    document.getElementById('profileType').textContent = userProfile.userType.charAt(0).toUpperCase() + userProfile.userType.slice(1);
    document.getElementById('profileImage').src = userProfile.profileImage || 'https://via.placeholder.com/150';
    document.getElementById('profileBio').textContent = userProfile.bio || 'No bio yet';
    document.getElementById('profileRating').textContent = `${userProfile.rating.toFixed(1)} ⭐`;
    document.getElementById('profileCollaborations').textContent = userProfile.collaborationsCount;
    document.getElementById('profileFollowers').textContent = userProfile.followers.length;
    
    document.getElementById('userBtn').textContent = `👤 ${userProfile.firstName}`;
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Load user's lyrics
async function loadMyLyrics() {
  try {
    const response = await fetch(`${API_URL}/lyrics/user/${currentUser._id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const lyrics = await response.json();
    const grid = document.getElementById('myLyricsGrid');
    
    if (lyrics.length === 0) {
      grid.innerHTML = '<p style="color: #999; grid-column: 1/-1;">No lyrics yet. Create your first one!</p>';
      return;
    }
    
    grid.innerHTML = '';
    lyrics.forEach(lyric => {
      const card = document.createElement('div');
      card.className = 'lyrics-card';
      card.innerHTML = `
        <h4>${lyric.title}</h4>
        <p>${lyric.genre}</p>
        <div class="lyrics-meta">
          <span>👁️ ${lyric.viewCount}</span>
          <span>❤️ ${lyric.likes.length}</span>
        </div>
      `;
      card.onclick = () => viewLyrics(lyric._id);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading lyrics:', error);
  }
}

// Load collaborations
async function loadCollaborations() {
  try {
    const response = await fetch(`${API_URL}/collaborations/user/${currentUser._id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const collaborations = await response.json();
    const list = document.getElementById('collaborationsList');
    
    if (collaborations.length === 0) {
      list.innerHTML = '<p style="color: #999;">No active collaborations</p>';
      return;
    }
    
    list.innerHTML = '';
    collaborations.forEach(collab => {
      const partner = collab.lyricist._id === currentUser._id ? collab.singer : collab.lyricist;
      const card = document.createElement('div');
      card.className = 'collaboration-card';
      card.innerHTML = `
        <div class="collab-title">${collab.lyrics.title}</div>
        <span class="collab-status ${collab.status}">${collab.status.toUpperCase()}</span>
        <p style="color: #999; margin: 1rem 0;">With: <strong>${partner.firstName} ${partner.lastName}</strong></p>
        <button class="btn btn-primary" style="width: 100%;" onclick="openChat('${partner._id}')">💬 Message</button>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading collaborations:', error);
  }
}

// Load all lyrics for browsing
async function loadBrowseLyrics() {
  try {
    const response = await fetch(`${API_URL}/lyrics`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    allLyrics = await response.json();
    renderBrowseGrid(allLyrics);
  } catch (error) {
    console.error('Error loading lyrics:', error);
  }
}

// Render browse grid
function renderBrowseGrid(lyrics) {
  const grid = document.getElementById('browseGrid');
  
  if (lyrics.length === 0) {
    grid.innerHTML = '<p style="color: #999; grid-column: 1/-1;">No lyrics found</p>';
    return;
  }
  
  grid.innerHTML = '';
  lyrics.forEach(lyric => {
    const card = document.createElement('div');
    card.className = 'lyrics-card';
    card.innerHTML = `
      <h4>${lyric.title}</h4>
      <p style="color: #999; font-size: 0.9rem;">${lyric.artist.firstName} ${lyric.artist.lastName}</p>
      <p style="color: #666;">${lyric.genre}</p>
      <div class="lyrics-meta">
        <span>👁️ ${lyric.viewCount}</span>
        <span>⭐ ${lyric.artist.rating}</span>
      </div>
    `;
    card.onclick = () => requestCollaboration(lyric._id, lyric.artist._id);
    grid.appendChild(card);
  });
}

// Load pending requests
async function loadPendingRequests() {
  try {
    // Get all lyrics where current user is the artist
    const response = await fetch(`${API_URL}/lyrics/user/${currentUser._id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const lyrics = await response.json();
    pendingRequests = [];
    
    lyrics.forEach(lyric => {
      lyric.collaborationRequests.forEach(req => {
        if (req.status === 'pending') {
          pendingRequests.push({ ...req, lyric });
        }
      });
    });
    
    document.getElementById('requestBadge').textContent = pendingRequests.length;
    
    const list = document.getElementById('requestsList');
    if (pendingRequests.length === 0) {
      list.innerHTML = '<p style="color: #999;">No pending requests</p>';
      return;
    }
    
    list.innerHTML = '';
    pendingRequests.forEach(req => {
      const card = document.createElement('div');
      card.className = 'request-card';
      card.innerHTML = `
        <h4>New Collaboration Request</h4>
        <p><strong>Song:</strong> ${req.lyric.title}</p>
        <p><strong>From:</strong> ${req.singer.firstName} ${req.singer.lastName}</p>
        <p style="color: #999; margin: 1rem 0;">${req.message || 'No message provided'}</p>
        <div class="request-actions">
          <button class="accept" onclick="acceptRequest('${req.lyric._id}', '${req.singer._id}')">✅ Accept</button>
          <button class="reject" onclick="rejectRequest('${req.lyric._id}', '${req.singer._id}')">❌ Reject</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading requests:', error);
  }
}

// Accept request
async function acceptRequest(lyricsId, singerId) {
  try {
    const response = await fetch(`${API_URL}/collaborations/${lyricsId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ lyricsId, singerId })
    });
    
    if (response.ok) {
      alert('✅ Collaboration accepted!');
      loadPendingRequests();
      loadCollaborations();
    }
  } catch (error) {
    console.error('Error accepting request:', error);
  }
}

// Reject request
async function rejectRequest(lyricsId, singerId) {
  try {
    const response = await fetch(`${API_URL}/collaborations/${lyricsId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ lyricsId, singerId })
    });
    
    if (response.ok) {
      alert('❌ Request rejected');
      loadPendingRequests();
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
  }
}

// Request collaboration
async function requestCollaboration(lyricsId, lyricistId) {
  if (currentUser._id === lyricistId) {
    alert('You cannot collaborate on your own lyrics!');
    return;
  }
  
  const message = prompt('Send a message to the lyricist:');
  if (!message) return;
  
  try {
    const response = await fetch(`${API_URL}/collaborations/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ lyricsId, message })
    });
    
    if (response.ok) {
      alert('✅ Request sent!');
    }
  } catch (error) {
    console.error('Error sending request:', error);
  }
}

// Show section
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Show selected section
  document.getElementById(`${sectionName}-section`).classList.add('active');
  event.target.classList.add('active');
}

// Create lyrics
document.getElementById('createLyricsForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  try {
    const response = await fetch(`${API_URL}/lyrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title: document.getElementById('lyricsTitle').value,
        genre: document.getElementById('lyricsGenre').value,
        lyrics: document.getElementById('lyricsContent').value,
        description: document.getElementById('lyricsDescription').value
      })
    });
    
    if (response.ok) {
      alert('✅ Lyrics created!');
      closeModal('createLyricsModal');
      loadMyLyrics();
      this.reset();
    }
  } catch (error) {
    console.error('Error creating lyrics:', error);
  }
});

// Search and filter
function searchLyrics() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allLyrics.filter(l => l.title.toLowerCase().includes(search));
  renderBrowseGrid(filtered);
}

function filterByGenre() {
  const genre = document.getElementById('genreFilter').value;
  const filtered = genre ? allLyrics.filter(l => l.genre === genre) : allLyrics;
  renderBrowseGrid(filtered);
}

// Modals
function showCreateLyrics() {
  document.getElementById('createLyricsModal').style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function editProfile() {
  alert('Profile editing feature coming soon!');
}

function viewLyrics(id) {
  alert('View lyrics feature coming soon!');
}

function toggleUserMenu() {
  alert(`Logged in as: ${currentUser.firstName} ${currentUser.lastName}`);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  disconnectSocket();
  window.location.href = 'index.html';
}

function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

// Open chat
function openChat(userId) {
  window.location.href = `messages.html?user=${userId}`;
}
