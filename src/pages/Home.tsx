import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, MapPin, Users } from "lucide-react";

const Home = () => {
  const exhibiciones = [
    {
      titulo: "Especies de la Región",
      descripcion: "Conoce la flora y fauna nativa del Biobío",
      imagen: "/huemul.webp",
    },
    {
      titulo: "Historia del Embalse",
      descripcion: "Descubre cómo se construyó la Angostura",
      imagen:
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600",
    },
    {
      titulo: "Ecosistema del Biobío",
      descripcion: "Explora el ecosistema único del río",
      imagen:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600",
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
              Explora nuestras principales exhibiciones y descubre la riqueza
              natural de la región
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
                  <CardTitle className="font-montserrat">
                    {exhibicion.titulo}
                  </CardTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center flex flex-col">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-montserrat text-xl">
                    Horarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Martes a Domingo
                    <br />
                    09:00 - 13:00 y 14:00 - 16:00
                    <br />
                    Lunes: Cerrado
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center flex flex-col">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="font-montserrat text-xl">
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Santa Bárbara
                    <br />
                    Región del Biobío
                    <br />
                    Chile
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center flex flex-col">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="font-montserrat text-xl">
                    Visitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">
                    Entrada gratuita
                    <br />
                    Requiere reserva previa
                    <br />
                    Grupos hasta 100 personas
                  </p>
                  <Link to="/reservar">
                    <Button size="default">Reservar ahora</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
