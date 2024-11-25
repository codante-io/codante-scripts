// Esse script transfere todas as tasks do github project da sprint anterior para a sprint atual
// ATENÇÃO - VC PRECISA ESTAR NA DATA CORRETA (A ULTIMA SPRINT FECHOU, A NOVA É A PRÓXIMA.)

const LAST_SPRINT_NAME = 'Sprint 85';
const NEXT_INTERACTION = 'Sprint 86';
// const NEXT_INTERACTION_ID = '50864559';

const TOKEN = process.env.GITHUB_TOKEN_PROJECTS;

if (!TOKEN) {
  throw new Error('Missing GITHUB_TOKEN_PROJECTS');
}

const PROJECT_ID = 'PVT_kwDOB6J5TM4AN191';
const FIELD_ID = 'PVTIF_lADOB6J5TM4AN191zgI6BRw';

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

interface IterationQueryResponse {
  data: {
    node: {
      id: string;
      configuration: {
        iterations: Array<{
          id: string;
          title: string;
        }>;
      };
    };
  };
}

async function fetchProjectItems(): Promise<ProjectItem[]> {
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
        Authorization: `Bearer ${TOKEN}`,
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
    if (
      item?.sprint?.title === LAST_SPRINT_NAME &&
      item?.status?.name !== 'Done'
    ) {
      return item;
    }
  });
}

async function fetchIterationId(sprintTitle: string): Promise<string> {
  const query = `
    query {
      node(id: "${FIELD_ID}") {
        id
        __typename
        ... on ProjectV2IterationField {
          configuration {		
            iterations {
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
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const result = (await response.json()) as IterationQueryResponse;
  const iteration = result.data.node.configuration.iterations.find(
    (it) => it.title === sprintTitle
  );

  if (!iteration) {
    throw new Error(`Sprint "${sprintTitle}" not found`);
  }

  return iteration.id;
}

async function moveTaskToSprint(itemId: string) {
  console.log('pegando id da próxima sprint...');
  const nextSprintId = await fetchIterationId(NEXT_INTERACTION);
  console.log(nextSprintId);

  console.log(itemId);
  const mutation = `
    mutation {
      updateProjectV2ItemFieldValue(input: {
        projectId: "${PROJECT_ID}"
        itemId: "${itemId}"
        fieldId: "${FIELD_ID}"
        value: {
          iterationId: "${await fetchIterationId(NEXT_INTERACTION)}"
        }
      }) {
        clientMutationId
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: mutation }),
  });

  return await response.json();
}

const items = await fetchProjectItems();
console.log(items);
for (const item of items) {
  console.log(
    `Moving task "${item.title?.text}" to sprint: ${NEXT_INTERACTION}`
  );
  await moveTaskToSprint(item.id);
}

console.log('All tasks moved successfully!');
