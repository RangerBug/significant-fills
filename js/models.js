// ---------------------------------------------------------------------------
// models.js
//
// Entry and User classes, which are the data model for the app.
// ---------------------------------------------------------------------------

class Entry {
  /**
   * @param {Object} data
   * @param {string} data.username
   * @param {string} data.sigFill   - e.g. "Bottle 42"
   * @param {string} data.comments
   * @param {string} data.timestamp - raw timestamp string from the sheet
   */
  constructor({ username, sigFill, comments, timestamp }) {
    this.username = username || '';
    this.sigFill = sigFill || '';
    this.comments = comments || '';
    this.timestamp = timestamp || '';

    // Not in the spreadsheet yet, but here so the UI and scoring logic
    // already know how to use them once you add a way to set them
    // (e.g. a future "like this fill" button, or a moderator bonus).
    this.likes = 0;
    this.bonusScore = 0;
  }

  /** The numeric bottle number extracted from "Bottle 42" -> 42. */
  get fillNumber() {
    const match = this.sigFill.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /** Every fill is worth 1 point, plus likes, category bonuses, and any manual bonus. */
  get score() {
    return 1 + this.likes + this.bonusScore + this.categoryBonus;
  }

  /** Special-number categories this fill qualifies for (palindrome, milestone, etc). See scoring.js. */
  get matchedCategories() {
    return getMatchedCategories(this.fillNumber);
  }

  /** The bonus points earned from matched categories. See scoring.js for the formula. */
  get categoryBonus() {
    return calculateCategoryBonus(this.fillNumber);
  }

  get hasComments() {
    return Boolean(this.comments && this.comments.trim() !== '');
  }

  /** Human-readable timestamp, e.g. "Aug 3, 2:14 PM". */
  get formattedTimestamp() {
    return formatTimestamp(this.timestamp);
  }
}

class User {
  /** @param {string} username */
  constructor(username) {
    this.username = username;
    this.entries = []; // every Entry this user has submitted
  }

  /** Adds one Entry to this user's history. */
  addEntry(entry) {
    this.entries.push(entry);
  }

  get totalFills() {
    return this.entries.length;
  }

  get totalScore() {
    return this.entries.reduce((sum, entry) => sum + entry.score, 0);
  }

  get totalLikes() {
    return this.entries.reduce((sum, entry) => sum + entry.likes, 0);
  }

  /** The highest bottle number this user has ever filled. */
  get largestFill() {
    return this.entries.reduce((max, entry) => Math.max(max, entry.fillNumber), 0);
  }

  /** This user's entries, most recent first. */
  get sortedEntries() {
    return [...this.entries].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  /** A consistent color for this user, used to color-code their entries. */
  get color() {
    return colorForUsername(this.username);
  }
}