import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import {
  visitasAPI,
  EstadisticasResponse,
  VisitaDetalle,
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

  // Formatear fecha completa: "Jueves - 18 diciembre 2025"
  const formatearFechaCompleta = (fechaStr: string, diaStr: string) => {
    const fecha = new Date(fechaStr);
    const diaNumero = fecha.getDate();
    const mes = MESES[fecha.getMonth()].toLowerCase();
    const ano = fecha.getFullYear();
    return `${diaStr} - ${diaNumero} ${mes} ${ano}`;
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
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Detalle de Visitantes - {MESES[mesSeleccionado - 1]}{" "}
              {anoSeleccionado}
            </DialogTitle>
            <DialogDescription>
              Total de {estadisticas?.totalVisitantes || 0} visitantes en{" "}
              {estadisticas?.totalVisitas || 0} reservas
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
                              <div>
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
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Todas las Reservas - {MESES[mesSeleccionado - 1]}{" "}
              {anoSeleccionado}
            </DialogTitle>
            <DialogDescription>
              {estadisticas?.totalVisitas || 0} reservas totales
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
                            <p>
                              <strong>🌳 Arboreto:</strong> {visita.arboretum}
                            </p>
                            <p>
                              <strong>📍 Comuna:</strong>{" "}
                              {visita.contacto.comuna}
                            </p>
                            <p>
                              <strong>📞 Teléfono:</strong>{" "}
                              {visita.contacto.telefono}
                            </p>
                            <p>
                              <strong>📧 Correo:</strong>{" "}
                              {visita.contacto.correo}
                            </p>
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

      <Footer />
    </div>
  );
};

export default Dashboard;
