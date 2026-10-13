#!/usr/bin/env node
/**
 * QuickBooks OAuth Authentication
 *
 * Usage:
 *   npm run auth                      (from a checkout)
 *   npm run auth -- --manual
 *   npx -y github:<owner>/quickbooks-online-mcp-server auth [--manual]
 *
 * Two modes:
 *
 * - Local callback (sandbox default): starts a server on port 8000, opens the
 *   browser, receives the callback and saves tokens. Requires
 *   http://localhost:8000/callback to be registered as a redirect URI.
 *
 * - Manual paste-back (--manual, and always in production): prints an
 *   authorize URL, you open it in any browser, and paste back the full URL
 *   you are redirected to. Requires QUICKBOOKS_REDIRECT_URI to be set to a
 *   redirect URI registered on the Intuit app (HTTPS for production). The
 *   page at that URI does not need to serve anything. Works over SSH and in
 *   containers with no browser or open port.
 *
 * Tokens are saved to the token store (.env, or QUICKBOOKS_TOKEN_STORE_PATH)
 * and, in manual mode, also printed so they can be copied into a host's env
 * config when the store does not persist.
 */

import readline from 'readline';
import { quickbooksClient } from './clients/quickbooks-client.js';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function runManual() {
  const result = await quickbooksClient.authorizeWithPastedRedirect(async (authUri) => {
    console.log('1. Open this URL in a browser and authorize the company:\n');
    console.log(authUri);
    console.log('\n2. After the redirect, copy the full URL from the address bar.');
    console.log('   The page itself may show an error or 404; that is fine.');
    console.log('   The code expires within a few minutes.\n');
    return ask('3. Paste the redirected URL here and press Enter:\n> ');
  });

  console.log('\n✓ Successfully authorized with QuickBooks.\n');
  if (result.saveError) {
    console.log(`Could not save tokens to ${result.tokenStorePath}:`, result.saveError);
  } else {
    console.log(`Tokens saved to ${result.tokenStorePath}`);
  }
  console.log('\nIf the token store does not persist across restarts, set these in the host env config:\n');
  console.log(`QUICKBOOKS_REFRESH_TOKEN=${result.refreshToken}`);
  console.log(`QUICKBOOKS_REALM_ID=${result.realmId}`);
  console.log('\nThen restart the MCP server so it picks up the new refresh token.');
}

async function runLocalCallback() {
  console.log('Starting OAuth flow...');
  console.log('A browser window will open for you to authorize the application.\n');

  // The authenticate method will trigger the OAuth flow if no tokens exist
  await quickbooksClient.authenticate();

  console.log('\n✓ Successfully authenticated with QuickBooks!');
  console.log('Tokens have been saved to your .env file.');
  console.log('\nYou can now use the MCP server.');
}

async function main() {
  console.log('QuickBooks OAuth Authentication');
  console.log('================================\n');

  const environment = process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox';
  const manual = process.argv.includes('--manual') || environment === 'production';

  try {
    if (manual) {
      await runManual();
    } else {
      await runLocalCallback();
    }
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Authentication failed:', error instanceof Error ? error.message : error);
    console.error('\nPlease check:');
    console.error('1. QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET are set correctly');
    if (manual) {
      console.error('2. QUICKBOOKS_REDIRECT_URI exactly matches a redirect URI registered on the Intuit app');
      console.error('3. The redirected URL was pasted within a few minutes and only once');
    } else {
      console.error('2. http://localhost:8000/callback is registered as a redirect URI in your Intuit app');
    }

    process.exit(1);
  }
}

main();
