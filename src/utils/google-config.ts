// 🔑 Google APIs Configuration
// Configurazione per OAuth, Sheets API e Drive API

import { GoogleAuth } from 'google-auth-library';

// ==================== GOOGLE OAUTH CONFIG ====================

export const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
  redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback',
};

// Scopes richiesti per l'applicazione
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

// ==================== SHEETS API CONFIG ====================

export const SHEETS_CONFIG = {
  // Template del workbook per ogni utente
  WORKBOOK_NAME: 'Expense Tracker Pro - {userName}',
  
  // Nomi dei fogli nel workbook
  SHEET_NAMES: {
    TRIPS: 'Trips',
    EXPENSES: 'Expenses', 
    PEOPLE: 'People',
    SHARED_ACCESS: 'Shared_Access',
    SETTINGS: 'Settings',
  },
  
  // Headers per ogni foglio
  SHEET_HEADERS: {
    TRIPS: [
      'id', 'name', 'description', 'startDate', 'endDate', 
      'people', 'createdBy', 'createdAt', 'updatedAt'
    ],
    EXPENSES: [
      'id', 'tripId', 'description', 'amount', 'paidBy',
      'participants', 'category', 'date', 'isSettled', 
      'createdAt', 'updatedAt'
    ],
    PEOPLE: [
      'id', 'name', 'email', 'avatar', 'createdAt'
    ],
    SHARED_ACCESS: [
      'tripId', 'sharedWith', 'permission', 'sharedAt', 'status'
    ],
    SETTINGS: [
      'key', 'value', 'updatedAt'
    ],
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Inizializza il client Google Auth per il browser
 */
export const initializeGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Auth can only be initialized in browser'));
      return;
    }

    // Carica Google API script
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2:client:picker', () => {
          window.gapi.client.init({
            apiKey: GOOGLE_CONFIG.apiKey,
            clientId: GOOGLE_CONFIG.clientId,
            discoveryDocs: [
              'https://sheets.googleapis.com/\/rest?version=v4',
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ],
            scope: GOOGLE_SCOPES.join(' ')
          }).then(resolve).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      resolve(window.gapi.auth2.getAuthInstance());
    }
  });
};

/**
 * Effettua il login con Google
 */
export const signInWithGoogle = async () => {
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    
    return {
      accessToken: user.getAuthResponse().access_token,
      profile: {
        id: user.getBasicProfile().getId(),
        name: user.getBasicProfile().getName(),
        email: user.getBasicProfile().getEmail(),
        imageUrl: user.getBasicProfile().getImageUrl(),
      }
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw new Error('Errore durante il login con Google');
  }
};

/**
 * Effettua il logout da Google
 */
export const signOutFromGoogle = async () => {
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  } catch (error) {
    console.error('Google sign out error:', error);
    throw new Error('Errore durante il logout');
  }
};

/**
 * Verifica se l'utente è autenticato
 */
export const isUserSignedIn = () => {
  if (typeof window === 'undefined' || !window.gapi) return false;
  
  const authInstance = window.gapi.auth2.getAuthInstance();
  return authInstance && authInstance.isSignedIn.get();
};

/**
 * Ottiene il token di accesso corrente
 */
export const getCurrentAccessToken = () => {
  if (!isUserSignedIn()) return null;
  
  const authInstance = window.gapi.auth2.getAuthInstance();
  const user = authInstance.currentUser.get();
  return user.getAuthResponse().access_token;
};

/**
 * Ottiene le informazioni del profilo utente corrente
 */
export const getCurrentUserProfile = () => {
  if (!isUserSignedIn()) return null;
  
  const authInstance = window.gapi.auth2.getAuthInstance();
  const user = authInstance.currentUser.get();
  const profile = user.getBasicProfile();
  
  return {
    id: profile.getId(),
    name: profile.getName(),
    email: profile.getEmail(),
    imageUrl: profile.getImageUrl(),
  };
};

// ==================== TYPE DEFINITIONS ====================

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export interface GoogleAuthResponse {
  accessToken: string;
  profile: GoogleUserProfile;
}

// ==================== ERROR HANDLING ====================

export class GoogleAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'GoogleAPIError';
  }
}

export const handleGoogleAPIError = (error: any): GoogleAPIError => {
  console.error('Google API Error:', error);
  
  if (error.status === 401) {
    return new GoogleAPIError('Token di accesso scaduto. Effettua nuovamente il login.', 'UNAUTHORIZED', 401);
  }
  
  if (error.status === 403) {
    return new GoogleAPIError('Permessi insufficienti per questa operazione.', 'FORBIDDEN', 403);
  }
  
  if (error.status === 429) {
    return new GoogleAPIError('Troppo richieste API. Riprova tra qualche minuto.', 'RATE_LIMITED', 429);
  }
  
  return new GoogleAPIError(error.message || 'Errore sconosciuto delle API Google', 'UNKNOWN');
};

// ==================== DEVELOPMENT HELPERS ====================

export const isDevelopment = process.env.NODE_ENV === 'development';

export const logGoogleAPICall = (endpoint: string, data?: any) => {
  if (isDevelopment) {
    console.log(\[Google API] \\, data);
  }
};
