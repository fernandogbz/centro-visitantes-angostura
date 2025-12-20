import { describe, it, expect } from 'vitest';
import { formatearParaInput, formatearFechaCompleta } from './formatearFecha';

describe('formatearParaInput', () => {
    it('debe formatear fecha en formato YYYY-MM-DD', () => {
        const date = new Date('2023-10-01T12:00:00Z');
        const resultado = formatearParaInput(date);
        expect(resultado).toMatch(/^2023-\d{2}-\d{2}$/);
    });

    it('debe manejar fecha como string y formatearla correctamente', () => {
        const resultado = formatearParaInput('2025-12-19T00:00:00');
        // El resultado puede variar por zona horaria, verificamos el formato
        expect(resultado).toMatch(/^2025-12-\d{2}$/);
    });

    it('debe agregar ceros a la izquierda en mes y día', () => {
        const date = new Date(2023, 0, 5); // Usar constructor con valores locales
        expect(formatearParaInput(date)).toBe('2023-01-05');
    });
});

describe('formatearFechaCompleta', () => {
    it('debe formatear fecha completa con mes y año', () => {
        const fecha = new Date(2025, 11, 19); // Usar constructor con valores locales
        const resultado = formatearFechaCompleta(fecha);
        expect(resultado).toContain('diciembre');
        expect(resultado).toContain('2025');
    });

    it('debe usar el día de la semana proporcionado', () => {
        const fecha = new Date(2025, 11, 19);
        const resultado = formatearFechaCompleta(fecha, 'Viernes');
        expect(resultado).toContain('Viernes');
    });
});
