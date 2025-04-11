# YouTube-Twitter Hybrid Application

A full-stack social media application that combines features from YouTube and Twitter, built with modern web technologies.

## Features

### Backend (Node.js + Express)
- User Authentication (JWT)
- Video Upload and Streaming
- Tweet Creation and Management
- Like/Unlike Videos and Tweets
- Comments on Videos
- User Profiles
- Subscriptions
- Cloudinary Integration for Media Storage

### Frontend (React + Redux)
- Modern UI with Tailwind CSS
- Video Player
- Tweet Feed
- User Authentication
- Responsive Design
- Real-time Updates
- Protected Routes

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Cloudinary
- Multer
- Bcrypt

### Frontend
- React
- Redux Toolkit
- React Query
- React Router
- Tailwind CSS
- Axios

## Project Structure
```
MERN-Video-Streamer/
├── backend/           # Backend server code
│   ├── src/          # Source code
│   ├── public/       # Public assets
│   └── package.json  # Backend dependencies
└── frontend/         # Frontend React application
    ├── src/          # Source code
    └── package.json  # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary Account
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/itsAadi1/MERN-Video-Streamer.git
cd MERN-Video-Streamer
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create a .env file in the backend directory with the following variables:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
```

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

5. Create a .env file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1

## API Endpoints

### Authentication
- POST /users/register - Register a new user
- POST /users/login - Login user
- POST /users/logout - Logout user
- GET /users/current-user - Get current user

### Videos
- GET /videos - Get all videos
- GET /videos/:videoId - Get video by ID
- POST /videos - Upload a video
- PATCH /videos/:videoId - Update video
- DELETE /videos/:videoId - Delete video

### Tweets
- GET /tweets - Get all tweets
- POST /tweets - Create a tweet
- DELETE /tweets/:tweetId - Delete a tweet

### Likes
- POST /likes/toggle/v/:videoId - Toggle video like
- POST /likes/toggle/t/:tweetId - Toggle tweet like

### Comments
- POST /comments/:videoId - Add comment to video
- DELETE /comments/:commentId - Delete comment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Contact

Aadarsh Kumar Jha - [GitHub](https://github.com/itsAadi1)

Project Link: [https://github.com/itsAadi1/MERN-Video-Streamer](https://github.com/itsAadi1/MERN-Video-Streamer)