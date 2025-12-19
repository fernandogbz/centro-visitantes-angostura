import Visita from '../models/Visita.js';

/**
 * Genera un código único de visita con formato: VIS-YYYYMMDD-XXX
 * @returns {Promise<string>} Código único generado
 */
export const generarCodigoVisita = async () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const fechaBase = `${year}${month}${day}`;

  // Buscar el último código del día
  const ultimaVisita = await Visita.findOne({
    codigoVisita: { $regex: `^VIS-${fechaBase}-` }
  })
    .sort({ codigoVisita: -1 })
    .select('codigoVisita')
    .lean();

  let secuencia = 1;

  if (ultimaVisita) {
    // Extraer número de secuencia del último código
    const match = ultimaVisita.codigoVisita.match(/-(\d{3})$/);
    if (match) {
      secuencia = parseInt(match[1], 10) + 1;
    }
  }

  const secuenciaStr = String(secuencia).padStart(3, '0');
  const nuevoCodigo = `VIS-${fechaBase}-${secuenciaStr}`;

  // Verificar que no exista (por seguridad)
  const existe = await Visita.findOne({ codigoVisita: nuevoCodigo });
  
  if (existe) {
    // Si existe, incrementar secuencia recursivamente
    console.warn(`⚠️ Código duplicado detectado: ${nuevoCodigo}, generando nuevo...`);
    return generarCodigoVisita();
  }

  console.log(`✅ Código único generado: ${nuevoCodigo}`);
  return nuevoCodigo;
};
