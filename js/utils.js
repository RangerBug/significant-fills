// ---------------------------------------------------------------------------
// utils.js
//
// Helper functions used by both pages (index and profile).
// Plain text/data manipulation.
// ---------------------------------------------------------------------------

const USERNAME_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

/**
 * Escapes HTML-sensitive characters so untrusted text (from the CSV/Google
 * Form) can't inject markup into the page.
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[&<>"']/g, (char) => {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[char];
    })
    .trim();
}

/**
 * Turns raw CSV text into an array of plain row objects, e.g.
 *   [{ Username: 'Will', SigFill: 'Bottle 42', Comments: '...', Timestamp: '...' }, ...]
 */
function parseCSV(csv) {
  const lines = csv.split('\n').filter(l => l.trim().length > 0);

  // Commas inside quoted fields shouldn't be treated as column separators.
  // We temporarily swap them out, split on commas, then swap them back.
  const safeLines = lines.map(line =>
    line.replace(/"([^"]*)"/g, (match, group) =>
      `"${group.replace(/,/g, '&#44;')}"`
    )
  );

  const headers = safeLines[0].split(',').map(h => h.trim());
  return safeLines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/&#44;/g, ','));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim();
    });
    return row;
  });
}

/**
 * Formats an ISO-ish timestamp string into something readable, e.g. "Aug 3, 2:14 PM".
 * Returns '' if the timestamp is missing or unparseable.
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Normalizes a username for comparison/grouping purposes, so "Willie" and
 * "willie" (or "  willie  ") are recognized as the same person. This is
 * only ever used as a lookup key — the original casing typed by the user
 * is still what gets displayed.
 */
function usernameKey(username) {
  return (username || '').trim().toLowerCase();
}

/** Deterministically maps a username to a color from USERNAME_COLORS. */
function colorForUsername(username) {
  const key = usernameKey(username);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USERNAME_COLORS.length;
  return USERNAME_COLORS[index];
}