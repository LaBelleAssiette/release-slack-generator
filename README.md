# Slack release message CLI

![Preview](https://i.imgur.com/1BK47te.png)

## Configuration

- Install the dependencies
- Add .env file:
```
SLACK_TOKEN=
SLACK_CHANNEL_ID=
```
The Slack app linked to the token should have 'chat:write:user' in its scope and
you must be logged in to Slack before using the script.
(Why? Because we write the code so we deserve to announce the release!)

It’s the Gregbot app that does the job to post message as you: go to https://api.slack.com/apps and select Gregbot.
In ‘Oauth & permissions’ :
Scroll down to ‘Scopes’, ‘User token scopes’, click “Add an OAuth Scope”, and add “chat:write”.
Scroll up and click “Reinstall to workspace”.
Copy the User OAuth Token (starting by 'xoxp');

## Usage

```sh
node index.js
```

Just reply to the questions and the message will be posted to Slack and a reply
will be added to start the thread!

## TO-DO

- Integrate imgur API to ask user to automatically upload an image from imgur.
