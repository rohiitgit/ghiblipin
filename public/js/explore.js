export function initializeExplore(supabaseClient) {
    const gallery = document.getElementById('gallery');
    const galleryLoading = document.getElementById('gallery-loading');
    const imagePopup = document.getElementById('image-popup');
    const popupImage = document.getElementById('popup-image');
    const popupTitle = document.getElementById('popup-title');
    const popupUsername = document.getElementById('popup-username');
    const closePopup = document.querySelector('.close-popup');
    
    // Close popup event
    closePopup.addEventListener('click', () => {
        imagePopup.classList.add('closing');
        setTimeout(() => {
            imagePopup.classList.remove('active');
            imagePopup.classList.remove('closing');
        }, 300);
    });
    
    // Close popup when clicking outside the image
    imagePopup.addEventListener('click', (e) => {
        if (e.target === imagePopup) {
            imagePopup.classList.add('closing');
            setTimeout(() => {
                imagePopup.classList.remove('active');
                imagePopup.classList.remove('closing');
            }, 300);
        }
    });
    
    // Open popup with image data
    function openImagePopup(imageUrl, title, username) {
        popupImage.src = imageUrl;
        popupTitle.textContent = title;
        popupUsername.textContent = `@${username}`;
        
        // Show popup after image has loaded
        popupImage.onload = () => {
            imagePopup.classList.add('active');
        };
    }
    
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
                    
                    // Add click event to open popup
                    pin.addEventListener('click', () => {
                        openImagePopup(post.image_url, post.title, post.twitter_username);
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