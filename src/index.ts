// inquirer to select which script to run
import inquirer from 'inquirer';
import { addPresetToVideosInFolder } from './vimeo-scripts/addPresetToVideos';
import { createChatGPTDescriptions } from './video-descriptions';
import { getSQLfromVideos } from './vimeo-scripts/getAllVideosFromFolder';
import { createGithubRepos } from './github-scripts/createGithubRepos';

// O que você quer fazer?

// 1. Add Preset do Codante para uma Pasta do Vimeo
// 2. Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados
// 3. Criar repositórios de Mini Projetos
// 4. Gerar descrições de vídeo com ChatGPT

const questions = [
  {
    type: 'list',
    name: 'action',
    message: 'O que você quer fazer?',
    choices: [
      'Add Preset do Codante para uma Pasta do Vimeo',
      'Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados',
      'Criar repositórios de Mini Projetos',
      'Gerar descrições de vídeo com ChatGPT',
    ],
  },
];
inquirer.prompt(questions).then((answers) => {
  switch (answers.action) {
    case 'Add Preset do Codante para uma Pasta do Vimeo':
      addPresetToVideosInFolder();
      break;
    case 'Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados':
      getSQLfromVideos();
      break;
    case 'Criar repositórios de Mini Projetos':
      createGithubRepos();
      break;
    case 'Gerar descrições de vídeo com ChatGPT':
      createChatGPTDescriptions();
      break;
    default:
      console.log('Invalid action');
      break;
  }
});
