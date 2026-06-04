const { Events, InteractionType } = require('discord.js');
const buttonHandler = require('../utils/buttonHandler');
const selectHandler = require('../utils/selectHandler');
const modalHandler = require('../utils/modalHandler');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try { await command.execute(interaction); }
            catch (error) {
                console.error(error);
                const reply = { content: '❌ Erro ao executar comando.', ephemeral: true };
                if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
                else await interaction.reply(reply);
            }
        }
        if (interaction.isButton()) {
            try { await buttonHandler.handleButton(interaction); }
            catch (error) { console.error('Erro botão:', error); }
        }
        if (interaction.isStringSelectMenu()) {
            try { await selectHandler.handleSelect(interaction); }
            catch (error) { console.error('Erro select:', error); }
        }
        if (interaction.type === InteractionType.ModalSubmit) {
            try { await modalHandler.handleModal(interaction); }
            catch (error) { console.error('Erro modal:', error); }
        }
    }
};