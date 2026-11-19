/**
 * Colors the user can tag a project with so similar names are easy to tell
 * apart in the project selector. Mid-tone values read on light and dark themes.
 * The server stores the hex value, so changing a label here is safe, but
 * changing a value orphans projects already tagged with the old one.
 */
export const PROJECT_COLORS = [
  { key: 'red', value: '#ef4444' },
  { key: 'orange', value: '#f97316' },
  { key: 'yellow', value: '#eab308' },
  { key: 'green', value: '#22c55e' },
  { key: 'teal', value: '#14b8a6' },
  { key: 'blue', value: '#3b82f6' },
  { key: 'violet', value: '#8b5cf6' },
  { key: 'pink', value: '#ec4899' },
] as const;
