import axios from "axios";
import inquirer from "inquirer";

export async function createNewVimeoFolder() {
  const questions = [
    {
      type: "input",
      name: "folderName",
      message: "What is the name of the new Vimeo folder?",
    },
    {
      type: "input",
      name: "parentFolderId",
      message:
        "What is the ID of the parent Vimeo folder? (Leave empty for root)",
    },
  ];

  const answers = await inquirer.prompt(questions);
  const folderName = answers.folderName;
  const parentFolderId = answers.parentFolderId;

  if (!process.env.VIMEO_TOKEN)
    throw new Error("VIMEO_TOKEN not found in .env file");

  let parentUri = null;
  if (parentFolderId) {
    try {
      const response = await axios.get(
        `https://api.vimeo.com/me/folders/${parentFolderId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VIMEO_TOKEN}`,
          },
        }
      );
      parentUri = response.data.uri;
    } catch (error) {
      console.error("Error fetching parent folder:", error);
      return;
    }
  }

  try {
    const response = await axios.post(
      `https://api.vimeo.com/me/projects`,
      {
        name: folderName,
        parent_folder_uri: parentUri,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_TOKEN}`,
        },
      }
    );
    console.log("Folder created successfully:", response.data);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
}