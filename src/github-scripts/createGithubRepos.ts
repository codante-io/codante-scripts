import chalk from 'chalk';
import { handle } from './lib/createRepo';
import inquirer from 'inquirer';

export async function createGithubRepos() {
  const REPO_NAME = 'server-actions-no-next-js'; // sem o "mp-"
  const DESCRIPTION =
    'Vamos adicionar um formulário de cadastro usando server actions no Next.js! 🚀';
  const URL_DO_MINI_PROJETO =
    'https://codante.io/mini-projetos/server-actions-no-next-js';

  console.log(chalk.blue(`Mini Projeto ${REPO_NAME}...`));
  console.log(chalk.blue(`Descrição: ${DESCRIPTION}...`));
  console.log(chalk.blue(`URL: ${URL_DO_MINI_PROJETO}...`));

  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Deseja continuar?`,
      },
    ])
    .then((answers) => {
      if (!answers.confirm) {
        console.log('Ok, script cancelado.');
        process.exit();
      }
    });

  // Principal
  await handle(`mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);

  // Protótipo
  await handle(`prototipo-mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);
}
