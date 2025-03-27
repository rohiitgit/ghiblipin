# GhibliPin

A simple web application for sharing Ghibli-style transformations of photos. Users can upload their Ghibli-style images, which are displayed in a Pinterest-like layout. The application identifies users by their Twitter username without requiring traditional account creation.

## Features

- Upload Ghibli-style images with Twitter username identification
- Discover page to view recent uploads from all users
- Profile page showing all uploads from a specific user
- Responsive design for mobile and desktop

## Project Structure

```
ghiblipin/
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── server.js               # Simple server for development
├── public/                 # Static files
│   ├── index.html          # Main HTML file
│   ├── css/                
│   │   └── styles.css      # Main stylesheet
│   ├── js/                 
│   │   ├── config.js       # Loads environment variables safely
│   │   ├── app.js          # Main application logic
│   │   ├── upload.js       # Upload functionality
│   │   ├── explore.js      # Explore page functionality
│   │   └── profile.js      # Profile page functionality
│   └── assets/             
│       └── placeholder.png # Default profile image
└── SUPABASE_SETUP.md       # Supabase setup instructions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Supabase account (free tier works)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ghiblipin.git
   cd ghiblipin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

4. Set up Supabase by following the instructions in `SUPABASE_SETUP.md`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

For deployment options, refer to `SUPABASE_SETUP.md`

## Built With

- Vanilla JavaScript - Frontend
- Express.js - Backend server
- Supabase - Database and storage
- Parcel - Bundler

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Pinterest
- Studio Ghibli for their beautiful art style
- The latest OpenAI trend