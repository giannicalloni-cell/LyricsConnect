// ==================== MOCK DATA ==================== 
const mockUsers = [
    {
        id: 1,
        name: "Marco Rossi",
        type: "lyricist",
        email: "marco@example.com",
        rating: 4.8,
        bio: "Passionate songwriter with 5 years experience",
        avatar: "👨‍🎤"
    },
    {
        id: 2,
        name: "Giulia Bianchi",
        type: "singer",
        email: "giulia@example.com",
        rating: 4.9,
        bio: "Professional vocalist, classical training",
        avatar: "👩‍🎤"
    },
    {
        id: 3,
        name: "Alex Verdi",
        type: "lyricist",
        email: "alex@example.com",
        rating: 4.7,
        bio: "Hip-hop and pop lyrics specialist",
        avatar: "🎤"
    }
];

const mockLyrics = [
    {
        id: 1,
        title: "Midnight Dreams",
        artist: "Marco Rossi",
        genre: "Pop",
        lyrics: "When the night falls down...",
        requests: 5,
        rating: 4.8,
        preview: "Emotive pop song about life and love"
    },
    {
        id: 2,
        title: "City Lights",
        artist: "Alex Verdi",
        genre: "Hip-Hop",
        lyrics: "Urban vibes, concrete streets...",
        requests: 3,
        rating: 4.6,
        preview: "Modern hip-hop track with deep meaning"
    },
    {
        id: 3,
        title: "Summer Rain",
        artist: "Marco Rossi",
        genre: "Indie",
        lyrics: "Falling down like memories...",
        requests: 7,
        rating: 4.9,
        preview: "Indie masterpiece with poetic verses"
    }
];

// ==================== STATE MANAGEMENT ==================== 
let currentUser = null;
let isLoggedIn = false;

// ==================== MODAL FUNCTIONS ==================== 
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showSignupModal(type) {
    document.getElementById('signupModal').style.display = 'block';
    if (type) {
        document.getElementById('userType').value = type;
    }
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function switchToLogin() {
    closeSignupModal();
    showLoginModal();
}

function switchToSignup() {
    closeLoginModal();
    showSignupModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target == signupModal) {
        signupModal.style.display = 'none';
    }
}

// ==================== FORM HANDLERS ==================== 
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    // Mock authentication
    currentUser = mockUsers.find(u => u.email === email) || {
        id: 99,
        name: "User",
        type: "lyricist",
        email: email,
        rating: 0,
        avatar: "👤"
    };
    
    isLoggedIn = true;
    closeLoginModal();
    updateNavBar();
    showNotification('✅ Logged in successfully!');
    
    // Reset form
    this.reset();
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const type = document.getElementById('userType').value;
    
    // Create mock user
    currentUser = {
        id: mockUsers.length + 1,
        name: name,
        type: type,
        email: email,
        rating: 5.0,
        avatar: type === 'singer' ? '👩‍🎤' : '✍️'
    };
    
    isLoggedIn = true;
    closeSignupModal();
    updateNavBar();
    showNotification(`✅ Welcome ${name}! Account created as ${type}`);
    
    // Reset form
    this.reset();
});

// ==================== NAVIGATION UPDATES ==================== 
function updateNavBar() {
    const loginBtn = document.querySelector('.btn-login');
    
    if (isLoggedIn && currentUser) {
        loginBtn.textContent = `${currentUser.avatar} ${currentUser.name}`;
        loginBtn.onclick = function() {
            showUserMenu();
        };
    }
}

function showUserMenu() {
    alert(`Logged in as: ${currentUser.name}\nType: ${currentUser.type}\nEmail: ${currentUser.email}\n\nFeature coming soon!`);
}

// ==================== NOTIFICATIONS ==================== 
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== HAMBURGER MENU ==================== 
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
});

// Close menu when link clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ==================== SMOOTH SCROLL NAV ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// ==================== ANIMATIONS ==================== 
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZE ==================== 
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 LyricsConnect App Loaded!');
    console.log('Mock Users:', mockUsers);
    console.log('Mock Lyrics:', mockLyrics);
    
    // Log when buttons are hovered (for testing)
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Button clicked:', this.textContent);
        });
    });
});

// ==================== DEBUG HELPER ==================== 
window.debug = {
    getUsers: () => mockUsers,
    getLyrics: () => mockLyrics,
    getCurrentUser: () => currentUser,
    isLoggedIn: () => isLoggedIn,
    setUser: (id) => {
        currentUser = mockUsers.find(u => u.id === id);
        isLoggedIn = true;
        updateNavBar();
        console.log('User set to:', currentUser);
    },
    logout: () => {
        currentUser = null;
        isLoggedIn = false;
        updateNavBar();
        console.log('Logged out');
    }
};

console.log('💡 Debug commands available: window.debug.getUsers(), window.debug.setUser(1), etc.');