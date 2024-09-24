import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { handle } from './lib/createRepo';

export async function createGithubRepos() {
  const REPO_NAME = 'testes-1'; // sem o "mp-"
  const DESCRIPTION = 'Teste 1.';
  const URL_DO_MINI_PROJETO = 'https://codante.io/mini-projetos/testes-1';

  console.log(chalk.blue(`Mini Projeto ${REPO_NAME}...`));
  console.log(chalk.blue(`Descrição: ${DESCRIPTION}...`));
  console.log(chalk.blue(`URL: ${URL_DO_MINI_PROJETO}...`));

  const answer = await confirm({
    message:
      'Você está prestes a iniciar o script de criação de repos no Github. As informações estão corretas?',
  });
  if (!answer) {
    console.log('Ok, script cancelado.');
    process.exit();
  }

  // Principal
  await handle(`mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);

  // Protótipo
  await handle(`prototipo-mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);
}
