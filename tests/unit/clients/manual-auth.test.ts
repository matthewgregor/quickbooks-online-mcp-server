/**
 * Tests for the console paste-back OAuth flow (authorizeWithPastedRedirect),
 * used for production apps and headless/containerized hosts where no local
 * callback server can be reached.
 */
import { jest } from '@jest/globals';

process.env.QUICKBOOKS_CLIENT_ID = 'test-client-id';
process.env.QUICKBOOKS_CLIENT_SECRET = 'test-client-secret';
process.env.QUICKBOOKS_REFRESH_TOKEN = 'old-refresh-token';
process.env.QUICKBOOKS_REALM_ID = '12345';
process.env.QUICKBOOKS_ENVIRONMENT = 'production';
process.env.QUICKBOOKS_REDIRECT_URI = 'https://example.com/qbo/callback';
process.env.QUICKBOOKS_TOKEN_STORE_PATH = '/qbo-tokens/.env';

jest.unstable_mockModule('dotenv', () => ({ default: { config: jest.fn(), parse: jest.fn(() => ({})) } }));

const authorizeUri = jest.fn((_opts: { scope: string[]; state: string }) => 'https://appcenter.intuit.com/connect/oauth2?mock');
const createToken = jest.fn<(url: string) => Promise<unknown>>();
const oauthConfigs: Record<string, unknown>[] = [];

jest.unstable_mockModule('intuit-oauth', () => {
  class MockOAuthClient {
    static scopes = { Accounting: 'com.intuit.quickbooks.accounting' };
    authorizeUri = authorizeUri;
    createToken = createToken;
    refreshUsingToken = jest.fn();
    constructor(cfg: Record<string, unknown>) {
      oauthConfigs.push(cfg);
    }
  }
  return { default: MockOAuthClient };
});

jest.unstable_mockModule('node-quickbooks', () => ({
  default: class MockQuickBooks {
    constructor(..._args: unknown[]) {}
  },
}));

jest.unstable_mockModule('open', () => ({ default: jest.fn(async () => undefined) }));

const fsMock = {
  readFileSync: jest.fn(() => {
    throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
  }),
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
  renameSync: jest.fn(),
  unlinkSync: jest.fn(),
  lstatSync: jest.fn(() => {
    throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
  }),
  mkdirSync: jest.fn(),
};
jest.unstable_mockModule('fs', () => ({ default: fsMock }));

const { quickbooksClient } = await import('../../../src/clients/quickbooks-client');

// Builds the URL Intuit would redirect to, echoing the state the client sent.
function redirectFor(authUri: string, extra = 'code=AUTH_CODE&realmId=987654321'): string {
  void authUri;
  const state = authorizeUri.mock.calls[authorizeUri.mock.calls.length - 1][0].state;
  return `https://example.com/qbo/callback?${extra}&state=${state}`;
}

beforeEach(() => {
  authorizeUri.mockClear();
  createToken.mockReset();
  Object.values(fsMock).forEach((fn) => fn.mockClear());
});

describe('authorizeWithPastedRedirect', () => {
  it('uses the configured HTTPS redirect URI, not localhost', () => {
    expect(oauthConfigs[0].redirectUri).toBe('https://example.com/qbo/callback');
  });

  it('exchanges the pasted code once, saves to the token store and returns the tokens', async () => {
    createToken.mockResolvedValue({
      token: { access_token: 'AT', refresh_token: 'NEW_RT', expires_in: 3600, realmId: '987654321' },
    });

    let pasted = '';
    const result = await quickbooksClient.authorizeWithPastedRedirect(async (uri) => {
      pasted = `  "${redirectFor(uri)}"\n`;
      return pasted;
    });

    expect(createToken).toHaveBeenCalledTimes(1);
    expect(createToken.mock.calls[0][0]).toBe(pasted.trim().slice(1, -1));
    expect(result).toEqual({
      refreshToken: 'NEW_RT',
      realmId: '987654321',
      tokenStorePath: '/qbo-tokens/.env',
      saveError: undefined,
    });
    expect(fsMock.mkdirSync).toHaveBeenCalledWith('/qbo-tokens', { recursive: true });
    const written = String(fsMock.writeFileSync.mock.calls[0][1]);
    expect(written).toContain('QUICKBOOKS_REFRESH_TOKEN=NEW_RT');
    expect(written).toContain('QUICKBOOKS_REALM_ID=987654321');
  });

  it('rejects a URL whose state does not match, without exchanging', async () => {
    await expect(
      quickbooksClient.authorizeWithPastedRedirect(async () =>
        'https://example.com/qbo/callback?code=AUTH_CODE&realmId=1&state=wrong'
      )
    ).rejects.toThrow(/state/);
    expect(createToken).not.toHaveBeenCalled();
  });

  it('reports an OAuth error returned in the redirect', async () => {
    await expect(
      quickbooksClient.authorizeWithPastedRedirect(async (uri) => redirectFor(uri, 'error=access_denied'))
    ).rejects.toThrow(/access_denied/);
    expect(createToken).not.toHaveBeenCalled();
  });

  it('rejects input that is not a redirect URL', async () => {
    await expect(quickbooksClient.authorizeWithPastedRedirect(async () => 'AUTH_CODE')).rejects.toThrow(/query string/);
    expect(createToken).not.toHaveBeenCalled();
  });

  it('still returns the tokens when the token store cannot be written', async () => {
    createToken.mockResolvedValue({
      token: { access_token: 'AT', refresh_token: 'NEW_RT2', expires_in: 3600, realmId: '987654321' },
    });
    const eacces = Object.assign(new Error('EACCES'), { code: 'EACCES' });
    fsMock.mkdirSync.mockImplementationOnce(() => {
      throw eacces;
    });

    const result = await quickbooksClient.authorizeWithPastedRedirect(async (uri) => redirectFor(uri));

    expect(result.refreshToken).toBe('NEW_RT2');
    expect(result.saveError).toBe(eacces);
  });
});
