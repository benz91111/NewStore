const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isStaff } = require('../../utils/helpers');
const { errorEmbed, infoEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Mostra instruções de configuração (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas membros da Staff podem usar este comando.')],
                ephemeral: true
            });
        }

        const instructions = `
**📋 Configuração Manual**

Crie os seguintes itens no Discord e coloque os IDs no config.json:

**Cargos:**
1. Crie um cargo chamado "Staff" (ou qualquer nome)
2. Crie um cargo chamado "Cliente" (ou qualquer nome)
3. Copie os IDs dos cargos

**Categorias:**
1. Crie uma categoria chamada "Tickets"
2. Crie uma categoria chamada "Logs"
3. Copie os IDs das categorias

**Canais:**
1. Crie um canal chamado "logs" dentro da categoria Logs
2. Crie um canal chamado "loja" (para o painel de vendas)
3. Copie os IDs dos canais

**Atualize o config.json com todos os IDs!**
        `;

        await interaction.reply({
            embeds: [infoEmbed('⚙️ Configuração', instructions)],
            ephemeral: true
        });
    }
};