import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AppSidebar from "./AppSidebar";
import SessionTimer from "./SessionTimer";
import OnboardingChecklist from "./OnboardingChecklist";
import { useGestor } from "@/contexts/GestorContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { gestor, isLoggedIn, logout } = useGestor();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          {/* Top Bar with Sidebar Trigger */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1" />
            
            {/* Session Timer */}
            <SessionTimer />
            
            {/* User Info */}
            {gestor && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={gestor.foto_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {gestor.nome.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:block">{gestor.nome}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </header>
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
      
      {/* Onboarding Checklist */}
      <OnboardingChecklist />
    </SidebarProvider>
  );
};

export default AppLayout;
