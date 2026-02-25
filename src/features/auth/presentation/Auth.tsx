import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/data/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useToast } from "@/shared/hooks/use-toast";
import { z } from "zod";
import logo from "@/assets/logo.png";
import authIllustration from "@/assets/auth-illustration.png";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "signin" | "signup" | "reset" | "update-password";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<AuthMode>(
    modeParam === "update-password" ? "update-password" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; agreed?: string }>({});

  const { signIn, signUp, resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && mode !== "update-password") {
      navigate("/money-health");
    }
  }, [user, navigate, mode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string; agreed?: string } = {};

    if (mode !== "update-password") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }

    if (mode !== "reset") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if ((mode === "signup" || mode === "update-password") && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (mode === "signup" && !agreed) {
      newErrors.agreed = "You must agree to the Privacy Policy and Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message === "Invalid login credentials"
              ? "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message.includes("already registered")
              ? "This email is already registered. Please sign in instead."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link. Please check your email to complete registration.",
          });
        }
      } else if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Reset failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setMode("signin");
        }
      } else if (mode === "update-password") {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: "Update failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password updated",
            description: "Your password has been updated successfully.",
          });
          navigate("/money-health");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signin": return "Welcome back";
      case "signup": return "Create your account";
      case "reset": return "Reset your password";
      case "update-password": return "Set new password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signin": return "Sign in to continue to SimpliFi";
      case "signup": return "Start your journey to financial freedom";
      case "reset": return "Enter your email to receive a reset link";
      case "update-password": return "Enter your new password below";
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
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

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="SimpliFi" className="h-14 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{getDescription()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {mode !== "update-password" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            )}

            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === "update-password" ? "New Password" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {(mode === "signup" || mode === "update-password") && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreed"
                    checked={agreed}
                    onCheckedChange={(checked) => {
                      setAgreed(checked === true);
                      setErrors((prev) => ({ ...prev, agreed: undefined }));
                    }}
                    className={errors.agreed ? "border-destructive" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="agreed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I agree and have read the{" "}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/terms-of-service"
                        target="_blank"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </Link>
                    </label>
                  </div>
                </div>
                {errors.agreed && (
                  <p className="text-sm text-destructive">{errors.agreed}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "reset" ? "Send Reset Link" : "Update Password"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-2">
            {mode === "signin" && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-primary hover:underline"
                >
                  Forgot your password?
                </button>
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
