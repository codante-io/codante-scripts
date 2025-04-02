import { hfs } from '@humanfs/node';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import OpenAI from 'openai';
import chalk from 'chalk';
import { json2csv } from 'json-2-csv';
import { confirm } from '@inquirer/prompts';
import Groq from 'groq-sdk';

// ---------------- ALTERAR AQUI
const courseDescription = `Esse é um workshop de TailwindCSS avançado para desenvolvedores web. os temas são esses: Boas-vindas!
O que vamos aprender
Para quem é esse workshop
Links Úteis
Quem sou eu?
group-*
peer-*
has-*
Comparação entre group, peer, in e has
Valores, Propriedades e Variantes arbitrários
Classes que fazem mágica
Regra Essencial do Tailwind CSS
Por trás dos panos
Diretivas no Tailwind
Diretiva @theme
Outras Diretivas
Funções
Dark Mode
Transições
Animações
Componentes prontos com Animações
Plugins no Tailwindcss
Forms
Tipografia
Headless Componentes
tailwind-merge
cn() do shadcn
CVA - Class Variance Authority
`;
const localPath = 'data/video-descriptions/'; // Pasta onde irá ficar os arquivos de áudio e transcrição.
const videosPath =
  '/Volumes/codante/em-edicao/WS00XX - Tailwind Avancado/editados/'; // pasta onde estão os vídeos. Recomendado usar nomes como 01.mp4, 02.mp4, 03.mp4, etc. A pasta deve ter um trailing slash (/) no final.
let cumulativeInfoString = ''; // string que irá acumular as informações dos vídeos para ser usada no contexto do chatGPT
// ---------------- ALTERAR AQUI

export async function createChatGPTDescriptions() {
  console.log(chalk.blue('Descrição: ' + courseDescription));
  console.log(chalk.blue('Pasta dos Vídeos: ' + videosPath));

  const answer = await confirm({
    message:
      'Você está prestes a iniciar o script de exportação de descrições de vídeos. As informações estão corretas?',
  });
  if (!answer) {
    console.log('Ok, script cancelado.');
    process.exit();
  }

  handle(); // start!
}

async function handle() {
  log('Iniciando script de exportação de descrições de vídeos...');
  const videos = await listAllVideosFromFolder(videosPath);

  // order videos by name (01.mov, 02.mov, 03.mov, etc)
  videos.sort((a: { name: string }, b: { name: string }): number => {
    const aName = a.name.split('.')[0];
    const bName = b.name.split('.')[0];
    return parseInt(aName) - parseInt(bName);
  });

  //Caso o serviço interrompa em alguma parte
  // const startFromVideo37 = videos.filter((video: { name: string }) => {
  //   const videoNumber = parseInt(video.name.split('.')[0]);
  //   return videoNumber >= 37;  // Começa a partir do vídeo 37
  // });

  await generateAllFiles(videos);
  await saveVideosInfo(videos);
}

