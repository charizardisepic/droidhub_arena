import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-7xl font-bold mb-4 glow">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Signal lost. This area is outside robot control range.</p>
          <Button asChild className="neo-button">
            <Link to="/">Return to Control Center</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
