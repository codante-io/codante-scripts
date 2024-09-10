import * as fs from 'fs';
import axios from 'axios';
import { parse, type Workshop } from './lessonParser';

/// ALTERE AQUI
const workshopPath =
  '/Users/robertotcestari/Desktop/iniciando-no-desenvolvimento-web/2.Git-Github';
const workshopId = 88;
/// ALTERE AQUI

const workshop = await parse(workshopPath);
generateSql(workshop, workshopId);

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
  stream.end();
}
