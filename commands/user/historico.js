const { SlashCommandBuilder } = require('discord.js');
const { getPurchaseHistory } = require('../../database/queries');
const { createEmbed, errorEmbed } = require('../../utils/embeds');
const { formatCurrency, formatDate } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historico')
        .setDescription('Veja seu histórico de compras'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const history = await getPurchaseHistory(interaction.user.id);

            if (history.length === 0) {
                return interaction.editReply({
                    embeds: [createEmbed('📋 Histórico de Compras', 'Você ainda não realizou nenhuma compra.', '#5865F2')]
                });
            }

            let description = '';
            history.forEach((purchase, index) => {
                const statusEmojis = {
                    'pending': '⏳',
                    'confirmed': '✅',
                    'delivered': '🎁'
                };
                description += `**#${index + 1}** ${statusEmojis[purchase.status] || '❓'} **${purchase.product_name}**\n`;
                description += `💰 ${formatCurrency(purchase.price)} | 📅 ${formatDate(purchase.created_at)}\n`;
                description += `Status: \`${purchase.status.toUpperCase()}\`\n\n`;
            });

            const embed = createEmbed('📋 Seu Histórico de Compras', description, '#5865F2');
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro no comando historico:', error);
            await interaction.editReply({
                embeds: [errorEmbed('Erro', 'Ocorreu um erro ao carregar seu histórico.')]
            });
        }
    }
};