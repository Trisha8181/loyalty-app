export type Kind = "campaigns" | "memberships" | "receipts" | "gifts" | "redemptions";
export interface Row {
 id: string; name?: string; created_at: string; user_id?: string | null;
 start_date?: string; end_date?: string; status?: string; gender?: string; tier?: string;
 lifecycle_status?: string; registered_at?: string; suggested_tier?: string; suggested_tier_source?: string;
 suggested_tier_confidence?: number; suggested_tier_review_status?: string;
 member_id?: string; amount?: number; store?: string; transaction_date?: string; campaign_id?: string | null;
 description?: string; stock?: number; threshold_amount?: number; gift_id?: string; receipt_id?: string;
}
export type Dataset = Record<Kind, Row[]>;
export const money = (value: number) => new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"}).format(value);
export const sections = ["dashboard","campaigns","members","receipts","gifts","redemptions"] as const;
