import axios from 'axios';
import inquirer from 'inquirer';

export async function generateVideoCover() {
  // workshopSlug: string, vimeoID: string, startTime: string, position: string = 'right'

  const questions = [
    {
      type: 'input',
      name: 'workshopSlug',
      message: 'Qual o slug do workshop?',
    },
    {
      type: 'input',
      name: 'vimeoID',
      message: 'Qual o ID do vídeo no Vimeo?',
    },
    {
      type: 'input',
      name: 'startTime',
      message: 'Qual o tempo de início do vídeo? (00:00:00)',
    },
    {
      type: 'input',
      name: 'position',
      default: 'right',
      message: 'Qual a posição do texto?',
    },  
  ];

  const answers = await inquirer.prompt(questions);
  const workshopSlug = answers.workshopSlug;
  const vimeoID = answers.vimeoID;
  const startTime = answers.startTime;
  const position = answers.position;


  const res = await axios.post('https://screenshot-service.codante.io/video/process', {
    vimeoUrl: `https://vimeo.com/manage/videos/${vimeoID}`,
    localPath: `workshops/cover-videos/${workshopSlug}`,
    startTime,
    position,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SCREENSHOT_SERVICE_TOKEN}`,
    },
  });

  console.log(res.data);
}
