require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { OpenAI } = require('openai');
const NodeCache = require('node-cache');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
const yodaCache = new NodeCache({ stdTTL: 86400, maxKeys: 100 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getYodaText(input){
    const key = input.trim().toLowerCase();
    const cached = yodaCache.get(key);
    if (cached) return cached;

    try{
        const res = await axios.get('https://api.funtranslations.com/translate/yoda.json', {
            params: { text: input },
        });
        const result = res.data.contents.translated;
        yodaCache.set(key, result);
        return result;
    }
    catch (err) {
        try {
            const gptRes = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "You are Yoda from Star Wars. Speak only in Yoda's voice and sentence structure." },
                    { role: 'user', content: input },
                ],
                temperature: 0.8,
            });
            const result = gptRes.choices[0].message.content.trim();
            yodaCache.set(key, result);
            return result;
        }
        catch (gptErr) {
            return 'Working, the Force is not. Broken, all things are.';
        }
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('/yodafy')) return;

    const input = message.content.slice(8).trim();
    if (!input) return message.reply('Type something to Yodafy, you must.');
    const yodaText = await getYodaText(input);
    await message.reply(`Yoda says...\n ${yodaText}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);