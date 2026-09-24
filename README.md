# B2QR MERN Project

This project has:
- Frontend: Vite + React in the client folder
- Backend: Express + MongoDB in the server folder

## Important files to keep

- client/src/App.jsx: main QR generator logic
- client/src/components/: UI components
- client/src/utils/qrUtils.js: QR formatting helpers
- server/server.js: API entry point
- server/controller.js: CRUD logic for saved prefixes
- server/prefix.model.js: Mongo schema
- server/connectDB.js: Mongo connection

## Local development

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install frontend and backend dependencies:
   ```bash
   npm install --prefix client
   npm install --prefix server
   ```

3. Copy the environment examples and fill your values:
   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

4. Start both apps:
   ```bash
   npm run dev
   ```

This runs the backend on port 5000 and the frontend on the Vite default port 5173.

## Deployment to Render (backend)

1. Push this project to GitHub.
2. In Render, click New > Web Service.
3. Connect your GitHub repository.
4. Choose the root project folder.
5. Set these values:
   - Build Command: `npm install --prefix server`
   - Start Command: `npm start --prefix server`
   - Environment Variables:
     - `PORT=10000` (Render sets this automatically, but you can keep 10000 for safety)
     - `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db-name>?retryWrites=true&w=majority`
     - `CLIENT_URL=https://your-frontend-domain.vercel.app`

6. Save and deploy.
7. Render will give you a backend URL like:
   `https://your-app-name.onrender.com`

## Deployment to Vercel (frontend)

1. In Vercel, import the GitHub repository.
2. Set the root directory to `client`.
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variable:
   - `VITE_SERVER_URL=https://your-app-name.onrender.com`
7. Deploy.

## Avoiding the common Mongo/port issues

- Do not hardcode `localhost:3000` in production.
- Use `PORT` from the hosting platform instead of a fixed port.
- Never commit your real `.env` file with the Mongo URI.
- Keep the backend listening on `0.0.0.0` for Render.
- Make sure MongoDB Atlas allows connections from Render and Vercel IPs or uses the Atlas network access whitelist.

## Notes

- The backend uses `/health` for server health checks.
- The frontend uses `VITE_SERVER_URL` and falls back to `http://localhost:5000` locally.
