const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { isStaff } = require('../../utils/helpers');
const { errorEmbed, successEmbed } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adicionarproduto')
        .setDescription('Adicione um novo produto à loja (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas membros da Staff podem usar este comando.')],
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('add_product_modal')
            .setTitle('➕ Adicionar Produto');

        const nameInput = new TextInputBuilder()
            .setCustomId('product_name')
            .setLabel('Nome do Produto')
            .setPlaceholder('Ex: Conta Netflix Premium')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const priceInput = new TextInputBuilder()
            .setCustomId('product_price')
            .setLabel('Preço (apenas números)')
            .setPlaceholder('Ex: 29.90')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('product_description')
            .setLabel('Descrição do Produto')
            .setPlaceholder('Descreva o produto...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        const contentInput = new TextInputBuilder()
            .setCustomId('product_content')
            .setLabel('Conteúdo para Entrega')
            .setPlaceholder('Email:senha ou chave de ativação...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(priceInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
    }
};