import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PasskeyModal } from "./PasskeyModal";

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <PasskeyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información de contacto */}
            <div>
              <h3 className="font-montserrat font-bold text-lg mb-4">
                Contacto
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    Centro de Visitantes Angostura del Biobío
                    <br />
                    Santa Bárbara, Región del Biobío
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">+56 9 9999 9999</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">
                    contacto@angosturadelbiobio.cl
                  </span>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div>
              <h3 className="font-montserrat font-bold text-lg mb-4">
                Horarios de Atención
              </h3>
              <div className="text-sm space-y-2">
                <p>Lunes a Viernes: 10:00 - 17:00</p>
                <p>Sábados: 10:00 - 14:00</p>
                <p className="text-primary-foreground/80">Domingos: Cerrado</p>
              </div>
            </div>

            {/* Acerca de */}
            <div>
              <h3 className="font-montserrat font-bold text-lg mb-4">
                Acerca de
              </h3>
              <p className="text-sm text-primary-foreground/90">
                El Centro de Visitantes Angostura del Biobío es un espacio
                dedicado a la educación ambiental y la conservación del
                ecosistema del río Biobío.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-primary-foreground/80">
                © {new Date().getFullYear()} Centro de Visitantes Angostura del
                Biobío. Todos los derechos reservados.
              </p>
              {location.pathname !== "/admin" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-primary-foreground/60 hover:text-primary-foreground/100 transition-colors"
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
