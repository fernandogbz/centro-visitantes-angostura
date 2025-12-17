import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tipos para la API
export interface CrearVisitaData {
  fecha: string; // ISO 8601
  hora: string;
  institucion?: string;
  numVisitantes: number;
  arboretum: "Si" | "No";
  contacto: {
    nombre: string;
    telefono: string;
    comuna: string;
    correo: string;
  };
}

export interface VisitaResponse {
  mensaje: string;
  visita: {
    codigoVisita: string;
    fecha: string;
    hora: string;
    numVisitantes: number;
    estado: string;
  };
}

export interface DisponibilidadResponse {
  aforoMaximo: number;
  reservado: number;
  disponible: number;
}

export interface EstadisticasResponse {
  periodo: {
    mes: number;
    ano: number;
    fechaInicio: string;
    fechaFin: string;
  };
  totalVisitantes: number;
  totalVisitas: number;
  visitasConfirmadas: number;
  visitasRealizadas: number;
  rankingComunas: Array<{
    comuna: string;
    visitantes: number;
  }>;
  flujoDiario: Array<{
    dia: number;
    visitantes: number;
  }>;
}

export interface VisitaDetalle {
  codigoVisita: string;
  fecha: string;
  hora: string;
  dia: string;
  numVisitantes: number;
  institucion?: string;
  arboretum: string;
  estado: string;
  contacto: {
    nombre: string;
    telefono: string;
    comuna: string;
    correo: string;
  };
}

export interface ListadoVisitasResponse {
  visitas: VisitaDetalle[];
}

// Endpoints de visitas
export const visitasAPI = {
  crear: async (data: CrearVisitaData): Promise<VisitaResponse> => {
    const response = await api.post("/visitas", data);
    return response.data;
  },

  consultarDisponibilidad: async (
    fecha: string
  ): Promise<DisponibilidadResponse> => {
    const response = await api.get(`/visitas/disponibilidad?fecha=${fecha}`);
    return response.data;
  },

  obtenerEstadisticas: async (
    mes?: number,
    ano?: number
  ): Promise<EstadisticasResponse> => {
    const params = new URLSearchParams();
    if (mes) params.append("mes", mes.toString());
    if (ano) params.append("ano", ano.toString());

    console.log("🔍 Llamando a /visitas/estadisticas con:", { mes, ano });
    console.log(
      "📍 URL completa:",
      `/visitas/estadisticas?${params.toString()}`
    );

    const response = await api.get(
      `/visitas/estadisticas?${params.toString()}`
    );

    console.log("📥 Respuesta recibida:", response.data);

    return response.data;
  },

  obtenerListado: async (
    mes?: number,
    ano?: number
  ): Promise<ListadoVisitasResponse> => {
    const params = new URLSearchParams();
    if (mes) params.append("mes", mes.toString());
    if (ano) params.append("ano", ano.toString());

    const response = await api.get(`/visitas/listado?${params.toString()}`);
    return response.data;
  },
};

// Manejo de errores centralizado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Error de la API
      console.error("Error API:", error.response.data);
      throw new Error(error.response.data.error || "Error en la petición");
    } else if (error.request) {
      // No hubo respuesta
      console.error("Sin respuesta del servidor");
      throw new Error("No se pudo conectar con el servidor");
    } else {
      // Error al configurar la petición
      console.error("Error:", error.message);
      throw new Error("Error al realizar la petición");
    }
  }
);

// ===================================
// TIPOS PARA DISPONIBILIDAD
// ===================================

export interface HorarioDisponibilidad {
  hora: string;
  capacidad: number;
  disponible: number;
  ocupado: number;
  porcentajeOcupacion: number;
}

export interface DisponibilidadFechaResponse {
  fecha: string;
  disponible: boolean;
  motivo?: string;
  capacidadTotal?: number;
  cuposDisponibles?: number;
  cuposOcupados?: number;
  porcentajeOcupacion?: number;
  horarios: HorarioDisponibilidad[];
}

export interface ValidarReservaRequest {
  fecha: string;
  hora: string;
  numVisitantes: number;
}

export interface ValidarReservaResponse {
  valido: boolean;
  mensaje: string;
  cuposDisponibles?: number;
}

export interface DiaBloqueado {
  _id: string;
  fecha: string;
  motivo: string;
  tipo: string;
  activo: boolean;
}

// ===================================
// API DE DISPONIBILIDAD
// ===================================

export const disponibilidadAPI = {
  consultarDisponibilidadFecha: async (
    fecha: string
  ): Promise<DisponibilidadFechaResponse> => {
    const response = await api.get(`/disponibilidad/${fecha}`);
    return response.data;
  },

  validarReserva: async (
    data: ValidarReservaRequest
  ): Promise<ValidarReservaResponse> => {
    const response = await api.post("/disponibilidad/validar", data);
    return response.data;
  },

  obtenerDiasBloqueados: async (): Promise<DiaBloqueado[]> => {
    const response = await api.get("/disponibilidad/dias-bloqueados/all");
    return response.data;
  },
};

export default api;
