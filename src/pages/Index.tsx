import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/data/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import logo from "@/assets/logo.png";
import { DollarSign, Eye, Heart, ArrowRight, BarChart3, UserCircle, BookOpen } from "lucide-react";

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
      icon: BarChart3,
      title: "Personal Financial Snapshot",
      description:
        "See exactly where you stand today. Enter your income and key numbers to instantly understand your income tier, projected retirement funds, and estimated future spending capacity.",
    },
    {
      icon: UserCircle,
      title: "Retirement Visibility — Before It's Too Late",
      description:
        "Understand your retirement outlook in minutes. See how much you may accumulate by retirement and how much you could sustainably spend — based on your current inputs.",
    },
    {
      icon: BookOpen,
      title: "Clarity on Your Biggest Financial Constraint",
      description:
        "Identify what's holding you back. SimpliFi highlights the key factor that most limits your financial position today — whether it's income level, savings rate, or lifestyle assumptions.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <img src={logo} alt="SimpliFi" className="h-10 w-auto" />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background inspired by reference */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/8 blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            SimpliFi Your Path to{" "}
            <span className="text-primary">Financial Freedom</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Helping you plan smarter, invest better, and achieve financial freedom step by step.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link to="/auth">
                Start Your Financial Freedom Plan <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 h-12">
              <Link to="/auth">See How It Works</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            <span className="font-semibold">100% Free.</span> No hidden fees, no premium tiers.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
            Why Choose SimpliFi?
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
            We make financial planning simple, accessible, and effective for everyone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-accent/30 shadow-none">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-accent/50 to-background">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join Malaysians who are already on their path to financial freedom.
          </p>
          <Button asChild size="lg" className="text-base px-10 h-12">
            <Link to="/auth">
              Start Your Plan Today <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Value Props Strip */}
      <section className="border-t border-border px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <h4 className="font-semibold text-foreground">100% Free to Use</h4>
            <p className="text-sm text-muted-foreground">No hidden fees, no premium tiers.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            <h4 className="font-semibold text-foreground">Visualise Your Future</h4>
            <p className="text-sm text-muted-foreground">See where you stand and where you could be.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h4 className="font-semibold text-foreground">Support Development</h4>
            <p className="text-sm text-muted-foreground">Share SimpliFi to help us keep building.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SimpliFi" className="h-8 w-auto" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SimpliFi. All rights reserved.
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for Malaysians who want to take control of their finances.
          </p>
        </div>
      </footer>
    </div>
  );
}
