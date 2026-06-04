const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/settings');

async function loadCommands(client) {
    client.commands = new Map();
    const commands = [];

    const foldersPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`✅ Comando carregado: /${command.data.name}`);
            } else {
                console.log(`⚠️ Comando em ${filePath} está faltando 'data' ou 'execute'.`);
            }
        }
    }

    return commands;
}

async function deployCommands(commands) {
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log(`🔄 Registrando ${commands.length} comandos...`);

        // Registro em guild (rápido para desenvolvimento)
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );

        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
}

module.exports = { loadCommands, deployCommands };