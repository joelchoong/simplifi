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
    /**
     * Fetches all receipts for a specific user and year.
     */
    async fetchReceipts(userId: string, year: number): Promise<any[]> {
      const { data, error } = await supabase
        .from("tax_receipts")
        .select("*")
        .eq("user_id", userId)
        .eq("tax_year", year)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Saves a new receipt record. This will trigger the Make.com automation.
     */
    async saveReceipt(payload: {
      user_id: string;
      file_name: string;
      storage_path: string;
      tax_year: number;
      amount?: number;
      category_id?: string;
      sub_item_id?: string;
    }): Promise<any> {
      const { data, error } = await supabase
        .from("tax_receipts")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Updates an existing receipt.
     */
    async updateReceipt(receiptId: string, userId: string, updates: any): Promise<void> {
      const { error } = await supabase
        .from("tax_receipts")
        .update(updates)
        .eq("id", receiptId)
        .eq("user_id", userId);

      if (error) {
        console.error("Supabase Update Error:", error);
        throw new Error(error.message || "Failed to update record");
      }
    },

    /**
     * Deletes a receipt.
     */
    async deleteReceipt(receiptId: string, userId: string): Promise<void> {
      const { error } = await supabase
        .from("tax_receipts")
        .delete()
        .eq("id", receiptId)
        .eq("user_id", userId);

      if (error) throw error;
    }
  },

  storage: {
    /**
     * Uploads a receipt file to the storage bucket.
     * Returns the public path/URL for the file.
     */
    async uploadReceipt(file: File, userId: string): Promise<string> {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (error) throw error;
      return filePath;
    },

    /**
     * Gets a temporary signed URL for a private file.
     */
    async createSignedUrl(path: string): Promise<string | null> {
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(path, 3600); // 1 hour expiry
      
      if (error) return null;
      return data.signedUrl;
    }
  }
};
