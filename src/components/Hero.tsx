import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511497584788-876760111969?w=1600')] bg-cover bg-center opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-montserrat font-bold text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
          Bienvenido al Centro de Visitantes
          <br />
          <span className="text-secondary-foreground">Angostura del Biobío</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow">
          Descubre la biodiversidad y la historia del río Biobío en un entorno natural único
        </p>
        <Link to="/reservar">
          <Button
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-montserrat font-semibold text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Agenda tu Visita
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
