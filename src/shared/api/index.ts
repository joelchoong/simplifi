import { supabase } from "@/shared/integrations/supabase/client";
import { 
  NetWorthRecord, 
  NetWorthFormValues, 
  calculateNetWorth, 
  normaliseNetWorthValues,
  normaliseEntryMonth 
} from "@/features/financial-records/net-worth/domain/netWorth";

/**
 * ApiService Abstraction Layer
 * 
 * This service acts as the single source of truth for all backend communications.
 * By centralizing Supabase logic here, we ensure that the rest of the application
 * (hooks, components, domain logic) remains decoupled from the specific backend provider.
 */

export const ApiService = {
  netWorth: {
    /**
     * Fetches all net worth records for a specific user.
     */
    async fetchRecords(userId: string): Promise<NetWorthRecord[]> {
      const { data, error } = await supabase
        .from("net_worth_records")
        .select("*")
        .eq("user_id", userId)
        .order("entry_month", { ascending: true });

      if (error) throw error;

      return (data ?? []).map(row => ({
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
      }));
    },

    /**
     * Saves or updates a net worth record for the current month.
     */
    async saveRecord(userId: string, values: NetWorthFormValues, month: string): Promise<void> {
      const normalised = normaliseNetWorthValues(values);
      const payload = {
        user_id: userId,
        entry_month: month,
        total_cash: normalised.totalCash,
        total_investments: normalised.totalInvestments,
        total_property: normalised.totalProperty,
        total_liabilities: normalised.totalLiabilities,
        epf_amount: null,
        net_worth: calculateNetWorth(normalised),
      };

      const { error } = await supabase
        .from("net_worth_records")
        .upsert(payload, { onConflict: "user_id,entry_month" });

      if (error) throw error;
    },

    /**
     * Updates a batch of records (used for history editing).
     */
    async updateBatch(userId: string, updatedRecords: NetWorthRecord[], deletedIds: string[]): Promise<void> {
      // Handle deletions
      if (deletedIds.length) {
        const { error: deleteError } = await supabase
          .from("net_worth_records")
          .delete()
          .in("id", deletedIds)
          .eq("user_id", userId);

        if (deleteError) throw deleteError;
      }

      // Handle updates/inserts
      for (const record of updatedRecords) {
        const normalised = normaliseNetWorthValues({
          totalCash: record.totalCash,
          totalInvestments: record.totalInvestments,
          totalProperty: record.totalProperty,
          totalLiabilities: record.totalLiabilities,
        });

        const payload = {
          user_id: userId,
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
          if (insertError) throw insertError;
        } else {
          const { error: updateError } = await supabase
            .from("net_worth_records")
            .update(payload)
            .eq("id", record.id)
            .eq("user_id", userId);
          if (updateError) throw updateError;
        }
      }
    }
  },

  tax: {
    // We can add tax-related API calls here next
  }
};
