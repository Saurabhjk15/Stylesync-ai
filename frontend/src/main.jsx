import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { store } from './redux/store.js';
import './index.css';

// Google Client ID — set VITE_GOOGLE_CLIENT_ID in frontend/.env
// To get this: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs
// Create a "Web application" type, add http://localhost:5173 and http://localhost:3000 to AUTHORIZED ORIGINS
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>,
);
