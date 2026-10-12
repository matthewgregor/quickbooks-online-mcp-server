import { describe, it, expect } from '@jest/globals';
import { jsonResult, searchResult } from '../../../src/helpers/tool-result';

describe('jsonResult', () => {
  it('returns exactly one text item holding the value as JSON', () => {
    const result = jsonResult({ Id: '1', TotalAmt: 10 });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text)).toEqual({ Id: '1', TotalAmt: 10 });
  });

  it('serialises undefined as null so the text still parses', () => {
    expect(JSON.parse(jsonResult(undefined).content[0].text)).toBeNull();
  });
});

describe('searchResult', () => {
  const parse = (r: ReturnType<typeof searchResult>) => {
    expect(r.content).toHaveLength(1);
    return JSON.parse(r.content[0].text);
  };

  it('wraps an entity array with its count', () => {
    expect(parse(searchResult('bills', [{ Id: '1' }, { Id: '2' }]))).toEqual({
      count: 2,
      bills: [{ Id: '1' }, { Id: '2' }],
    });
  });

  it('returns only the count for count queries', () => {
    expect(parse(searchResult('bills', 111))).toEqual({ count: 111 });
  });

  it('treats a missing result as an empty list', () => {
    expect(parse(searchResult('bills', null))).toEqual({ count: 0, bills: [] });
  });

  it('unwraps a raw QueryResponse envelope', () => {
    const raw = { QueryResponse: { BillPayment: [{ Id: '9' }], startPosition: 1, maxResults: 1 }, time: 'x' };
    expect(parse(searchResult('billPayments', raw))).toEqual({ count: 1, billPayments: [{ Id: '9' }] });
    expect(parse(searchResult('billPayments', { QueryResponse: { totalCount: 4 } }))).toEqual({ count: 4 });
    expect(parse(searchResult('billPayments', { QueryResponse: {} }))).toEqual({ count: 0, billPayments: [] });
  });
});
