import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es, se } from "date-fns/locale";
import { ArrowRight, ArrowLeft, Calendar, Users, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { visitasAPI, type DisponibilidadResponse } from "@/services/api";
import QRCode from "qrcode";
import { sendEmail } from "@/services/email";

type Paso = 1 | 2 | 3;

const Reservar = () => {
  const [paso, setPaso] = useState<Paso>(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHora, setSelectedHora] = useState<string>("");
  const [esInstitucion, setEsInstitucion] = useState(false);
  const [codigoVisita, setCodigoVisita] = useState("");
  const [loading, setLoading] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadResponse | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    institucion: "",
    numVisitantes: "",
    arboretum: "",
    nombreContacto: "",
    telefono: "",
    comuna: "",
    email: "",
    aceptaTerminos: false,
  });

  const horariosDisponibles = [
    { hora: "10:00", disponible: 50, total: 100 },
    { hora: "11:00", disponible: 30, total: 100 },
    { hora: "14:00", disponible: 75, total: 100 },
  ];

  // Consultar disponibilidad cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      consultarDisponibilidad();
    }
  }, [selectedDate]);

  const consultarDisponibilidad = async () => {
    if (!selectedDate) return;
    
    try {
      const fechaISO = selectedDate.toISOString().split('T')[0];
      const data = await visitasAPI.consultarDisponibilidad(fechaISO);
      setDisponibilidad(data);
    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedHora(""); // Reset hora al cambiar fecha
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarPaso1 = () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha",
        variant: "destructive",
      });
      return false;
    }
    if (!selectedHora) {
      toast({
        title: "Error",
        description: "Por favor selecciona un horario",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    if (esInstitucion && !formData.institucion.trim()) {
      toast({ title: "Error", description: "Ingresa el nombre de la institución", variant: "destructive" });
      return false;
    }
    if (!formData.numVisitantes || parseInt(formData.numVisitantes) < 1) {
      toast({ title: "Error", description: "Ingresa un número válido de visitantes", variant: "destructive" });
      return false;
    }
    if (!formData.arboretum) {
      toast({ title: "Error", description: "Indica si visitarás el Arboretum", variant: "destructive" });
      return false;
    }
    if (!formData.nombreContacto.trim()) {
      toast({ title: "Error", description: "Ingresa el nombre del contacto", variant: "destructive" });
      return false;
    }
    if (!formData.telefono.match(/^\+56\d{9}$/)) {
      toast({ title: "Error", description: "Formato de teléfono inválido (+56XXXXXXXXX)", variant: "destructive" });
      return false;
    }
    if (!formData.comuna.trim()) {
      toast({ title: "Error", description: "Ingresa tu comuna", variant: "destructive" });
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({ title: "Error", description: "Ingresa un email válido", variant: "destructive" });
      return false;
    }
    if (!formData.aceptaTerminos) {
      toast({ title: "Error", description: "Debes aceptar los términos y condiciones", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleContinuar = async () => {
    if (paso === 1 && validarPaso1()) {
      setPaso(2);
    } else if (paso === 2 && validarPaso2()) {
      setLoading(true);
      try {
        const fechaISO = selectedDate!.toISOString().split('T')[0];
        
        const response = await visitasAPI.crear({
          fecha: fechaISO,
          hora: selectedHora,
          institucion: esInstitucion ? formData.institucion : undefined,
          numVisitantes: parseInt(formData.numVisitantes),
          arboretum: formData.arboretum as 'Si' | 'No',
          contacto: {
            nombre: formData.nombreContacto,
            telefono: formData.telefono,
            comuna: formData.comuna,
            correo: formData.email,
          },
        });

        setCodigoVisita(response.visita.codigoVisita);

        // Envio correo de confirmacion 
        try {
        await sendEmail({
          email: formData.email,
          nombre: formData.nombreContacto,
          codigoVisita: response.visita.codigoVisita,
          fecha: format(selectedDate!, "EEEE d 'de' MMMM, yyyy", { locale: es }),
          hora: selectedHora,
          numVisitantes: parseInt(formData.numVisitantes),
          arboretum: formData.arboretum,
        });
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
        // No detenemos el proceso si falla el email
      }

        setPaso(3);
        
        // Generar QR con el código de visita
        setTimeout(() => {
          if (qrCanvasRef.current) {
            QRCode.toCanvas(qrCanvasRef.current, response.visita.codigoVisita, {
              width: 200,
              margin: 2,
              color: {
                dark: '#2C5F2D',
                light: '#FFFFFF'
              }
            });
          }
        }, 100);
        
        toast({
          title: "¡Reserva Confirmada!",
          description: "Se ha enviado un correo de confirmación",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear la reserva",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
              Reserva tu Visita
            </h1>
            <p className="text-muted-foreground">
              Completa el proceso en 2 simples pasos
            </p>
          </div>

          {/* Indicador de pasos */}
          {paso !== 3 && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${paso === 1 ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paso === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    1
                  </div>
                  <span className="hidden md:inline font-medium">Fecha y Hora</span>
                </div>
                <div className="w-12 h-0.5 bg-border"></div>
                <div className={`flex items-center space-x-2 ${paso === 2 ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paso === 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    2
                  </div>
                  <span className="hidden md:inline font-medium">Tus Datos</span>
                </div>
              </div>
            </div>
          )}

          {/* Paso 1: Fecha y Hora */}
          {paso === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <CalendarioDisponibilidad
                  onSelectDate={handleDateSelect}
                  selectedDate={selectedDate}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="font-montserrat">Horarios Disponibles</CardTitle>
                    <CardDescription>
                      {selectedDate
                        ? format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })
                        : "Selecciona una fecha primero"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedDate ? (
                      <RadioGroup value={selectedHora} onValueChange={setSelectedHora}>
                        <div className="space-y-3">
                          {horariosDisponibles.map((horario) => (
                            <div
                              key={horario.hora}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <RadioGroupItem value={horario.hora} id={horario.hora} />
                              <Label htmlFor={horario.hora} className="flex-1 cursor-pointer">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">{horario.hora}</span>
                                  <Badge
                                    variant={horario.disponible > 20 ? "default" : "secondary"}
                                  >
                                    {horario.disponible}/{horario.total} disponibles
                                  </Badge>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Selecciona una fecha para ver los horarios disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button size="lg" onClick={handleContinuar} disabled={!selectedDate || !selectedHora}>
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Formulario */}
          {paso === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat">Datos de la Visita</CardTitle>
                <CardDescription>
                  Completa tus datos para confirmar la reserva
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Institución */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esInstitucion"
                      checked={esInstitucion}
                      onCheckedChange={(checked) => setEsInstitucion(checked as boolean)}
                    />
                    <Label htmlFor="esInstitucion" className="cursor-pointer">
                      Visita institucional
                    </Label>
                  </div>
                  {esInstitucion && (
                    <div>
                      <Label htmlFor="institucion">Nombre de la Institución *</Label>
                      <Input
                        id="institucion"
                        value={formData.institucion}
                        onChange={(e) => handleInputChange("institucion", e.target.value)}
                        placeholder="Ej: Colegio Los Ángeles"
                      />
                    </div>
                  )}
                </div>

                {/* Número de visitantes */}
                <div>
                  <Label htmlFor="numVisitantes">Número de Visitantes *</Label>
                  <Input
                    id="numVisitantes"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.numVisitantes}
                    onChange={(e) => handleInputChange("numVisitantes", e.target.value)}
                    placeholder="1-100"
                  />
                </div>

                {/* Arboretum */}
                <div>
                  <Label>¿Incluye visita al Arboretum? *</Label>
                  <RadioGroup value={formData.arboretum} onValueChange={(value) => handleInputChange("arboretum", value)}>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Si" id="arboretum-si" />
                        <Label htmlFor="arboretum-si" className="cursor-pointer">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="arboretum-no" />
                        <Label htmlFor="arboretum-no" className="cursor-pointer">No</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-montserrat font-semibold text-lg mb-4">Datos de Contacto</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombreContacto">Nombre Completo *</Label>
                      <Input
                        id="nombreContacto"
                        value={formData.nombreContacto}
                        onChange={(e) => handleInputChange("nombreContacto", e.target.value)}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        placeholder="+56912345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="comuna">Comuna *</Label>
                      <Input
                        id="comuna"
                        value={formData.comuna}
                        onChange={(e) => handleInputChange("comuna", e.target.value)}
                        placeholder="Los Ángeles"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Términos */}
                <div className="flex items-start space-x-2 pt-4">
                  <Checkbox
                    id="terminos"
                    checked={formData.aceptaTerminos}
                    onCheckedChange={(checked) => handleInputChange("aceptaTerminos", checked as boolean)}
                  />
                  <Label htmlFor="terminos" className="text-sm cursor-pointer leading-relaxed">
                    Acepto los términos y condiciones y la política de privacidad del Centro de
                    Visitantes Angostura del Biobío
                  </Label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setPaso(1)} disabled={loading}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                  <Button size="lg" onClick={handleContinuar} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Confirmar Reserva
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paso 3: Confirmación */}
          {paso === 3 && (
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-montserrat text-2xl">¡Reserva Confirmada!</CardTitle>
                <CardDescription>
                  Tu visita ha sido agendada exitosamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Código de Visita</div>
                    <div className="text-3xl font-bold font-montserrat text-primary">{codigoVisita}</div>
                  </div>
                  <div className="flex justify-center">
                    <canvas ref={qrCanvasRef} className="border-4 border-white rounded-lg shadow-md"></canvas>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Presenta este código QR al llegar al Centro de Visitantes
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Fecha</div>
                    <div className="font-semibold">
                      {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Hora</div>
                    <div className="font-semibold">{selectedHora}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Visitantes</div>
                    <div className="font-semibold">{formData.numVisitantes} personas</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Arboretum</div>
                    <div className="font-semibold">{formData.arboretum}</div>
                  </div>
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg text-sm">
                  <p className="text-secondary-foreground">
                    Se ha enviado un correo de confirmación a <strong>{formData.email}</strong> con
                    los detalles de tu visita e indicaciones de cómo llegar.
                  </p>
                </div>

                <div className="pt-4">
                  <Button size="lg" onClick={() => window.location.href = "/"}>
                    Volver al Inicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reservar;
