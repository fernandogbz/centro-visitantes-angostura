import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos para la API
export interface CrearVisitaData {
  fecha: string; // ISO 8601
  hora: string;
  institucion?: string;
  numVisitantes: number;
  arboretum: 'Si' | 'No';
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

// Endpoints de visitas
export const visitasAPI = {
  crear: async (data: CrearVisitaData): Promise<VisitaResponse> => {
    const response = await api.post('/visitas', data);
    return response.data;
  },

  consultarDisponibilidad: async (fecha: string): Promise<DisponibilidadResponse> => {
    const response = await api.get(`/visitas/disponibilidad?fecha=${fecha}`);
    return response.data;
  },
};

// Manejo de errores centralizado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Error de la API
      console.error('Error API:', error.response.data);
      throw new Error(error.response.data.error || 'Error en la petición');
    } else if (error.request) {
      // No hubo respuesta
      console.error('Sin respuesta del servidor');
      throw new Error('No se pudo conectar con el servidor');
    } else {
      // Error al configurar la petición
      console.error('Error:', error.message);
      throw new Error('Error al realizar la petición');
    }
  }
);

export default api;
