/**
 * zerog.js — API layer for Doge Escape 0G backend.
 * Base URL: VITE_API_URL or https://dogescape.onrender.com
 */

const BASE    = import.meta.env.VITE_API_URL || 'https://dogescape.onrender.com';
export const JWT_KEY    = 'ZGJwt';
export const WALLET_KEY = 'ZGWallet';

// ── JWT helpers ───────────────────────────────────────────────────────────────

export function getCachedJwt() {
  try {
    const token = localStorage.getItem(JWT_KEY);
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < payload.exp * 1000 - 5 * 60 * 1000 ? token : null;
  } catch {
    return null;
  }
}

/** Returns cached JWT only if it belongs to the given wallet address */
export function getJwtForWallet(wallet) {
  try {
    const token = localStorage.getItem(JWT_KEY);
    if (!token || !wallet) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (Date.now() >= payload.exp * 1000 - 5 * 60 * 1000) return null;
    const tokenWallet  = (payload.wallet || '').toLowerCase();
    const inputWallet  = wallet.toLowerCase();
    return tokenWallet === inputWallet ? token : null;
  } catch {
    return null;
  }
}

export function clearJwt() {
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(WALLET_KEY);
}

// ── Internal fetch ────────────────────────────────────────────────────────────

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let msg = `${res.status}`;
    try { const b = await res.json(); msg = b.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

function authHeaders(jwt) {
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────

// No-signature auth for DogeOS/Dogecoin wallets
export async function walletLogin(wallet) {
  return req('/auth/wallet-login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ wallet })
  });
}

export async function getNonce(wallet) {
  return req(`/auth/nonce?wallet=${encodeURIComponent(wallet)}`);
}

export async function login(wallet, signature, nonce) {
  return req('/auth/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ wallet, signature, nonce })
  });
}

/**
 * Dual-track auth flow.
 *
 * Works for both:
 *   - EVM wallets (0x...):      Ethereum SIWE — signMessage returns 0x hex signature
 *   - Dogecoin wallets (D...):  Dogecoin signed message — signMessage returns base64 signature
 *
 * signMessage: async (message: string) => string
 */
export async function authenticate(wallet, signMessage) {
  if (!wallet) return null;

  const isEvm  = /^0x[0-9a-fA-F]{40}$/.test(wallet);
  const isDoge = /^[DA][1-9A-HJ-NP-Za-km-z]{24,33}$/.test(wallet);

  if (!isEvm && !isDoge) {
    console.warn('[0G] Unsupported wallet format:', wallet);
    return null;
  }

  try {
    const { message, nonce } = await getNonce(wallet);
    const signature           = await signMessage(message);
    const { token }           = await login(wallet, signature, nonce);

    // EVM: store lowercase; Dogecoin: store as-is (case-sensitive)
    const stored = isEvm ? wallet.toLowerCase() : wallet;
    localStorage.setItem(JWT_KEY,    token);
    localStorage.setItem(WALLET_KEY, stored);
    return token;
  } catch (err) {
    console.warn('[0G] Auth failed:', err.message);
    return null;
  }
}

// ── BCSV binary deserializer ──────────────────────────────────────────────────

/**
 * Deserialize a BCSV binary buffer into a plain JS object.
 *
 * Wire format:
 *   [4 bytes] Magic: 0x42 0x43 0x53 0x56  ("BCSV")
 *   [1 byte]  Version: 0x01
 *   [N bytes] UTF-8 JSON payload
 *
 * Returns null if the buffer is not a valid BCSV file.
 */
export function deserializeBCSV(arrayBuffer) {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    if (bytes.length < 5) return null;
    if (bytes[0] !== 0x42 || bytes[1] !== 0x43 || bytes[2] !== 0x53 || bytes[3] !== 0x56) return null;
    if (bytes[4] !== 0x01) return null;
    const json = new TextDecoder('utf-8').decode(bytes.slice(5));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── Save / Load ───────────────────────────────────────────────────────────────

export async function saveBinary(buffer, jwt) {
  const res = await fetch(`${BASE}/player/save/binary`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/octet-stream',
      Authorization:   `Bearer ${jwt}`,
    },
    body: buffer
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
}

export async function loadBinary(jwt) {
  const res = await fetch(`${BASE}/player/load/binary`, {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  if (!res.ok) throw new Error(`Load failed: ${res.status}`);
  return {
    buffer:    await res.arrayBuffer(),
    rootHash:  res.headers.get('X-Root-Hash')   || '',
    saveIndex: res.headers.get('X-Save-Index')  || '0',
    daStatus:  res.headers.get('X-Da-Status')   || 'pending',
    checksum:  res.headers.get('X-Checksum-Sha256') || ''
  };
}

export async function getMetadata(wallet) {
  return req(`/player/save/metadata?wallet=${encodeURIComponent(wallet)}`);
}

export async function verify(wallet) {
  return req(`/player/verify?wallet=${encodeURIComponent(wallet)}`);
}

export async function getDecentralizedLeaderboard() {
  return req('/player/leaderboard/decentralized');
}

// ── 0G Dashboard / UX ────────────────────────────────────────────────────────

export async function getDashboard(jwt) {
  return req('/0g/dashboard', { headers: authHeaders(jwt) });
}

export async function getActivity(jwt, page = 1, limit = 20) {
  return req(`/0g/activity?page=${page}&limit=${limit}`, { headers: authHeaders(jwt) });
}

export async function getBadge(jwt) {
  return req('/0g/badge', { headers: authHeaders(jwt) });
}

export async function getSaveHistory(jwt, page = 1, limit = 20) {
  return req(`/0g/player/history?page=${page}&limit=${limit}`, { headers: authHeaders(jwt) });
}

export async function getGlobalStats() {
  return req('/0g/stats');
}

export async function getRecentSaves(limit = 20) {
  return req(`/0g/saves/recent?limit=${limit}`);
}

export async function getComputeStats() {
  return req('/0g/compute/stats');
}

export async function getNetworkStatus() {
  return req('/0g/network');
}

export async function getVerifiedLeaderboard(filter = 'finalized') {
  return req(`/0g/leaderboard/verified?filter=${filter}`);
}

export async function getProof(wallet, saveIndex) {
  return req(`/0g/proof/${encodeURIComponent(wallet)}/${saveIndex}`);
}

export async function getWalletExplorer(wallet) {
  return req(`/0g/explorer/${encodeURIComponent(wallet)}`);
}

export async function getPlayerOverview(wallet) {
  return req(`/0g/player/overview/${encodeURIComponent(wallet)}`);
}
