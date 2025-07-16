require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { OpenAI } = require('openai');
const NodeCache = require('node-cache');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const yodaCache = new NodeCache({ stdTTL: 86400, maxKeys: 100 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getYodaText(input) {
    const key = input.trim().toLowerCase();
    const cached = yodaCache.get(key);
    if (cached) return cached;

    try {
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

bot.onText(/\/yodafy (.+)/, async (msg, match) => {
    const input = match[1];
    const chatId = msg.chat.id;
    const result = await getYodaText(input);
    await bot.sendMessage(chatId, `*Yoda says...*\n${result}`, { parse_mode: 'Markdown' });
});