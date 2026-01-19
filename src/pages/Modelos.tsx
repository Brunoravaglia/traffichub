import { ReportTemplateManager } from "@/components/ReportTemplateManager";

const Modelos = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modelos de Relatório</h1>
        <p className="text-muted-foreground">
          Gerencie os templates de relatório disponíveis para você e sua equipe
        </p>
      </div>

      <ReportTemplateManager />
    </div>
  );
};

export default Modelos;
