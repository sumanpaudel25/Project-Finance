/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppData } from '../types';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const APP_DATA_FILENAME = 'fintrack_pro_data.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Initialize Google API Client
export const initializeGoogleApi = async (clientId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if(!clientId) {
            console.warn("Google Client ID not provided.");
            resolve(false);
            return;
        }

        const gapiLoadPromise = new Promise<void>((innerResolve) => {
            window.gapi.load('client', async () => {
                await window.gapi.client.init({
                    apiKey: process.env.API_KEY, // Optional for Drive, mostly need Token
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                innerResolve();
            });
        });

        const gsiLoadPromise = new Promise<void>((innerResolve) => {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                callback: '', // Defined later at request time
            });
            gisInited = true;
            innerResolve();
        });

        Promise.all([gapiLoadPromise, gsiLoadPromise]).then(() => resolve(true));
    });
};

export const handleLogin = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject("Google Auth not initialized");
            return;
        }

        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                reject(resp);
            }
            resolve(resp.access_token);
        };

        if (window.gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

export const handleLogout = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken(null);
    }
};

// --- Drive Operations ---

// Find the file by name
const findFile = async (): Promise<string | null> => {
    try {
        const response = await window.gapi.client.drive.files.list({
            q: `name = '${APP_DATA_FILENAME}' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        const files = response.result.files;
        if (files && files.length > 0) {
            return files[0].id;
        }
        return null;
    } catch (err) {
        console.error("Error finding file", err);
        return null;
    }
};

// Upload Data (Update existing or Create new)
export const syncToDrive = async (data: AppData): Promise<void> => {
    const fileContent = JSON.stringify(data);
    const fileId = await findFile();

    const metadata = {
        name: APP_DATA_FILENAME,
        mimeType: 'application/json',
    };

    const multipartRequestBody =
        `\r\n--foo_bar_baz\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--foo_bar_baz\r\nContent-Type: application/json\r\n\r\n` +
        fileContent +
        `\r\n--foo_bar_baz--`;

    try {
        if (fileId) {
            // Update existing file
             await window.gapi.client.request({
                path: `/upload/drive/v3/files/${fileId}`,
                method: 'PATCH',
                params: { uploadType: 'multipart' },
                headers: { 'Content-Type': 'multipart/related; boundary=foo_bar_baz' },
                body: multipartRequestBody,
            });
        } else {
            // Create new file
            await window.gapi.client.request({
                path: '/upload/drive/v3/files',
                method: 'POST',
                params: { uploadType: 'multipart' },
                headers: { 'Content-Type': 'multipart/related; boundary=foo_bar_baz' },
                body: multipartRequestBody,
            });
        }
    } catch (e) {
        console.error("Error syncing to drive", e);
        throw e;
    }
};

// Download Data
export const loadFromDrive = async (): Promise<AppData | null> => {
    const fileId = await findFile();
    if (!fileId) return null;

    try {
        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        return response.result as AppData;
    } catch (e) {
        console.error("Error loading from drive", e);
        throw e;
    }
};