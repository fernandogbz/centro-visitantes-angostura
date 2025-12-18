import express from 'express';
import DisponibilidadService from '../services/disponibilidad.js';
import DiaBloqueado from '../models/diaBloqueado.js';

const router = express.Router();

    // GET /api/disponibilidad/:fecha
    router.get('/:fecha', async (req, res) => {
    try {
        const { fecha } = req.params;
        
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({
            error: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
        }
        
        const disponibilidad = await DisponibilidadService.obtenerDisponibilidadFecha(fecha);
        res.json(disponibilidad);
        
    } catch (error) {
        console.error('Error en GET /disponibilidad/:fecha:', error);
        res.status(500).json({
        error: 'Error al obtener disponibilidad',
        mensaje: error.message
        });
    }
    });

    // POST /api/disponibilidad/validar
    router.post('/validar', async (req, res) => {
    try {
        const { fecha, hora, numVisitantes } = req.body;
        
        if (!fecha || !hora || !numVisitantes) {
        return res.status(400).json({
            error: 'Faltan datos requeridos: fecha, hora, numVisitantes'
        });
        }
        
        const resultado = await DisponibilidadService.validarReserva(
        fecha,
        hora,
        numVisitantes
        );
        
        res.json(resultado);
        
    } catch (error) {
        console.error('Error en POST /disponibilidad/validar:', error);
        res.status(500).json({
        error: 'Error al validar reserva',
        mensaje: error.message
        });
    }
    });

    // GET /api/disponibilidad/config/all
    router.get('/config/all', async (req, res) => {
    try {
        const config = await DisponibilidadService.obtenerConfiguracion();
        res.json(config);
    } catch (error) {
        console.error('Error en GET /disponibilidad/config:', error);
        res.status(500).json({
        error: 'Error al obtener configuración',
        mensaje: error.message
        });
    }
    });

    // GET /api/disponibilidad/dias-bloqueados/all
    router.get('/dias-bloqueados/all', async (req, res) => {
    try {
        const diasBloqueados = await DiaBloqueado.find({ activo: true })
        .sort({ fecha: 1 });
        res.json(diasBloqueados);
    } catch (error) {
        console.error('Error en GET /disponibilidad/dias-bloqueados:', error);
        res.status(500).json({
        error: 'Error al obtener días bloqueados',
        mensaje: error.message
        });
    }
    });

    export default router;