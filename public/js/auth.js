// Initialize Supabase client
let supabaseClient = null;

async function initializeSupabase() {
  try {
    // Fetch configuration from server-side API
    const response = await fetch('/api/config');
    const config = await response.json();
    
    // Initialize Supabase client with explicit storage configuration
    supabaseClient = supabase.createClient(
      config.supabaseUrl,
      config.supabaseKey,
      {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
    
    console.log('Supabase client initialized for login');
    
    // Check if there's a hash fragment from OAuth redirect
    const fragment = window.location.hash;
    if (fragment.includes('access_token') || fragment.includes('refresh_token')) {
      console.log('Auth tokens detected in URL, processing login...');
      // The detectSessionInUrl option should handle this automatically
    }
    
    // Check if user is already logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
      console.log('Session detected, redirecting to app');
      window.location.href = '/index.html';
    } else {
      console.log('No session found, showing login form');
      setupTwitterLogin();
    }
    
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    showErrorMessage('Error connecting to the server. Please try again later.');
  }
}

async function signInWithTwitter() {
  try {
    // Twitter OAuth with explicit redirectTo
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    });
    
    if (error) throw error;
    
    console.log('Auth initiated:', data);
    
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
      
      // Reset button after a delay (in case of error)
      setTimeout(() => {
        twitterLoginBtn.disabled = false;
        twitterLoginBtn.innerHTML = '<i class="fab fa-twitter"></i> Continue with Twitter';
      }, 2000);
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