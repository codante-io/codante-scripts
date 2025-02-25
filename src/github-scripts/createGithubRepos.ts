import chalk from 'chalk';
import { handle } from './lib/createRepo';
import inquirer from "inquirer";

export async function createGithubRepos() {
  const questions = [
    {
      type: "input",
      name: "repoSlug",
      message: "Qual o slug do repositório? Sem o 'prefixo' `mp`. Exemplo: saas-com-next",
    },
    {
      type: "input",
      name: "description",
      message: "Qual a descrição?",
    },
    {
      type: "input",
      name: "urlMp",
      message: "Qual a url ? Exemplo: saas-com-next",
    },
    {
      type: "confirm",
      name: "confirmQuestions",
      message: `Você está prestes a iniciar o script de criação de repositórios. Deseja continuar ?`,
    },
  ]

  const answers = await inquirer.prompt(questions);
  const REPO_NAME = answers.repoName; 
  const DESCRIPTION = answers.description;
  const URL_DO_MINI_PROJETO = answers.urlMp;

  console.log(chalk.blue(`Mini Projeto ${REPO_NAME}...`));
  console.log(chalk.blue(`Descrição: ${DESCRIPTION}...`));
  console.log(chalk.blue(`URL: ${URL_DO_MINI_PROJETO}...`));


  if (!answers.confirmQuestions) {
    console.log('Ok, script cancelado.');
    process.exit();
  }

  // Principal
  await handle(`mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);

  // Protótipo
  await handle(`prototipo-mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);
}
