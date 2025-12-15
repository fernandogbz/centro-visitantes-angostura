import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, MapPin, Users } from "lucide-react";

const Home = () => {
  const exhibiciones = [
    {
      titulo: "Especies de la Región",
      descripcion: "Conoce la flora y fauna nativa del Biobío",
      imagen: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600",
    },
    {
      titulo: "Historia del Embalse",
      descripcion: "Descubre cómo se construyó la Angostura",
      imagen: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600",
    },
    {
      titulo: "Ecosistema del Biobío",
      descripcion: "Explora el ecosistema único del río",
      imagen: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />

        {/* Exhibiciones Destacadas */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
              Exhibiciones Destacadas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explora nuestras principales exhibiciones y descubre la riqueza natural de la región
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exhibiciones.map((exhibicion, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={exhibicion.imagen}
                    alt={exhibicion.titulo}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="font-montserrat">{exhibicion.titulo}</CardTitle>
                  <CardDescription>{exhibicion.descripcion}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Información Práctica */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
                Información Práctica
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-montserrat text-xl">Horarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Lun-Vie: 10:00 - 17:00
                    <br />
                    Sábado: 10:00 - 14:00
                    <br />
                    Domingo: Cerrado
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="font-montserrat text-xl">Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Santa Bárbara
                    <br />
                    Región del Biobío
                    <br />
                    Chile
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-montserrat text-xl">Visitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Entrada gratuita
                    <br />
                    Requiere reserva previa
                    <br />
                    Grupos hasta 100 personas
                  </p>
                  <Link to="/reservar">
                    <Button size="sm" className="mt-2">
                      Reservar ahora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enlace temporal al Dashboard */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">
              Acceso Rápido
            </h2>
          </div>

          <div className="max-w-md mx-auto">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">
                Dashboard (Admin)
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
