import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\w-]+ failed/i,
  /ChunkLoadError/i,
  /error loading dynamically imported module/i,
  /dynamically imported module/i,
];

const isChunkErrorMessage = (message: string) =>
  CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const errorMessage =
      typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Erro inesperado na interface.";

    return {
      hasError: true,
      errorMessage,
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isChunkError = isChunkErrorMessage(this.state.errorMessage);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-card/80 p-6 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-destructive/15 p-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Falha ao carregar a tela</h2>
              <p className="text-sm text-muted-foreground">
                {isChunkError
                  ? "Detectamos atualização de versão durante navegação. Recarregue para sincronizar."
                  : "Ocorreu um erro inesperado nesta página."}
              </p>
            </div>
          </div>

          <p className="mb-6 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
            {this.state.errorMessage}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={this.handleReload} className="sm:flex-1">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
            <Button variant="outline" onClick={this.handleGoHome} className="sm:flex-1">
              <Home className="mr-2 h-4 w-4" />
              Ir para dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
