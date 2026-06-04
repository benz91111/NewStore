const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config/settings');
const { loadCommands, deployCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

client.commands = new Collection();

async function init() {
    try {
        // Carregar comandos
        const commands = await loadCommands(client);

        // Registrar comandos no Discord
        await deployCommands(commands);

        // Carregar eventos
        await loadEvents(client);

        // Login
        await client.login(config.token);

    } catch (error) {
        console.error('Erro ao iniciar o bot:', error);
        process.exit(1);
    }
}

init();

// Tratamento de erros
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
