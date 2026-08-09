// ═══════════════════════════════════════════════════════
// CONFIG · Supabase endpoint + end-to-end-encryption tuning
// The publishable key is meant to be public; Row-Level-Security +
// client-side AES-GCM keep the actual data private (zero-knowledge).
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = 'https://gnxwxoficcptpbrsltsx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ltyvis3q0kKCOvj0nsQw6g_nEXCgDck';

// Domain-separation string mixed into the per-user salt (public, not a secret).
const APP_PEPPER = 'lifeos.e2ee.v1';

// PBKDF2 work factor for deriving keys from the password.
const KDF_ITERATIONS = 210000;

// How long after the last change before an encrypted snapshot is pushed.
const SYNC_DEBOUNCE_MS = 4000;
