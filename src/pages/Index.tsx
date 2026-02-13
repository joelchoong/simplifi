import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/money-health");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary to-accent p-6">
      <div className="text-center max-w-lg">
        <img src={logo} alt="SimpliFi" className="h-24 w-auto mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">SimpliFi</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Plan smarter, invest better, and achieve financial freedom step by step.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
