import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ConfiguracionSistema from '../models/configSystem.js';
import DiaBloqueado from '../models/diaBloqueado.js';
import HorarioDisponible from '../models/horarioDisponible.js';

dotenv.config();

async function initDatabase() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/angostura');
    
    console.log('✅ Conectado a MongoDB');
    console.log('');
    console.log('🚀 Iniciando inicialización de datos...');
    console.log('');
    
    // ====================================
    // 1. CONFIGURACIÓN DEL SISTEMA
    // ====================================
    console.log('📋 Configurando parámetros del sistema...');
    
    const configuraciones = [
      { clave: 'capacidad_maxima_dia', valor: '250', descripcion: 'Capacidad máxima de visitantes por día', tipo: 'number' },
      { clave: 'capacidad_maxima_horario', valor: '100', descripcion: 'Capacidad máxima por horario', tipo: 'number' },
      { clave: 'horario_apertura', valor: '10:00', descripcion: 'Hora de apertura', tipo: 'string' },
      { clave: 'horario_cierre', valor: '14:00', descripcion: 'Hora de cierre', tipo: 'string' },
      { clave: 'duracion_visita', valor: '60', descripcion: 'Duración de cada visita en minutos', tipo: 'number' },
      { clave: 'anticipacion_minima', valor: '24', descripcion: 'Horas mínimas de anticipación para reservar', tipo: 'number' },
      { clave: 'anticipacion_maxima', valor: '720', descripcion: 'Horas máximas de anticipación (30 días)', tipo: 'number' }
    ];
    
    for (const config of configuraciones) {
      await ConfiguracionSistema.findOneAndUpdate(
        { clave: config.clave },
        config,
        { upsert: true, new: true }
      );
    }
    
    console.log(`   ✓ ${configuraciones.length} configuraciones inicializadas`);
    console.log('');
    
    // ====================================
    // 2. DÍAS BLOQUEADOS (FERIADOS 2025)
    // ====================================
    console.log('📋 Configurando días bloqueados...');
    
    const feriados = [
      { fecha: new Date('2024-12-25'), motivo: 'Navidad', tipo: 'feriado' },
      { fecha: new Date('2025-01-01'), motivo: 'Año Nuevo', tipo: 'feriado' },
      { fecha: new Date('2025-04-18'), motivo: 'Viernes Santo', tipo: 'feriado' },
      { fecha: new Date('2025-05-01'), motivo: 'Día del Trabajo', tipo: 'feriado' },
      { fecha: new Date('2025-05-21'), motivo: 'Día de las Glorias Navales', tipo: 'feriado' },
      { fecha: new Date('2025-09-18'), motivo: 'Fiestas Patrias', tipo: 'feriado' },
      { fecha: new Date('2025-09-19'), motivo: 'Día del Ejército', tipo: 'feriado' },
      { fecha: new Date('2025-10-12'), motivo: 'Encuentro de Dos Mundos', tipo: 'feriado' },
      { fecha: new Date('2025-12-25'), motivo: 'Navidad', tipo: 'feriado' }
    ];
    
    for (const feriado of feriados) {
      await DiaBloqueado.findOneAndUpdate(
        { fecha: feriado.fecha },
        feriado,
        { upsert: true, new: true }
      );
    }
    
    console.log(`   ✓ ${feriados.length} días bloqueados configurados`);
    console.log('');
    
    // ====================================
    // 3. HORARIOS DISPONIBLES
    // ====================================
    console.log('📋 Configurando horarios disponibles...');
    
    const horarios = [
      { hora: '10:00', capacidad: 100, orden: 1 },
      { hora: '11:00', capacidad: 100, orden: 2 },
      { hora: '14:00', capacidad: 100, orden: 3 }
    ];
    
    for (const horario of horarios) {
      await HorarioDisponible.findOneAndUpdate(
        { hora: horario.hora },
        horario,
        { upsert: true, new: true }
      );
    }
    
    console.log(`   ✓ ${horarios.length} horarios configurados`);
    console.log('');
    
    console.log('✅ Base de datos inicializada correctamente');
    console.log('');
    console.log('📊 Resumen:');
    console.log('  ✓ Configuración del sistema');
    console.log('  ✓ Días bloqueados (feriados)');
    console.log('  ✓ Horarios disponibles (10:00, 11:00, 14:00)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('🎉 Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export default initDatabase;