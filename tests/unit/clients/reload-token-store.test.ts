/**
 * The running server picks up tokens that a separate `auth` process wrote to
 * the token store, without a restart. Uses a real temp file so mtime-based
 * change detection is exercised end to end.
 */
import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qbo-reload-'));
const STORE_PATH = path.join(dir, '.env');
fs.writeFileSync(STORE_PATH, 'QUICKBOOKS_REFRESH_TOKEN=startup-token\nQUICKBOOKS_REALM_ID=111\n');

process.env.QUICKBOOKS_CLIENT_ID = 'test-client-id';
process.env.QUICKBOOKS_CLIENT_SECRET = 'test-client-secret';
process.env.QUICKBOOKS_ENVIRONMENT = 'production';
process.env.QUICKBOOKS_REDIRECT_URI = 'https://example.com/callback';
process.env.QUICKBOOKS_TOKEN_STORE_PATH = STORE_PATH;

const refreshDispatch = jest.fn<(token: string) => Promise<unknown>>();
const quickbooksArgs: unknown[][] = [];

jest.unstable_mockModule('intuit-oauth', () => {
  class MockOAuthClient {
    static scopes = { Accounting: 'com.intuit.quickbooks.accounting' };
    refreshUsingToken = jest.fn((token: string) => refreshDispatch(token));
    createToken = jest.fn();
    authorizeUri = jest.fn(() => 'https://mock');
    constructor(_cfg: Record<string, unknown>) {}
  }
  return { default: MockOAuthClient };
});
jest.unstable_mockModule('node-quickbooks', () => ({
  default: class MockQuickBooks {
    constructor(...args: unknown[]) {
      quickbooksArgs.push(args);
    }
  },
}));
jest.unstable_mockModule('open', () => ({ default: jest.fn(async () => undefined) }));

const { QuickbooksClient, quickbooksClient } = await import('../../../src/clients/quickbooks-client');

// Simulates `npx <package> auth` in another process: rewrite the file and move
// its mtime forward so the change is visible even on coarse-mtime filesystems.
let bump = 0;
function writeFromOtherProcess(content: string) {
  fs.writeFileSync(STORE_PATH, content);
  const t = new Date(Date.now() + ++bump * 10_000);
  fs.utimesSync(STORE_PATH, t, t);
}

describe('reloading tokens written by another process', () => {
  beforeEach(() => {
    refreshDispatch.mockReset();
    refreshDispatch.mockImplementation(async (token: string) => ({
      token: { access_token: `access-for-${token}`, expires_in: 3600, refresh_token: token },
    }));
    quickbooksArgs.length = 0;
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('starts with the tokens from the store', async () => {
    await QuickbooksClient.getInstance();
    expect(refreshDispatch).toHaveBeenLastCalledWith('startup-token');
    expect(quickbooksArgs[0][4]).toBe('111');
  });

  it('does nothing when the store has not changed', async () => {
    expect(quickbooksClient.reloadTokensIfStoreChanged()).toBe(false);
    await QuickbooksClient.getInstance();
    expect(refreshDispatch).not.toHaveBeenCalled();
  });

  it('loads a new refresh token and realm ID into the client and process.env', async () => {
    writeFromOtherProcess('QUICKBOOKS_REFRESH_TOKEN=reauthorized-token\nQUICKBOOKS_REALM_ID=222\n');

    await QuickbooksClient.getInstance();

    expect(refreshDispatch).toHaveBeenCalledWith('reauthorized-token');
    expect(quickbooksArgs.at(-1)?.[4]).toBe('222');
    expect(process.env.QUICKBOOKS_REFRESH_TOKEN).toBe('reauthorized-token');
    expect(process.env.QUICKBOOKS_REALM_ID).toBe('222');
  });

  it('ignores its own writes when a refresh token rotates', async () => {
    refreshDispatch.mockImplementationOnce(async () => ({
      token: { access_token: 'a', expires_in: 3600, refresh_token: 'rotated-token' },
    }));
    (quickbooksClient as any).accessTokenExpiry = new Date(0);
    await QuickbooksClient.getInstance();
    expect(fs.readFileSync(STORE_PATH, 'utf8')).toContain('QUICKBOOKS_REFRESH_TOKEN=rotated-token');
    expect(process.env.QUICKBOOKS_REFRESH_TOKEN).toBe('rotated-token');

    expect(quickbooksClient.reloadTokensIfStoreChanged()).toBe(false);
  });

  it('ignores a changed store with no refresh token in it', () => {
    writeFromOtherProcess('SOMETHING_ELSE=1\n');
    expect(quickbooksClient.reloadTokensIfStoreChanged()).toBe(false);
    expect(process.env.QUICKBOOKS_REFRESH_TOKEN).toBe('rotated-token');
  });
});
