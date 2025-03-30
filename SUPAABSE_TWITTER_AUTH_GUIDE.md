# Supabase Twitter Auth Setup Guide

To set up Twitter authentication for GhibliPin, follow these steps:

# Supabase Twitter Auth Setup Guide (Updated for Twitter API v2)

## 1. Create Twitter Developer Account & App

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign up for a developer account if you don't have one
3. Create a new Project and App with OAuth 2.0 settings
4. Configure the App:
   - Set the App permissions to "Read" (or more if needed)
   - Set the type of App to "Web App"
   - Add the callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. Note your Client ID and Client Secret

## 2. Configure Supabase Auth

1. Go to your Supabase dashboard
2. Navigate to Authentication → Providers
3. Find Twitter in the list of providers and enable it
4. Enter the Client ID and Client Secret from Twitter
5. Save the settings

## 3. Update the Database Schema

Run this SQL in your Supabase SQL Editor to update your `ghibli_posts` table:

```sql
-- Update the existing ghibli_posts table to include Twitter info
ALTER TABLE ghibli_posts 
ADD COLUMN twitter_url TEXT,
ADD COLUMN twitter_avatar TEXT,
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for querying by user_id
CREATE INDEX idx_ghibli_posts_user_id ON ghibli_posts(user_id);

-- Create RLS policies for the updated table
DROP POLICY IF EXISTS "Anyone can view posts" ON ghibli_posts;
DROP POLICY IF EXISTS "Anyone can create posts" ON ghibli_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON ghibli_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON ghibli_posts;

-- Users can view all posts
CREATE POLICY "Anyone can view posts" 
ON ghibli_posts 
FOR SELECT 
USING (true);

-- Users can create posts if authenticated
CREATE POLICY "Users can create posts" 
ON ghibli_posts 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Users can update only their own posts
CREATE POLICY "Users can update their own posts" 
ON ghibli_posts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own posts
CREATE POLICY "Users can delete their own posts" 
ON ghibli_posts 
FOR DELETE 
USING (auth.uid() = user_id);
```

## 4. Deploy Your App

1. Update your `.env` file with your Supabase credentials
2. Deploy your app to Vercel:
   ```bash
   vercel --prod
   ```

3. Configure your environment variables in Vercel:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## 5. Test the Authentication Flow

1. Visit your deployed app
2. Click "Continue with Twitter"
3. Complete the Twitter authentication
4. You should be redirected to the Explore page
5. Try uploading an image to confirm it works with your Twitter identity

## Troubleshooting

- **Callback URL errors**: Make sure the callback URL in Twitter matches your Supabase project exactly
- **Authentication failures**: Check browser console for specific error messages
- **Database errors**: Verify your SQL commands executed correctly in Supabase
- **CORS issues**: Check that your domain is added to the allowed list in Supabase settings