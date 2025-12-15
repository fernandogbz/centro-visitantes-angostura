import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center overflow-hidden">
      {/* Background Video with Dark Overlay */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video-angostura.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">
              Descubre la Región del Biobío
            </span>
          </div>

          {/* Title with highlighted word */}
          <h1 className="font-montserrat font-bold text-4xl md:text-6xl text-white mb-6 leading-tight">
            <span className="text-orange-500">Bienvenido</span> al Centro de
            Visitantes
            <br />
            Angostura del Biobío
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
            Descubre la biodiversidad y la historia del río Biobío en un entorno
            natural único
          </p>

          {/* CTA Button */}
          <Link to="/reservar">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-montserrat font-semibold text-base md:text-lg px-8 py-6 rounded-lg shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105 border-0"
            >
              Agenda tu Visita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
