import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { useAuth } from "@/features/auth/data/useAuth";
import { supabase } from "@/shared/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";
import { User, Mail, Banknote, ShieldCheck, Save, Loader2, KeyRound, AlertCircle } from "lucide-react";
import { z } from "zod";
import { profileUpdateSchema } from "@/shared/lib/validation";
import { captureError } from "@/shared/lib/sentry";
import SEO from "@/shared/components/SEO";

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
  const [emailEditing, setEmailEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, monthly_income")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // Error fetching profile - silent fail, user will see empty form
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

    // Validate profile data before saving
    const validationResult = profileUpdateSchema.safeParse({
      full_name: profile.full_name,
      monthly_income: profile.monthly_income,
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        monthly_income: profile.monthly_income,
      })
      .eq("user_id", user.id);

    if (error) {
      captureError(error as Error, { context: 'profile_save' });
      toast({
        title: "Error saving profile",
        description: "An error occurred while saving. Please try again.",
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
      captureError(error as Error, { context: 'password_update' });
      toast({
        title: "Error updating password",
        description: "An error occurred while updating your password. Please try again.",
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
      <>
        <SEO title="Profile | SimpliFi" description="Manage your SimpliFi profile." />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${profile.full_name || "Profile"} | SimpliFi`}
        description="Manage your SimpliFi account details and security preferences."
      />
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
                  {!emailEditing ? (
                    <>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          className="pl-10 h-11 bg-muted/30 border-muted text-muted-foreground cursor-not-allowed"
                          value={profile.email || ""}
                          disabled
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setNewEmail(profile.email || ""); setEmailEditing(true); }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 underline underline-offset-2 text-left w-fit"
                      >
                        Change email address
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="newEmail"
                          type="email"
                          className="pl-10 h-11 focus:ring-emerald-500"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                        />
                      </div>
                      <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          A verification email will be sent to your new email address. You must confirm it to complete the change.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEmailEditing(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={savingEmail || !newEmail || newEmail === profile.email}
                          onClick={async () => {
                            setSavingEmail(true);
                            const { error } = await supabase.auth.updateUser({ email: newEmail });
                            if (error) {
                              captureError(error as Error, { context: 'email_update' });
                              toast({ title: "Error", description: "An error occurred while updating your email. Please try again.", variant: "destructive" });
                            } else {
                              toast({
                                title: "Verification email sent",
                                description: "Please check both your current and new email to confirm the change.",
                              });
                              setEmailEditing(false);
                            }
                            setSavingEmail(false);
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {savingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : "Update Email"}
                        </Button>
                      </div>
                    </>
                  )}
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
    </>
  );
}