async function saveVideosInfo(videos: any) {
  log('Salvando informações dos vídeos...');

  for (const video of videos) {
    // get video info from file
    const infoFilePath =
      localPath + video.name.replace('.mov', '.json').replace('.mp4', '.json');
    const videoInfos = await hfs.json(infoFilePath);
    // console.log(videoInfos)
    const filename = video.name;
    video.name = videoInfos.videoTitle.trim().replace(/"/g, '');
    video.description = videoInfos.description;
    video.filename = filename;
    //remove text from video object
    delete video.text;
    delete video.isFile;
    delete video.isDirectory;
    delete video.isSymlink;
  }

  // order videos by name (01.mov, 02.mov, 03.mov, etc)
  videos.sort((a: any, b: any) => {
    const aName = a.filename.split('.')[0];
    const bName = b.filename.split('.')[0];
    return parseInt(aName) - parseInt(bName);
  });

  await hfs.write(
    'data/video-descriptions/videos.json',
    JSON.stringify(videos)
  );

  // save a videos.csv file too
  const csv = json2csv(videos);
  await hfs.write('data/video-descriptions/videos.csv', csv);
}

async function generateAllFiles(videos: any[]) {
  // First, handle all transcriptions
  for (const video of videos) {
    const videoPath = videosPath + video.name;
    const audioPath =
      localPath + video.name.replace('.mov', '.mp3').replace('.mp4', '.mp3');
    const infoFilePath =
      localPath + video.name.replace('.mov', '.json').replace('.mp4', '.json');

    // Skip if video is already processed
    if (await isVideoProcessed(audioPath, infoFilePath)) {
      log(`Skipping ${video.name} - already processed`);
      continue;
    }

    // Export audio and get transcription
    await exportAudioFromVideo(videoPath, audioPath);
    await getAudioTranscription(audioPath, infoFilePath);
  }

  // After all transcriptions are done, generate descriptions in batch
  await generateBatchDescriptions(videos);
}

async function generateBatchDescriptions(videos: any[]) {
  log('Gerando descrições em lote...');

  // Collect all transcriptions
  const transcriptions = [];
  for (const video of videos) {
    const infoFilePath =
      localPath + video.name.replace('.mov', '.json').replace('.mp4', '.json');
    const infos = await hfs.json(infoFilePath);
    transcriptions.push({
      filename: video.name,
      transcription: infos.text,
    });
  }

  const openai = new OpenAI();

  // Generate descriptions for all videos at once
  const descriptions = await openai.chat.completions.create({
    // model: 'o3-mini',
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Você irá gerar descrições de vídeos. Vou as transcrições e você irá, para cada uma, gerar um título e uma descrição concisa de aproximadamente 30 palavras. 
        
        - Evite superlativos (melhor, pior, mais incrível, etc) 
        - Faça as descrições na primeira pessoa do plural. 
        - Evite começar com "neste vídeo...". 
        - A primeira letra da primeira palavra do título deve ser maiúscula. Todas as outras letras do título devem ser minúsculas.
        - O título deve ser curto, de 1 a 10 palavras.
        - Nas descrições, utilize termos de programação entre crases.
        - Evite descrições com inícios iguais "nós vamos...", etc.
        Outras informações sobre esse curso: ${courseDescription}. 
        
        - Retorne um JSON com o seguinte formato:
        {
          "videos": [
            {
              "filename": "nome do arquivo",
              "title": "título do vídeo",
              "description": "descrição do vídeo"
            }
          ]
        }`,
      },
      {
        role: 'user',
        content: JSON.stringify(transcriptions),
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(descriptions.choices[0].message.content || '{}');

  // Update all info files with the generated descriptions
  for (const video of result.videos) {
    const infoFilePath =
      localPath +
      video.filename.replace('.mov', '.json').replace('.mp4', '.json');
    const infos = await hfs.json(infoFilePath);
    infos.videoTitle = video.title;
    infos.description = video.description;
    await hfs.write(infoFilePath, JSON.stringify(infos));
  }
}

async function isVideoProcessed(
  audioPath: string,
  infoFilePath: string
): Promise<boolean> {
  try {
    // Check if both audio and JSON files exist
    const audioExists = fs.existsSync(audioPath);
    const jsonExists = fs.existsSync(infoFilePath);

    if (!audioExists || !jsonExists) {
      return false;
    }

    // Check if JSON file has the required fields
    const jsonContent = await hfs.json(infoFilePath);
    return jsonContent.description && jsonContent.videoTitle;
  } catch (error) {
    return false;
  }
}

async function exportAudioFromVideo(videoPath: string, audioPath: string) {
  log('Exportando áudio do vídeo...');
  // this function will export the audio from the videos

  function convertVideoToAudio(): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .audioBitrate(64) // lower bitrate to reduce file size
        .audioCodec('libmp3lame') // use the 'libmp3lame' codec for faster encoding
        .audioChannels(1)
        .audioFrequency(44100)
        .noVideo()
        .outputOptions('-preset', 'ultrafast') // use the 'ultrafast' preset for faster encoding
        .on('end', () => {
          console.log('Conversion ended');
          resolve();
        })
        .on('error', (err) => {
          console.log('Error: ' + err);
          reject(err);
        })
        .run();
    });
  }

  return convertVideoToAudio();
}

async function getAudioTranscription(audioPath: string, infoFilePath: string) {
  log('Transcrevendo áudio do vídeo...');

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const openai = new OpenAI();

  // const transcript = await openai.audio.transcriptions.create({
  //   model: 'whisper-1',
  //   file: fs.createReadStream(audioPath),
  // });

  const transcript = await groq.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    // model: 'distil-whisper-large-v3-en',
    model: 'whisper-large-v3-turbo',
    // response_format: "json", // Optional
    // language: "en", // Optional
    // temperature: 0.0, // Optional
  });

  // now we will save the transcript to a file
  await hfs.write(infoFilePath, JSON.stringify(transcript));

  console.log(transcript);
}

async function getVideoDescription(infoFilePath: string) {
  log('Gerando descrição do vídeo...');

  // this function will get the video description from chatGPT
  const openai = new OpenAI();

  const infos = await hfs.json(infoFilePath);
  const videoTranscript = infos.text;

  const description = await openai.chat.completions.create({
    model: 'o3-mini',
    // model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: `Você irá gerar descrições de vídeos. Vou mandar uma transcrição do vídeo e você irá, de forma concisa fazer um resumo de aproximadamente 30 palavras. Evite superlativos (melhor, pior, mais incrível, etc) e faça a descrição na primeira pessoa do plural para falar sobre o vídeo. Também evite começar com "neste vídeo...". Outras informações sobre esse curso: ${courseDescription}. ${
          cumulativeInfoString
            ? `Aqui está um contexto dos vídeos anteriores: ${cumulativeInfoString}`
            : ''
        } `,
      },
      {
        role: 'user',
        content: videoTranscript,
      },
    ],
  });

  infos.description = description.choices[0].message.content;

  const videoTitle = await openai.chat.completions.create({
    // model: 'gpt-4o-2024-08-06',
    model: 'o3-mini',
    messages: [
      {
        role: 'system',
        content:
          'Você é um bot que gera títulos para os vídeos. Vou mandar a descrição do vídeo e você me dá um título pequeno (1 a 5 palavras) para o vídeo. Evite também superlativos (melhor, pior, mais incrível, etc).',
      },
      {
        role: 'user',
        content: infos.description,
      },
    ],
  });

  // now we will save the transcript into our file
  // add the description to the json object
  infos.videoTitle = videoTitle.choices[0].message.content;
  // write the json object back to the file
  await hfs.write(infoFilePath, JSON.stringify(infos));

  console.log(description.choices[0].message.content);
}

function log(message: string) {
  console.log(chalk.blue(message));
}

async function listAllVideosFromFolder(folderPath: string) {
  const entries = [];

  for await (const entry of hfs.list(folderPath)) {
    if (entry.name.endsWith('.mov') || entry.name.endsWith('.mp4')) {
      entries.push(entry);
    }
  }

  return entries;
}
