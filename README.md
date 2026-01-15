# Zoomerrrrlive / Transcripter

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![React](https://img.shields.io/badge/frontend-React_19-61DAFB.svg?logo=react)
![Node](https://img.shields.io/badge/backend-Node.js-339933.svg?logo=node.js)
![LiveKit](https://img.shields.io/badge/video-LiveKit-F63660.svg)

**Zoomerrrrlive** (also known as Transcripter) is a next-generation video conferencing platform built for the modern era. It combines high-definition video calling with real-time AI transcription, secure authentication, and a futuristic, glassmorphism-inspired user interface.

## 🚀 Key Features

-   **HD Video Calls**: Crystal clear real-time video and audio communication powered by [LiveKit](https://livekit.io/).
-   **Real-time AI Transcription**: Instant speech-to-text processing for meetings, ensuring you never miss a word.
-   **Secure Authentication**: Robust user management using JWT and BCrypt for secure login and registration.
-   **Interactive Dashboard**: A comprehensive dashboard to manage meetings, view call history, and access team analytics.
-   **Smart Scheduling**: Integrated tools for scheduling upcoming meetings.
-   **Modern UI/UX**: A fully responsive, dark-themed interface featuring glassmorphism effects, smooth animations (Framer Motion), and a premium aesthetic.
-   **Team Collaboration**: Tools for chat, breakout rooms, and team status visibility.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React 19 (Vite)
-   **Styling**: Tailwind CSS, Tailwind Merge
-   **Animations**: Framer Motion
-   **Real-time**: Socket.io-client, LiveKit React Components
-   **Routing**: React Router DOM
-   **Icons**: Lucide React
-   **State Management**: Context API

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Real-time**: Socket.io, LiveKit Server SDK
-   **Authentication**: JSON Web Tokens (JWT), BCrypt.js
-   **AI Integration**: OpenRouter / Custom AI endpoints

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas)
-   [Git](https://git-scm.com/)

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/zoomerrrrlive.git
    cd zoomerrrrlive
    ```

2.  **Backend Setup**
    Navigate to the server directory and install dependencies:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and configure your environment variables (see [Environment Variables](#environment-variables)).
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**
    Navigate to the client directory and install dependencies:
    ```bash
    cd ../client
    npm install
    ```
    Create a `.env` file in the `client` directory if needed.
    Start the development server:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🔐 Environment Variables

### Server (`server/.env`)
Create a `.env` file in the `server` folder with the following keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/zoomerrrrlive
JWT_SECRET=your_jwt_secret_key
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Client (`client/.env`)
Create a `.env` file in the `client` folder with the following keys:
```env
VITE_API_URL=http://localhost:5000/api
VITE_LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add some NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the **ISC License**.

---
*Built with ❤️ by the Zoomerrrrlive Team.*
