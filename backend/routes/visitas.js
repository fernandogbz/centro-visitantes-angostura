import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Visita from '../models/Visita.js';
import { generarCodigoVisita } from '../utils/generarCodigo.js';

const router = express.Router();

// Aforo máximo por día (configurable)
const AFORO_MAXIMO = 250;

/**
 * POST /api/visitas - Crear nueva reserva
 */
router.post(
  '/',
  [
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('hora').isIn(['10:00', '11:00', '14:00']).withMessage('Hora debe ser 10:00, 11:00 o 14:00'),
    body('institucion').optional().trim().isLength({ min: 3, max: 200 }).escape(),
    body('numVisitantes').isInt({ min: 1, max: 100 }).withMessage('Número de visitantes debe estar entre 1 y 100'),
    body('arboretum').isIn(['Si', 'No']).withMessage('Arboretum debe ser Si o No'),
    body('contacto.nombre').trim().notEmpty().withMessage('Nombre de contacto es requerido').escape(),
    body('contacto.telefono').matches(/^\+56\d{9}$/).withMessage('Teléfono debe tener formato +56XXXXXXXXX'),
    body('contacto.comuna').trim().notEmpty().withMessage('Comuna es requerida').escape(),
    body('contacto.correo').isEmail().normalizeEmail().withMessage('Email inválido')
  ],
  async (req, res) => {
    try {
      // Validar errores
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Datos inválidos', 
          detalles: errors.array() 
        });
      }

      const { fecha, hora, institucion, numVisitantes, arboretum, contacto } = req.body;
      const fechaVisita = new Date(fecha);

      // Validar que la fecha sea futura
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaVisita < hoy) {
        return res.status(400).json({ error: 'La fecha debe ser futura' });
      }

      // Calcular aforo usado en esa fecha
      const inicioDelDia = new Date(fechaVisita);
      inicioDelDia.setHours(0, 0, 0, 0);
      
      const finDelDia = new Date(fechaVisita);
      finDelDia.setHours(23, 59, 59, 999);

      const visitasDelDia = await Visita.find({
        fecha: { $gte: inicioDelDia, $lte: finDelDia },
        estado: { $ne: 'cancelada' }
      });

      const aforoReservado = visitasDelDia.reduce((sum, v) => sum + v.numVisitantes, 0);

      // Verificar si hay espacio disponible
      if (aforoReservado + numVisitantes > AFORO_MAXIMO) {
        return res.status(400).json({ 
          error: 'Aforo insuficiente',
          disponible: AFORO_MAXIMO - aforoReservado,
          solicitado: numVisitantes
        });
      }

      // Generar código de visita
      const codigoVisita = await generarCodigoVisita(fechaVisita);

      // Obtener nombre del día en español
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dia = diasSemana[fechaVisita.getDay()];

      // Crear visita
      const nuevaVisita = new Visita({
        codigoVisita,
        dia,
        fecha: fechaVisita,
        hora,
        institucion: institucion || '',
        numVisitantes,
        arboretum,
        contacto,
        estado: 'confirmada'
      });

      await nuevaVisita.save();

      res.status(201).json({
        mensaje: 'Reserva creada exitosamente',
        visita: {
          codigoVisita: nuevaVisita.codigoVisita,
          fecha: nuevaVisita.fecha,
          hora: nuevaVisita.hora,
          numVisitantes: nuevaVisita.numVisitantes,
          estado: nuevaVisita.estado
        }
      });

    } catch (error) {
      console.error('Error al crear visita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

/**
 * GET /api/visitas/disponibilidad?fecha=YYYY-MM-DD - Consultar disponibilidad
 */
router.get(
  '/disponibilidad',
  [
    query('fecha').isISO8601().withMessage('Fecha inválida')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Parámetros inválidos', 
          detalles: errors.array() 
        });
      }

      const fecha = new Date(req.query.fecha);
      
      const inicioDelDia = new Date(fecha);
      inicioDelDia.setHours(0, 0, 0, 0);
      
      const finDelDia = new Date(fecha);
      finDelDia.setHours(23, 59, 59, 999);

      const visitasDelDia = await Visita.find({
        fecha: { $gte: inicioDelDia, $lte: finDelDia },
        estado: { $ne: 'cancelada' }
      });

      const aforoReservado = visitasDelDia.reduce((sum, v) => sum + v.numVisitantes, 0);

      res.json({
        aforoMaximo: AFORO_MAXIMO,
        reservado: aforoReservado,
        disponible: AFORO_MAXIMO - aforoReservado
      });

    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
