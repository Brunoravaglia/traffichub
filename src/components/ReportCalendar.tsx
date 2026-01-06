import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  filledDates: Date[];
  onExport: () => void;
}

const ReportCalendar = ({ currentMonth, onMonthChange, filledDates, onExport }: ReportCalendarProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const isDateFilled = (date: Date) => {
    return filledDates.some(filledDate => isSameDay(filledDate, date));
  };

  // Get the first day of the week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="vcd-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Calendário de Relatórios</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="border-primary text-primary hover:bg-primary/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-lg font-medium text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="hover:bg-secondary"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isFilled = isDateFilled(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all",
                isCurrentDay && "ring-2 ring-primary",
                isFilled && "bg-primary/20"
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  isCurrentDay ? "text-primary font-bold" : "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
              {isFilled && (
                <div className="absolute bottom-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Relatório preenchido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded ring-2 ring-primary" />
          <span className="text-xs text-muted-foreground">Hoje</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportCalendar;