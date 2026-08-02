/* Bob's Kitchen secrets — EXAMPLE only (safe to commit).
 *
 * Setup:
 *  1. Copy this file to:  kitchen/kitchen-config.js
 *     (and/or local/kitchen-config.js if you keep the portal under local/)
 *  2. Fill in password (and portalKey if needed)
 *  3. kitchen-config.js is gitignored — never commit the real one
 *
 * Open kitchen/index.html in a browser (same folder as kitchen-config.js).
 */
window.BB_KITCHEN = {
  email: 'bobsburritosco@gmail.com',
  password: 'CHANGE_ME_TO_A_STRONG_PASSWORD',
  scriptUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  portalKey: 'change-me-to-match-PORTAL_KEY-in-apps-script'
};
