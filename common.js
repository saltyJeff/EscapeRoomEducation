/**
 * Fetch game configuration from /config
 * @returns {Promise<Object>} The game configuration
 */
function fetchGameConfig() {
  return fetch('/config')
    .then(res => {
      if (!res.ok) throw new Error("Config not available");
      return res.json();
    })
    .then(config => {
      if (config && config['css-overrides']) {
        applyCssOverrides(config['css-overrides']);
      }
      return config;
    });
}

/**
 * Dynamically injects a CSS string into document head under a specific ID.
 * If the string contains variables but no selector block (e.g. `--primary: ...`),
 * wraps it inside a `:root { ... }` block to ensure validity.
 * @param {string} cssText Custom CSS code to insert
 */
function applyCssOverrides(cssText) {
  let styleTag = document.getElementById('css-overrides-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'css-overrides-style';
    document.head.appendChild(styleTag);
  }
  
  const trimmed = cssText.trim();
  if (trimmed && !trimmed.includes('{')) {
    styleTag.textContent = `:root {\n  ${trimmed}\n}`;
  } else {
    styleTag.textContent = cssText;
  }
}

/**
 * Fetch all teams' progress mapping from /progress
 * @returns {Promise<Object>} Maps team name (string) -> floor (number)
 */
function fetchTeamsProgress() {
  return fetch('/progress')
    .then(res => {
      if (!res.ok) throw new Error("Progress not available");
      return res.json();
    });
}

/**
 * Update the progress level for a specified team
 * @param {string} teamName 
 * @param {number} floor 
 * @returns {Promise<Object>} Success response JSON payload
 */
function updateTeamProgress(teamName, floor) {
  return fetch(`/update_progress?team_name=${encodeURIComponent(teamName)}&floor=${floor}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to update team progress");
      return res.json();
    });
}

/**
 * Format a duration in seconds into HH:MM:SS format
 * @param {number} seconds 
 * @returns {string} Formatted duration string
 */
function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}
