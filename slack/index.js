require('dotenv').config();
const { App } = require('@slack/bolt');
const axios = require('axios');
const { OpenAI } = require('openai');
const NodeCache = require('node-cache');

const yodaCache = new NodeCache({ stdTTL: 86400, maxKeys: 100 });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
});

async function getYodaText(input) {
    const key = input.trim().toLowerCase();
    const cached = yodaCache.get(key);
    if (cached) return cached;
    try {
        const res = await axios.get("https://api.funtranslations.com/translate/yoda.json", {
            params: { text: input }
        });
        const result = res.data.contents.translated;
        yodaCache.set(key, result);
        return result;
    }
    catch (err) {
        console.warn("Falling back to OpenAI for Yoda response");

        try {
            const gptRes = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are Yoda from Star Wars. Speak only in Yoda's voice and sentence structure."
                    },
                    {
                        role: "user",
                        content: input
                    }
                ],
                temperature: 0.8,
            });

            const result = gptRes.choices[0].message.content.trim();
            yodaCache.set(key, result);
            return result;
        }
        catch (gptErr) {
            console.error("OpenAI fallback failed:", gptErr);
            return "Working, the Force is not. Try again, later, you should.";
        }
    }
}

app.command('/yodafy', async ({ command, ack, respond }) => {
    await ack();

    const input = command.text;
    if (!input) {
        return respond("Hmm. Type something to Yodafy, you must.");
    }
    const result = await getYodaText(input);
    await respond(`:yoda: *Yoda says...*\n> ${result}`);
});

(async () => {
    await app.start();
    console.log("⚡ Yodafy bot is running");
})();