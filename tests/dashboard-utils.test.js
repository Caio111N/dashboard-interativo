import { describe, expect, it } from 'vitest';
import { buildCsv, calculateTrend, formatCurrency } from '../mock/data.js';

describe('dashboard utilities', () => {
  it('calculates growth trend correctly', () => {
    expect(calculateTrend(120, 100)).toBe(20);
    expect(calculateTrend(80, 100)).toBe(-20);
  });

  it('formats currency in Brazilian format', () => {
    expect(formatCurrency(1250)).toContain('R$');
  });

  it('builds a CSV string with sales rows', () => {
    const csv = buildCsv({
      sales: {
        detail: [
          { label: 'Jan', total: 1000, previous: 850, users: 30, temperature: 22 },
          { label: 'Fev', total: 1200, previous: 1100, users: 35, temperature: 24 }
        ]
      }
    });

    expect(csv).toContain('Mes,Vendas,Ano anterior,Usuários,Temperatura');
    expect(csv).toContain('Jan');
    expect(csv).toContain('Fev');
  });
});
