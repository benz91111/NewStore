const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { removeProduct, getAllProducts } = require('../../database/queries');
const { isStaff } = require('../../utils/helpers');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerproduto')
        .setDescription('Remova um produto da loja (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID do produto a remover')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas membros da Staff podem usar este comando.')],
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const productId = interaction.options.getInteger('id');

        try {
            const products = await getAllProducts();
            const product = products.find(p => p.id === productId);

            if (!product) {
                return interaction.editReply({
                    embeds: [errorEmbed('Produto Não Encontrado', `Não existe produto com ID \`${productId}\`.`)]
                });
            }

            await removeProduct(productId);

            await interaction.editReply({
                embeds: [successEmbed('Produto Removido', `O produto **${product.name}** foi removido com sucesso!`)]
            });

        } catch (error) {
            console.error('Erro ao remover produto:', error);
            await interaction.editReply({
                embeds: [errorEmbed('Erro', 'Ocorreu um erro ao remover o produto.')]
            });
        }
    }
};