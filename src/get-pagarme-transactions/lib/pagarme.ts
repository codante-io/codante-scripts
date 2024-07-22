import { input } from '@inquirer/prompts';
import axios from 'axios';
import type { PagarmeTransaction, Transaction } from './schemas';

export async function getTransactionsFromPagarme(): Promise<Transaction[]> {
  const firstDayOfCurrentMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const lastDayOfCurrentMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  );

  // format YYYY-MM-DD
  const firstDayOfCurrentMonthString = firstDayOfCurrentMonth
    .toISOString()
    .split('T')[0];

  const lastDayOfCurrentMonthString = lastDayOfCurrentMonth
    .toISOString()
    .split('T')[0];

  const startDate = await input({
    message: 'Qual a data de início',
    default: firstDayOfCurrentMonthString,
  });
  const endDate = await input({
    message: 'Qual a data final',
    default: lastDayOfCurrentMonthString,
  });

  const res = await axios.get<PagarmeTransaction>(
    `https://api.pagar.me/core/v5/balance/operations?created_since=${startDate}&created_until=${endDate}&size=1000`,
    {
      auth: {
        username: process.env.PAGARME_API_KEY!,
        password: '',
      },
    }
  );

  const sanitizedData: Transaction[] = res.data.data.map((transaction) => {
    // console.log(transaction);
    return {
      date: transaction.created_at.split('T')[0],
      // status: transaction.status,
      type: transaction.type,
      amount: new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format((transaction.amount - transaction.fee) / 100),
    };
  });

  return sanitizedData;
}
