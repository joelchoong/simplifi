import { useEffect, useState } from "react";
import { DashboardLayout } from "@/features/dashboard/presentation/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { useAuth } from "@/features/auth/data/useAuth";
import { supabase } from "@/shared/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";
import { User, Mail, Banknote, ShieldCheck, Save, Loader2, KeyRound } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

interface ProfileData {
  full_name: string | null;
  email: string | null;
  monthly_income: number | null;
}

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    monthly_income: 0,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ password?: string; confirm?: string }>({});

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, monthly_income")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          monthly_income: Number(data.monthly_income) || 0,
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        monthly_income: profile.monthly_income,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    const newErrors: { password?: string; confirm?: string } = {};

    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);

    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account details and security preferences.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-emerald-100/50 shadow-emerald-900/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Update your public profile and contact info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      className="pl-10 h-11 transition-all focus:ring-emerald-500"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-10 h-11 bg-muted/30 border-muted text-muted-foreground cursor-not-allowed"
                      value={profile.email || ""}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email is managed via your authentication provider</p>
                </div>

                <div className="pt-4 border-t border-emerald-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Banknote className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold">Financial Settings</h3>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="income" className="text-sm font-medium">Monthly Gross Income (RM)</Label>
                    <div className="relative text-lg font-bold">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">RM</span>
                      <Input
                        id="income"
                        type="number"
                        className="pl-10 h-11 text-emerald-600 focus:ring-emerald-500"
                        value={profile.monthly_income || ""}
                        onChange={(e) => setProfile({ ...profile, monthly_income: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-emerald-100/50 shadow-emerald-900/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <CardTitle>Account Security</CardTitle>
                </div>
                <CardDescription>Keep your data safe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      className={`pl-10 ${passwordErrors.password ? "border-destructive ring-destructive/20" : "focus:ring-emerald-500"}`}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.password && (
                    <p className="text-xs text-destructive">{passwordErrors.password}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className={`pl-10 ${passwordErrors.confirm ? "border-destructive ring-destructive/20" : "focus:ring-emerald-500"}`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordErrors((prev) => ({ ...prev, confirm: undefined }));
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.confirm && (
                    <p className="text-xs text-destructive">{passwordErrors.confirm}</p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  {changingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
