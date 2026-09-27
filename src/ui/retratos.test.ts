import { describe, expect, it } from 'vitest';
import { RETRATOS } from './retratos';

describe('retratos', () => {
  it.each(Object.entries(RETRATOS))('%s mide 16×16', (_, filas) => {
    expect(filas).toHaveLength(16);
    for (const fila of filas) expect(fila).toHaveLength(16);
  });
});
