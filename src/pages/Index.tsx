import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/data/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import logo from "@/assets/logo.png";
import authIllustration from "@/assets/auth-illustration.png";
import { DollarSign, Eye, Heart, ArrowRight } from "lucide-react";

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

  const features = [
    {
      icon: DollarSign,
      title: "100% Free to Use",
      description: "No hidden fees, no premium tiers. SimpliFi is completely free for everyone.",
    },
    {
      icon: Eye,
      title: "Visualise Your Future",
      description: "Enter your salary and see where you stand — and where you could be with smarter planning.",
    },
    {
      icon: Heart,
      title: "Support Development",
      description: "Love SimpliFi? Share it with friends to help us keep building and improving.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row">
        {/* Left - Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 lg:py-0">
          <div className="max-w-lg mx-auto lg:mx-0">
            <img src={logo} alt="SimpliFi" className="h-16 w-auto mb-8" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              Take control of your <span className="text-primary">financial future</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Plan smarter, invest better, and achieve financial freedom step by step. 
              See exactly where your money stands — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/auth">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right - Illustration */}
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
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 border-t border-border px-6 sm:px-12 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Why SimpliFi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-background border-t border-border px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ for Malaysians who want to take control of their finances.
        </p>
      </footer>
    </div>
  );
}
