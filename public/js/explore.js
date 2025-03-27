export function initializeExplore(supabaseClient) {
    const gallery = document.getElementById('gallery');
    const galleryLoading = document.getElementById('gallery-loading');
    
    async function loadGallery() {
        gallery.innerHTML = '';
        galleryLoading.style.display = 'block';
        
        try {
            // Fetch latest posts, limited to 20
            const { data, error } = await supabaseClient
                .from('ghibli_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Add animation delay for staggered appearance
                data.forEach((post, index) => {
                    const pin = document.createElement('div');
                    pin.className = 'pin';
                    pin.style.animationDelay = `${index * 0.1}s`;
                    
                    pin.innerHTML = `
                        <div class="pin-img-container">
                            <img src="${post.image_url}" alt="${post.title}" class="pin-img">
                        </div>
                        <div class="pin-content">
                            <h3>${post.title}</h3>
                            <div class="pin-user">${post.twitter_username}</div>
                        </div>
                    `;
                    
                    // Add hover animation
                    const img = pin.querySelector('.pin-img');
                    pin.addEventListener('mouseenter', () => {
                        img.style.transform = 'scale(1.05)';
                    });
                    pin.addEventListener('mouseleave', () => {
                        img.style.transform = 'scale(1)';
                    });
                    
                    gallery.appendChild(pin);
                });
            } else {
                gallery.innerHTML = `
                    <div class="empty-state" style="grid-column: span 2;">
                        <i class="fas fa-photo-film"></i>
                        <h3>No Ghibli creations yet</h3>
                        <p>Be the first to share your Ghibli-style image!</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            gallery.innerHTML = `
                <div class="empty-state" style="grid-column: span 2;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading gallery</h3>
                    <p>Please try again later.</p>
                </div>
            `;
        } finally {
            galleryLoading.style.display = 'none';
        }
    }
    
    // Load gallery when the module is initialized
    loadGallery();
    
    // Return methods that can be called from outside
    return {
        refresh: loadGallery
    };
}