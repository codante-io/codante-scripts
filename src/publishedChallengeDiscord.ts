import axios from 'axios';

// ========= CONFIG =========
const MP_SLUG = '';
// ===========================

const { name, imageUrl } = await getMPData(MP_SLUG);

const message = `Fala pessoal! Acabamos de lançar mais um Mini Projeto no Codante: 

**${name}!** 🚀

Acesse o link abaixo para acessar o Mini-Projeto e para participar! 👇
\u200B\n

`;

publishToDiscord(message, imageUrl);

async function publishToDiscord(text: string, imageUrl?: string) {
  const webhookURL = process.env.DISCORD_WEBHOOK ?? ''; // replace with your webhook URL

  const data = {
    content: text,
    username: 'Roberto Cestari',
    embeds: [
      {
        title: 'Calculadora de IMC com React',
        description: 'Mini Projeto',
        url: 'https://codante.io/mini-projetos/calculadora-de-imc-com-react',
        color: 0x0099ff,
        image: {
          url: imageUrl,
        },
      },
    ],
  };

  try {
    await axios.post(webhookURL, data);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

async function getMPData(slug: string) {
  const res = await axios.get(`https://api.codante.io/challenges/${slug}`);
  const data = res.data.data;
  const name = data.name;
  const imageUrl = data.image_url;

  return { name, imageUrl };
}
