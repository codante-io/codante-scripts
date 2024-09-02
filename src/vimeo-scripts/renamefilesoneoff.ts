import axios from 'axios';

async function renameFilesOneOff() {
  const VIMEO_FOLDER_ID = '22002683';
  const VIMEO_TOKEN = process.env.VIMEO_TOKEN;

  // get all videos from vimeo folder:
  // https://api.vimeo.com/me/projects/22002683/videos?per_page=100

  const res = await axios.get(
    `https://api.vimeo.com/me/projects/${VIMEO_FOLDER_ID}/videos?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${VIMEO_TOKEN}`,
      },
    }
  );

  const videos = res.data.data;

  for (const video of videos) {
    console.log(video.name);
    const newName = video.name.split('.')[0];

    // rename video
    await axios.patch(
      `https://api.vimeo.com/videos/${video.uri.split('/')[2]}`,
      {
        name: newName,
      },
      {
        headers: {
          Authorization: `Bearer ${VIMEO_TOKEN}`,
        },
      }
    );
  }
}

async function domainOneoff() {
  const VIMEO_FOLDER_ID = '22002683';
  const VIMEO_TOKEN = process.env.VIMEO_TOKEN;

  // get all videos from vimeo folder:
  // https://api.vimeo.com/me/projects/22002683/videos?per_page=100

  const res = await axios.get(
    `https://api.vimeo.com/me/projects/${VIMEO_FOLDER_ID}/videos?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${VIMEO_TOKEN}`,
      },
    }
  );

  const videos = res.data.data;

  for (const video of videos) {
    console.log(video.name);
    const videoId = video.uri.split('/')[2];

    // rename video
    console.log('renomeando video', video.name, '...');
    try {
      const res = await axios.put(
        `https://api.vimeo.com/videos/${videoId}/privacy/domains/codante.io`,
        null,
        {
          headers: {
            Authorization: `Bearer ${VIMEO_TOKEN}`,
          },
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
}

await domainOneoff();
