import * as fs from 'fs';
import axios from 'axios';
import { parse, type Workshop } from './lessonParser';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { join } from 'path';

/// ALTERE AQUI
const workshopPath =
  '/Users/robertotcestari/Desktop/iniciando-no-desenvolvimento-web/2.Git-Github';
const workshopId = 88;
/// ALTERE AQUI

export async function generateLessonsSQLfromWorkshop() {
  console.log(chalk.blue('WorkshopPath: ' + workshopPath));
  console.log(chalk.blue('WorkshopID: ' + workshopId));

  const answer = await confirm({
    message:
      'Você está prestes a iniciar o script de exportação de descrições de vídeos. As informações estão corretas?',
  });
  if (!answer) {
    console.log('Ok, script cancelado.');
    process.exit();
  }

  const workshop = await parse(workshopPath);
  generateSql(workshop, workshopId); // start!
}

async function generateSql(workshop: Workshop, workshopID: number) {
  const filePath = 'data/workshop-lessons-generator/output.sql';
  const stream = fs.createWriteStream(filePath, { flags: 'w' });

  for (const section of workshop) {
    for (const lesson of section.lessons) {
      const slugRes = await axios.post(
        'https://api.codante.io/api/get-unused-slug',
        {
          lesson_name: lesson.name,
        }
      );

      const slug = slugRes.data.slug;

      const sql = `INSERT INTO lessons (workshop_id, name, content, available_to, slug, position, created_at, updated_at, section) VALUES (${workshopID},  '${lesson.name}', '${lesson.content}', 'pro', '${slug}', ${lesson.order}, NOW(), NOW(), '${section.name}');`;
      stream.write(sql + '\n');
    }
  }
  console.log('Maravilha! SQL gerado com sucesso em: ' + join(filePath));
  stream.end();
}
