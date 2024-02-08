import { handle } from "./support-files/createRepo";

const REPO_NAME = 'autenticacao-com-nextauth-e-github';
const DESCRIPTION = 'O poder - e a facilidade - de um sistema de login com NextAuth.js utilizando o Github para autenticação em uma aplicação Next.js';
const URL_DO_MINI_PROJETO = 'https://codante.io/mini-projetos/autenticacao-com-nextauth-e-github';

// Principal
await handle(`mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);

// Protótipo
await handle(`prototipo-mp-${REPO_NAME}`, DESCRIPTION, URL_DO_MINI_PROJETO);