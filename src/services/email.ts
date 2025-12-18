// Import de emailjs para el envio de correos electronicos para la confirmacion de reserva
import emailjs from "@emailjs/browser";

// Variables de entorno para emailjs
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

// Funcion para envio el correo con info de la reserva
export const sendEmail = async (datos: {
  // Datos y tipo de datos necesario para el envio del correo
  email: string;
  nombre: string;
  codigoVisita: string;
  fecha: string;
  hora: string;
  numVisitantes: number;
  arboretum: string;
  qrCode?: string; // QR en formato base64
}) => {
  // Estructura de try/catch para el envio del correo
  try {
    console.log("Enviando email con:", {
      SERVICE_ID,
      TEMPLATE_ID,
      PUBLIC_KEY: PUBLIC_KEY ? "***configurado***" : "FALTA",
      datos,
    });

    const templateParams = {
      to_email: datos.email,
      to_name: datos.nombre,
      codigo_visita: datos.codigoVisita,
      fecha: datos.fecha,
      hora: datos.hora,
      num_visitantes: datos.numVisitantes,
      arboretum: datos.arboretum,
      qr_code: datos.qrCode || "", // QR en base64 para la plantilla
    };

    // Envio del correo usando emailjs, retorna la respuesta
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    console.log("Email enviado exitosamente:", response);
    return response;
    // Catch para errores en el envio del correo
  } catch (error) {
    console.error("Error completo al enviar email:", {
      status: error.status,
      text: error.text,
      message: error.message,
      error,
    });
    throw error;
  }
};
