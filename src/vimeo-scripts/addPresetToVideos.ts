import axios from 'axios';
import inquirer from 'inquirer';

export async function addPresetToVideosInFolder() {
  const questions = [
    {
      type: 'input',
      name: 'folderId',
      message: 'Qual o ID da pasta do Vimeo?',
    },
  ];

  const answers = await inquirer.prompt(questions);
  const folderId = answers.folderId;

  if (!process.env.VIMEO_TOKEN) throw new Error('VIMEO_TOKEN not found');
  if (!folderId) throw new Error('É necessário um ID da pasta do Vimeo');


  console.log('Adicionando Preset do Codante para todos os vídeos da pasta...')
  const response = await axios.get(
    `https://api.vimeo.com/me/projects/${folderId}/videos?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VIMEO_TOKEN}`,
      },
    }
  );
  const data = response.data.data;

  const videoArray = data.map((video: any) => {
    return video.uri.replace('/videos/', '');
  });

  const promises = videoArray.map((videoId: any) => {
    return axios.put(
      `https://api.vimeo.com/videos/${videoId}/presets/${process.env.VIMEO_PRESET_ID}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_TOKEN}`,
        },
      }
    );
  });

  await Promise.all(promises);

  console.log('Todos os vídeos foram atualizados com o Preset do Codante!');
}
