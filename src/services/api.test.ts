import { describe, it, expect } from 'vitest';
import api from './api';

describe('API Service', () => {
  it('debe exportar instancia de axios', () => {
    expect(api).toBeDefined();
    // Verificar que tenga los métodos de Axios (más preciso que typeof)
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
    expect(api.patch).toBeDefined();
  });

  it('debe tener métodos HTTP básicos', () => {
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  it('debe tener interceptores configurados', () => {
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });
});