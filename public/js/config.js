// This script loads configuration from our secure server API endpoint
let supabaseClient = null;

async function initializeSupabase() {
  try {
    // Fetch configuration from server-side API (keeps keys out of client code)
    const response = await fetch('/api/config');
    const config = await response.json();
    
    // Initialize Supabase client with fetched credentials
    supabaseClient = supabase.createClient(
      config.supabaseUrl,
      config.supabaseKey
    );
    
    console.log('Supabase client initialized');
    
    // Dispatch event so other scripts know Supabase is ready
    window.dispatchEvent(new Event('supabaseReady'));
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

// Initialize as soon as the script loads
initializeSupabase();