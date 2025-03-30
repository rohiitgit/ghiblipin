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
    
    // Check if we just completed authentication (set by auth.js)
    const justAuthenticated = localStorage.getItem('justAuthenticated');
    if (justAuthenticated === 'true') {
      console.log('Just authenticated, clearing flag and proceeding');
      localStorage.removeItem('justAuthenticated');
      // Continue without any redirects - wait for session check
    }
    
    // Check if user is logged in
    console.log('Checking for active session...');
    const { data, error } = await supabaseClient.auth.getSession();

    console.log('Session check result:', data);
    if (error) console.error('Session error:', error);

    if (!data?.session) {
      console.log('No active session found, redirecting to login');
      redirectToLogin();
      return;
    }

    // User has a valid session
    console.log('Valid session found for user:', data.session.user.id);
    currentUser = data.session.user;
    
    // Check if user exists in profiles table and create if not
    try {
      // First, check if the user exists in your database
      const { data: profile, error: fetchError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
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
              id: currentUser.id,
              twitter_username: currentUser.user_metadata?.user_name || '',
              twitter_avatar: currentUser.user_metadata?.avatar_url || '',
              created_at: new Date()
            }
          ]);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (profileError) {
      console.error('Profile management error:', profileError);
    }
    
    // Dispatch event so other scripts know Supabase is ready
    window.dispatchEvent(new CustomEvent('supabaseReady', { detail: { user: currentUser } }));
    
    // Add listener for auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in main app:', event);
      
      if (event === 'SIGNED_OUT') {
        redirectToLogin();
      }
    });
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

function redirectToLogin() {
  window.location.href = '/login.html';
}

// Add logout functionality
async function logout() {
  if (!supabaseClient) return;
  
  try {
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