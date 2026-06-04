const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllProducts } = require('../../database/queries');
const { isStaff } = require('../../utils/helpers');
const { createEmbed, errorEmbed } = require('../../utils/embeds');
const { formatCurrency } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listarprodutos')
        .setDescription('Liste todos os produtos da loja (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas membros da Staff podem usar este comando.')],
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const products = await getAllProducts();

            if (products.length === 0) {
                return interaction.editReply({
                    embeds: [createEmbed('📦 Produtos', 'Não há produtos cadastrados.', '#5865F2')]
                });
            }

            let description = '';
            products.forEach(p => {
                const stockEmoji = p.stock > 0 ? '🟢' : '🔴';
                description += `**ID:** \`${p.id}\` | **${p.name}**\n`;
                description += `💰 ${formatCurrency(p.price)} | ${stockEmoji} Estoque: \`${p.stock}\`\n`;
                description += `📝 ${p.description || 'Sem descrição'}\n\n`;
            });

            const embed = createEmbed(`📦 Produtos Cadastrados (${products.length})`, description, '#5865F2');
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            await interaction.editReply({
                embeds: [errorEmbed('Erro', 'Ocorreu um erro ao listar os produtos.')]
            });
        }
    }
};