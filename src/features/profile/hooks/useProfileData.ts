import { useState, useEffect } from 'react';
import { supabase } from '@/shared/integrations/supabase/client';
import { useAuth } from '@/features/auth/data/useAuth';
import { useToast } from '@/shared/hooks/use-toast';

export interface ProfileData {
  monthlyIncome: number;
  currentEPF: number;
  age: number;
  housingCost: number;
  householdType: string;
  dependants: number;
  location: string;
  expenseFood: number;
  expenseTransport: number;
  expenseUtilities: number;
  expenseOthers: number;
  expenseEntertainment: number;
  monthlyVoluntaryContribution: number;
  benchmarkSector: string;
  benchmarkSpecialisation: string;
  benchmarkRole: string;
}

export const useProfileData = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [dataLoading, setDataLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    monthlyIncome: 0,
    currentEPF: 0,
    age: 30,
    housingCost: 0,
    householdType: 'Single',
    dependants: 0,
    location: 'Kuala Lumpur',
    expenseFood: 0,
    expenseTransport: 0,
    expenseUtilities: 0,
    expenseOthers: 0,
    expenseEntertainment: 0,
    monthlyVoluntaryContribution: 0,
    benchmarkSector: '',
    benchmarkSpecialisation: '',
    benchmarkRole: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setDataLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData({
            monthlyIncome: data.monthly_income || 0,
            currentEPF: data.current_epf_amount || 0,
            age: data.age || 30,
            housingCost: data.housing_cost || 0,
            householdType: data.household_type || 'Single',
            dependants: data.dependants || 0,
            location: data.location || 'Kuala Lumpur',
            expenseFood: data.expense_food || 0,
            expenseTransport: data.expense_transport || 0,
            expenseUtilities: data.expense_utilities || 0,
            expenseOthers: data.expense_others || 0,
            expenseEntertainment: data.expense_entertainment || 0,
            monthlyVoluntaryContribution: data.monthly_voluntary_contribution || 0,
            benchmarkSector: data.benchmark_sector || '',
            benchmarkSpecialisation: data.benchmark_specialisation || '',
            benchmarkRole: data.benchmark_role || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateIncome = async (newIncome: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_income: newIncome })
        .eq('user_id', user.id);
      if (error) throw error;
      setProfileData(prev => ({ ...prev, monthlyIncome: newIncome }));
      toast({ title: "Income updated", description: "Your financial profile has been updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save income. Please try again.", variant: "destructive" });
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_income: data.monthlyIncome,
          current_epf_amount: data.currentEPF,
          age: data.age,
          monthly_voluntary_contribution: data.monthlyVoluntaryContribution,
          housing_cost: data.housingCost,
          household_type: data.householdType,
          dependants: data.dependants,
          location: data.location,
          expense_food: data.expenseFood,
          expense_transport: data.expenseTransport,
          expense_utilities: data.expenseUtilities,
          expense_others: data.expenseOthers,
          expense_entertainment: data.expenseEntertainment,
          benchmark_sector: data.benchmarkSector,
          benchmark_specialisation: data.benchmarkSpecialisation,
          benchmark_role: data.benchmarkRole,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      setProfileData(prev => ({ ...prev, ...data }));
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    }
  };

  const updateBenchmark = async (sector: string, specialisation: string, role: string) => {
    await updateProfile({
      benchmarkSector: sector,
      benchmarkSpecialisation: specialisation,
      benchmarkRole: role
    });
  };

  return {
    profileData,
    loading: loading || dataLoading,
    user,
    updateIncome,
    updateProfile,
    updateBenchmark,
  };
};
