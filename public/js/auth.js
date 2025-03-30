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
      console.log('Existing session found, redirecting to explore page');
      
      // Store user ID for backup auth
      localStorage.setItem('ghiblipin_user_id', session.user.id);
      
      // Redirect to explore page
      window.location.href = '/index.html';
    } else {
      console.log('No existing session, showing login screen');
      
      // Setup login button
      setupTwitterLogin();
      
      // Add auth state change listener
      setupAuthListener();
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    showErrorMessage('Error connecting to the server. Please try again later.');
  }
}

function setupAuthListener() {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in successfully!', session.user.id);
      
      // Store auth info for reliable session recovery
      localStorage.setItem('justAuthenticated', 'true');
      localStorage.setItem('ghiblipin_user_id', session.user.id);
      
      // Give a brief moment for everything to sync
      setTimeout(() => {
        // Redirect to the main app
        window.location.href = '/index.html';
      }, 500);
    }
  });
}

async function signInWithTwitter() {
  try {
    // Use the simplest form without any extra options
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'twitter'
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