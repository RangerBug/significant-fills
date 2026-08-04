// ---------------------------------------------------------------------------
// dataStore.js
//
// FillTracker: Fetch the CSV, turn each
// row into an Entry, and group entries by username into User objects. Both
// index.html and profile.html create one FillTracker and read from it.
// Only place for CSV-parsing.
// ---------------------------------------------------------------------------

class FillTracker {
  constructor() {
    this.users = new Map();  // lowercased username -> User
    this.entries = [];       // every Entry, in the order they appear in the sheet (oldest first)
  }

  /**
   * Fetches the CSV from `csvUrl`, parses it, and populates `this.entries`
   * and `this.users`. Returns `this` so you can chain:
   *   const tracker = await new FillTracker().loadFromCSV(CSV_URL);
   */
  async loadFromCSV(csvUrl) {
    const response = await fetch(csvUrl);
    const text = await response.text();
    const rows = parseCSV(text);

    rows.forEach(row => {
      const entry = new Entry({
        username: sanitizeText(row.Username),
        sigFill: sanitizeText(row.SigFill),
        comments: sanitizeText(row.Comments),
        timestamp: row.Timestamp
      });
      this.entries.push(entry);
      this._addEntryToUser(entry);
    });

    return this;
  }

  /** Files an Entry under its User, creating the User if needed. */
  _addEntryToUser(entry) {
    const key = usernameKey(entry.username);
    if (!this.users.has(key)) {
      this.users.set(key, new User(entry.username));
    }
    this.users.get(key).addEntry(entry);
  }

  /** Look up one user by username (case-insensitive). Returns `undefined` if they don't exist. */
  getUser(username) {
    return this.users.get(usernameKey(username));
  }

  /** All users as a plain array (handy for sorting/mapping). */
  getAllUsers() {
    return [...this.users.values()];
  }

  /** Top N users by fill count, descending. */
  getLeaderboard(limit = 10) {
    return this.getAllUsers()
      .sort((a, b) => b.totalFills - a.totalFills)
      .slice(0, limit);
  }

  get totalFills() {
    return this.entries.length;
  }

  /** The highest bottle number logged across everyone. */
  get largestFill() {
    return this.entries.reduce((max, entry) => Math.max(max, entry.fillNumber), 0);
  }

  get fillsPerMonth() {
    if (this.entries.length === 0) return '0.0';

    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);

    const recentFills = this.entries.filter(entry => {
      const fillDate = new Date(entry.timestamp);
      return !isNaN(fillDate.getTime()) && fillDate >= fourWeeksAgo;
    });

    if (recentFills.length === 0) return '0.0';

    const fillNumbers = recentFills.map(e => e.fillNumber);
    const bottlesFilled = Math.max(...fillNumbers) - Math.min(...fillNumbers);
    return bottlesFilled.toFixed(0);
  }
}