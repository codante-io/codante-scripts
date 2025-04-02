import { input } from '@inquirer/prompts';
import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function generateVideoCover() {
  // workshopSlug: string, vimeoID: string, startTime: string, position: string = 'right'

  const answers = {
    workshopId: await input({ message: 'Qual o ID do workshop?' }),
    vimeoID: await input({
      message: 'Qual o ID do vídeo no Vimeo?',
      validate: (value: string) => {
        if (value.match(/\d+/)) {
          return true;
        }
        return 'Formato inválido';
      },
    }),
    startTime: await input({
      message: 'Qual o tempo de início do vídeo? (00:00:00)',
      default: '00:00:00',
      validate: (value: string) => {
        if (value.match(/\d{2}:\d{2}:\d{2}/)) {
          return true;
        }
        return 'Formato inválido';
      },
    }),
  };

  const workshopId = answers.workshopId;
  const vimeoID = answers.vimeoID;
  const startTime = answers.startTime;

  console.log(
    chalk.blue('baixando vídeo do vimeo e gerando o thumb de vídeo...')
  );
  const res = await axios.post(
    'https://screenshot-service.codante.io/vimeo-video-thumbnail',
    {
      vimeoID,
      startTime,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SCREENSHOT_SERVICE_TOKEN}`,
      },
    }
  );

  // subir videoURL para o workshop
  console.log(chalk.blue('Atualizando workshop com a URL do vídeo...'));
  const videoURL = res.data.videoUrl;
  if (!videoURL) {
    console.log('Erro ao gerar imagem do vídeo');
    process.exit();
  }

  // atualizar na DB
  const res1 = await axios.put(
    `https://api.codante.io/api/custom-admin/workshops/${workshopId}`,
    {
      video_url: videoURL,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CODANTE_ADMIN_TOKEN}`,
      },
    }
  );
}
