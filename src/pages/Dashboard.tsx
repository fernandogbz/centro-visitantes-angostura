import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  formatearParaInput,
  formatearFechaCompleta,
  obtenerDiaSemana,
} from "@/utils/formatearFecha";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import {
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Award,
  Clock,
  Sparkles,
  LogOut,
  Eye,
  Edit,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  visitasAPI,
  EstadisticasResponse,
  VisitaDetalle,
  CrearVisitaData,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { decryptKey } from "@/lib/utils";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Paleta de 3 colores para dashboard
const COLOR_PRIMARY = "#2563eb"; // Azul principal
const COLOR_SECONDARY = "#10b981"; // Verde
const COLOR_ACCENT = "#f59e0b"; // Naranja/Amarillo

// Variaciones para el gráfico de pie
const PIE_COLORS = [
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_ACCENT,
  "#60a5fa",
  "#34d399",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().getMonth() + 1
  );
  const [anoSeleccionado, setAnoSeleccionado] = useState(
    new Date().getFullYear()
  );
  const { toast } = useToast();

  // Estados para modales
  const [modalVisitantes, setModalVisitantes] = useState(false);
  const [modalReservas, setModalReservas] = useState(false);
  const [modalPromedio, setModalPromedio] = useState(false);
  const [modalComunas, setModalComunas] = useState(false);
  const [visitasDetalle, setVisitasDetalle] = useState<VisitaDetalle[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Estados para próximas visitas
  const [proximasVisitas, setProximasVisitas] = useState<VisitaDetalle[]>([]);
  const [loadingProximas, setLoadingProximas] = useState(false);
  const [mostrarTodasProximas, setMostrarTodasProximas] = useState(false);

  // Estados para modal de detalles y edición
  const [modalDetalles, setModalDetalles] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [visitaSeleccionada, setVisitaSeleccionada] =
    useState<VisitaDetalle | null>(null);
  const [formEdicion, setFormEdicion] = useState<any>({});
  const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);
  const [mostrarAlertaCambios, setMostrarAlertaCambios] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // Estados para auto-actualización
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(
    new Date()
  );
  const [refrescando, setRefrescando] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  // Verificar autenticación
  useEffect(() => {
    const encryptedKey = window.localStorage.getItem("accessKey");
    const accessKey = encryptedKey && decryptKey(encryptedKey);

    if (accessKey !== import.meta.env.VITE_ADMIN_PASSKEY) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    cargarEstadisticas();
  }, [mesSeleccionado, anoSeleccionado]);

  useEffect(() => {
    cargarProximasVisitas();
  }, []);

  // Auto-actualización cada 5 minutos
  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarEstadisticas();
      cargarProximasVisitas();
      setUltimaActualizacion(new Date());
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalo);
  }, [mesSeleccionado, anoSeleccionado]);

  // Actualizar el tiempo transcurrido cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = new Date();
      const diferencia = Math.floor(
        (ahora.getTime() - ultimaActualizacion.getTime()) / 1000
      );
      setTiempoTranscurrido(diferencia);
    }, 60000); // Cada minuto

    return () => clearInterval(intervalo);
  }, [ultimaActualizacion]);

  const handleLogout = () => {
    localStorage.removeItem("accessKey");
    navigate("/");
  };

  const cargarEstadisticas = async () => {
    try {
      console.log("🚀 Iniciando carga de estadísticas...");
      console.log("📅 Mes:", mesSeleccionado, "Año:", anoSeleccionado);

      setLoading(true);
      const data = await visitasAPI.obtenerEstadisticas(
        mesSeleccionado,
        anoSeleccionado
      );

      console.log("✅ Datos recibidos:", data);
      console.log("📊 Total visitas:", data.totalVisitas);
      console.log("👥 Total visitantes:", data.totalVisitantes);
      console.log("🏘️ Comunas:", data.rankingComunas);

      setEstadisticas(data);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarVisitasDetalle = async () => {
    try {
      setLoadingModal(true);
      const data = await visitasAPI.obtenerListado(
        mesSeleccionado,
        anoSeleccionado
      );
      setVisitasDetalle(data.visitas);
    } catch (error) {
      console.error("❌ Error al cargar detalle:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el detalle de visitas",
        variant: "destructive",
      });
    } finally {
      setLoadingModal(false);
    }
  };

  const cargarProximasVisitas = async (limite?: number) => {
    try {
      setLoadingProximas(true);
      const data = await visitasAPI.obtenerProximas(limite);
      setProximasVisitas(data.visitas);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error("❌ Error al cargar próximas visitas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las próximas visitas",
        variant: "destructive",
      });
    } finally {
      setLoadingProximas(false);
    }
  };

  const refrescarDatos = async () => {
    setRefrescando(true);
    await Promise.all([
      cargarEstadisticas(),
      cargarProximasVisitas(mostrarTodasProximas ? undefined : 5),
    ]);
    setRefrescando(false);
  };

  const formatearUltimaActualizacion = () => {
    const ahora = new Date();
    const diferencia = Math.floor(
      (ahora.getTime() - ultimaActualizacion.getTime()) / 1000
    );

    if (diferencia < 60) return "Menos de 1 minuto";
    const minutos = Math.floor(diferencia / 60);
    if (minutos === 1) return "Hace 1 minuto";
    if (minutos < 60) return `Hace ${minutos} minutos`;
    return ultimaActualizacion.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Funciones para modal de detalles
  const abrirModalDetalles = (visita: VisitaDetalle) => {
    setVisitaSeleccionada(visita);
    setModalDetalles(true);
  };

  // Funciones para modal de edición
  const abrirModalEdicion = (visita: VisitaDetalle) => {
    setVisitaSeleccionada(visita);
    setFormEdicion({
      fecha: formatearParaInput(visita.fecha),
      hora: visita.hora,
      institucion: visita.institucion || "",
      numVisitantes: visita.numVisitantes,
      arboretum: visita.arboretum,
      nombreContacto: visita.contacto?.nombre || "",
      telefonoContacto: visita.contacto?.telefono || "",
      comunaContacto: visita.contacto?.comuna || "",
      correoContacto: visita.contacto?.correo || "",
    });
    setHayCambiosSinGuardar(false);
    setModalEdicion(true);
  };

  const handleFormChange = (campo: string, valor: any) => {
    setFormEdicion((prev: any) => ({ ...prev, [campo]: valor }));
    setHayCambiosSinGuardar(true);
  };

  const handleKeyDownEdicion = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hayCambiosSinGuardar && !guardandoEdicion) {
      e.preventDefault();
      guardarEdicion();
    }
  };

  const cerrarModalEdicion = () => {
    if (hayCambiosSinGuardar) {
      setMostrarAlertaCambios(true);
    } else {
      setModalEdicion(false);
      setVisitaSeleccionada(null);
    }
  };

  const confirmarSalirSinGuardar = () => {
    setMostrarAlertaCambios(false);
    setModalEdicion(false);
    setHayCambiosSinGuardar(false);
    setVisitaSeleccionada(null);
  };

  const guardarEdicion = async () => {
    if (!visitaSeleccionada) return;

    try {
      setGuardandoEdicion(true);

      const dataActualizada: Partial<CrearVisitaData> = {
        fecha: formEdicion.fecha,
        hora: formEdicion.hora,
        institucion: formEdicion.institucion,
        numVisitantes: formEdicion.numVisitantes,
        arboretum: formEdicion.arboretum,
        contacto: {
          nombre: formEdicion.nombreContacto,
          telefono: formEdicion.telefonoContacto,
          comuna: formEdicion.comunaContacto,
          correo: formEdicion.correoContacto,
        },
      };

      await visitasAPI.actualizarVisita(
        visitaSeleccionada.codigoVisita,
        dataActualizada
      );

      toast({
        title: "Éxito",
        description: "Visita actualizada correctamente",
      });

      setModalEdicion(false);
      setHayCambiosSinGuardar(false);
      setVisitaSeleccionada(null);

      // Recargar datos: próximas visitas, estadísticas y detalle si los modales están abiertos
      await Promise.all([
        cargarProximasVisitas(mostrarTodasProximas ? 50 : 5),
        cargarEstadisticas(),
        modalVisitantes || modalReservas
          ? cargarVisitasDetalle()
          : Promise.resolve(),
      ]);
      setUltimaActualizacion(new Date());
    } catch (error: any) {
      console.error("❌ Error al guardar:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "No se pudo actualizar la visita",
        variant: "destructive",
      });
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // Función para cambiar estado
  const cambiarEstado = async (codigoVisita: string, nuevoEstado: string) => {
    try {
      await visitasAPI.actualizarEstado(codigoVisita, nuevoEstado);

      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente",
      });

      // Recargar datos: próximas visitas, estadísticas y detalle si los modales están abiertos
      await Promise.all([
        cargarProximasVisitas(mostrarTodasProximas ? 50 : 5),
        cargarEstadisticas(),
        modalVisitantes || modalReservas
          ? cargarVisitasDetalle()
          : Promise.resolve(),
      ]);
      setUltimaActualizacion(new Date());
    } catch (error: any) {
      console.error("❌ Error al cambiar estado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  // Agrupar visitas por día
  const agruparPorDia = (visitas: VisitaDetalle[]) => {
    const grupos: { [key: string]: VisitaDetalle[] } = {};
    visitas.forEach((visita) => {
      // Usar la fecha completa como clave para agrupar
      const fechaKey = visita.fecha;
      if (!grupos[fechaKey]) {
        grupos[fechaKey] = [];
      }
      grupos[fechaKey].push(visita);
    });
    return grupos;
  };

  const anos = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // Preparar datos para el gráfico de pie
  const topComunasPie =
    estadisticas?.rankingComunas.slice(0, 5).map((c, index) => ({
      name: c.comuna,
      value: c.visitantes,
    })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <Sparkles
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse"
              size={32}
            />
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">
            Cargando estadísticas...
          </p>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const promedio = estadisticas?.totalVisitas
    ? Math.round(estadisticas.totalVisitantes / estadisticas.totalVisitas)
    : 0;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-blue-600 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800">{`Día ${label}`}</p>
          <p className="text-blue-600 font-bold text-lg">{`${payload[0].value} visitantes`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-green-600 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-green-600 font-bold text-lg">{`${payload[0].value} visitantes`}</p>
          <p className="text-gray-600 text-sm">{`${(
            (payload[0].value / estadisticas!.totalVisitantes) *
            100
          ).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-montserrat font-bold text-3xl md:text-4xl mb-2">
              Dashboard Angostura
            </h1>
            <p className="text-muted-foreground">
              Métricas y Estadísticas del Centro de Visitantes
            </p>
          </div>

          <div className="flex gap-3">
            <Select
              value={mesSeleccionado.toString()}
              onValueChange={(value) => setMesSeleccionado(parseInt(value))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={anoSeleccionado.toString()}
              onValueChange={(value) => setAnoSeleccionado(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
        {/* Cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={async () => {
              await cargarVisitasDetalle();
              setModalVisitantes(true);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitantes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticas?.totalVisitantes || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {MESES[mesSeleccionado - 1]}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={async () => {
              await cargarVisitasDetalle();
              setModalReservas(true);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reservas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticas?.totalVisitas || 0}
              </div>
              <p className="text-xs text-muted-foreground">Visitas agendadas</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={async () => {
              await cargarVisitasDetalle();
              setModalPromedio(true);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio Grupo
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promedio}</div>
              <p className="text-xs text-muted-foreground">
                personas por visita
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={async () => {
              await cargarVisitasDetalle();
              setModalComunas(true);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Comuna</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold leading-tight mb-1">
                {estadisticas?.rankingComunas[0]?.comuna || "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {estadisticas?.rankingComunas[0]?.visitantes || 0} visitantes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Próximas Visitas */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {obtenerDiaSemana(new Date())},{" "}
                {new Date().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {formatearUltimaActualizacion()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refrescarDatos}
                  disabled={refrescando}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refrescando ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
            <CardDescription>
              Reservas confirmadas para el día de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProximas ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
              </div>
            ) : proximasVisitas.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  No hay visitas próximas programadas
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Las nuevas reservas aparecerán aquí
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Hora
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Visitante
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Institución
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                          N° Visitantes
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                          Estado
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(mostrarTodasProximas
                        ? proximasVisitas
                        : proximasVisitas.slice(0, 5)
                      ).map((visita, index) => (
                        <tr
                          key={visita.codigoVisita}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            index === 0 ? "bg-blue-50/30" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900">
                                {visita.hora}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {visita.contacto.nombre}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {visita.institucion || (
                              <span className="text-gray-400 italic">
                                Sin institución
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                              {visita.numVisitantes}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <Select
                                value={visita.estado}
                                onValueChange={(value) =>
                                  cambiarEstado(visita.codigoVisita, value)
                                }
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="confirmada">
                                    Confirmada
                                  </SelectItem>
                                  <SelectItem value="realizada">
                                    Realizada
                                  </SelectItem>
                                  <SelectItem value="cancelada">
                                    Cancelada
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalDetalles(visita)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalEdicion(visita)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {proximasVisitas.length > 5 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (mostrarTodasProximas) {
                          setMostrarTodasProximas(false);
                        } else {
                          cargarProximasVisitas(50);
                          setMostrarTodasProximas(true);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {mostrarTodasProximas
                        ? "Mostrar menos"
                        : `Mostrar más (${proximasVisitas.length - 5} más)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Flujo de asistencia */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Flujo de Asistencia Diaria
                </CardTitle>
                <CardDescription>Visitantes por día del mes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={estadisticas?.flujoDiario || []}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={COLOR_PRIMARY}
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLOR_PRIMARY}
                          stopOpacity={0.4}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="dia"
                      stroke="#6b7280"
                      label={{
                        value: "Día del mes",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#374151",
                        fontWeight: "bold",
                      }}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      label={{
                        value: "Visitantes",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#374151",
                        fontWeight: "bold",
                      }}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="visitantes"
                      fill="url(#colorBar)"
                      name="Visitantes"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitantes"
                      stroke={COLOR_PRIMARY}
                      strokeWidth={3}
                      dot={{
                        fill: COLOR_PRIMARY,
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                      name="Tendencia"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Pie */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Top 5 Comunas
                </CardTitle>
                <CardDescription>Distribución porcentual</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topComunasPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) =>
                        `${(
                          (entry.value / estadisticas!.totalVisitantes) *
                          100
                        ).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {topComunasPie.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {topComunasPie.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-sm flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-sm font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ranking de comunas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ranking Completo de Comunas
            </CardTitle>
            <CardDescription>Top 10 comunas con más visitantes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={estadisticas?.rankingComunas.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  label={{
                    value: "Número de visitantes",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#374151",
                    fontWeight: "bold",
                  }}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  type="category"
                  dataKey="comuna"
                  stroke="#6b7280"
                  width={90}
                  tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #f59e0b",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "rgba(245, 158, 11, 0.1)" }}
                />
                <Bar
                  dataKey="visitantes"
                  fill={COLOR_ACCENT}
                  radius={[0, 8, 8, 0]}
                  label={{
                    position: "right",
                    fill: "#374151",
                    fontWeight: "bold",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>

      {/* Modal Total Visitantes */}
      <Dialog open={modalVisitantes} onOpenChange={setModalVisitantes}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Detalle de Visitantes - {MESES[mesSeleccionado - 1]}{" "}
                  {anoSeleccionado}
                </DialogTitle>
                <DialogDescription>
                  Total de {estadisticas?.totalVisitantes || 0} visitantes en{" "}
                  {estadisticas?.totalVisitas || 0} reservas
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatearUltimaActualizacion()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setLoadingModal(true);
                    await Promise.all([
                      cargarVisitasDetalle(),
                      new Promise((resolve) => setTimeout(resolve, 1000)),
                    ]);
                    setLoadingModal(false);
                  }}
                  disabled={loadingModal}
                  className="flex items-center gap-2 mr-4"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingModal ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </DialogHeader>
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(agruparPorDia(visitasDetalle)).map(
                ([fecha, visitas]) => (
                  <div key={fecha}>
                    <div className="sticky top-0 bg-sky-50 border-l-4 border-sky-500 px-4 py-2 mb-3 rounded">
                      <h3 className="font-bold text-sky-900">
                        📅 {formatearFechaCompleta(fecha, visitas[0].dia)}
                      </h3>
                      <p className="text-xs text-sky-700">
                        {visitas.length} reserva(s)
                      </p>
                    </div>
                    <div className="space-y-3 pl-2">
                      {visitas.map((visita) => (
                        <Card
                          key={visita.codigoVisita}
                          className="border-l-4 border-l-sky-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-lg">
                                  {visita.contacto.nombre}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Código: {visita.codigoVisita}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-sky-500">
                                  {visita.numVisitantes}
                                </p>
                                <p className="text-xs text-gray-500">
                                  visitantes
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>🕐 {visita.hora}</p>
                              <p>
                                🏢 {visita.institucion || "Sin institución"}
                              </p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirModalDetalles(visita)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirModalEdicion(visita)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Total Reservas */}
      <Dialog open={modalReservas} onOpenChange={setModalReservas}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Todas las Reservas - {MESES[mesSeleccionado - 1]}{" "}
                  {anoSeleccionado}
                </DialogTitle>
                <DialogDescription>
                  {estadisticas?.totalVisitas || 0} reservas totales
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatearUltimaActualizacion()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setLoadingModal(true);
                    await Promise.all([
                      cargarVisitasDetalle(),
                      new Promise((resolve) => setTimeout(resolve, 1000)),
                    ]);
                    setLoadingModal(false);
                  }}
                  disabled={loadingModal}
                  className="flex items-center gap-2 mr-4"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingModal ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </DialogHeader>
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(agruparPorDia(visitasDetalle)).map(
                ([fecha, visitas]) => (
                  <div key={fecha}>
                    <div className="sticky top-0 bg-blue-50 border-l-4 border-blue-600 px-4 py-2 mb-3 rounded">
                      <h3 className="font-bold text-blue-900">
                        📅 {formatearFechaCompleta(fecha, visitas[0].dia)}
                      </h3>
                      <p className="text-xs text-blue-700">
                        {visitas.length} reserva(s)
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                      {visitas.map((visita) => (
                        <Card
                          key={visita.codigoVisita}
                          className="border-t-4 border-t-blue-600"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                              <span>{visita.contacto.nombre}</span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  visita.estado === "confirmada"
                                    ? "bg-green-100 text-green-700"
                                    : visita.estado === "realizada"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {visita.estado}
                              </span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {visita.codigoVisita}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <p>
                              <strong>🕐 Hora:</strong> {visita.hora}
                            </p>
                            <p>
                              <strong>👥 Visitantes:</strong>{" "}
                              {visita.numVisitantes}
                            </p>
                            <p>
                              <strong>🏢 Institución:</strong>{" "}
                              {visita.institucion || "N/A"}
                            </p>
                            <div className="flex gap-2 mt-3 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirModalDetalles(visita)}
                                className="flex items-center gap-1 flex-1"
                              >
                                <Eye className="h-4 w-4" />
                                Ver Detalle
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirModalEdicion(visita)}
                                className="flex items-center gap-1 flex-1"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Promedio Grupo */}
      <Dialog open={modalPromedio} onOpenChange={setModalPromedio}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Análisis de Grupos - {MESES[mesSeleccionado - 1]}{" "}
              {anoSeleccionado}
            </DialogTitle>
            <DialogDescription>
              Promedio de {promedio} personas por grupo
            </DialogDescription>
          </DialogHeader>
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(agruparPorDia(visitasDetalle)).map(
                ([fecha, visitas]) => (
                  <div key={fecha}>
                    <div className="sticky top-0 bg-green-50 border-l-4 border-green-600 px-4 py-2 mb-3 rounded">
                      <h3 className="font-bold text-green-900">
                        📅 {formatearFechaCompleta(fecha, visitas[0].dia)}
                      </h3>
                      <p className="text-xs text-green-700">
                        {visitas.length} reserva(s) - Promedio:{" "}
                        {Math.round(
                          visitas.reduce((sum, v) => sum + v.numVisitantes, 0) /
                            visitas.length
                        )}{" "}
                        personas
                      </p>
                    </div>
                    <div className="space-y-3 pl-2">
                      {visitas
                        .sort((a, b) => b.numVisitantes - a.numVisitantes)
                        .map((visita) => (
                          <Card
                            key={visita.codigoVisita}
                            className="border-l-4 border-l-green-600"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="font-semibold">
                                    {visita.contacto.nombre}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {visita.institucion || "Sin institución"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    🕐 {visita.hora}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-green-600">
                                    {visita.numVisitantes}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    personas
                                  </p>
                                  <div className="mt-1">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            (visita.numVisitantes / 30) * 100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Top Comunas */}
      <Dialog open={modalComunas} onOpenChange={setModalComunas}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Comunas Participantes - {MESES[mesSeleccionado - 1]}{" "}
              {anoSeleccionado}
            </DialogTitle>
            <DialogDescription>Distribución por comuna</DialogDescription>
          </DialogHeader>
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {estadisticas?.rankingComunas.map((item, index) => {
                const visitasComuna = visitasDetalle.filter(
                  (v) => v.contacto.comuna === item.comuna
                );
                return (
                  <Card
                    key={item.comuna}
                    className="border-l-4 border-l-orange-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-orange-500">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {item.comuna}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.visitantes} visitantes en{" "}
                              {visitasComuna.length} reservas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-orange-500">
                            {item.visitantes}
                          </div>
                          <p className="text-xs text-gray-500">personas</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.visitantes /
                                  (estadisticas?.totalVisitantes || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                          Ver {visitasComuna.length} reservas
                        </summary>
                        <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
                          {visitasComuna.map((v) => (
                            <div
                              key={v.codigoVisita}
                              className="text-xs text-gray-600"
                            >
                              <span className="font-medium">
                                {v.contacto.nombre}
                              </span>{" "}
                              - {v.numVisitantes} personas ({v.dia})
                            </div>
                          ))}
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog open={modalDetalles} onOpenChange={setModalDetalles}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Detalles de la Visita
            </DialogTitle>
            <DialogDescription>
              Código: {visitaSeleccionada?.codigoVisita}
            </DialogDescription>
          </DialogHeader>
          {visitaSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-600">
                    Fecha
                  </Label>
                  <p className="text-gray-900">
                    {formatearFechaCompleta(
                      visitaSeleccionada.fecha,
                      visitaSeleccionada.dia
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">
                    Hora
                  </Label>
                  <p className="text-gray-900">{visitaSeleccionada.hora}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">
                    N° Visitantes
                  </Label>
                  <p className="text-gray-900 font-bold">
                    {visitaSeleccionada.numVisitantes}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600">
                    Estado
                  </Label>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        visitaSeleccionada.estado === "confirmada"
                          ? "bg-green-100 text-green-700"
                          : visitaSeleccionada.estado === "realizada"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {visitaSeleccionada.estado}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Institución
                </Label>
                <p className="text-gray-900">
                  {visitaSeleccionada.institucion || "Sin institución"}
                </p>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Visita al Arboreto
                </Label>
                <p className="text-gray-900">{visitaSeleccionada.arboretum}</p>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-semibold text-gray-600 mb-3 block">
                  Datos de Contacto
                </Label>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Nombre</Label>
                    <p className="text-gray-900 font-medium">
                      {visitaSeleccionada.contacto.nombre}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Teléfono</Label>
                    <p className="text-gray-900">
                      {visitaSeleccionada.contacto.telefono}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Comuna</Label>
                    <p className="text-gray-900">
                      {visitaSeleccionada.contacto.comuna}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Correo</Label>
                    <p className="text-gray-900 text-sm">
                      {visitaSeleccionada.contacto.correo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog
        open={modalEdicion}
        onOpenChange={(open) => !open && cerrarModalEdicion()}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Editar Visita
            </DialogTitle>
            <DialogDescription>
              Código: {visitaSeleccionada?.codigoVisita}
            </DialogDescription>
          </DialogHeader>
          {visitaSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formEdicion.fecha}
                    onChange={(e) => handleFormChange("fecha", e.target.value)}
                    onKeyDown={handleKeyDownEdicion}
                  />
                </div>
                <div>
                  <Label htmlFor="hora">Hora</Label>
                  <Select
                    value={formEdicion.hora}
                    onValueChange={(value) => handleFormChange("hora", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="17:00">17:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="institucion">Institución (opcional)</Label>
                <Input
                  id="institucion"
                  value={formEdicion.institucion}
                  onChange={(e) =>
                    handleFormChange("institucion", e.target.value)
                  }
                  onKeyDown={handleKeyDownEdicion}
                  placeholder="Nombre de la institución"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numVisitantes">Número de Visitantes</Label>
                  <Input
                    id="numVisitantes"
                    type="number"
                    min="1"
                    max="30"
                    value={formEdicion.numVisitantes}
                    onChange={(e) =>
                      handleFormChange(
                        "numVisitantes",
                        parseInt(e.target.value)
                      )
                    }
                    onKeyDown={handleKeyDownEdicion}
                  />
                </div>
                <div>
                  <Label htmlFor="arboretum">Visita al Arboreto</Label>
                  <Select
                    value={formEdicion.arboretum}
                    onValueChange={(value) =>
                      handleFormChange("arboretum", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Si">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-3 block">
                  Datos de Contacto
                </Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombreContacto">Nombre Completo</Label>
                    <Input
                      id="nombreContacto"
                      value={formEdicion.nombreContacto}
                      onChange={(e) =>
                        handleFormChange("nombreContacto", e.target.value)
                      }
                      onKeyDown={handleKeyDownEdicion}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefonoContacto">Teléfono</Label>
                      <Input
                        id="telefonoContacto"
                        value={formEdicion.telefonoContacto}
                        onChange={(e) =>
                          handleFormChange("telefonoContacto", e.target.value)
                        }
                        onKeyDown={handleKeyDownEdicion}
                        placeholder="+56912345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="comunaContacto">Comuna</Label>
                      <Input
                        id="comunaContacto"
                        value={formEdicion.comunaContacto}
                        onChange={(e) =>
                          handleFormChange("comunaContacto", e.target.value)
                        }
                        onKeyDown={handleKeyDownEdicion}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="correoContacto">Correo Electrónico</Label>
                    <Input
                      id="correoContacto"
                      type="email"
                      value={formEdicion.correoContacto}
                      onChange={(e) =>
                        handleFormChange("correoContacto", e.target.value)
                      }
                      onKeyDown={handleKeyDownEdicion}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={cerrarModalEdicion}
                  disabled={guardandoEdicion}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={guardarEdicion}
                  disabled={guardandoEdicion || !hayCambiosSinGuardar}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {guardandoEdicion ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog para cambios sin guardar */}
      <AlertDialog
        open={mostrarAlertaCambios}
        onOpenChange={setMostrarAlertaCambios}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas salir sin guardar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Si sales ahora, perderás todos los
              cambios realizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMostrarAlertaCambios(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarSalirSinGuardar}
              className="bg-red-600 hover:bg-red-700"
            >
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
