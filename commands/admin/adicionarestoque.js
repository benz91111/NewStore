const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { getProduct } = require('../../database/queries');
const { isStaff } = require('../../utils/helpers');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adicionarestoque')
        .setDescription('Adicione estoque a um produto (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID do produto')
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
            .setCustomId(`add_stock_modal_${productId}`)
            .setTitle('📦 Adicionar Estoque');

        const contentInput = new TextInputBuilder()
            .setCustomId('stock_content')
            .setLabel('Conteúdo do Item')
            .setPlaceholder('Email:senha, chave, código, texto...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000);

        modal.addComponents(new ActionRowBuilder().addComponents(contentInput));

        await interaction.showModal(modal);
    }
};