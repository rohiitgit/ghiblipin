// Import modular functionality
import { initializeUpload } from './upload.js';
import { initializeExplore } from './explore.js';
import { initializeProfile } from './profile.js';

// Elements
const uploadPage = document.getElementById('upload-page');
const explorePage = document.getElementById('explore-page');
const profilePage = document.getElementById('profile-page');
const navExplore = document.getElementById('nav-explore');
const navProfile = document.getElementById('nav-profile');
const bottomNav = document.getElementById('bottom-nav');
const exploreOnlyBtn = document.getElementById('explore-only-btn');
const userAvatarEl = document.getElementById('user-avatar');
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Global state
let hasVisitedExplore = false; // Track if user has visited explore page
let exploreModule = null;
let profileModule = null;
let currentUser = null;

// Page navigation functions
function showUploadPage() {
    uploadPage.classList.add('active');
    explorePage.classList.remove('active');
    profilePage.classList.remove('active');
    navExplore.classList.remove('active');
    navProfile.classList.remove('active');
    
    // Hide bottom navigation on upload page
    if (!hasVisitedExplore) {
        bottomNav.classList.remove('visible');
    }
}

function showExplorePage() {
    uploadPage.classList.remove('active');
    explorePage.classList.add('active');
    profilePage.classList.remove('active');
    navExplore.classList.add('active');
    navProfile.classList.remove('active');
    
    // Show bottom navigation
    bottomNav.classList.add('visible');
    hasVisitedExplore = true; // User has now visited explore page
    
    // Refresh explore data every time we switch to this tab
    if (exploreModule) {
        exploreModule.refresh();
    }
}

function showProfilePage() {
    uploadPage.classList.remove('active');
    explorePage.classList.remove('active');
    profilePage.classList.add('active');
    navExplore.classList.remove('active');
    navProfile.classList.add('active');
    
    // Show bottom navigation
    bottomNav.classList.add('visible');
    
    // Refresh profile data every time we switch to this tab
    if (profileModule && currentUser) {
        profileModule.refresh();
    }
}

// Update user information in the header
function updateUserInfo(user) {
    // If elements exist in the DOM
    if (userAvatarEl && user.user_metadata && user.user_metadata.avatar_url) {
        userAvatarEl.src = user.user_metadata.avatar_url;
        userAvatarEl.style.display = 'block';
    }
    
    if (userNameEl && user.user_metadata && user.user_metadata.user_name) {
        userNameEl.textContent = user.user_metadata.user_name;
    }
}

// Initialize the app
function initApp(event) {
    // Get user information from the event
    currentUser = event?.detail?.user;
    
    if (currentUser) {
        // Update user information in the UI
        updateUserInfo(currentUser);
    }
    
    // Set up logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout(); // Function from config.js
        });
    }
    
    // Start by showing the explore page for authenticated users
    showExplorePage();
    exploreModule = initializeExplore(supabaseClient);
    
    // Bottom navigation
    navExplore.addEventListener('click', function() {
        showExplorePage();
        if (!exploreModule) {
            exploreModule = initializeExplore(supabaseClient);
        }
    });
    
    navProfile.addEventListener('click', function() {
        showProfilePage();
        if (!profileModule) {
            // Initialize with Twitter username from auth
            const twitterUsername = currentUser?.user_metadata?.user_name || '';
            profileModule = initializeProfile(supabaseClient, twitterUsername);
        }
    });
    
    // "Explore Only" button handler
    if (exploreOnlyBtn) {
        exploreOnlyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showExplorePage();
            if (!exploreModule) {
                exploreModule = initializeExplore(supabaseClient);
            }
            
            // Show only the Explore tab in the navigation
            navExplore.style.display = 'flex';
            navProfile.style.display = 'none';
        });
    }
    
    // Initialize upload module with Twitter information
    initializeUpload(supabaseClient, { 
        user: currentUser,
        onUploadSuccess: function() {
            // Wait briefly then show explore page with nav
            setTimeout(() => {
                showExplorePage();
                
                // Make sure both navigation options are visible
                navExplore.style.display = 'flex';
                navProfile.style.display = 'flex';
                
                // Initialize modules if they haven't been yet
                if (!exploreModule) {
                    exploreModule = initializeExplore(supabaseClient);
                } else {
                    exploreModule.refresh();
                }
                
                // Initialize profile module for future use
                if (!profileModule && currentUser) {
                    const twitterUsername = currentUser?.user_metadata?.user_name || '';
                    profileModule = initializeProfile(supabaseClient, twitterUsername);
                }
            }, 1500);
        }
    });
}

// Wait for Supabase to initialize before starting app
window.addEventListener('supabaseReady', initApp);