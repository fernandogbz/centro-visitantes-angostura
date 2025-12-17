import express from "express";
import { body, query, validationResult } from "express-validator";
import Visita from "../models/Visita.js";
import { generarCodigoVisita } from "../utils/generarCodigo.js";

const router = express.Router();

/**
 * POST /api/visitas - Crear nueva reserva
 */
router.post(
  "/",
  [
    body("fecha").isISO8601().withMessage("Fecha inválida"),
    body("hora")
      .isIn([
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
      ])
      .withMessage("Hora no válida"),
    body("institucion")
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .escape(),
    body("numVisitantes")
      .isInt({ min: 1, max: 30 })
      .withMessage("Número de visitantes debe estar entre 1 y 30"),
    body("arboretum")
      .isIn(["Si", "No"])
      .withMessage("Arboretum debe ser Si o No"),
    body("contacto.nombre")
      .trim()
      .notEmpty()
      .withMessage("Nombre de contacto es requerido")
      .escape(),
    body("contacto.telefono")
      .matches(/^\+56\d{9}$/)
      .withMessage("Teléfono debe tener formato +56XXXXXXXXX"),
    body("contacto.comuna")
      .trim()
      .notEmpty()
      .withMessage("Comuna es requerida")
      .escape(),
    body("contacto.correo")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email inválido"),
  ],
  async (req, res) => {
    try {
      // Validar errores
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Datos inválidos",
          detalles: errors.array(),
        });
      }

      const { fecha, hora, institucion, numVisitantes, arboretum, contacto } =
        req.body;

      // Parsear fecha en hora local para evitar problemas de zona horaria
      const [year, month, day] = fecha.split("-").map(Number);
      const fechaVisita = new Date(year, month - 1, day, 0, 0, 0, 0);

      // Validar que la fecha sea futura
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaVisita < hoy) {
        return res.status(400).json({ error: "La fecha debe ser futura" });
      }

      // La validación de capacidad se hace en el servicio de disponibilidad
      // No validamos aforo total aquí, solo por horario

      // Generar código de visita
      const codigoVisita = await generarCodigoVisita(fechaVisita);

      // Obtener nombre del día en español
      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const dia = diasSemana[fechaVisita.getDay()];

      // Crear visita
      const nuevaVisita = new Visita({
        codigoVisita,
        dia,
        fecha: fechaVisita,
        hora,
        institucion: institucion || "",
        numVisitantes,
        arboretum,
        contacto,
        estado: "confirmada",
      });

      await nuevaVisita.save();

      res.status(201).json({
        mensaje: "Reserva creada exitosamente",
        visita: {
          codigoVisita: nuevaVisita.codigoVisita,
          fecha: nuevaVisita.fecha,
          hora: nuevaVisita.hora,
          numVisitantes: nuevaVisita.numVisitantes,
          estado: nuevaVisita.estado,
        },
      });
    } catch (error) {
      console.error("Error al crear visita:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// Busca si existe el endpoint /estadisticas
router.get("/estadisticas", async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const currentYear = ano ? parseInt(ano) : new Date().getFullYear();
    const currentMonth = mes ? parseInt(mes) : new Date().getMonth() + 1;

    // Fecha de inicio y fin del periodo
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Total de visitantes del periodo
    const visitasPeriodo = await Visita.find({
      fecha: { $gte: startDate, $lte: endDate },
      estado: { $ne: "cancelada" },
    });

    if (visitasPeriodo.length === 0) {
      return res.json({
        periodo: {
          mes: currentMonth,
          ano: currentYear,
          fechaInicio: startDate,
          fechaFin: endDate,
        },
        totalVisitantes: 0,
        totalVisitas: 0,
        visitasConfirmadas: 0,
        visitasRealizadas: 0,
        rankingComunas: [],
        flujoDiario: [],
      });
    }

    const totalVisitantes = visitasPeriodo.reduce(
      (sum, visita) => sum + visita.numVisitantes,
      0
    );

    // Ranking de comunas
    const comunasCount = {};
    visitasPeriodo.forEach((visita) => {
      const comuna = visita.contacto.comuna;
      comunasCount[comuna] = (comunasCount[comuna] || 0) + visita.numVisitantes;
    });

    const rankingComunas = Object.entries(comunasCount)
      .map(([comuna, visitantes]) => ({ comuna, visitantes }))
      .sort((a, b) => b.visitantes - a.visitantes);

    // Flujo de asistencia por día
    const flujoAsistencia = {};
    visitasPeriodo.forEach((visita) => {
      const dia = visita.fecha.getDate();
      flujoAsistencia[dia] = (flujoAsistencia[dia] || 0) + visita.numVisitantes;
    });

    const flujoDiario = Object.entries(flujoAsistencia)
      .map(([dia, visitantes]) => ({ dia: parseInt(dia), visitantes }))
      .sort((a, b) => a.dia - b.dia);

    // Estadísticas generales
    const totalVisitas = visitasPeriodo.length;
    const visitasConfirmadas = visitasPeriodo.filter(
      (v) => v.estado === "confirmada"
    ).length;
    const visitasRealizadas = visitasPeriodo.filter(
      (v) => v.estado === "realizada"
    ).length;

    const response = {
      periodo: {
        mes: currentMonth,
        ano: currentYear,
        fechaInicio: startDate,
        fechaFin: endDate,
      },
      totalVisitantes,
      totalVisitas,
      visitasConfirmadas,
      visitasRealizadas,
      rankingComunas,
      flujoDiario,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener estadísticas", details: error.message });
  }
});

/**
 * GET /api/visitas/listado - Obtener listado completo de visitas
 */
router.get("/listado", async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const currentYear = ano ? parseInt(ano) : new Date().getFullYear();
    const currentMonth = mes ? parseInt(mes) : new Date().getMonth() + 1;

    // Fecha de inicio y fin del periodo
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Obtener todas las visitas del periodo (más reciente primero)
    const visitas = await Visita.find({
      fecha: { $gte: startDate, $lte: endDate },
    }).sort({ fecha: -1, hora: -1 });

    res.json({
      visitas: visitas.map((v) => ({
        codigoVisita: v.codigoVisita,
        fecha: v.fecha,
        hora: v.hora,
        dia: v.dia,
        numVisitantes: v.numVisitantes,
        institucion: v.institucion,
        arboretum: v.arboretum,
        estado: v.estado,
        contacto: {
          nombre: v.contacto.nombre,
          telefono: v.contacto.telefono,
          comuna: v.contacto.comuna,
          correo: v.contacto.correo,
        },
      })),
    });
  } catch (error) {
    console.error("❌ Error al obtener listado:", error);
    res
      .status(500)
      .json({ error: "Error al obtener listado", details: error.message });
  }
});

