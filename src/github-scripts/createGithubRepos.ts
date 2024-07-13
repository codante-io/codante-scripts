import chalk from 'chalk';
import { handle } from './lib/createRepo';
import inquirer from 'inquirer';

export async function createGithubRepos() {
  const REPO_NAME = 'formulario-dinamico-com-react-hook-form-e-zod'; // sem o "mp-"
  const DESCRIPTION =
    'Fazer um formulário na vida real nem sempre é uma tarefa trivial. Nuances como validação, mensagens de erro e máscaras de preenchimento tornam o processo um pouco menos intuitivo. Neste mini projeto, você vai aprender a criar um formulário dinâmico usando React Hook Form e Zod para facilitar o desenvolvimento.';
  const URL_DO_MINI_PROJETO =
    'https://codante.io/mini-projetos/formulario-dinamico-com-react-hook-form-e-zod';

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
