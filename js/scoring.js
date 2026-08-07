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
| Category                        | Approx. Count (10k–20k) | Odds       |               Score | Notes                  |
| ------------------------------- | ----------------------: | ---------- | ------------------: | ---------------------- |
| Prime                           |                   ~1030 | 1 in 10    |               **5** | Common bonus           |
| Sum of digits = 25              |             ~550 (est.) | 1 in 18    |               **6** | Nice little bonus      |
| Contains three identical digits |                    ~350 | 1 in 29    |               **8** | e.g. 11123, 17771      |
| Palindrome                      |                     100 | 1 in 100   |              **10** | Instantly recognizable |
| Perfect square                  |                      42 | 1 in 238   |              **15** | Mathematical milestone |
| All digits unique               |                   ~3000 | 1 in 3     | **Not recommended** | Too common             |
| Cube number                     |                       6 | 1 in 1667  |              **25** | 22³–27³                |
| Thousand milestone              |                      10 | 1 in 1000  |              **30** | 10000, 11000, …        |
| Triangular number               |                     ~31 | 1 in 323   |              **30** | Nice hidden pattern    |
| Repdigit                        |                       1 | 1 in 10000 |              **60** | Only **11111**         |
| Sequential digits               |                       1 | 1 in 10000 |              **75** | Only **12345**         |
| Fibonacci                       |                       1 | 1 in 10000 |              **90** | **10946**              |
| Power of 2                      |                       1 | 1 in 10000 |             **100** | **16384**              |
*/

/**
 * Each rule is: { id, label, points, test(n) -> boolean }
 *   id     - stable short key (used in code, not shown to users)
 *   label  - human-readable name shown in the UI (e.g. as a little badge)
 *   points - the base point value this category is worth
 *   test   - given a fill number, returns true if it qualifies
 */
const SCORE_CATEGORIES = [
  {
    id: 'palindrome',
    label: 'Palindrome',
    points: 10,
    test: (n) => isPalindrome(n)
  },
  {
    id: 'thousand-milestone',
    label: 'Thousand Milestone',
    points: 40,
    test: (n) => n > 0 && n % 1000 === 0
  },
  {
    id: 'prime',
    label: 'Prime',
    points: 5,
    test: (n) => isPrime(n)
  },
  {
    id: 'power-of-two',
    label: 'Power of 2',
    points: 100,
    test: (n) => n > 0 && (n & (n - 1)) === 0
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci',
    points: 90,
    test: (n) => isFibonacci(n)
  }
];

/** True if `n` reads the same forwards and backwards (e.g. 232, 1001). */
function isPalindrome(n) {
  const str = String(n);
  return str === str.split('').reverse().join('');
}

function isPrime(num) {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  const limit = Math.sqrt(num);
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false; 
  }
  
  return true;
}

function isFibonacci(n) {
    if (n < 0) return false;
    if (n === 0 || n === 1) return true;

    let a = 0;
    let b = 1;
    
    while (b < n) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    
    return b === n;
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