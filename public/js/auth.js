// Initialize Supabase client
let supabaseClient = null;

async function initializeSupabase() {
  try {
    // Fetch configuration from server-side API
    const response = await fetch('/api/config');
    const config = await response.json();
    
    // Initialize Supabase client with fetched credentials
    supabaseClient = supabase.createClient(
      config.supabaseUrl,
      config.supabaseKey
    );
    
    console.log('Supabase client initialized for login');
    
    // Check if user is already logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
      // User is already authenticated, redirect to explore page
      window.location.href = '/index.html';
    } else {
      // Setup login button
      setupTwitterLogin();
    }
    
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    showErrorMessage('Error connecting to the server. Please try again later.');
  }
}

// Listen for auth state changes
supabaseClient?.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_IN' && session) {
    console.log('User signed in successfully!', session.user.id);
    // Store confirmation in localStorage to help with redirect
    localStorage.setItem('justAuthenticated', 'true');
    // Redirect to the main app
    window.location.href = '/index.html';
  }
});

async function signInWithTwitter() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'twitter',
        options: {
            redirectTo: `https://zmkyhurmhjuwqjgblyas.supabase.co/auth/v1/callback`
        }
    });
    
    if (error) throw error;
    
  } catch (error) {
    console.error('Twitter login error:', error);
    showErrorMessage('Failed to connect with Twitter. Please try again.');
  }
}

function setupTwitterLogin() {
  const twitterLoginBtn = document.getElementById('twitter-login-btn');
  
  if (twitterLoginBtn) {
    twitterLoginBtn.addEventListener('click', async () => {
      // Show loading state
      twitterLoginBtn.disabled = true;
      twitterLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to Twitter...';
      
      // Call the signInWithTwitter function
      await signInWithTwitter();
      
      // Reset button (will only run if there's an error)
      twitterLoginBtn.disabled = false;
      twitterLoginBtn.innerHTML = '<i class="fab fa-twitter"></i> Continue with Twitter';
    });
  }
}

function showErrorMessage(message) {
  // Create error message element if it doesn't exist
  let errorElement = document.querySelector('.login-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'login-error';
    errorElement.style.display = 'block';
    
    const loginCard = document.querySelector('.login-card');
    const loginButton = document.querySelector('.twitter-login-btn');
    
    if (loginCard && loginButton) {
      loginCard.insertBefore(errorElement, loginButton);
    }
  }
  
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Initialize the authentication when the page loads
document.addEventListener('DOMContentLoaded', initializeSupabase);