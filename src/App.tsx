import { lazy, Suspense } from "react";
import { BrowserRouter, matchPath, useLocation } from "react-router-dom";
import AppErrorBoundary from "./components/AppErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./components/ThemeProvider";
const PublicRoutes = lazy(() => import("./routes/PublicRoutes"));
const AuthenticatedRoutes = lazy(() => import("./routes/AuthenticatedRoutes"));

const AUTHENTICATED_PATTERNS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/welcome/*",
  "/account",
  "/account/*",
  "/dashboard",
  "/novo-cliente",
  "/novo-gestor",
  "/clientes",
  "/cliente/*",
  "/historico",
  "/gestores",
  "/configuracoes",
  "/gerencial",
  "/controle",
  "/relatorio-cliente",
  "/modelos",
  "/conquistas",
  "/produtividade",
  "/previsao-saldo",
  "/calendario",
  "/agencia/*",
  "/ferramentas",
];

const RouteResolver = () => {
  const location = useLocation();
  const isAuthenticatedArea = AUTHENTICATED_PATTERNS.some((pattern) =>
    Boolean(matchPath({ path: pattern, end: false }, location.pathname))
  );

  return isAuthenticatedArea ? <AuthenticatedRoutes /> : <PublicRoutes />;
};

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium text-muted-foreground">Carregando interface...</p>
          </div>
        }
      >
        <AppErrorBoundary>
          <RouteResolver />
        </AppErrorBoundary>
      </Suspense>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
