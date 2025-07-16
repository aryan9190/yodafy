#  Yodafy Bot

A cross-platform bot that translates regular speech into Yoda-speak. Works on **Slack**, **Discord**, and **Telegram**.

---

##  Features

- Translate any input into Yoda’s voice and sentence structure
- Supports:
  - 🟦 Slack `/yodafy` command
  - 🟣 Discord `/yodafy` message trigger
  - 🔵 Telegram `/yodafy` bot command

---

##  Setup

1. **Clone the repository**
   ```
   git clone https://github.com/aryan9190/yodafy.git
   cd yodafy
   ```
   
2. **Install dependencies**
    ```
    npm install
    ```


3. **Create an .env file**
    ### Example for Slack
   ```
    SLACK_BOT_TOKEN=xoxb-...
    SLACK_SIGNING_SECRET=...
    SLACK_APP_TOKEN=xapp-...
   ```
    
    ### Example for Discord
   ```
    DISCORD_BOT_TOKEN=...
   ```
    
    ### Example for Telegram
   ```
    TELEGRAM_BOT_TOKEN=...
   ```
    
    # Required for all
   ```
    OPENAI_API_KEY=sk-...
    ```
4. **Start the bot**
```
node slack.js     # or
node discord.js   # or
node telegram.js
```
## Slash Commands

**Slack**

- Register a /yodafy slash command on https://api.slack.com/apps
- Enable SOCKET MODE
- Scope requirements: commands, app_mentions:read, chat:write

**Discord**
- Simply send messages like:
- /yodafy Hello there

**Telegram**
- Start the bot and type:
- /yodafy This is my message
