import { handle } from "./src/createRepo";

const REPO_NAME = 'mp-teste-imc';
const DESCRIPTION = '';
const URL_DO_MINI_PROJETO = '';

// Principal
await handle(REPO_NAME, DESCRIPTION, URL_DO_MINI_PROJETO);

// Protótipo
await handle(`prototipo-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);