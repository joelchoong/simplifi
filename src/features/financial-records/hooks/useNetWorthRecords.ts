import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/integrations/supabase/client";
import { useAuth } from "@/features/auth/data/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import {
  calculateDefaultMonthlyEPFContribution,
  calculateMonthlyChange,
  calculateNetWorth,
  calculateNetWorthWithEPF,
  EMPTY_NET_WORTH_VALUES,
  formatMonthLabel,
  getMonthStart,
  getPreviousMonthStart,
  NetWorthFormValues,
  NetWorthRecord,
  normaliseEntryMonth,
  normaliseNetWorthValues,
  projectEPFForMonth,
} from "@/features/financial-records/domain/netWorth";
import type { ProfileData } from "@/features/profile/hooks/useProfileData";

function mapRecord(row: {
  id: string;
  epf_amount: number | null;
  entry_month: string;
  total_cash: number;
  total_investments: number;
  total_property: number;
  total_liabilities: number;
  net_worth: number;
  created_at: string;
  updated_at: string;
}): NetWorthRecord {
  return {
    id: row.id,
    entryMonth: row.entry_month,
    totalCash: Number(row.total_cash) || 0,
    totalInvestments: Number(row.total_investments) || 0,
    totalProperty: Number(row.total_property) || 0,
    totalLiabilities: Number(row.total_liabilities) || 0,
    epfAmount: row.epf_amount === null ? undefined : Number(row.epf_amount) || 0,
    netWorth: Number(row.net_worth) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchNetWorthRecords(userId: string): Promise<NetWorthRecord[]> {
  const { data, error } = await supabase
    .from("net_worth_records")
    .select("*")
    .eq("user_id", userId)
    .order("entry_month", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRecord);
}

export function useNetWorthRecords(profileData?: Partial<ProfileData>) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const queryKey = ["net-worth-records", user?.id] as const;

  const {
    data: records = [],
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchNetWorthRecords(user!.id),
    enabled: !!user && !authLoading,
    staleTime: 5 * 60 * 1000,   // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000,     // Keep in cache for 30 minutes
  });

  const invalidateRecords = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const latestRecord = useMemo(
    () => (records.length ? records[records.length - 1] : null),
    [records],
  );

  const currentMonth = useMemo(() => getMonthStart(), []);
  const monthlyEPFContribution = useMemo(
    () => calculateDefaultMonthlyEPFContribution(
      profileData?.monthlyIncome ?? 0,
      profileData?.monthlyVoluntaryContribution ?? 0,
    ),
    [profileData?.monthlyIncome, profileData?.monthlyVoluntaryContribution],
  );

  const recordsWithEPF = useMemo(
    () =>
      records.map((record) => {
        const projectedEPF = projectEPFForMonth({
          currentEPF: profileData?.currentEPF ?? 0,
          currentMonth,
          targetMonth: record.entryMonth,
          monthlyContribution: monthlyEPFContribution,
        });
        const epfAmount = record.epfAmount ?? projectedEPF;

        return {
          ...record,
          epfAmount,
          netWorth: calculateNetWorthWithEPF(
            {
              totalCash: record.totalCash,
              totalInvestments: record.totalInvestments,
              totalProperty: record.totalProperty,
              totalLiabilities: record.totalLiabilities,
            },
            epfAmount,
          ),
        };
      }),
    [currentMonth, monthlyEPFContribution, profileData?.currentEPF, records],
  );

  const initialValues = useMemo<NetWorthFormValues>(() => {
    if (!latestRecord) return EMPTY_NET_WORTH_VALUES;

    return normaliseNetWorthValues({
      totalCash: latestRecord.totalCash,
      totalInvestments: latestRecord.totalInvestments,
      totalProperty: latestRecord.totalProperty,
      totalLiabilities: latestRecord.totalLiabilities,
    });
  }, [latestRecord]);

  const previousMonthRecord = useMemo(() => {
    if (!recordsWithEPF.length) return null;
    const currentLatestRecord = recordsWithEPF[recordsWithEPF.length - 1];
    const previousMonth = getPreviousMonthStart(currentLatestRecord.entryMonth);
    return recordsWithEPF.find((record) => record.entryMonth === previousMonth) ?? null;
  }, [recordsWithEPF]);

  const monthlyChange = useMemo(
    () => calculateMonthlyChange(recordsWithEPF[recordsWithEPF.length - 1]?.netWorth ?? null, previousMonthRecord?.netWorth ?? null),
    [latestRecord, previousMonthRecord],
  );

  const chartData = useMemo(
    () =>
      recordsWithEPF.map((record) => ({
        month: formatMonthLabel(record.entryMonth),
        netWorth: record.netWorth,
        actualMonth: record.entryMonth,
      })),
    [recordsWithEPF],
  );

  const saveCurrentMonthRecord = useCallback(
    async (values: NetWorthFormValues) => {
      if (!user) return;

      const normalised = normaliseNetWorthValues(values);
      const payload = {
        user_id: user.id,
        entry_month: getMonthStart(),
        total_cash: normalised.totalCash,
        total_investments: normalised.totalInvestments,
        total_property: normalised.totalProperty,
        total_liabilities: normalised.totalLiabilities,
        epf_amount: null,
        net_worth: calculateNetWorth(normalised),
      };

      setSaving(true);
      try {
        const { error } = await supabase
          .from("net_worth_records")
          .upsert(payload, { onConflict: "user_id,entry_month" });

        if (error) {
          throw error;
        }

        await invalidateRecords();

        toast({
          title: "Net worth saved",
          description: "This month's record has been updated.",
        });
      } catch (error) {
        console.error("Error saving net worth record:", error);
        toast({
          title: "Unable to save record",
          description: "Please check your values and try again.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [invalidateRecords, toast, user],
  );

  const updateRecords = useCallback(
    async (updatedRecords: NetWorthRecord[], deletedRecordIds: string[] = []) => {
      if (!user) return;

      setSaving(true);
      try {
        if (deletedRecordIds.length) {
          const persistedIds = deletedRecordIds.filter((id) => !id.startsWith("temp-"));
          if (persistedIds.length) {
            const { error: deleteError } = await supabase
              .from("net_worth_records")
              .delete()
              .in("id", persistedIds)
              .eq("user_id", user.id);

            if (deleteError) {
              throw deleteError;
            }
          }
        }

        if (!updatedRecords.length) {
          await invalidateRecords();
          toast({
            title: "Records updated",
            description: "Your net worth history has been saved.",
          });
          return;
        }

        for (const record of updatedRecords) {
          const normalised = normaliseNetWorthValues({
            totalCash: record.totalCash,
            totalInvestments: record.totalInvestments,
            totalProperty: record.totalProperty,
            totalLiabilities: record.totalLiabilities,
          });

          const payload = {
            user_id: user.id,
            entry_month: normaliseEntryMonth(record.entryMonth),
            total_cash: normalised.totalCash,
            total_investments: normalised.totalInvestments,
            total_property: normalised.totalProperty,
            total_liabilities: normalised.totalLiabilities,
            epf_amount: record.epfAmount ?? null,
            net_worth: calculateNetWorth(normalised),
          };

          if (record.id.startsWith("temp-")) {
            const { error: insertError } = await supabase
              .from("net_worth_records")
              .insert(payload);

            if (insertError) {
              throw insertError;
            }
          } else {
            const { error: updateError } = await supabase
              .from("net_worth_records")
              .update(payload)
              .eq("id", record.id)
              .eq("user_id", user.id);

            if (updateError) {
              throw updateError;
            }
          }
        }

        await invalidateRecords();

        toast({
          title: "Records updated",
          description: "Your net worth history has been saved.",
        });
      } catch (error) {
        console.error("Error updating net worth records:", error);
        toast({
          title: "Unable to update records",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [invalidateRecords, toast, user],
  );

  return {
    loading: authLoading || isLoading,
    saving,
    records: recordsWithEPF,
    latestRecord: recordsWithEPF[recordsWithEPF.length - 1] ?? null,
    previousMonthRecord,
    monthlyChange,
    initialValues,
    chartData,
    saveCurrentMonthRecord,
    updateRecords,
  };
}
