const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { getProduct } = require('../../database/queries');
const { isStaff } = require('../../utils/helpers');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editarproduto')
        .setDescription('Edite um produto existente (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID do produto a editar')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas membros da Staff podem usar este comando.')],
                ephemeral: true
            });
        }

        const productId = interaction.options.getInteger('id');
        const product = await getProduct(productId);

        if (!product) {
            return interaction.reply({
                embeds: [errorEmbed('Produto Não Encontrado', `Não existe produto com ID ${productId}.`)],
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`edit_product_modal_${productId}`)
            .setTitle('✏️ Editar Produto');

        const nameInput = new TextInputBuilder()
            .setCustomId('edit_name')
            .setLabel('Nome do Produto')
            .setValue(product.name)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const priceInput = new TextInputBuilder()
            .setCustomId('edit_price')
            .setLabel('Preço (apenas números)')
            .setValue(product.price.toString())
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('edit_description')
            .setLabel('Descrição do Produto')
            .setValue(product.description || '')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(priceInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    }
};