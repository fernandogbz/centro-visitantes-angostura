    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { generarCodigoVisita } from './generarCodigo.js';

    // Contador de llamadas para simular recursión limitada
    let callCount = 0;

    vi.mock('../models/Visita.js', () => ({
    default: {
        findOne: vi.fn((query) => {
        // Primera llamada: buscar última visita con regex
        if (query && query.codigoVisita && query.codigoVisita.$regex) {
            return {
            sort: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(null), // No hay visitas previas
            };
        }
        
        // Segunda llamada: verificar si código existe
        // Simular que NO existe (retornar null) para evitar recursión
        callCount++;
        
        // Limitar a 3 llamadas para evitar bucle infinito en caso de error
        if (callCount > 3) {
            throw new Error('Mock: Demasiadas llamadas recursivas detectadas');
        }
        
        return Promise.resolve(null); // El código NO existe
        }),
    },
    }));

    describe('generarCodigoVisita', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        callCount = 0;
    });

    it('debe generar código con formato VIS-YYYYMMDD-XXX', async () => {
        const codigo = await generarCodigoVisita();
        
        expect(codigo).toMatch(/^VIS-\d{8}-\d{3}$/);
    }, 5000); // Timeout de 5 segundos

    it('debe empezar con secuencia 001 si no hay visitas del día', async () => {
        const codigo = await generarCodigoVisita();
        
        expect(codigo).toContain('-001');
    }, 5000);

    it('debe incluir la fecha actual en el código', async () => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        const fechaEsperada = `${year}${month}${day}`;

        const codigo = await generarCodigoVisita();
        
        expect(codigo).toContain(fechaEsperada);
    }, 5000);

    it('debe incrementar secuencia si ya existe una visita del día', async () => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        
        const Visita = (await import('../models/Visita.js')).default;
        
        // Reset call count
        callCount = 0;
        
        // Mock específico para este test
        Visita.findOne.mockImplementation((query) => {
        // Primera llamada: buscar última visita con regex
        if (query && query.codigoVisita && query.codigoVisita.$regex) {
            return {
            sort: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue({
                codigoVisita: `VIS-${year}${month}${day}-001`
            }),
            };
        }
        
        // Segunda llamada: verificar si código existe
        // Retornar null para que acepte el código -002
        return Promise.resolve(null);
        });

        const codigo = await generarCodigoVisita();
        
        expect(codigo).toContain('-002');
    }, 5000);
    });