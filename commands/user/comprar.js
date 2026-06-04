const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllProducts } = require('../../database/queries');
const { createProductSelectMenu } = require('../../utils/buttons');
const { errorEmbed, infoEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comprar')
        .setDescription('Inicie uma compra na loja'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const products = await getAllProducts();

            if (products.length === 0) {
                return interaction.editReply({
                    embeds: [errorEmbed('Sem Produtos', 'Não há produtos disponíveis no momento.')]
                });
            }

            const availableProducts = products.filter(p => p.stock > 0);

            if (availableProducts.length === 0) {
                return interaction.editReply({
                    embeds: [errorEmbed('Sem Estoque', 'Todos os produtos estão esgotados no momento.')]
                });
            }

            const embed = infoEmbed(
                '🛒 Selecione um Produto',
                'Escolha um produto abaixo para adicionar ao seu carrinho.'
            );

            const selectMenu = createProductSelectMenu(availableProducts);

            await interaction.editReply({
                embeds: [embed],
                components: [selectMenu]
            });

        } catch (error) {
            console.error('Erro no comando comprar:', error);
            await interaction.editReply({
                embeds: [errorEmbed('Erro', 'Ocorreu um erro ao carregar os produtos.')]
            });
        }
    }
};