import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { es } from "date-fns/locale";

interface CalendarioDisponibilidadProps {
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

const CalendarioDisponibilidad = ({
  onSelectDate,
  selectedDate,
}: CalendarioDisponibilidadProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onSelectDate(newDate);
    }
  };

  // Deshabilitar fechas pasadas y lunes
  const disabledDays = [
    { before: new Date() },
    { dayOfWeek: [1] }, // Solo Lunes
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-montserrat font-bold text-xl mb-2">
            Selecciona una Fecha
          </h3>
          <p className="text-sm text-muted-foreground">
            El centro está cerrado los días lunes
          </p>
        </div>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabledDays}
            locale={es}
            className="rounded-md border"
          />
        </div>

        {/* Leyenda */}
        <div className="flex justify-center gap-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary"></div>
            <span className="text-sm">Fecha seleccionada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <span className="text-sm">No disponible</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CalendarioDisponibilidad;
