import axios from 'axios';
import fs from 'fs';
import csv from 'csv-parser';
import slugify from 'slugify';
import inquirer from 'inquirer';

export async function getSQLfromVideos() {
  const questions = [
    {
      type: 'input',
      name: 'folderId',
      message: 'Qual o ID da pasta do Vimeo?',
    },
    {
      type: 'input',
      name: 'workshopId',
      message: 'Qual o ID do Workshop?',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: `Você está prestes a iniciar o script de exportação de descrições de vídeos. Você já colocou o arquivo data.csv com as infos corretas dentro da pasta?`,
    },
  ];

  const answers = await inquirer.prompt(questions);
  const folderId = answers.folderId;
  const workshopId = answers.workshopId;
  const VIMEO_TOKEN = process.env.VIMEO_TOKEN;

  if (!VIMEO_TOKEN) throw new Error('VIMEO_TOKEN not found in .env file');
  if (!folderId) throw new Error('VIMEO_FOLDER_ID not found ');
  if (!workshopId) throw new Error('WORKSHOP_ID not found');
  if (!answers.confirm) {
    console.log('Ok, script cancelado.');
    process.exit();
  }

  const results: any[] = [];

  readCSV(() => getAllVideosFromFolder(folderId));

  function readCSV(callback: any) {
    fs.createReadStream('data/data.csv')
      // @ts-ignore-next-line
      .pipe(csv())
      // @ts-ignore-next-line
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        callback();
      });
  }

  function getAllVideosFromFolder(folderId: string | number) {
    axios
      .get(
        `https://api.vimeo.com/me/projects/${folderId}/videos?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${VIMEO_TOKEN}`,
          },
        }
      )
      .then((response) => {
        response.data.data.forEach((video: any) => {
          if (!isNaN(video.name)) {
            let index = Number(video.name) - 1;
            results[index]['video_url'] = video.link.replace(
              'https://vimeo.com/',
              'https://player.vimeo.com/video/'
            );
            results[index]['duration_in_seconds'] = video.duration;
            results[index]['slug'] = slugify(results[index].name, {
              lower: true,
            });
          }
        });

        generateSQL();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function generateSQL() {
    results.map((result) => {
      const sql =
        `INSERT INTO "lessons" ("workshop_id", "name", "description", "video_url", "duration_in_seconds", "slug", "created_at", "updated_at") values (${workshopId}, '${result.name}', '${result.description}', '${result.video_url}', ${result.duration_in_seconds}, '${result.slug}', NOW(), NOW() );`.replaceAll(
          '"',
          '`'
        );
      console.log(sql);
    });
  }
}
