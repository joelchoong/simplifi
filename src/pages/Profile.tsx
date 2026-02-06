import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

interface Profile {
  full_name: string | null;
  email: string | null;
  monthly_income: number | null;
}

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Profile Management</h2>
          <p className="text-muted-foreground">Manage your personal information and account security</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income (RM)</Label>
              <Input
                id="income"
                type="number"
                value={profile.monthly_income || ""}
                onChange={(e) => setProfile({ ...profile, monthly_income: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={passwordErrors.password ? "border-destructive" : ""}
              />
              {passwordErrors.password && (
                <p className="text-sm text-destructive">{passwordErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                placeholder="••••••••"
                className={passwordErrors.confirm ? "border-destructive" : ""}
              />
              {passwordErrors.confirm && (
                <p className="text-sm text-destructive">{passwordErrors.confirm}</p>
              )}
            </div>

            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
