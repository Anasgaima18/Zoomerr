# Deploying Zoomerr to Render

This guide provides step-by-step instructions to verify your deployment setup locally and deploy to Render.com.

## 1. Local Verification

Before pushing to production, verify that the build process works locally.

1.  **Stop running servers**: if you have `npm run dev` running.
2.  **Build the Client**:
    ```bash
    npm run build
    ```
    This should install client dependencies and create a `dist` folder in `client/`.
3.  **Start the Server**:
    ```bash
    npm start
    ```
    This runs `node server/src/index.js`.
4.  **Verify**: Open `http://localhost:5000` (or your PORT). You should see your React app, not just "API is Running".

## 2. Deploying to Render

### Option A: Blueprints (Recommended)

1.  Push your code to GitHub/GitLab.
2.  Go to the [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Blueprint**.
4.  Connect your repository.
5.  Render will automatically read the `render.yaml` file and configure the service.
6.  **Important**: You will need to fill in the Environment Variables (MONGO_URI, secrets, etc.) in the Render dashboard before the deployment will succeed.

### Option B: Manual Setup

1.  Create a new **Web Service**.
2.  Connect your repository.
3.  **Build Command**: `npm run build`
    *   *Note: This runs the script in the root `package.json` which builds the client.*
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    You must add the following **8 keys** in the Render Dashboard:

    | Key | Value to Enter |
    | :--- | :--- |
    | `MONGO_URI` | Your MongoDB Connection String |
    | `JWT_SECRET` | Your Secret Key |
    | `LIVEKIT_URL` | Your LiveKit Project URL (e.g., `wss://...`) |
    | `LIVEKIT_API_KEY` | Your LiveKit API Key |
    | `LIVEKIT_API_SECRET` | Your LiveKit API Secret |
    | `SARVAM_API_KEY` | Your Sarvam AI Key |
    | `OPENROUTER_API_KEY` | Your OpenRouter Key |
    | `VITE_SERVER_URL` | `/` (This is crucial: set exactly to a single forward slash) |

## Troubleshooting

-   **White Screen / 404**: Ensure the `server/src/index.js` is correctly pointing to `../../client/dist`.
-   **API Errors**: specific environment variables might be missing. Check the Render logs.
