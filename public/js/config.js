// This script loads configuration from our secure server API endpoint
let supabaseClient = null;
let currentUser = null;

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
    
    console.log('Supabase client initialized for main app');
    
    // Check for hash fragments from auth redirect
    const fragment = window.location.hash;
    if (fragment.includes('access_token') || fragment.includes('refresh_token')) {
      console.log('Auth tokens detected in URL');
      // The detectSessionInUrl option should handle this automatically
    }
    
    // Check if user is logged in
    console.log('Checking for active session...');
    const { data, error } = await supabaseClient.auth.getSession();
    
    console.log('Session data:', data);
    
    if (error) {
      console.error('Session error:', error);
      redirectToLogin();
      return;
    }
    
    if (!data?.session) {
      console.log('No session found, redirecting to login');
      redirectToLogin();
      return;
    }
    
    // We have a valid session
    currentUser = data.session.user;
    console.log('User authenticated:', currentUser.id);
    
    // Check if profile exists and create if needed
    await createProfileIfNeeded(currentUser);
    
    // Dispatch event so other scripts know Supabase is ready
    window.dispatchEvent(new CustomEvent('supabaseReady', { detail: { user: currentUser } }));
    
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

async function createProfileIfNeeded(user) {
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
      console.log('User profile exists');
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