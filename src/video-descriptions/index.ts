import { hfs } from '@humanfs/node';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import OpenAI from 'openai';
import chalk from 'chalk';
import { json2csv } from 'json-2-csv';

// Iniciar
const localPath = 'data/video-descriptions/'; // Pasta onde irá ficar os arquivos de áudio e transcrição.
const videosPath =
  '/Users/robertotcestari/Movies/Codante/Workshops/Typescript no React/editados/'; // pasta onde estão os vídeos. Recomendado usar nomes como 01.mp4, 02.mp4, 03.mp4, etc.∂

handle(); // start!
// /////////////////////////////

async function handle() {
  log('Iniciando script de exportação de descrições de vídeos...');
  const videos = await listAllVideosFromFolder(videosPath);

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
  videos.sort((a, b) => {
    const aName = a.filename.split('.')[0];
    const bName = b.filename.split('.')[0];
    return parseInt(aName) - parseInt(bName);
  });

  console.log(videos);

  await hfs.write(
    'data/video-descriptions/videos.json',
    JSON.stringify(videos)
  );

  // save a videos.csv file too
  const csv = await json2csv(videos);
  await hfs.write('data/video-descriptions/videos.csv', csv);
}

async function generateAllFiles(videos: any[]) {
  for (const video of videos) {
    const videoPath = videosPath + video.name;
    const audioPath =
      localPath + video.name.replace('.mov', '.mp3').replace('.mp4', '.mp3');
    const infoFilePath =
      localPath + video.name.replace('.mov', '.json').replace('.mp4', '.json');

    // first, we will export just the audio from video files
    await exportAudioFromVideo(videoPath, audioPath);
    // // then, we will upload the audio to openai to generate the video description
    await getAudioTranscription(audioPath, infoFilePath);
    // // finally, we will upload the video description to chatGPT to ask for a summary.
    await getVideoDescription(infoFilePath);
  }
}

async function exportAudioFromVideo(videoPath: string, audioPath: string) {
  log('Exportando áudio do vídeo...');
  // this function will export the audio from the videos

  function convertVideoToAudio(): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setDuration(240)
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

  const openai = new OpenAI();

  const transcript = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(audioPath),
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
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'Você é um bot que gera descrições de vídeos. Vou mandar uma parte do vídeo e você me dá um resumo de 30 palavras. Evite superlativos (melhor, pior, mais incrível, etc) e faça a descrição na primeira pessoa do plural para falar sobre o vídeo',
      },
      {
        role: 'user',
        content: videoTranscript,
      },
    ],
  });

  infos.description = description.choices[0].message.content;

  const videoTitle = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
