import { z } from 'zod';

export const PagarmeTransactionSchema = z.object({
  paging: z.object({}),
  data: z.array(
    z.object({
      id: z.number(),
      status: z.string(),
      balance_amount: z.number(),
      type: z.string(),
      amount: z.number(),
      fee: z.number(),
      created_at: z.string(),
      movement_object: z.object({
        product: z.string(),
        brand: z.string(),
        payment_date: z.string(),
        recipient_id: z.string(),
        document_type: z.string(),
        document: z.string(),
        liquidation_arrangement_id: z.string(),
        external_engine_payment_id: z.string(),
        object: z.string(),
        id: z.string(),
        amount: z.number(),
      }),
    })
  ),
});

export const TransactionSchema = z.object({
  amount: z.string(),
  status: z.string().optional(),
  type: z.string(),
  date: z.string(),
});

export type PagarmeTransaction = z.infer<typeof PagarmeTransactionSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
