    import { useState, useEffect } from 'react';
    import {
    disponibilidadAPI,
    type DisponibilidadFechaResponse,
    type DiaBloqueado,
    } from '@/services/api';

    export const useDisponibilidad = (fechaSeleccionada?: Date) => {
    const [disponibilidad, setDisponibilidad] =
        useState<DisponibilidadFechaResponse | null>(null);
    const [diasBloqueados, setDiasBloqueados] = useState<DiaBloqueado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar días bloqueados al montar
    useEffect(() => {
        cargarDiasBloqueados();
    }, []);

    // Consultar disponibilidad cuando cambia la fecha
    useEffect(() => {
        if (fechaSeleccionada) {
        consultarDisponibilidad(fechaSeleccionada);
        }
    }, [fechaSeleccionada]);

    const cargarDiasBloqueados = async () => {
        try {
        const data = await disponibilidadAPI.obtenerDiasBloqueados();
        setDiasBloqueados(data);
        } catch (err) {
        console.error('Error cargando días bloqueados:', err);
        }
    };

    const consultarDisponibilidad = async (fecha: Date) => {
        setLoading(true);
        setError(null);

        try {
        const fechaISO = fecha.toISOString().split('T')[0];
        console.log('🔍 Consultando disponibilidad para:', fechaISO);
        const data = await disponibilidadAPI.consultarDisponibilidadFecha(fechaISO);
        console.log('✅ Disponibilidad recibida:', data);
        setDisponibilidad(data);
        } catch (err) {
        // ✅ SOLUCIÓN 1: Usar unknown y type guard
        console.error('❌ Error al consultar disponibilidad:', err);
        const mensaje = err instanceof Error ? err.message : 'Error al consultar disponibilidad';
        setError(mensaje);
        setDisponibilidad(null);
        } finally {
        setLoading(false);
        }
    };

    const validarReserva = async (
        fecha: Date,
        hora: string,
        numVisitantes: number
    ) => {
        try {
        const fechaISO = fecha.toISOString().split('T')[0];
        const resultado = await disponibilidadAPI.validarReserva({
            fecha: fechaISO,
            hora,
            numVisitantes,
        });
        return resultado;
        } catch (err) {
        // ✅ SOLUCIÓN 2: Type guard para Error
        const mensaje = err instanceof Error ? err.message : 'Error al validar reserva';
        throw new Error(mensaje);
        }
    };

    const esFechaBloqueada = (fecha: Date): boolean => {
        const fechaISO = fecha.toISOString().split('T')[0];
        return diasBloqueados.some(
        (dia) => dia.fecha.split('T')[0] === fechaISO && dia.activo
        );
    };

    const obtenerMotivoBloqueado = (fecha: Date): string | null => {
        const fechaISO = fecha.toISOString().split('T')[0];
        const diaB = diasBloqueados.find(
        (dia) => dia.fecha.split('T')[0] === fechaISO && dia.activo
        );
        return diaB?.motivo || null;
    };

    return {
        disponibilidad,
        diasBloqueados,
        loading,
        error,
        consultarDisponibilidad,
        validarReserva,
        esFechaBloqueada,
        obtenerMotivoBloqueado,
    };
    };
