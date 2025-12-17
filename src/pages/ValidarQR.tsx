import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Users,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { visitasAPI } from "@/services/api";
import { formatearFechaCompleta } from "@/utils/formatearFecha";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Visita {
  codigoVisita: string;
  dia: string;
  fecha: Date;
  hora: string;
  institucion: string;
  numVisitantes: number;
  arboretum: string;
  contacto: {
    nombre: string;
    telefono: string;
    comuna: string;
    correo: string;
  };
  estado: string;
}

const ValidarQR = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [validando, setValidando] = useState(false);
  const [visita, setVisita] = useState<Visita | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [esQrValido, setEsQrValido] = useState(false);
  const [esFechaFutura, setEsFechaFutura] = useState(false);

  useEffect(() => {
    cargarVisita();
  }, [codigo]);

  const cargarVisita = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/api/visitas/codigo/${codigo}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError(
            "QR inválido: No se encontró ninguna reserva con este código"
          );
        } else {
          setError("Error al cargar la información de la visita");
        }
        return;
      }

      const data = await response.json();
      const visitaData = {
        ...data.visita,
        fecha: new Date(data.visita.fecha),
      };
      setVisita(visitaData);

      // Validar si el QR es válido (mismo día)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaVisita = new Date(visitaData.fecha);
      fechaVisita.setHours(0, 0, 0, 0);

      const esValido = hoy.getTime() === fechaVisita.getTime();
      const esFutura = fechaVisita.getTime() > hoy.getTime();

      setEsQrValido(esValido);
      setEsFechaFutura(esFutura);

      // Si NO es válido (no es el mismo día) y la fecha ya pasó, marcar como "no_asistio"
      if (!esValido && !esFutura && visitaData.estado === "confirmada") {
        try {
          await visitasAPI.actualizarVisita(visitaData.codigoVisita, {
            estado: "no_asistio" as any,
          });
          // Actualizar el estado local
          setVisita((prev) =>
            prev ? { ...prev, estado: "no_asistio" } : null
          );
        } catch (error) {
          console.error("Error al actualizar estado a no_asistio:", error);
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async () => {
    if (!visita) return;

    try {
      setValidando(true);

      await visitasAPI.actualizarVisita(visita.codigoVisita, {
        estado: "completada" as any,
      });

      toast({
        title: "✅ Visita Validada",
        description: "La reserva ha sido marcada como completada",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (error) {
      console.error("Error al validar:", error);
      toast({
        title: "Error",
        description: "No se pudo validar la visita",
        variant: "destructive",
      });
    } finally {
      setValidando(false);
    }
  };

  const handleCancelar = () => {
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando QR...</p>
        </div>
      </div>
    );
  }

  if (error || !visita) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center">
          <Card className="max-w-2xl mx-auto border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-6 w-6" />
                QR Inválido
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {error || "No se encontró la reserva"}
                </AlertDescription>
              </Alert>
              <div className="mt-6 flex justify-center">
                <Button onClick={() => navigate("/")} variant="outline">
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!esQrValido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center">
          <Card className="max-w-2xl mx-auto border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-6 w-6" />
                {esFechaFutura ? "QR Anticipado" : "QR Expirado"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="ml-2 text-orange-800">
                  {esFechaFutura
                    ? `Este QR solo será válido el día de la visita programada. La fecha de esta reserva es para el ${formatearFechaCompleta(
                        visita.fecha,
                        visita.dia
                      )}.`
                    : `Este QR solo es válido el día de la visita programada. La fecha de esta reserva era para el ${formatearFechaCompleta(
                        visita.fecha,
                        visita.dia
                      )}.`}
                </AlertDescription>
              </Alert>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Código de Reserva:</p>
                  <p className="font-mono font-bold text-lg">
                    {visita.codigoVisita}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => navigate("/")} variant="outline">
                    Volver al Inicio
                  </Button>
                  <Button onClick={() => navigate("/admin")}>
                    Ir al Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <Card className="max-w-3xl mx-auto border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-7 w-7" />
              Validación de Reserva
            </CardTitle>
            <p className="text-green-100 text-sm mt-2">
              Código: {visita.codigoVisita}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Estado */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  QR Válido - Fecha Correcta
                </span>
              </div>
              <Badge
                className={`${
                  visita.estado === "confirmada"
                    ? "bg-blue-500"
                    : visita.estado === "realizada"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {visita.estado}
              </Badge>
            </div>

            {/* Información de la Visita */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Fecha
                  </Label>
                  <p className="text-lg font-semibold">
                    {formatearFechaCompleta(visita.fecha, visita.dia)}
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Hora
                  </Label>
                  <p className="text-lg font-semibold">{visita.hora}</p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Users className="h-4 w-4" />
                    Número de Visitantes
                  </Label>
                  <p className="text-2xl font-bold text-green-600">
                    {visita.numVisitantes}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {visita.institucion && (
                  <div>
                    <Label className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Building2 className="h-4 w-4" />
                      Institución
                    </Label>
                    <p className="text-lg font-semibold">
                      {visita.institucion}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Building2 className="h-4 w-4" />
                    Visita al Arboretum
                  </Label>
                  <Badge
                    variant={
                      visita.arboretum === "Si" ? "default" : "secondary"
                    }
                  >
                    {visita.arboretum}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 text-sm">Nombre</Label>
                  <p className="font-medium">{visita.contacto.nombre}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </Label>
                  <p className="font-medium">{visita.contacto.telefono}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="font-medium break-all">
                    {visita.contacto.correo}
                  </p>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="h-4 w-4" />
                    Comuna
                  </Label>
                  <p className="font-medium">{visita.contacto.comuna}</p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                onClick={handleCancelar}
                variant="outline"
                className="flex-1"
                disabled={validando}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleValidar}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={validando || visita.estado === "completada"}
              >
                {validando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Visita
                  </>
                )}
              </Button>
            </div>

            {visita.estado === "completada" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">
                  Esta visita ya ha sido validada anteriormente
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ValidarQR;
