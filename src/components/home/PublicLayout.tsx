import HomeNavbar from "@/components/home/HomeNavbar";
import FooterSection from "@/components/home/FooterSection";

interface PublicLayoutProps {
    children: React.ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <HomeNavbar />
            <main className="pt-20">{children}</main>
            <FooterSection />
        </div>
    );
};

export default PublicLayout;
