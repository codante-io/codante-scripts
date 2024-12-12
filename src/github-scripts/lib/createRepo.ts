import { Octokit } from '@octokit/rest';
import chalk from 'chalk';

export async function handle(
  name: string,
  description: string,
  homepage: string
) {
  const token = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });

  await createRepoFromTemplate(octokit, name);
  await updateRepo(octokit, name, description, homepage);
  await addTopicToRepo(octokit, name);
  await addTeamMiniProjetosToRepo(octokit, name);
}

async function createRepoFromTemplate(octokit: Octokit, name: string) {
  console.log(chalk.blue(`Criando repo || ${name} || a partir do template...`));

  const response = await octokit.repos.createUsingTemplate({
    template_owner: 'codante-io',
    template_repo: 'mp-template',
    owner: 'codante-io',
    name,
    private: false,
    include_all_branches: false,
  });

  console.log(chalk.blue('Repo criado com sucesso!'));
}

async function updateRepo(
  octokit: Octokit,
  name: string,
  description: string,
  homepage: string
) {
  console.log(chalk.blue(`Editando repo || ${name} ||...`));

  const response = await octokit.repos.update({
    owner: 'codante-io',
    repo: name,
    org: 'codante-io',
    description,
    homepage,
    private: false,
    has_issues: false,
    has_projects: false,
    has_wiki: false,
    has_discussions: false,
    has_downloads: false,
    team_id: 8336401,
    license_template: 'GPL-3.0',
  });

  console.log(chalk.blue('Repo editado com sucesso!'));
}

async function addTopicToRepo(octokit: Octokit, name: string) {
  console.log(chalk.blue(`Adicionando tópico ao repo  || ${name} ||...`));

  const response1 = await octokit.repos.replaceAllTopics({
    owner: 'codante-io',
    repo: name,
    names: ['codante-mini-projetos'],
  });

  console.log(chalk.blue('Tópico adicionado com sucesso!'));
}

async function addTeamMiniProjetosToRepo(octokit: Octokit, name: string) {
  console.log(chalk.blue(`Adicionando time ao repo || ${name} ||...`));

  const response2 = await octokit.rest.teams
    .addOrUpdateRepoPermissionsInOrg({
      org: 'codante-io',
      team_slug: 'mini-projetos',
      owner: 'codante-io',
      repo: name,
      permission: 'push',
    })
    .catch((e) => console.log(e));

  console.log(chalk.blue('Time adicionado com sucesso!'));
}
