/**
 * Utilidades para formateo de fechas
 */

/**
 * Convierte una fecha ISO a formato YYYY-MM-DD para inputs de tipo date
 * @param fecha - Fecha en formato ISO string o Date
 * @returns Fecha en formato YYYY-MM-DD
 */
export const formatearParaInput = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
  const year = fechaObj.getFullYear();
  const month = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const day = String(fechaObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha completa con día de la semana
 * @param fecha - Fecha en formato ISO string o Date
 * @param diaTexto - Día de la semana (opcional, si no se pasa se calcula)
 * @returns Fecha formateada como "Jueves - 18 diciembre 2025"
 */
export const formatearFechaCompleta = (
  fecha: string | Date,
  diaTexto?: string
): string => {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;

  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const diaSemana = diaTexto || diasSemana[fechaObj.getDay()];
  const dia = fechaObj.getDate();
  const mes = meses[fechaObj.getMonth()];
  const año = fechaObj.getFullYear();

  return `${diaSemana} - ${dia} ${mes} ${año}`;
};

/**
 * Obtiene el nombre del día de la semana de una fecha
 * @param fecha - Fecha en formato ISO string o Date
 * @returns Nombre del día (Lunes, Martes, etc.)
 */
export const obtenerDiaSemana = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return diasSemana[fechaObj.getDay()];
};

/**
 * Formatea una fecha para mostrar en formato corto
 * @param fecha - Fecha en formato ISO string o Date
 * @returns Fecha en formato "18/12/2025"
 */
export const formatearFechaCorta = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
  const dia = String(fechaObj.getDate()).padStart(2, "0");
  const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const año = fechaObj.getFullYear();
  return `${dia}/${mes}/${año}`;
};
