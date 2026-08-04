// ---------------------------------------------------------------------------
// main.js
//
// Powers index.html: loads all the data into a FillTracker, then renders the
// recent-fills log, the stats cards, the progress bar, and the leaderboard.
// This file is all rendering.
// ---------------------------------------------------------------------------

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm1AXCBhTs52i0VZScUL753QK5wC_RmAMWIEygF5bBZHr0TywN1LWzMlvbPCyKtnabLihXOQDpA_GX/pub?output=csv';
const MILKYWAY_DISTANCE = 25800; // Light years from Earth to Center of Milky Way

async function init() {
  const tracker = new FillTracker();
  await tracker.loadFromCSV(CSV_URL);

  renderLog(tracker);
  renderStats(tracker);
  renderLeaderboard(tracker);
}

function renderLog(tracker) {
  const log = document.getElementById('log');
  log.innerHTML = '';

  // Most recent first.
  const recentFirst = [...tracker.entries].reverse();

  recentFirst.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.style.borderLeftColor = colorForUsername(entry.username);

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <a class="username-link" href="profile.html?user=${encodeURIComponent(entry.username)}"
             style="color: ${colorForUsername(entry.username)}">${entry.username}</a>
          filled the <em>${entry.sigFill}</em> bottle!${entry.hasComments ? `<br/>📝 "${entry.comments}"` : ''}
          ${renderCategoryBadges(entry)}
        </div>
        <div style="text-align: right;">
          ${entry.formattedTimestamp ? `<div style="color: #888; font-size: 0.8rem;">${entry.formattedTimestamp}</div>` : ''}
          <div class="entry-score">${entry.score} pt${entry.score === 1 ? '' : 's'}</div>
        </div>
      </div>
    `;
    log.appendChild(div);
  });
}

function renderStats(tracker) {
  const statsContainer = document.getElementById('stats');
  const [topUser] = tracker.getLeaderboard(1);

  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-title">Total Fills Logged</div>
      <div class="stat-value">${tracker.totalFills}</div>
    </div>

    <div class="stat-card">
      <div class="stat-title">Most Active Hydrator</div>
      <div class="stat-value">${topUser ? topUser.username : '—'}</div>
      <div class="stat-detail">${topUser ? topUser.totalFills : 0} fills logged</div>
    </div>

    <div class="stat-card">
      <div class="stat-title">Fills Per Month</div>
      <div class="stat-value">${tracker.fillsPerMonth}</div>
      <div class="stat-detail">average rate</div>
    </div>
  `;

  updateProgressBar(tracker.largestFill);
}

function updateProgressBar(largestFill) {
  const progressFill = document.getElementById('progress-fill');
  const distanceCovered = document.getElementById('distance-covered');

  const percentage = Math.min((largestFill / MILKYWAY_DISTANCE) * 100, 100);
  const distance = Math.min(largestFill, MILKYWAY_DISTANCE);

  progressFill.style.width = `${percentage}%`;
  distanceCovered.textContent = `${distance.toLocaleString()} ly`;
}

function renderLeaderboard(tracker) {
  const leaderboardContainer = document.getElementById('leaderboard');
  const topUsers = tracker.getLeaderboard(10);

  leaderboardContainer.innerHTML = topUsers.map(user => `
    <a class="leaderboard-link" href="profile.html?user=${encodeURIComponent(user.username)}">
      <div class="stat-card" style="border-left-color: ${user.color}">
        <div class="stat-title">${user.username}</div>
        <div class="stat-value">${user.totalFills}</div>
      </div>
    </a>
  `).join('');
}

window.addEventListener('DOMContentLoaded', init);