const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🤖 Bot logado como ${client.user.tag}`);

        client.user.setActivity({
            name: '🛒 Loja Digital | /comprar',
            type: ActivityType.Playing
        });
    }
};