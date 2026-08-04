// ---------------------------------------------------------------------------
// profile.js
//
// Powers profile.html?user=SomeUsername — looks that user up in a freshly
// loaded FillTracker and renders their stats plus their full fill history.
// ---------------------------------------------------------------------------

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm1AXCBhTs52i0VZScUL753QK5wC_RmAMWIEygF5bBZHr0TywN1LWzMlvbPCyKtnabLihXOQDpA_GX/pub?output=csv';

async function init() {
  const requestedUsername = new URLSearchParams(window.location.search).get('user');
  const header = document.getElementById('profile-header');
  const log = document.getElementById('profile-log');

  if (!requestedUsername) {
    header.innerHTML = `<p>No user specified. <a href="index.html">Go back home</a>.</p>`;
    return;
  }

  const tracker = new FillTracker();
  await tracker.loadFromCSV(CSV_URL);

  // Sanitize the way every other username was sanitized, so the lookup matches.
  const user = tracker.getUser(sanitizeText(requestedUsername));

  if (!user) {
    header.innerHTML = `<p>No profile found for "${sanitizeText(requestedUsername)}". <a href="index.html">Go back home</a>.</p>`;
    return;
  }

  renderProfileHeader(user);
  renderProfileLog(user, log);
}

function renderProfileHeader(user) {
  document.title = `${user.username}'s Profile 💧`;
  const header = document.getElementById('profile-header');

  header.innerHTML = `
    <h1 style="color: ${user.color}">${user.username}</h1>
    <p class="subtitle">Hydration profile</p>
    <div class="profile-stats">
      <div class="stat-card" style="border-left-color: ${user.color}">
        <div class="stat-title">Total Fills</div>
        <div class="stat-value">${user.totalFills}</div>
      </div>
      <div class="stat-card" style="border-left-color: ${user.color}">
        <div class="stat-title">Total Score</div>
        <div class="stat-value">${user.totalScore}</div>
      </div>
      <div class="stat-card" style="border-left-color: ${user.color}">
        <div class="stat-title">Largest Fill</div>
        <div class="stat-value">#${user.largestFill}</div>
      </div>
    </div>
  `;
}

function renderProfileLog(user, log) {
  log.innerHTML = user.sortedEntries.map(entry => `
    <div class="entry" style="border-left-color: ${user.color}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          filled the <em>${entry.sigFill}</em> bottle!${entry.hasComments ? `<br/>📝 "${entry.comments}"` : ''}
        </div>
        ${entry.formattedTimestamp ? `<div style="color: #888; font-size: 0.8rem; margin-left: 10px;">${entry.formattedTimestamp}</div>` : ''}
      </div>
    </div>
  `).join('');
}

window.addEventListener('DOMContentLoaded', init);