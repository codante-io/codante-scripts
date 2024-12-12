// Esse script transfere todas as tasks do github project da sprint anterior para a sprint atual
// ATENÇÃO - VC PRECISA ESTAR NA DATA CORRETA (A ULTIMA SPRINT FECHOU, A NOVA É A PRÓXIMA.)

import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';

// ==== Constants ====
const PROJECT_ID = 'PVT_kwDOB6J5TM4AN191';
const FIELD_ID = 'PVTIF_lADOB6J5TM4AN191zgI6BRw';
// ===================

// ==== HANDLE ====
handleTransferTasks();
// ================

export async function handleTransferTasks() {
  console.log(
    chalk.redBright(`===== Iniciando transferência de tasks... =====`)
  );
  console.log(chalk.blue(`Buscando a última e a próxima sprint...`));
  console.log(chalk.blue(`Buscando a próxima sprint...`));

  const { lastSprintName, nextSprintName, nextSprintId } =
    await fetchLastAndNextSprint();

  const answer = await confirm({
    message: `Você está prestes a transferir tasks de uma sprint para outra. As informações estão corretas? (Sprint Anterior: ${lastSprintName}, Próxima Sprint: ${nextSprintName} (${nextSprintId}))`,
  });
  if (!answer) {
    console.log('Ok, script cancelado.');
    process.exit();
  }

  const items = await fetchProjectItems(lastSprintName);
  console.log(items);
  for (const item of items) {
    console.log(
      `Moving task "${item.title?.text}" to sprint: ${nextSprintName}`
    );
    await moveTaskToSprint(item.id, nextSprintId);
  }

  console.log('All tasks moved successfully!');
}

interface ProjectItem {
  id: string;
  title: { text: string } | null;
  sprint: { title: string } | null;
  status: { name: string } | null;
}

interface QueryResponse {
  data: {
    organization: {
      projectV2: {
        items: {
          nodes: ProjectItem[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    };
  };
}

interface SprintIterationsResponse {
  data: {
    node: {
      id: string;
      configuration: {
        iterations: Array<{
          id: string;
          title: string;
        }>;
        completedIterations: Array<{
          id: string;
          title: string;
        }>;
      };
    };
  };
}

async function fetchLastAndNextSprint(): Promise<{
  lastSprintName: string;
  nextSprintName: string;
  nextSprintId: string;
}> {
  const query = `
    query {
      node(id: "PVTIF_lADOB6J5TM4AN191zgI6BRw") {
        id
        __typename
        ... on ProjectV2IterationField {
          configuration {		
            iterations{
					    id
					    title
            }
            completedIterations {
              id
              title
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN_PROJECTS}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const result = (await response.json()) as SprintIterationsResponse;
  const completedIterations =
    result.data.node.configuration.completedIterations;
  const nextIteration = result.data.node.configuration.iterations[0];

  // Sort iterations by sprint number and get the last one
  const sortedIterations = completedIterations
    .filter((it) => it.title.startsWith('Sprint '))
    .sort((a, b) => {
      const numA = parseInt(a.title.split(' ')[1]);
      const numB = parseInt(b.title.split(' ')[1]);
      return numA - numB;
    });

  const lastSprint = sortedIterations[sortedIterations.length - 1];

  if (!lastSprint) {
    throw new Error('No sprints found');
  }

  return {
    lastSprintName: lastSprint.title,
    nextSprintName: nextIteration.title,
    nextSprintId: nextIteration.id,
  };
}

async function fetchProjectItems(sprintName: string): Promise<ProjectItem[]> {
  let hasNextPage = true;
  let endCursor: string | null = null;
  let allItems: ProjectItem[] = [];

  while (hasNextPage) {
    const query = `
      query {
        organization(login: "codante-io") {
          projectV2(number: 1) {
            items(first: 100${endCursor ? `, after: "${endCursor}"` : ''}) {
              nodes {
                id
                title: fieldValueByName(name: "Title") {
                  ... on ProjectV2ItemFieldTextValue {
                    text
                  }
                }
                sprint: fieldValueByName(name: "Sprint") {
                  ... on ProjectV2ItemFieldIterationValue {
                    title
                  }
                }
                status: fieldValueByName(name: "Status") {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN_PROJECTS}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const result = (await response.json()) as QueryResponse;
    const items = result.data.organization.projectV2.items;

    allItems = [...allItems, ...items.nodes];
    hasNextPage = items.pageInfo.hasNextPage;
    endCursor = items.pageInfo.endCursor;
  }

  return allItems.filter((item) => {
    if (item?.sprint?.title === sprintName && item?.status?.name !== 'Done') {
      return item;
    }
  });
}

async function moveTaskToSprint(itemId: string, sprintId: string) {
  console.log('pegando id da próxima sprint...');

  console.log(itemId);
  const mutation = `
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: "${PROJECT_ID}"
        itemId: "${itemId}"
        fieldId: "${FIELD_ID}"
        value: {
          iterationId: "${sprintId}"
        }
      }) {
        clientMutationId
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN_PROJECTS}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: mutation }),
  });

  return await response.json();
}
