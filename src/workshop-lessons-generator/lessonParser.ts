import { readdir } from 'fs/promises';
import { statSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';

type Section = {
  name: string;
  order: number;
  originalPath: string;
  lessons: Lesson[];
};

type Lesson = {
  name: string;
  order: number;
  originalPath: string;
  content: string;
};

export type Workshop = Section[];

export async function parse(workshopPath: string): Promise<Section[]> {
  // pega as seções do workshop
  let sections = await getOrderedSectionsFromDirectories(workshopPath);
  // adiciona as aulas na seção
  sections = await Promise.all(sections.map(addLessonsToSection));
  // adiciona o markdown nas aulas
  sections = await Promise.all(
    sections.map(async (section) => {
      const lessons = await Promise.all(
        (section.lessons ?? []).map(addMarkdownToLesson)
      );
      return { ...section, lessons };
    })
  );

  return sections;
}

function transformFileToLesson(file: string, sectionPath: string): Lesson {
  const splitItems = file.split(/\[(\d+)\]\s*/).filter(Boolean);
  return {
    name: splitItems[1].replace('.md', '').trim(),
    order: parseInt(splitItems[0]),
    originalPath: join(sectionPath, file),
    content: '',
  };
}

function transformFileToSection(workshopPath: string, file: string): Section {
  const splitItems = file.split(/\[(\d+)\]\s*/).filter(Boolean);
  return {
    name: splitItems[1].replace('.md', '').trim(),
    order: parseInt(splitItems[0]),
    originalPath: join(workshopPath, file),
    lessons: [],
  };
}

async function getOrderedSectionsFromDirectories(rootPath: string) {
  const directories = await getDirectories(rootPath);
  const sections = directories.map((directory) => {
    return transformFileToSection(rootPath, directory);
  });

  return sections.sort((a, b) => a.order - b.order);
}

// pega as seções do workshop
async function getDirectories(path: string) {
  try {
    const files = await readdir(path);
    const directories = files.filter((file) =>
      statSync(join(path, file)).isDirectory()
    );
    return directories;
  } catch (err) {
    console.error('Error reading the directory', err);
    throw err;
  }
}

async function getLessonsFromSection(section: Section) {
  const lessons = await readdir(section.originalPath);
  const mdFiles = lessons.filter((lesson) =>
    lesson.toLowerCase().endsWith('.md')
  );

  const sanitizedLessons = mdFiles.map((lesson) => {
    return transformFileToLesson(lesson, section.originalPath);
  });

  const orderedLessons = sanitizedLessons.sort((a, b) => a.order - b.order);
  return orderedLessons;
}

async function addLessonsToSection(section: Section): Promise<Section> {
  const lessons = await getLessonsFromSection(section);
  return { ...section, lessons };
}

async function addMarkdownToLesson(lesson: Lesson) {
  const markdown = await readFile(lesson.originalPath, 'utf-8');
  return { ...lesson, content: markdown };
}
