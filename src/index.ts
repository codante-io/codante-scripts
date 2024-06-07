// inquirer to select which script to run
import inquirer from 'inquirer';
import { addPresetToVideosInFolder } from './vimeo-scripts/addPresetToVideos';

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
    ],
  },
];
inquirer.prompt(questions).then((answers) => {
  switch (answers.action) {
    case 'Add Preset do Codante para uma Pasta do Vimeo':
      addPresetToVideosInFolder();
      break;
    case 'Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados':
      // Call the function for Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados
      break;
    case 'Criar repositórios de Mini Projetos':
      // Call the function for Criar repositórios de Mini Projetos
      break;
    default:
      console.log('Invalid action');
      break;
  }
});
