import QRCode from "qrcode";

/**
 * Genera un código QR en formato base64
 * @param {string} codigoVisita - Código de visita único
 * @param {string} baseUrl - URL base de la aplicación
 * @returns {Promise<string>} - Imagen QR en formato base64
 */
export const generarQRBase64 = async (codigoVisita, baseUrl) => {
  try {
    // Construir la URL completa para validar el QR
    const qrUrl = `${baseUrl}/admin/validar/${codigoVisita}`;

    // Generar QR como data URL (base64)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#2C5F2D",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Error al generar QR:", error);
    throw new Error("No se pudo generar el código QR");
  }
};
