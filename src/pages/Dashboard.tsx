import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from "recharts";
import { Users, Calendar, MapPin, TrendingUp, ArrowUpRight, Activity, Award, Clock, Sparkles } from "lucide-react";
import { visitasAPI, EstadisticasResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Paleta de 3 colores para dashboard
const COLOR_PRIMARY = '#2563eb';   // Azul principal
const COLOR_SECONDARY = '#10b981'; // Verde
const COLOR_ACCENT = '#f59e0b';    // Naranja/Amarillo

// Variaciones para el gráfico de pie
const PIE_COLORS = [COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT, '#60a5fa', '#34d399'];

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear());
  const { toast } = useToast();

  useEffect(() => {
    cargarEstadisticas();
  }, [mesSeleccionado, anoSeleccionado]);

  const cargarEstadisticas = async () => {
    try {
      console.log('🚀 Iniciando carga de estadísticas...');
      console.log('📅 Mes:', mesSeleccionado, 'Año:', anoSeleccionado);
      
      setLoading(true);
      const data = await visitasAPI.obtenerEstadisticas(mesSeleccionado, anoSeleccionado);
      
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Total visitas:', data.totalVisitas);
      console.log('👥 Total visitantes:', data.totalVisitantes);
      console.log('🏘️ Comunas:', data.rankingComunas);
      
      setEstadisticas(data);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Preparar datos para el gráfico de pie
  const topComunasPie = estadisticas?.rankingComunas.slice(0, 5).map((c, index) => ({
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
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={32} />
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Cargando estadísticas...</p>
        </motion.div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const promedio = estadisticas?.totalVisitas ? 
    Math.round(estadisticas.totalVisitantes / estadisticas.totalVisitas) : 0;

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
          <p className="text-gray-600 text-sm">{`${((payload[0].value / estadisticas!.totalVisitantes) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <Activity className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Dashboard Angostura</h1>
                  <p className="text-blue-600 text-sm font-medium">Métricas y Estadísticas</p>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <Select value={mesSeleccionado.toString()} onValueChange={(value) => setMesSeleccionado(parseInt(value))}>
                <SelectTrigger className="w-[160px] border-2 border-blue-600 hover:bg-blue-50 transition-colors">
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

              <Select value={anoSeleccionado.toString()} onValueChange={(value) => setAnoSeleccionado(parseInt(value))}>
                <SelectTrigger className="w-[120px] border-2 border-blue-600 hover:bg-blue-50 transition-colors">
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
            </div>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-600">
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Visitantes</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold text-gray-800 mb-2">{estadisticas?.totalVisitantes || 0}</div>
                <div className="flex items-center gap-2 text-blue-600">
                  <ArrowUpRight size={16} />
                  <span className="text-xs font-medium">{MESES[mesSeleccionado - 1]}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-600">
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Reservas</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold text-gray-800 mb-2">{estadisticas?.totalVisitas || 0}</div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock size={16} />
                  <span className="text-xs font-medium">Visitas agendadas</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-600">
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Promedio Grupo</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold text-gray-800 mb-2">{promedio}</div>
                <div className="flex items-center gap-2 text-green-600">
                  <Users size={16} />
                  <span className="text-xs font-medium">personas por visita</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-amber-500">
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Top Comuna</CardTitle>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-lg font-bold text-gray-800 mb-1 leading-tight">
                  {estadisticas?.rankingComunas[0]?.comuna || '-'}
                </div>
                <div className="flex items-center gap-2 text-amber-500">
                  <MapPin size={16} />
                  <span className="text-xs font-semibold">{estadisticas?.rankingComunas[0]?.visitantes || 0} visitantes</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Flujo de asistencia - Azul */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-xl">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Activity className="text-white" size={20} />
                  </div>
                  <span className="text-gray-800 font-bold">Flujo de Asistencia Diaria</span>
                </CardTitle>
                <CardDescription className="text-gray-600">Visitantes por día del mes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={estadisticas?.flujoDiario || []}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLOR_PRIMARY} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={COLOR_PRIMARY} stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dia" 
                      stroke="#6b7280"
                      label={{ value: 'Día del mes', position: 'insideBottom', offset: -5, fill: '#374151', fontWeight: 'bold' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      label={{ value: 'Visitantes', angle: -90, position: 'insideLeft', fill: '#374151', fontWeight: 'bold' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
                      dot={{ fill: COLOR_PRIMARY, r: 5, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                      name="Tendencia"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de Pie - Verde */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-white shadow-xl">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <span className="text-gray-800 font-bold">Top 5 Comunas</span>
                </CardTitle>
                <CardDescription className="text-gray-600">Distribución porcentual</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topComunasPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${((entry.value / estadisticas!.totalVisitantes) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {topComunasPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {topComunasPie.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-800 flex-1 truncate font-medium">{item.name}</span>
                      <span className="text-sm font-bold text-green-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Ranking de comunas - Naranja/Amarillo */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-white shadow-xl">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <MapPin className="text-white" size={20} />
                </div>
                <span className="text-gray-800 font-bold">Ranking Completo de Comunas</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Top 10 comunas con más visitantes</CardDescription>
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
                    label={{ value: 'Número de visitantes', position: 'insideBottom', offset: -5, fill: '#374151', fontWeight: 'bold' }}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="comuna" 
                    stroke="#6b7280"
                    width={90}
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
                  />
                  <Bar 
                    dataKey="visitantes" 
                    fill={COLOR_ACCENT}
                    radius={[0, 8, 8, 0]}
                    label={{ position: 'right', fill: '#374151', fontWeight: 'bold' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;