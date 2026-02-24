import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/data/useAuth";
import { Button } from "@/shared/components/ui/button";
import logo from "@/assets/logo.png";
import authIllustration from "@/assets/auth-illustration.png";

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
        <div className="text-center max-w-md">
          <img
            src={authIllustration}
            alt="Financial freedom illustration"
            className="w-80 h-80 mx-auto mb-8 object-contain"
          />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Your journey to financial freedom
          </h2>
          <p className="text-muted-foreground">
            Plan smarter, invest better, and achieve your financial goals step by step with SimpliFi.
          </p>
        </div>
      </div>

      {/* Right panel - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="text-center max-w-md">
          <img src={logo} alt="SimpliFi" className="h-20 w-auto mx-auto mb-6" />
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
    </div>
  );
}
