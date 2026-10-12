import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockQuickbooksClient, mockQuickbooksClientClass, mockQuickBooksInstance, resetAllMocks } from '../../mocks/quickbooks.mock';

// Clients and gateways that read only content[0] must get the whole result,
// so every successful call returns one text item holding plain JSON.
jest.unstable_mockModule('../../../src/clients/quickbooks-client', () => ({
  quickbooksClient: mockQuickbooksClient,
  QuickbooksClient: mockQuickbooksClientClass,
}));

const { SearchBillsTool } = await import('../../../src/tools/search-bills.tool');
const { SearchInvoicesTool } = await import('../../../src/tools/search-invoices.tool');
const { SearchBillPaymentsTool } = await import('../../../src/tools/search-bill-payments.tool');
const { GetAgedPayablesTool } = await import('../../../src/tools/get-aged-payables.tool');
const { GetAgedReceivablesTool } = await import('../../../src/tools/get-aged-receivables.tool');
const { GetCustomerTool } = await import('../../../src/tools/get-customer.tool');

const call = (tool: any, params: any) => (tool.handler as any)({ params });

const onlyItem = (result: any) => {
  expect(result.content).toHaveLength(1);
  expect(result.content[0].type).toBe('text');
  return JSON.parse(result.content[0].text);
};

describe('tool responses use a single JSON content item', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('search_bills returns { count, bills }', async () => {
    const bills = [{ Id: '1' }, { Id: '2' }, { Id: '3' }];
    mockQuickBooksInstance.findBills.mockImplementation((_c: any, cb: any) => cb(null, { QueryResponse: { Bill: bills } }));

    const body = onlyItem(
      await call(SearchBillsTool, {
        criteria: [{ field: 'DueDate', value: '2026-09-29', operator: '>=' }],
        fetchAll: true,
      })
    );

    expect(body).toEqual({ count: 3, bills });
  });

  it('search_bills with count returns { count }', async () => {
    mockQuickBooksInstance.findBills.mockImplementation((_c: any, cb: any) => cb(null, { QueryResponse: { totalCount: 111 } }));

    expect(onlyItem(await call(SearchBillsTool, { count: true }))).toEqual({ count: 111 });
  });

  it('search_invoices returns { count, invoices }', async () => {
    const invoices = Array.from({ length: 106 }, (_, i) => ({ Id: String(i) }));
    mockQuickBooksInstance.findInvoices.mockImplementation((_c: any, cb: any) => cb(null, { QueryResponse: { Invoice: invoices } }));

    const body = onlyItem(await call(SearchInvoicesTool, { criteria: { fetchAll: true } }));

    expect(body.count).toBe(106);
    expect(body.invoices).toEqual(invoices);
  });

  it('search_bill_payments unwraps the raw QueryResponse', async () => {
    mockQuickBooksInstance.findBillPayments.mockImplementation((_c: any, cb: any) =>
      cb(null, { QueryResponse: { BillPayment: [{ Id: '5' }] }, time: 't' })
    );

    expect(onlyItem(await call(SearchBillPaymentsTool, {}))).toEqual({ count: 1, billPayments: [{ Id: '5' }] });
  });

  it('get_aged_payables returns the report object with no prefix line', async () => {
    const report = { Header: { ReportName: 'AgedPayables' }, Rows: { Row: [] } };
    mockQuickBooksInstance.reportAgedPayables.mockImplementation((_p: any, cb: any) => cb(null, report));

    expect(onlyItem(await call(GetAgedPayablesTool, {}))).toEqual(report);
  });

  it('get_aged_receivables returns the report object with no prefix line', async () => {
    const report = { Header: { ReportName: 'AgedReceivables' }, Rows: { Row: [] } };
    mockQuickBooksInstance.reportAgedReceivables.mockImplementation((_p: any, cb: any) => cb(null, report));

    expect(onlyItem(await call(GetAgedReceivablesTool, {}))).toEqual(report);
  });

  it('get_customer returns the entity as JSON', async () => {
    mockQuickBooksInstance.getCustomer.mockImplementation((_id: any, cb: any) => cb(null, { Id: '42', DisplayName: 'Acme' }));

    expect(onlyItem(await call(GetCustomerTool, { id: '42' }))).toEqual({ Id: '42', DisplayName: 'Acme' });
  });
});
