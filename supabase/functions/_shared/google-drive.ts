// Shared Google Drive helpers (Phase CX.2).
// Used by context-save-drive and tts-save-drive. Centralizes RS256 JWT signing,
// OAuth2 token exchange, multipart upload to a Shared Drive, and anyone-with-link sharing.
//
// Do NOT inline this logic into edge functions — duplication caused divergent
// JWT handling between tts-save-drive and context-save-drive in CX.1.

const SHARED_DRIVE_PARENT = '0AHOa_eCfO3arUk9PVA'; // Srangam Shared Drive

function base64UrlEncode(data: ArrayBuffer | string): string {
  const bytes =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  const pemContents = pemKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

export interface ServiceAccount {
  client_email: string;
  private_key: string;
}

export async function getDriveAccessToken(
  serviceAccount: ServiceAccount,
  scope = 'https://www.googleapis.com/auth/drive.file',
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput),
  );
  const jwt = `${signatureInput}.${base64UrlEncode(signatureBuffer)}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Google OAuth2 token exchange failed: ${errorText}`);
  }
  const { access_token } = await resp.json();
  return access_token as string;
}

export interface UploadOptions {
  accessToken: string;
  fileName: string;
  mimeType: string;
  // Either a base64 string (for binary like audio) OR raw text content.
  body: { kind: 'base64'; data: string } | { kind: 'text'; data: string };
  parentFolderId?: string;
  shareAnyone?: boolean;
}

export interface UploadResult {
  fileId: string;
  shareUrl: string;
}

export async function uploadToDrive(opts: UploadOptions): Promise<UploadResult> {
  const parents = [opts.parentFolderId ?? SHARED_DRIVE_PARENT];
  const metadata = { name: opts.fileName, mimeType: opts.mimeType, parents };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const bodyHeader =
    opts.body.kind === 'base64'
      ? `Content-Type: ${opts.mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`
      : `Content-Type: ${opts.mimeType}\r\n\r\n`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    bodyHeader +
    opts.body.data +
    closeDelimiter;

  const uploadResp = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    },
  );

  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    throw new Error(`Drive upload failed [${uploadResp.status}]: ${text}`);
  }

  const driveFile = await uploadResp.json();
  const fileId = driveFile.id as string;

  if (opts.shareAnyone !== false) {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${opts.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      },
    );
  }

  return {
    fileId,
    shareUrl: `https://drive.google.com/file/d/${fileId}/view`,
  };
}

export function loadServiceAccount(envVar = 'GOOGLE_SERVICE_ACCOUNT_JSON'): ServiceAccount {
  const raw = Deno.env.get(envVar);
  if (!raw) throw new Error(`${envVar} is not configured`);
  return JSON.parse(raw) as ServiceAccount;
}
