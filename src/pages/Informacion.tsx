import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Phone, Mail, Car, Bus, Info } from "lucide-react";

const Informacion = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
              Información General
            </h1>
            <p className="text-muted-foreground text-lg">
              Todo lo que necesitas saber antes de tu visita
            </p>
          </div>

          {/* Grid de información */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Horarios */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-montserrat">
                    Horarios de Atención
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Martes a Domingo</span>
                  <span className="text-muted-foreground">09:00 - 13:00</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Turno Tarde</span>
                  <span className="text-muted-foreground">14:00 - 16:00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Lunes</span>
                  <span className="text-destructive font-medium">Cerrado</span>
                </div>
                <div className="mt-4 p-3 bg-secondary/10 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    <strong>Importante:</strong> Se requiere reserva previa para
                    todas las visitas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="font-montserrat">Contacto</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Teléfono
                    </div>
                    <div className="font-medium">+56 9 9999 9999</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Correo Electrónico
                    </div>
                    <div className="font-medium">
                      contacto@angosturadelbiobio.cl
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Dirección
                    </div>
                    <div className="font-medium">
                      Centro de Visitantes Angostura del Biobío
                      <br />
                      Santa Bárbara, Región del Biobío
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mapa */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="font-montserrat">Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d403926.45938357146!2d-71.8127746!3d-37.7272949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966c7a7efee6bcb7%3A0x8039199b6b22b3a8!2sCentro%20de%20Visitantes%20Colbun!5e0!3m2!1sen!2sus!4v1764196631129!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa Centro Angostura"
                ></iframe>
              </div>
            </CardContent>
          </Card>

          {/* Cómo llegar */}
          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat">Cómo Llegar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">En Auto</h3>
                  <p className="text-muted-foreground mb-3">
                    Desde Los Ángeles, toma la Ruta 180 hacia Santa Bárbara. El
                    centro se encuentra a 35 km aproximadamente (40 minutos).
                    Sigue las señalizaciones hacia "Embalse Angostura".
                  </p>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <strong>Estacionamiento:</strong> Disponible sin costo
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bus className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    En Transporte Público
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Desde Los Ángeles, toma un bus interprovincial con destino a
                    Santa Bárbara. Desde allí, puedes tomar un taxi o colectivo
                    hasta el centro (15 minutos aprox).
                  </p>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <strong>Recomendación:</strong> Coordina el transporte con
                    anticipación
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Recomendaciones
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Llega con 10 minutos de anticipación a tu hora de
                        reserva
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Trae ropa cómoda y calzado adecuado para caminar
                        (especialmente si visitarás el Arboretum)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        No olvides protector solar y agua, especialmente en
                        verano
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Las visitas guiadas tienen una duración aproximada de
                        1-2 horas
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Informacion;
