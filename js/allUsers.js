// ---------------------------------------------------------------------------
// allUsers.js
//
// Like main.js and profile.js, this file only handles rendering. All the
// CSV-loading and grouping-by-user logic already lives in FillTracker
// (dataStore.js).
// ---------------------------------------------------------------------------

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm1AXCBhTs52i0VZScUL753QK5wC_RmAMWIEygF5bBZHr0TywN1LWzMlvbPCyKtnabLihXOQDpA_GX/pub?output=csv';

async function init() {
  const statsContainer = document.getElementById('user-stats');
  const dataContainer = document.getElementById('user-data');

  try {
    const tracker = new FillTracker();
    await tracker.loadFromCSV(CSV_URL);

    renderUserStats(tracker, statsContainer);
    renderAllUsers(tracker, dataContainer);
  } catch (error) {
    if (dataContainer) {
      dataContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-title">Could not load data</div>
          <div class="stat-detail">The fill sheet is unavailable right now. Please try again shortly.</div>
        </div>
      `;
    }
  }
}

/** Top-of-page summary: how many hydrators, how many fills total. */
function renderUserStats(tracker, container) {
  if (!container) return;

  const userCount = tracker.getAllUsers().length;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-title">Total Hydrators</div>
      <div class="stat-value">${userCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Total Fills Logged</div>
      <div class="stat-value">${tracker.totalFills}</div>
    </div>
  `;
}

/** One collapsible-feeling section per user, most fills first, each entry styled like the rest of the site. */
function renderAllUsers(tracker, container) {
  if (!container) return;

  const users = tracker.getAllUsers().sort((a, b) => b.totalFills - a.totalFills);

  if (users.length === 0) {
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-title">No fills yet</div>
        <div class="stat-detail">Be the first to log one!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = users.map(user => `
    <div class="user-section" id="user-${slugifyUsername(user.username)}">
      <h3 style="color: ${user.color}">${user.username}</h3>
      <div class="user-summary">
        ${user.totalFills} fill${user.totalFills === 1 ? '' : 's'} &middot; ${user.totalScore} pt${user.totalScore === 1 ? '' : 's'}
      </div>
      <div class="user-fills">
        ${user.sortedEntries.map(entry => `
          <div class="entry" style="border-left-color: ${user.color}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                filled the <em>${entry.sigFill}</em> bottle!${entry.hasComments ? `<br/>📝 "${entry.comments}"` : ''}
                ${renderCategoryBadges(entry)}
              </div>
              <div style="text-align: right;">
                ${entry.formattedTimestamp ? `<div style="color: #888; font-size: 0.8rem;">${entry.formattedTimestamp}</div>` : ''}
                <div class="entry-score">${entry.score} pt${entry.score === 1 ? '' : 's'}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', init);