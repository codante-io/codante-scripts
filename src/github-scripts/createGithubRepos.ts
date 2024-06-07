import { handle } from "./lib/createRepo";

const REPO_NAME = 'server-actions-no-next-js'; // sem o "mp-"
const DESCRIPTION = 'Vamos adicionar um formulário de cadastro usando server actions no Next.js! 🚀';
const URL_DO_MINI_PROJETO = 'https://codante.io/mini-projetos/server-actions-no-next-js';

// Principal
await handle(`mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);

// Protótipo
await handle(`prototipo-mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);