import Visita from '../models/Visita.js';

/**
 * Genera un código único de visita en formato VIS-YYYYMMDD-NNN
 * @param {Date} fecha - Fecha de la visita
 * @returns {Promise<string>} Código de visita generado
 */
export const generarCodigoVisita = async (fecha) => {
  // Formatear fecha como YYYYMMDD
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const yyyymmdd = `${year}${month}${day}`;

  // Contar visitas existentes para ese día
  const inicioDelDia = new Date(fecha);
  inicioDelDia.setHours(0, 0, 0, 0);
  
  const finDelDia = new Date(fecha);
  finDelDia.setHours(23, 59, 59, 999);

  const count = await Visita.countDocuments({
    fecha: { $gte: inicioDelDia, $lte: finDelDia }
  });

  // Generar secuencia con padding de 3 dígitos
  const secuencia = String(count + 1).padStart(3, '0');

  return `VIS-${yyyymmdd}-${secuencia}`;
};
