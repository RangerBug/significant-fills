// ---------------------------------------------------------------------------
// scoring.js
//
// The bonus-scoring system for "special" bottle numbers. This is the one
// place category rules live — to add a new category (prime, Fibonacci,
// round-number, whatever), you add one entry to SCORE_CATEGORIES and
// nothing else needs to change.
//
// How the math works (per your spec):
//   - Each category a number qualifies for contributes its `points` to a sum.
//   - The final bonus is that sum multiplied by *how many* categories matched.
//   - A number matching zero categories gets a bonus of 0.
//   - A number matching one category just gets that category's points
//     (sum * 1 = sum).
//   - A number matching multiple categories gets rewarded extra for the
//     overlap: e.g. two categories worth 5 and 10 -> (5 + 10) * 2 = 30.
// ---------------------------------------------------------------------------

/**
 * Each rule is: { id, label, points, test(n) -> boolean }
 *   id     - stable short key (used in code, not shown to users)
 *   label  - human-readable name shown in the UI (e.g. as a little badge)
 *   points - the base point value this category is worth
 *   test   - given a fill number, returns true if it qualifies
 *
 * To add a category later: add an object here. Nothing in models.js,
 * main.js, or profile.js needs to know how the test works.
 */
const SCORE_CATEGORIES = [
  {
    id: 'palindrome',
    label: 'Palindrome',
    points: 5,
    test: (n) => isPalindrome(n)
  },
  {
    id: 'milestone-1000',
    label: 'Milestone',
    points: 10,
    test: (n) => n > 0 && n % 1000 === 0
  }
];

/** True if `n` reads the same forwards and backwards (e.g. 232, 1001). */
function isPalindrome(n) {
  const str = String(n);
  return str === str.split('').reverse().join('');
}

/** All categories a given fill number qualifies for. */
function getMatchedCategories(fillNumber) {
  return SCORE_CATEGORIES.filter(category => category.test(fillNumber));
}

/**
 * The bonus score for a fill number: sum of matched categories' points,
 * multiplied by the number of categories matched. Returns 0 if none match.
 */
function calculateCategoryBonus(fillNumber) {
  const matched = getMatchedCategories(fillNumber);
  if (matched.length === 0) return 0;

  const pointSum = matched.reduce((total, category) => total + category.points, 0);
  return pointSum * matched.length;
}