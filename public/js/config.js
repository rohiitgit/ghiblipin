// This script loads configuration from our secure server API endpoint
let supabaseClient = null;
let currentUser = null;

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
    
    console.log('Supabase client initialized for main app');
    
    // Check for just authenticated flag
    const justAuthenticated = localStorage.getItem('justAuthenticated');
    if (justAuthenticated === 'true') {
      console.log('User just authenticated, clearing flag');
      localStorage.removeItem('justAuthenticated');
    }
    
    // Check if user is logged in
    console.log('Checking for active session...');
    const { data, error } = await supabaseClient.auth.getSession();
    
    console.log('Raw session data:', data);
    console.log('Session exists:', !!data?.session);
    
    if (error) {
      console.error('Session error:', error);
    }
    
    // Get stored user ID as fallback
    const storedUserId = localStorage.getItem('ghiblipin_user_id');
    
    if (!data?.session) {
      console.log('No session found initially, checking for stored user ID...');
      
      if (storedUserId) {
        console.log('Found stored user ID, attempting to recover session...');
        
        // Try refreshing the session
        const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession();
        
        if (refreshError || !refreshData?.session) {
          console.log('Failed to recover session, double checking with delay...');
          
          // Wait a moment and try one more time
          setTimeout(async () => {
            const { data: retryData } = await supabaseClient.auth.getSession();
            
            if (!retryData?.session) {
              console.log('Still no session after retry, redirecting to login');
              localStorage.removeItem('ghiblipin_user_id'); // Clear invalid ID
              redirectToLogin();
            } else {
              console.log('Session found on retry!');
              // Continue with app initialization
              currentUser = retryData.session.user;
              completeInitialization(currentUser);
            }
          }, 1500);
          
          return; // Exit early while we wait for timeout
        } else {
          // Refresh successful
          console.log('Session recovered successfully!');
          currentUser = refreshData.session.user;
        }
      } else {
        console.log('No stored user ID found, redirecting to login');
        redirectToLogin();
        return;
      }
    } else {
      // We have a valid session
      currentUser = data.session.user;
      
      // Store user ID for backup auth
      localStorage.setItem('ghiblipin_user_id', currentUser.id);
    }
    
    // Complete the initialization with the user
    completeInitialization(currentUser);
    
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #721c24;">
        <h2>Error connecting to the server</h2>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

function completeInitialization(user) {
  // Check if user exists in profiles table and create if not
  createUserProfileIfNeeded(user);
  
  // Dispatch event so other scripts know Supabase is ready
  window.dispatchEvent(new CustomEvent('supabaseReady', { detail: { user: user } }));
  
  // Add listener for auth state changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed in main app:', event);
    
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('ghiblipin_user_id');
      redirectToLogin();
    }
  });
}

async function createUserProfileIfNeeded(user) {
  try {
    // First, check if the user exists in your database
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "row not found" error
      console.error('Error fetching profile:', fetchError);
    }
    
    // If profile doesn't exist, create one
    if (!profile) {
      console.log('Creating new user profile');
      
      const { error: insertError } = await supabaseClient
        .from('profiles')
        .insert([
          {
            id: user.id,
            twitter_username: user.user_metadata?.user_name || '',
            twitter_avatar: user.user_metadata?.avatar_url || '',
            created_at: new Date()
          }
        ]);
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    } else {
      console.log('User profile exists:', profile.twitter_username);
    }
  } catch (profileError) {
    console.error('Profile management error:', profileError);
  }
}

function redirectToLogin() {
  window.location.href = '/login.html';
}

// Add logout functionality
async function logout() {
  if (!supabaseClient) return;
  
  try {
    localStorage.removeItem('ghiblipin_user_id');
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    // Redirect to login page
    redirectToLogin();
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Initialize as soon as the script loads
initializeSupabase();