import axios from "axios";
import { authService } from "./auth";

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

  obtenerProximas: async (limite?: number): Promise<ListadoVisitasResponse> => {
    const params = new URLSearchParams();
    if (limite) params.append("limite", limite.toString());

    const response = await api.get(`/visitas/proximas?${params.toString()}`);
    return response.data;
  },

  actualizarEstado: async (
    codigoVisita: string,
    estado: string
  ): Promise<any> => {
    const response = await api.patch(`/visitas/${codigoVisita}/estado`, {
      estado,
    });
    return response.data;
  },

  actualizarVisita: async (
    codigoVisita: string,
    data: Partial<CrearVisitaData>
  ): Promise<any> => {
    const response = await api.put(`/visitas/${codigoVisita}`, data);
    return response.data;
  },
};

/* VALIDACION DE TOKENS Y MANEJO DE ERRORES */

//Interceptor de tokens
api.interceptors.request.use(
  (config) => {
  const token = authService.getToken();

  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }

  return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Intercepta el response - Maneja errores de autenticacion
api.interceptors.response.use((response) => response,(error) => {
  if (error.response) {
    const { status, data } = error.response;

    // Manejo token expirado
    if(status === 401 && (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN' ||
      data.code === 'NO_TOKEN')) {
        console.warn('Tokenn incalido o expirado, redirigiendo al login...');
        authService.logout();
        window.location.href = '/'
      }

      //Acceso denegado ( no ea administrador)
      if (status === 403 && data.code === 'FORBIDDEN') {
        console.error('Acceso denegado');
        authService.logout();
        window.location.href = '/'
      }

      //Error de la API
        console.error('Error API', data);
        throw new Error(data.error || 'Error en la pertición');
    } else if (error.request) {
      console.error('Sin respuesat del servidor');
      throw  new Error('No se pudo conectar con el servidor')
    } else {
      console.error('Error: ', error.message);
      throw new Error('Error al realizar la peticion')
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
