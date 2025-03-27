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

// Global state
let currentUsername = null;
let exploreModule = null;
let profileModule = null;

// Page navigation functions
function showUploadPage() {
    uploadPage.classList.add('active');
    explorePage.classList.remove('active');
    profilePage.classList.remove('active');
    navExplore.classList.remove('active');
    navProfile.classList.remove('active');
    
    // Hide bottom navigation on upload page
    bottomNav.classList.remove('visible');
}

function showExplorePage() {
    uploadPage.classList.remove('active');
    explorePage.classList.add('active');
    profilePage.classList.remove('active');
    navExplore.classList.add('active');
    navProfile.classList.remove('active');
    
    // Show bottom navigation
    bottomNav.classList.add('visible');
    
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
    if (profileModule && currentUsername) {
        profileModule.refresh();
    }
}

// Initialize the app
function initApp() {
    // Check for stored username
    currentUsername = localStorage.getItem('twitterUsername');
    
    if (currentUsername) {
        // If user has uploaded before, show explore page
        showExplorePage();
        exploreModule = initializeExplore(supabaseClient);
    } else {
        // First-time user, show upload page
        showUploadPage();
    }
    
    // Bottom navigation
    navExplore.addEventListener('click', function() {
        showExplorePage();
        if (!exploreModule) {
            exploreModule = initializeExplore(supabaseClient);
        }
    });
    
    navProfile.addEventListener('click', function() {
        if (currentUsername) {
            showProfilePage();
            if (!profileModule) {
                profileModule = initializeProfile(supabaseClient, currentUsername);
            }
        } else {
            showUploadPage();
            document.getElementById('upload-message').textContent = 'Please upload a photo first to view your profile';
            document.getElementById('upload-message').className = 'message error';
            document.getElementById('upload-message').style.display = 'block';
        }
    });
    
    // Initialize upload module
    initializeUpload(supabaseClient, { 
        onUploadSuccess: function(username) {
            currentUsername = username;
            localStorage.setItem('twitterUsername', username);
            
            // Wait briefly then show explore page with nav
            setTimeout(() => {
                showExplorePage();
                
                // Initialize modules if they haven't been yet
                if (!exploreModule) {
                    exploreModule = initializeExplore(supabaseClient);
                } else {
                    exploreModule.refresh();
                }
                
                // Initialize profile module for future use
                if (!profileModule) {
                    profileModule = initializeProfile(supabaseClient, currentUsername);
                }
            }, 1500);
        }
    });
}

// Wait for Supabase to initialize before starting app
window.addEventListener('supabaseReady', initApp);