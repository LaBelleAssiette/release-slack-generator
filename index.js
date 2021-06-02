require('dotenv').config();

const inquirer = require('inquirer');
const pluralize = require('pluralize');
const { WebClient } = require('@slack/web-api');

inquirer.registerPrompt('recursive', require('inquirer-recursive'));

const getAnswers = async () => (
  inquirer.prompt([
    {
      type: 'input',
      message: 'What is the release name?',
      name: 'releaseName',
    },
    {
      type: 'input',
      message: 'What is the animal name? (Wikipedia link)',
      name: 'animalName',
      default: (answers) => {
        const { releaseName } = answers;
        // Truncate emojis
        const strToArr = releaseName.split(' ')
          .filter((str) => !str.includes(':'));
        return strToArr[strToArr.length - 1];
      },
    },
    {
      type: 'confirm',
      message: 'Notify channel? (@channel)',
      name: 'notifyChannel',
    },
    {
      type: 'input',
      message: 'Image link?',
      name: 'imgLink',
      when: (answers) => answers.notifyChannel,
    },
    {
      type: 'recursive',
      message: 'Add a feature?',
      name: 'features',
      prompts: [
        {
          type: 'input',
          name: 'desc',
          message: 'What is the feature description?',
          validate: (value) => {
            if (value !== '') {
              return true;
            }
            return 'A description is required';
          },
        },
      ],
    },
  ])
);

const getSlackMessageObj = (answers) => {
  const featuresDesc = answers.features
    .map((feature) => `• ${feature.desc}`)
    .join('\n');

  const capitalizedAnimal = answers.animalName.charAt(0).toUpperCase() +
    answers.animalName.substring(1);

  let accessory;

  let footer = '';
  const wikiLink =
    '<' +
    `https://en.wikipedia.org/wiki/${answers.animalName}` +
    `|${pluralize(capitalizedAnimal, 2)} on Wikipedia` +
    '>';

  if (answers.notifyChannel) {
    footer += 'CC <!channel>. ';
    accessory = {
      type: 'image',
      image_url: answers.imgLink,
      alt_text: `A ${capitalizedAnimal}`,
    };
  }

  footer += `Learn more about ${wikiLink}.`;

  return {
    channel: process.env.SLACK_CHANNEL_ID,
    unfurl_links: false,
    as_user: true,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `New release: *${answers.releaseName}*\n\n${featuresDesc}`,
        },
        accessory,
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: footer,
          },
        ],
      },
    ],
  };
};

const main = async () => {
  const token = process.env.SLACK_TOKEN;
  const slackClient = new WebClient(token);

  const answers = await getAnswers();
  if (answers.features.length === 0) {
    throw new Error('At least one feature description should be given');
  }
  const post = await slackClient.chat.postMessage(getSlackMessageObj(answers));
  await slackClient.chat.postMessage({
    thread_ts: post.ts,
    text: '_As usual, please keep the comments in a thread!_',
    channel: process.env.SLACK_CHANNEL_ID,
    as_user: true,
  });
};

main()
  .then(() => console.log('Done.'))
  .catch((err) => console.log(err));
