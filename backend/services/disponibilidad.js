import ConfiguracionSistema from '../models/configSystem.js';
import DiaBloqueado from '../models/diaBloqueado.js';
import HorarioDisponible from '../models/horarioDisponible.js';
import Visita from '../models/Visita.js';

class DisponibilidadService {
/**
   * Obtiene la disponibilidad completa de una fecha
*/
static async obtenerDisponibilidadFecha(fecha) {
try {
    const fechaObj = new Date(fecha);
        fechaObj.setHours(0, 0, 0, 0);

    // 1. Verificar si es lunes (cerrado)
    if (fechaObj.getDay() === 1) {
        return {
            fecha: fecha,
            disponible: false,
            motivo: 'Centro cerrado los días lunes',
            horarios: []
        };
    }
    
    // 2. Verificar si la fecha está bloqueada
    const diaBloqueado = await DiaBloqueado.findOne({
        fecha: fechaObj,
        activo: true
    });

    if (diaBloqueado) {
        return {
            fecha: fecha,
            disponible: false,
            motivo: diaBloqueado.motivo,
            horarios: []
        };
    }
      // 3. Obtener horarios disponibles
    const horarios = await HorarioDisponible.find({ activo: true })
        .sort({ orden: 1 })
        .lean();

      // 4. Para cada horario, calcular cupos disponibles
    const horariosDisponibilidad = await Promise.all(
        horarios.map(async (horario) => {
          // Contar reservas confirmadas para esa fecha y hora
          const inicioDia = new Date(fechaObj);
          inicioDia.setHours(0, 0, 0, 0);
          const finDia = new Date(fechaObj);
          finDia.setHours(23, 59, 59, 999);
          
            const reservas = await Visita.find({
                fecha: { $gte: inicioDia, $lte: finDia },
                hora: horario.hora,
                estado: { $in: ['confirmada', 'completada'] }
            });

        const visitantesReservados = reservas.reduce(
            (sum, visita) => sum + (visita.numVisitantes || 0),
            0
        );
        
        const cuposDisponibles = horario.capacidad - visitantesReservados;
        
            return {
                hora: horario.hora,
                capacidad: horario.capacidad,
                disponible: Math.max(cuposDisponibles, 0),
                ocupado: visitantesReservados,
                porcentajeOcupacion: Math.round(
              (visitantesReservados / horario.capacidad) * 100
            )
        };
        })
    );

    // 5. Calcular disponibilidad total del día
    const totalCapacidad = horariosDisponibilidad.reduce(
        (sum, h) => sum + h.capacidad, 0
    );
    const totalDisponible = horariosDisponibilidad.reduce(
        (sum, h) => sum + h.disponible, 0
    );
    
        return {
            fecha: fecha,
            disponible: totalDisponible > 0,
            capacidadTotal: totalCapacidad,
            cuposDisponibles: totalDisponible,
            cuposOcupados: totalCapacidad - totalDisponible,
            porcentajeOcupacion: Math.round(
          ((totalCapacidad - totalDisponible) / totalCapacidad) * 100
        ),
        horarios: horariosDisponibilidad
    };

    } catch (error) {
        console.error('Error en obtenerDisponibilidadFecha:', error);
        throw error;
        }
    }

/**
   * Valida si se puede hacer una reserva
   */
static async validarReserva(fecha, hora, numVisitantes) {
    try {
        const fechaObj = new Date(fecha);
        fechaObj.setHours(0, 0, 0, 0);

        const ahora = new Date();
        ahora.setHours(0, 0, 0, 0);

    // 1. Validar fecha no sea del pasado
    if (fechaObj < ahora) {
        return {
            valido: false,
            mensaje: 'No se pueden hacer reservas en fechas pasadas'
        };
    }
    
    // 2. Validar que no sea lunes (cerrado)
    if (fechaObj.getDay() === 1) {
        return {
            valido: false,
            mensaje: 'El centro permanece cerrado los días lunes'
        };
    }
    
    // 3. Validar anticipación mínima
    const configMin = await ConfiguracionSistema.findOne({ clave: 'anticipacion_minima' });
    const anticipacionMinima = configMin ? parseInt(configMin.valor) : 24;
    
    const horasAnticipacion = (new Date(fecha) - new Date()) / (1000 * 60 * 60);

    if (horasAnticipacion < anticipacionMinima) {
        return {
            valido: false,
            mensaje: `Debes reservar con al menos ${anticipacionMinima} horas de anticipación`
        };
    }

    // 4. Validar anticipación máxima
    const configMax = await ConfiguracionSistema.findOne({ clave: 'anticipacion_maxima' });
    const anticipacionMaxima = configMax ? parseInt(configMax.valor) : 720;

        if (horasAnticipacion > anticipacionMaxima) {
            const diasMax = Math.round(anticipacionMaxima / 24);
        return {
            valido: false,
            mensaje: `No se pueden hacer reservas con más de ${diasMax} días de anticipación`
        };
    }
    
    // 5. Verificar si la fecha está bloqueada
    const diaBloqueado = await DiaBloqueado.findOne({
        fecha: fechaObj,
        activo: true
    });

    if (diaBloqueado) {
        return {
            valido: false,
            mensaje: `Fecha no disponible: ${diaBloqueado.motivo}`
        };
    }

    // 6. Verificar cupos disponibles
    const horario = await HorarioDisponible.findOne({ hora: hora, activo: true });

    if (!horario) {
        return {
            valido: false,
            mensaje: 'Horario no válido'
        };
    }

    const inicioDia = new Date(fechaObj);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaObj);
    finDia.setHours(23, 59, 59, 999);
    
    const reservas = await Visita.find({
        fecha: { $gte: inicioDia, $lte: finDia },
        hora: hora,
        estado: { $in: ['confirmada', 'completada'] }
    });

    const visitantesReservados = reservas.reduce(
        (sum, visita) => sum + (visita.numVisitantes || 0),
        0
    );

    const cuposDisponibles = horario.capacidad - visitantesReservados;

    if (cuposDisponibles < numVisitantes) {
        return {
            valido: false,
            mensaje: `Solo hay ${cuposDisponibles} cupos disponibles en ese horario`
        };
    }

    // 6. Todo OK
    return {
        valido: true,
        mensaje: 'Reserva válida',
        cuposDisponibles
    };

    } catch (error) {
        console.error('Error en validarReserva:', error);
        throw error;
    }
}

/**
   * Obtener configuración del sistema
   */
static async obtenerConfiguracion() {
    try {
        const configs = await ConfiguracionSistema.find({});
        const resultado = {};
    configs.forEach(config => {
        resultado[config.clave] = {
            valor: config.getValorParseado(),
            descripcion: config.descripcion,
            tipo: config.tipo
        };
    });
    
    return resultado;
    
    } catch (error) {
        console.error('Error en obtenerConfiguracion:', error);
        throw error;
    }
 }
}

export default DisponibilidadService;