/**
 * GET /api/visitas/proximas - Obtener próximas visitas desde hoy
 */
router.get("/proximas", async (req, res) => {
  try {
    const { limite } = req.query;
    const limit = limite ? parseInt(limite) : 5;

    // Fecha actual a las 00:00:00
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener TODAS las visitas desde hoy en adelante
    const todasLasVisitas = await Visita.find({
      fecha: { $gte: hoy },
      estado: { $in: ["confirmada", "realizada"] },
    }).sort({ fecha: 1, hora: 1 });

    // Tomar solo las primeras 'limit' visitas
    const visitas = todasLasVisitas.slice(0, limit);

    res.json({
      visitas: visitas.map((v) => ({
        codigoVisita: v.codigoVisita,
        fecha: v.fecha,
        hora: v.hora,
        dia: v.dia,
        numVisitantes: v.numVisitantes,
        institucion: v.institucion,
        arboretum: v.arboretum,
        estado: v.estado,
        contacto: {
          nombre: v.contacto.nombre,
          telefono: v.contacto.telefono,
          comuna: v.contacto.comuna,
          correo: v.contacto.correo,
        },
      })),
    });
  } catch (error) {
    console.error("❌ Error al obtener próximas visitas:", error);
    res.status(500).json({
      error: "Error al obtener próximas visitas",
      details: error.message,
    });
  }
});

/**
 * PATCH /api/visitas/:codigo/estado - Actualizar estado de una visita
 */
router.patch("/:codigo/estado", async (req, res) => {
  try {
    const { codigo } = req.params;
    const { estado } = req.body;

    if (!["confirmada", "realizada", "cancelada"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const visita = await Visita.findOneAndUpdate(
      { codigoVisita: codigo },
      { estado },
      { new: true }
    );

    if (!visita) {
      return res.status(404).json({ error: "Visita no encontrada" });
    }

    res.json({ mensaje: "Estado actualizado", visita });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

/**
 * PUT /api/visitas/:codigo - Actualizar visita completa
 */
router.put("/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    const { fecha, hora, institucion, numVisitantes, arboretum, contacto } =
      req.body;

    // Obtener nombre del día si cambia la fecha
    let dia;
    let fechaObj;
    if (fecha) {
      // Parsear fecha en hora local, no UTC, para evitar cambios de día
      const [year, month, day] = fecha.split("-").map(Number);
      fechaObj = new Date(year, month - 1, day, 0, 0, 0, 0);

      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      dia = diasSemana[fechaObj.getDay()];
    }

    const updateData = {};
    if (fechaObj) updateData.fecha = fechaObj;
    if (hora) updateData.hora = hora;
    if (institucion !== undefined) updateData.institucion = institucion;
    if (numVisitantes) updateData.numVisitantes = numVisitantes;
    if (arboretum) updateData.arboretum = arboretum;
    if (contacto) updateData.contacto = contacto;
    if (dia) updateData.dia = dia;

    const visita = await Visita.findOneAndUpdate(
      { codigoVisita: codigo },
      updateData,
      { new: true, runValidators: true }
    );

    if (!visita) {
      return res.status(404).json({ error: "Visita no encontrada" });
    }

    res.json({ mensaje: "Visita actualizada", visita });
  } catch (error) {
    console.error("❌ Error al actualizar visita:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar visita", details: error.message });
  }
});

/**
 * GET /api/visitas/disponibilidad?fecha=YYYY-MM-DD - Consultar disponibilidad
 */
router.get(
  "/disponibilidad",
  [query("fecha").isISO8601().withMessage("Fecha inválida")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Parámetros inválidos",
          detalles: errors.array(),
        });
      }

      const fecha = new Date(req.query.fecha);

      const inicioDelDia = new Date(fecha);
      inicioDelDia.setHours(0, 0, 0, 0);

      const finDelDia = new Date(fecha);
      finDelDia.setHours(23, 59, 59, 999);

      const visitasDelDia = await Visita.find({
        fecha: { $gte: inicioDelDia, $lte: finDelDia },
        estado: { $ne: "cancelada" },
      });

      const aforoReservado = visitasDelDia.reduce(
        (sum, v) => sum + v.numVisitantes,
        0
      );

      res.json({
        aforoMaximo: AFORO_MAXIMO,
        reservado: aforoReservado,
        disponible: AFORO_MAXIMO - aforoReservado,
      });
    } catch (error) {
      console.error("Error al consultar disponibilidad:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

export default router;
