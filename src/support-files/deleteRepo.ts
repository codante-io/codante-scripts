import { Octokit } from '@octokit/rest';
import chalk from 'chalk';

export async function handle() {
  const token = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });

  await octokit.repos.delete({
    owner: 'codante-io',
    repo: 'teste-codante-scripts1',
  });

  console.log('deletado')
}
