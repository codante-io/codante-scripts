import * as hfs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';

const prompt = 'faça um blogpost em markdown do que esse vídeo tem de conteúdo';

export async function generateGeminiDescription() {
  const folderPath = 'data/gemini-video/';
  const videoFilename = await hfs.readdir(folderPath);

  // get first video
  const video = videoFilename[0];
  const videoPath = folderPath + video;
  const mimeType = 'video/mp4';

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const fileManager = new GoogleAIFileManager(
    process.env.GEMINI_API_KEY as string
  );

  const uploadResponse = await fileManager.uploadFile(videoPath, {
    mimeType: mimeType,
    displayName: 'video',
  });

  const name = uploadResponse.file.name;

  let file = await fileManager.getFile(name);
  process.stdout.write('Processando...');
  while (file.state === FileState.PROCESSING) {
    process.stdout.write('.');
    // Sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    // Fetch the file from the API again
    file = await fileManager.getFile(name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error('Video processing failed.');
  }

  // When file.state is ACTIVE, the file is ready to be used for inference.
  console.log(`Arquivo ${file.displayName} está pronto para uso em: ${file.uri}`);

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    { text: prompt },
  ]);

  console.log(result.response.text());
}
