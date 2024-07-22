import chalk from 'chalk';
import { getTransactionsFromPagarme } from './lib/pagarme';
import { Parser } from '@json2csv/plainjs';
import clipboard from 'clipboardy';

export async function getPagarmeTransactions() {
  console.log('Iniciando...');
  const transactions = await getTransactionsFromPagarme();

  const parser = new Parser({ delimiter: '\t', header: false });
  const csv = parser.parse(transactions);

  clipboard.writeSync(csv);
  console.log(chalk.green('Copiado para Clipboard!'));
}
