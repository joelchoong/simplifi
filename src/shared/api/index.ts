import { supabase } from "@/shared/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/shared/integrations/supabase/types";
import { 
  NetWorthRecord, 
  NetWorthFormValues, 
  calculateNetWorth, 
  normaliseNetWorthValues,
  normaliseEntryMonth 
} from "@/features/financial-records/net-worth/domain/netWorth";

type TaxReceiptRow = Tables<"tax_receipts">;
type TaxReceiptInsert = TablesInsert<"tax_receipts">;
type TaxReceiptUpdate = TablesUpdate<"tax_receipts">;

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
    async fetchReceipts(userId: string, year: number): Promise<TaxReceiptRow[]> {
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
    async saveReceipt(payload: TaxReceiptInsert): Promise<TaxReceiptRow> {
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
    async updateReceipt(receiptId: string, userId: string, updates: TaxReceiptUpdate): Promise<void> {
      const { error } = await supabase
        .from("tax_receipts")
        .update(updates)
        .eq("id", receiptId)
        .eq("user_id", userId);

      if (error) {
        console.warn("Supabase Update Error:", error);
        throw new Error(error.message || "Failed to update record");
      }
    },

    /**
     * Deletes a receipt and its file from storage.
     */
    async deleteReceipt(receiptId: string, userId: string, storagePath?: string): Promise<void> {
      // Delete the DB record first
      const { error } = await supabase
        .from("tax_receipts")
        .delete()
        .eq("id", receiptId)
        .eq("user_id", userId);

      if (error) throw error;

      // Delete the file from storage
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("receipts")
          .remove([storagePath]);

        if (storageError) {
          console.warn("Storage delete error:", storageError);
          // Don't throw — DB record is already gone, storage cleanup is best-effort
        }
      }
    },

    /**
     * Fetches saved N/A category IDs for a user and tax year from Supabase.
     */
    async fetchNaCategories(userId: string, year: number): Promise<string[] | null> {
      const { data, error } = await supabase
        .from("tax_receipts")
        .select("metadata")
        .eq("user_id", userId)
        .eq("tax_year", year)
        .eq("category_id", "system_setting")
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      const metadata = data.metadata as { na_categories?: string[] };
      return metadata?.na_categories || null;
    },

    /**
     * Saves user's N/A category IDs to Supabase.
     */
    async saveNaCategories(userId: string, year: number, categoryIds: string[]): Promise<void> {
      const { data } = await supabase
        .from("tax_receipts")
        .select("id")
        .eq("user_id", userId)
        .eq("tax_year", year)
        .eq("category_id", "system_setting")
        .limit(1)
        .maybeSingle();

      const metadata = { na_categories: categoryIds };

      if (data?.id) {
        await supabase
          .from("tax_receipts")
          .update({ metadata })
          .eq("id", data.id)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("tax_receipts")
          .insert({
            user_id: userId,
            tax_year: year,
            file_name: "__SETTING_NA_CATEGORIES__",
            storage_path: "system",
            amount: 0,
            category_id: "system_setting",
            metadata,
          });
      }
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
