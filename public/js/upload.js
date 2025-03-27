export function initializeUpload(supabaseClient, callbacks) {
    const uploadForm = document.getElementById('upload-form');
    const uploadArea = document.getElementById('upload-area');
    const photoUpload = document.getElementById('photo-upload');
    const imagePreview = document.getElementById('image-preview');
    const twitterUsername = document.getElementById('twitter-username');
    const photoTitle = document.getElementById('photo-title');
    const loading = document.getElementById('loading');
    const uploadMessage = document.getElementById('upload-message');
    
    let selectedFile = null;
    
    // Handle file selection UI
    uploadArea.addEventListener('click', function() {
        photoUpload.click();
    });
    
    photoUpload.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            selectedFile = this.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(selectedFile);
        }
    });
    
    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!selectedFile) {
            uploadMessage.textContent = 'Please select an image to upload';
            uploadMessage.className = 'message error';
            uploadMessage.style.display = 'block';
            return;
        }
        
        const username = twitterUsername.value.trim();
        const title = photoTitle.value.trim();
        
        if (!username || !title) {
            uploadMessage.textContent = 'Please fill in all fields';
            uploadMessage.className = 'message error';
            uploadMessage.style.display = 'block';
            return;
        }
        
        uploadMessage.style.display = 'none';
        loading.style.display = 'block';
        
        try {
            // 1. Upload the image to Supabase Storage
            const filename = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { data: fileData, error: fileError } = await supabaseClient.storage
                .from('ghibli-images')
                .upload(`public/${filename}`, selectedFile);
            
            if (fileError) throw fileError;
            
            // 2. Get the public URL for the uploaded image
            const { data: { publicUrl } } = supabaseClient.storage
                .from('ghibli-images')
                .getPublicUrl(`public/${filename}`);
            
            // 3. Insert a record into the database
            const { data, error } = await supabaseClient
                .from('ghibli_posts')
                .insert([
                    {
                        twitter_username: username,
                        title: title,
                        image_url: publicUrl,
                        created_at: new Date()
                    }
                ]);
            
            if (error) throw error;
            
            // Success!
            uploadMessage.textContent = 'Your Ghibli creation has been shared!';
            uploadMessage.className = 'message success';
            uploadMessage.style.display = 'block';
            
            // Reset form
            uploadForm.reset();
            imagePreview.innerHTML = '<p>Preview will appear here</p>';
            selectedFile = null;
            
            // Call success callback
            if (callbacks && callbacks.onUploadSuccess) {
                callbacks.onUploadSuccess(username);
            }
            
        } catch (error) {
            console.error('Error:', error);
            uploadMessage.textContent = 'Error uploading image. Please try again.';
            uploadMessage.className = 'message error';
            uploadMessage.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    });
}