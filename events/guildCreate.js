const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`🏰 Bot entrou no servidor: ${guild.name} (${guild.id})`);
        console.log('⚠️ Crie os cargos e canais manualmente e atualize o config.json');
    }
};