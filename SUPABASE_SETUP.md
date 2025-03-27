# Supabase Setup Guide for GhibliPin

This guide will walk you through setting up Supabase as a backend for your GhibliPin application.

## 1. Create a Supabase Account & Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign up for a free account
2. Create a new project with a name like "ghiblipin"
3. Note your project URL and anon/public key (you'll need these later)

## 2. Set Up Database Table

Create a table to store image posts:

1. In the Supabase dashboard, go to **Table Editor**
2. Click **New Table**
3. Use the following settings:
   - **Name**: `ghibli_posts`
   - **Enable Row Level Security**: ✓
   - **Columns**:
     - `id` (int8, primary key)
     - `created_at` (timestamp with time zone, default: now())
     - `twitter_username` (text, not null)
     - `title` (text, not null)
     - `image_url` (text, not null)
4. Click **Save**

## 3. Set Up Storage Bucket

Create a storage bucket for the images:

1. Go to **Storage** in the sidebar
2. Click **Create a new bucket**
3. Name it `ghibli-images`
4. Enable public access: ✓
5. Click **Create bucket**

## 4. Set Up Storage Permissions

We need to create a policy to allow public uploads:

1. Click on the `ghibli-images` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For full customization** and use these settings:
   - **Policy name**: `Allow public uploads`
   - **Allowed operations**: `INSERT, SELECT`
   - **Policy definition**: `true` (allows anyone to upload)
5. Click **Save policy**

## 5. Update Environment Variables

Add your Supabase credentials to the `.env` file:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=3000
```

## 6. Deploy Your App

### Option 1: Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access your app at `http://localhost:3000`

### Option 2: Deploy to Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. Deploy using Vercel CLI:
   ```bash
   vercel
   ```

3. Set up environment variables in the Vercel dashboard

### Option 3: Deploy to Netlify

1. Install Netlify CLI (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy using Netlify CLI:
   ```bash
   netlify deploy
   ```

3. Set up environment variables in the Netlify dashboard

## Troubleshooting

1. **CORS Issues**: If you encounter CORS errors, go to your Supabase project settings and add your website URL to the allowed domains
2. **Upload Errors**: Check storage bucket permissions
3. **Image Loading Issues**: Verify the public URLs are correct