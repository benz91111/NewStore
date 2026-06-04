const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogs } = require('../../database/queries');
const { isStaff } = require('../../utils/helpers');
const { createEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Veja os logs do sistema (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('limite')
                .setDescription('Número de logs para exibir (padrão: 10)')
                .setMinValue(1)
                .setMaxValue(50)
        ),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas membros da Staff podem usar este comando.')],
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const limit = interaction.options.getInteger('limite') || 10;
            const logs = await getLogs(limit);

            if (logs.length === 0) {
                return interaction.editReply({
                    embeds: [createEmbed('📋 Logs', 'Não há logs registrados.', '#5865F2')]
                });
            }

            let description = '';
            logs.forEach(log => {
                const emoji = {
                    'purchase': '🛒',
                    'payment_confirmed': '✅',
                    'product_delivered': '🎁',
                    'ticket_created': '🎫',
                    'ticket_closed': '🔒'
                }[log.type] || '📋';

                description += `${emoji} **${log.type.toUpperCase()}**\n`;
                description += `👤 ${log.user_tag || 'Sistema'} | 📅 ${new Date(log.created_at).toLocaleString('pt-BR')}\n`;
                description += `📝 ${log.details}\n\n`;
            });

            const embed = createEmbed(`📋 Últimos ${logs.length} Logs`, description, '#5865F2');
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao listar logs:', error);
            await interaction.editReply({
                embeds: [errorEmbed('Erro', 'Ocorreu um erro ao carregar os logs.')]
            });
        }
    }
};