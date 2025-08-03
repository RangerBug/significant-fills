const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm1AXCBhTs52i0VZScUL753QK5wC_RmAMWIEygF5bBZHr0TywN1LWzMlvbPCyKtnabLihXOQDpA_GX/pub?output=csv';
const MOON_DISTANCE = 384400; // km from Earth to Moon

function updateProgressBar(largestFill) {
  const progressFill = document.getElementById('progress-fill');
  const distanceCovered = document.getElementById('distance-covered');
  
  const percentage = Math.min((largestFill / MOON_DISTANCE) * 100, 100);
  const distance = Math.min(largestFill, MOON_DISTANCE);
  
  progressFill.style.width = `${percentage}%`;
  distanceCovered.textContent = `${distance.toLocaleString()} km`;
}

function csvToJSON(csv) {
  const lines = csv.split("\n").filter(l => l.trim().length > 0);
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const entry = {};
    headers.forEach((h, i) => {
      entry[h] = values[i];
    });
    return entry;
  });
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return '';
  }
}

function calculateStats(data) {
  const stats = {
    totalFills: data.length,
    userCounts: {},
    topUser: null,
    topUserCount: 0,
    largestFill: 0
  };

  // Count fills per user and find largest fill number
  data.forEach(entry => {
    const username = entry.Username;
    stats.userCounts[username] = (stats.userCounts[username] || 0) + 1;
    
    // Extract number from SigFill (e.g., "Bottle 42" -> 42)
    const fillMatch = entry.SigFill.match(/\d+/);
    if (fillMatch) {
      const fillNumber = parseInt(fillMatch[0]);
      if (fillNumber > stats.largestFill) {
        stats.largestFill = fillNumber;
      }
    }
  });

  // Find the user with the most fills
  Object.entries(stats.userCounts).forEach(([username, count]) => {
    if (count > stats.topUserCount) {
      stats.topUser = username;
      stats.topUserCount = count;
    }
  });

  return stats;
}

function showStats(data) {
  const statsContainer = document.getElementById('stats');
  const stats = calculateStats(data);
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-title">Total Fills</div>
      <div class="stat-value">${stats.totalFills}</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-title">Most Active Hydrator</div>
      <div class="stat-value">${stats.topUser}</div>
      <div class="stat-detail">${stats.topUserCount} fills logged</div>
    </div>
  `;
  
  // Update progress bar
  updateProgressBar(stats.largestFill);
}

function showData(data) {
  const log = document.getElementById('log');
  log.innerHTML = '';

  // Create a color map for usernames
  const usernameColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  // Get unique usernames and assign colors
  const uniqueUsernames = [...new Set(data.map(entry => entry.Username))];
  const colorMap = {};
  uniqueUsernames.forEach((username, index) => {
    colorMap[username] = usernameColors[index % usernameColors.length];
  });

  const allFills = data.reverse();
  allFills.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    const userColor = colorMap[entry.Username];
    div.style.borderLeftColor = userColor;
    const timestamp = formatTimestamp(entry.Timestamp);
    const hasComments = entry.Comments && entry.Comments.trim() !== '';
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <strong style="color: ${userColor}">${entry.Username}</strong> filled the <em>${entry.SigFill}</em> bottle!${hasComments ? `<br/>📝 "${entry.Comments}"` : ''}
        </div>
        ${timestamp ? `<div style="color: #888; font-size: 0.8rem; margin-left: 10px;">${timestamp}</div>` : ''}
      </div>
    `;
    log.appendChild(div);
  });

  // Show statistics
  showStats(data);
}

window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(csvUrl);
  const text = await response.text();
  const json = csvToJSON(text);
  showData(json);
}); 