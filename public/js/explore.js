export function initializeExplore(supabaseClient) {
    const gallery = document.getElementById('gallery');
    const galleryLoading = document.getElementById('gallery-loading');
<<<<<<< HEAD
    
    // Helper function to determine random heights for Pinterest-style layout
    function getRandomHeight() {
        const heights = [200, 250, 300, 350];
        return heights[Math.floor(Math.random() * heights.length)];
    }
=======
>>>>>>> parent of b7a94a5 (added image popup to view feature)
    
    async function loadGallery() {
        gallery.innerHTML = '';
        galleryLoading.style.display = 'block';
        
        try {
            // Fetch latest posts
            const { data, error } = await supabaseClient
                .from('ghibli_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Create Pinterest-style masonry layout
                gallery.className = 'gallery pinterest-layout';
                
                // Add animation delay for staggered appearance
                data.forEach((post, index) => {
                    const randomHeight = getRandomHeight();
                    const pin = document.createElement('div');
                    pin.className = 'pin';
                    pin.style.animationDelay = `${index * 0.1}s`;
                    
                    pin.innerHTML = `
                        <div class="pin-img-container" style="height: ${randomHeight}px;">
                            <img src="${post.image_url}" alt="${post.title}" class="pin-img">
                        </div>
                        <div class="pin-content">
                            <h3>${post.title}</h3>
                            <div class="pin-user-container">
                                ${post.twitter_avatar ? 
                                  `<img src="${post.twitter_avatar}" alt="@${post.twitter_username}" class="pin-avatar">` : 
                                  ''}
                                <span class="pin-user">${post.twitter_username}</span>
                                <a href="${post.twitter_url}" target="_blank" class="twitter-link" title="View on Twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                            </div>
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
                    <div class="empty-state">
                        <i class="fas fa-photo-film"></i>
                        <h3>No Ghibli creations yet</h3>
                        <p>Be the first to share your Ghibli-style image!</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            gallery.innerHTML = `
                <div class="empty-state">
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