// 📊 Google Sheets Service
// Servizio per interagire con Google Sheets API

import { SHEETS_CONFIG, getCurrentAccessToken, handleGoogleAPIError, logGoogleAPICall } from './google-config';
import type { Trip, Person, Expense } from '../types';

// ==================== SHEETS OPERATIONS ====================

/**
 * Crea un nuovo workbook per l'utente
 */
export const createUserWorkbook = async (userName: string): Promise<string> => {
  try {
    logGoogleAPICall('createUserWorkbook', { userName });
    
    const accessToken = getCurrentAccessToken();
    if (!accessToken) throw new Error('Token di accesso non disponibile');

    // 1. Crea il nuovo spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': \Bearer \\,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: SHEETS_CONFIG.WORKBOOK_NAME.replace('{userName}', userName),
        },
        sheets: Object.keys(SHEETS_CONFIG.SHEET_NAMES).map(key => ({
          properties: {
            title: SHEETS_CONFIG.SHEET_NAMES[key as keyof typeof SHEETS_CONFIG.SHEET_NAMES],
          }
        }))
      })
    });

    if (!createResponse.ok) {
      throw new Error(\Errore creazione spreadsheet: \\);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // 2. Inizializza gli headers per ogni foglio
    await initializeSheetHeaders(spreadsheetId);

    return spreadsheetId;
  } catch (error) {
    throw handleGoogleAPIError(error);
  }
};

/**
 * Inizializza gli headers per tutti i fogli
 */
export const initializeSheetHeaders = async (spreadsheetId: string): Promise<void> => {
  try {
    logGoogleAPICall('initializeSheetHeaders', { spreadsheetId });
    
    const accessToken = getCurrentAccessToken();
    if (!accessToken) throw new Error('Token di accesso non disponibile');

    const requests = Object.entries(SHEETS_CONFIG.SHEET_HEADERS).map(([sheetName, headers]) => ({
      updateCells: {
        range: {
          sheetId: getSheetId(sheetName),
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: headers.length,
        },
        rows: [{
          values: headers.map(header => ({
            userEnteredValue: { stringValue: header },
            userEnteredFormat: {
              textFormat: { bold: true },
              backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
            }
          }))
        }],
        fields: 'userEnteredValue,userEnteredFormat'
      }
    }));

    await fetch(\https://sheets.googleapis.com/v4/spreadsheets/\:batchUpdate\, {
      method: 'POST',
      headers: {
        'Authorization': \Bearer \\,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests })
    });
  } catch (error) {
    throw handleGoogleAPIError(error);
  }
};

/**
 * Legge tutti i viaggi dal foglio
 */
export const readTripsFromSheet = async (spreadsheetId: string): Promise<Trip[]> => {
  try {
    logGoogleAPICall('readTripsFromSheet', { spreadsheetId });
    
    const accessToken = getCurrentAccessToken();
    if (!accessToken) throw new Error('Token di accesso non disponibile');

    const response = await fetch(
      \https://sheets.googleapis.com/v4/spreadsheets/\/values/\!A2:Z\,
      {
        headers: { 'Authorization': \Bearer \\ }
      }
    );

    if (!response.ok) throw new Error(\Errore lettura viaggi: \\);
    
    const data = await response.json();
    const rows = data.values || [];

    return rows.map((row: string[]) => ({
      id: row[0] || '',
      name: row[1] || '',
      description: row[2] || '',
      startDate: row[3] || '',
      endDate: row[4] || '',
      people: row[5] ? JSON.parse(row[5]) : [],
      createdBy: row[6] || '',
      createdAt: row[7] || '',
      updatedAt: row[8] || '',
    })).filter(trip => trip.id); // Filtra righe vuote
  } catch (error) {
    throw handleGoogleAPIError(error);
  }
};

/**
 * Scrive un nuovo viaggio nel foglio
 */
export const writeTripsToSheet = async (spreadsheetId: string, trips: Trip[]): Promise<void> => {
  try {
    logGoogleAPICall('writeTripsToSheet', { spreadsheetId, tripsCount: trips.length });
    
    const accessToken = getCurrentAccessToken();
    if (!accessToken) throw new Error('Token di accesso non disponibile');

    const values = trips.map(trip => [
      trip.id,
      trip.name,
      trip.description || '',
      trip.startDate,
      trip.endDate,
      JSON.stringify(trip.people),
      trip.createdBy,
      trip.createdAt,
      trip.updatedAt,
    ]);

    await fetch(
      \https://sheets.googleapis.com/v4/spreadsheets/\/values/\!A2:I\,
      {
        method: 'PUT',
        headers: {
          'Authorization': \Bearer \\,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
          majorDimension: 'ROWS',
        })
      }
    );
  } catch (error) {
    throw handleGoogleAPIError(error);
  }
};

// ==================== HELPER FUNCTIONS ====================

const getSheetId = (sheetName: string): number => {
  const sheetIds: Record<string, number> = {
    [SHEETS_CONFIG.SHEET_NAMES.TRIPS]: 0,
    [SHEETS_CONFIG.SHEET_NAMES.EXPENSES]: 1,
    [SHEETS_CONFIG.SHEET_NAMES.PEOPLE]: 2,
    [SHEETS_CONFIG.SHEET_NAMES.SHARED_ACCESS]: 3,
    [SHEETS_CONFIG.SHEET_NAMES.SETTINGS]: 4,
  };
  return sheetIds[sheetName] || 0;
};

/**
 * Verifica se un spreadsheet esiste ed è accessibile
 */
export const verifySpreadsheetAccess = async (spreadsheetId: string): Promise<boolean> => {
  try {
    const accessToken = getCurrentAccessToken();
    if (!accessToken) return false;

    const response = await fetch(
      \https://sheets.googleapis.com/v4/spreadsheets/\\,
      {
        headers: { 'Authorization': \Bearer \\ }
      }
    );

    return response.ok;
  } catch {
    return false;
  }
};
