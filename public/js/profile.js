export function initializeProfile(supabaseClient, username) {
    const profilePic = document.getElementById('profile-pic');
    const profileName = document.getElementById('profile-name');
    const profileGallery = document.getElementById('profile-gallery');
    const profileLoading = document.getElementById('profile-loading');
    const imagePopup = document.getElementById('image-popup');
    const popupImage = document.getElementById('popup-image');
    const popupTitle = document.getElementById('popup-title');
    const popupUsername = document.getElementById('popup-username');
    
    // Open popup with image data
    function openImagePopup(imageUrl, title) {
        popupImage.src = imageUrl;
        popupTitle.textContent = title;
        popupUsername.textContent = `@${username}`;
        
        // Show popup after image has loaded
        popupImage.onload = () => {
            imagePopup.classList.add('active');
        };
    }
    
    async function loadProfile() {
        profileGallery.innerHTML = '';
        profileLoading.style.display = 'block';
        profileName.textContent = `@${username}`;
        
        try {
            // Fetch user's posts
            const { data, error } = await supabaseClient
                .from('ghibli_posts')
                .select('*')
                .eq('twitter_username', username)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Set first image as profile picture with fade-in effect
                profilePic.style.opacity = 0;
                profilePic.src = data[0].image_url;
                profilePic.onload = () => {
                    profilePic.style.transition = 'opacity 0.5s ease';
                    profilePic.style.opacity = 1;
                };
                
                // Add user posts to gallery with animation delay
                data.forEach((post, index) => {
                    const profilePin = document.createElement('div');
                    profilePin.className = 'profile-pin';
                    profilePin.style.animationDelay = `${index * 0.1}s`;
                    profilePin.innerHTML = `<img src="${post.image_url}" alt="${post.title}">`;
                    
                    // Add hover animation
                    const img = profilePin.querySelector('img');
                    profilePin.addEventListener('mouseenter', () => {
                        img.style.transform = 'scale(1.1)';
                    });
                    profilePin.addEventListener('mouseleave', () => {
                        img.style.transform = 'scale(1)';
                    });
                    
                    // Add click event to open popup
                    profilePin.addEventListener('click', () => {
                        openImagePopup(post.image_url, post.title);
                    });
                    
                    profileGallery.appendChild(profilePin);
                });
                
                // Add the "add more" button with animation
                addUploadButton();
            } else {
                profilePic.src = '/assets/placeholder.png';
                profileGallery.innerHTML = `
                    <div class="empty-state" style="grid-column: span 3;">
                        <i class="fas fa-camera-retro"></i>
                        <h3>No creations yet</h3>
                        <p>Add your first Ghibli image!</p>
                    </div>
                `;
                
                // Add the "add" button even when empty
                addUploadButton();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            profileGallery.innerHTML = `
                <div class="empty-state" style="grid-column: span 3;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading profile</h3>
                    <p>Please try again later.</p>
                </div>
            `;
        } finally {
            profileLoading.style.display = 'none';
        }
    }
    
    function addUploadButton() {
        const addPin = document.createElement('div');
        addPin.className = 'add-pin';
        addPin.innerHTML = '<div class="add-pin-icon">+</div>';
        
        // Add hover effect
        addPin.addEventListener('mouseenter', () => {
            addPin.querySelector('.add-pin-icon').style.transform = 'rotate(90deg)';
        });
        addPin.addEventListener('mouseleave', () => {
            addPin.querySelector('.add-pin-icon').style.transform = 'rotate(0deg)';
        });
        
        // Navigation action
        addPin.addEventListener('click', function() {
            // Show upload page
            document.getElementById('upload-page').classList.add('active');
            document.getElementById('explore-page').classList.remove('active');
            document.getElementById('profile-page').classList.remove('active');
            document.getElementById('nav-explore').classList.remove('active');
            document.getElementById('nav-profile').classList.remove('active');
            document.getElementById('bottom-nav').classList.remove('visible');
        });
        
        profileGallery.appendChild(addPin);
    }
    
    // Load profile when the module is initialized
    loadProfile();
    
    // Return methods that can be called from outside
    return {
        refresh: loadProfile
    };
}