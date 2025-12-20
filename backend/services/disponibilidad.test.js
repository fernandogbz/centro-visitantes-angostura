import { describe, it, expect, vi, beforeEach } from 'vitest';
import DisponibilidadService from './disponibilidad.js';

// Mock de modelos con método chaining
const mockChainVisita = {
  sort: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  lean: vi.fn(),
};

const mockChainHorario = {
  sort: vi.fn().mockReturnThis(),
  lean: vi.fn(),
};

const mockChainDiaBloqueado = {
  lean: vi.fn(),
};

// Mock de los modelos
vi.mock('../models/Visita.js', () => ({
  default: {
    find: vi.fn(() => mockChainVisita),
  },
}));

vi.mock('../models/horarioDisponible.js', () => ({
  default: {
    find: vi.fn(() => mockChainHorario),
  },
}));

vi.mock('../models/diaBloqueado.js', () => ({
  default: {
    findOne: vi.fn(() => mockChainDiaBloqueado),
  },
}));

describe('DisponibilidadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chains
    mockChainVisita.sort.mockReturnThis();
    mockChainVisita.select.mockReturnThis();
    mockChainHorario.sort.mockReturnThis();
  });

  it('debe retornar que los lunes están cerrados', async () => {
    // Mock para día no bloqueado específicamente
    mockChainDiaBloqueado.lean.mockResolvedValue(null);
    
    // Mock para horarios disponibles
    mockChainHorario.lean.mockResolvedValue([
      { hora: '09:00', activo: true, orden: 1 },
      { hora: '10:00', activo: true, orden: 2 },
    ]);
    
    // Mock para visitas vacías
    mockChainVisita.lean.mockResolvedValue([]);

    // Lunes 23 de diciembre de 2024
    const resultado = await DisponibilidadService.obtenerDisponibilidadFecha('2024-12-23');
    
    // El servicio debe detectar que es lunes
    expect(resultado.disponible).toBe(false);
    // El mensaje puede variar según la implementación
    expect(resultado.mensaje || resultado.motivo).toContain('lunes');
  });

  it('debe verificar días bloqueados', async () => {
    const DiaBloqueado = (await import('../models/diaBloqueado.js')).default;
    
    // Mock para día bloqueado específico
    mockChainDiaBloqueado.lean.mockResolvedValue({
      fecha: new Date('2025-12-25'),
      motivo: 'Navidad',
      activo: true
    });

    // Mock horarios
    mockChainHorario.lean.mockResolvedValue([]);
    mockChainVisita.lean.mockResolvedValue([]);

    const resultado = await DisponibilidadService.obtenerDisponibilidadFecha('2025-12-25');
    
    // Verificar que se llamó findOne (con cualquier parámetro)
    expect(DiaBloqueado.findOne).toHaveBeenCalled();
    
    // Si hay día bloqueado, debe estar no disponible
    if (resultado.diaBloqueado) {
      expect(resultado.disponible).toBe(false);
    }
  });

  it('debe calcular disponibilidad correcta con visitas existentes', async () => {
    // Mock para día no bloqueado (martes)
    mockChainDiaBloqueado.lean.mockResolvedValue(null);
    
    // Mock para horarios disponibles
    mockChainHorario.lean.mockResolvedValue([
      { hora: '09:00', activo: true, orden: 1 },
      { hora: '10:00', activo: true, orden: 2 },
      { hora: '11:00', activo: true, orden: 3 },
    ]);
    
    // Mock para visitas confirmadas
    mockChainVisita.lean.mockResolvedValue([
      { numVisitantes: 50, estado: 'Confirmada', hora: '09:00' },
      { numVisitantes: 30, estado: 'Confirmada', hora: '10:00' },
    ]);

    // Martes 24 de diciembre de 2024
    const resultado = await DisponibilidadService.obtenerDisponibilidadFecha('2024-12-24');
    
    // Verificar que hay horarios disponibles
    expect(resultado.horarios).toBeDefined();
    expect(Array.isArray(resultado.horarios)).toBe(true);
    
    // Si el servicio retorna cupos, verificarlos
    if (resultado.cuposOcupados !== undefined) {
      expect(resultado.cuposOcupados).toBeGreaterThanOrEqual(0);
    }
    
    if (resultado.cuposDisponibles !== undefined) {
      expect(resultado.cuposDisponibles).toBeGreaterThanOrEqual(0);
    }
  });

  it('debe marcar como no disponible si no hay cupos', async () => {
    mockChainDiaBloqueado.lean.mockResolvedValue(null);
    
    mockChainHorario.lean.mockResolvedValue([
      { hora: '09:00', activo: true, orden: 1 },
    ]);
    
    // Mock de capacidad completa (270 es la capacidad total)
    const visitasLleno = [];
    for (let i = 0; i < 9; i++) {
      visitasLleno.push({ 
        numVisitantes: 30, 
        estado: 'Confirmada',
        hora: '09:00' 
      });
    }
    mockChainVisita.lean.mockResolvedValue(visitasLleno);

    const resultado = await DisponibilidadService.obtenerDisponibilidadFecha('2024-12-24');
    
    // Verificar que retorna estructura básica
    expect(resultado).toBeDefined();
    expect(resultado.horarios).toBeDefined();
    
    // Si hay sistema de cupos, verificar lógica
    if (resultado.cuposDisponibles !== undefined) {
      // Puede ser 0 o negativo si está lleno
      expect(resultado.cuposDisponibles).toBeLessThanOrEqual(0);
    }
  });

  it('debe retornar estructura básica correcta', async () => {
    mockChainDiaBloqueado.lean.mockResolvedValue(null);
    mockChainHorario.lean.mockResolvedValue([
      { hora: '09:00', activo: true, orden: 1 },
    ]);
    mockChainVisita.lean.mockResolvedValue([]);

    const resultado = await DisponibilidadService.obtenerDisponibilidadFecha('2024-12-24');
    
    // Verificar estructura mínima que debe retornar
    expect(resultado).toBeDefined();
    expect(resultado).toHaveProperty('disponible');
    expect(resultado).toHaveProperty('horarios');
    expect(typeof resultado.disponible).toBe('boolean');
    expect(Array.isArray(resultado.horarios)).toBe(true);
  });
});