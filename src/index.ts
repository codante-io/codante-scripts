// inquirer to select which script to run
import inquirer from "inquirer";

import { select } from "@inquirer/prompts";
import { addPresetToVideosInFolder } from "./vimeo-scripts/addPresetToVideos";
import { createChatGPTDescriptions } from "./video-descriptions";
import { getSQLfromVideos } from "./vimeo-scripts/getAllVideosFromFolder";
import { createGithubRepos } from "./github-scripts/createGithubRepos";
import { generateVideoCover } from "./generate-video-cover";
import { generateGeminiDescription } from "./gemini-video";
import { getPagarmeTransactions } from "./get-pagarme-transactions";
import { createNewVimeoFolder } from "./vimeo-scripts/createVimeoFolder";
import { generateLessonsSQLfromWorkshop } from "./workshop-lessons-generator/generateLessonsSQLFromWorkshop";

const questions = {
  message: "O que você quer fazer?",
  choices: [
    { value: "Add Preset do Codante para uma Pasta do Vimeo" },
    { value: "Criar uma nova pasta no Vimeo" },
    {
      value:
        "Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados",
    },
    { value: "Criar repositórios de Mini Projetos" },
    { value: "Gerar descrições de vídeo com ChatGPT" },
    { value: "Gerar vídeo da capa do workshop" },
    { value: "Gerar descrição de upload de vídeo com Gemini" },
    { value: "[Financeiro] Pegar transações do Pagarme" },
  ],
};
select(questions).then((answer) => {
  switch (answer) {
    case "Add Preset do Codante para uma Pasta do Vimeo":
      addPresetToVideosInFolder();
      break;
    case "Criar uma nova pasta no Vimeo":
      createNewVimeoFolder();
      break;
    case "Gerar SQL de todos os vídeos de uma pasta do Vimeo para adicionar ao banco de dados":
      getSQLfromVideos();
      break;
    case "Criar repositórios de Mini Projetos":
      createGithubRepos();
      break;
    case "Gerar descrições de vídeo com ChatGPT":
      createChatGPTDescriptions();
      break;
    case "Gerar vídeo da capa do workshop":
      generateVideoCover();
      break;
    case "Gerar descrição de upload de vídeo com Gemini":
      generateGeminiDescription();
      break;
    case "Gerar SQL de aulas de workshop de arquivos em markdown":
      generateLessonsSQLfromWorkshop();
      break;
    case "[Financeiro] Pegar transações do Pagarme":
      getPagarmeTransactions();
      break;
    default:
      console.log("Invalid action");
      break;
  }
});
