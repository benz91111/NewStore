const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { isStaff } = require('../../utils/helpers');
const { addProductWithChannel, getProductsByChannel } = require('../../database/queries');
const { salesPanelEmbed, successEmbed, errorEmbed } = require('../../utils/embeds');
const { createProductSelectMenu } = require('../../utils/buttons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Cria um produto e envia o painel de vendas neste canal (Staff only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Apenas Staff pode usar este comando.')],
                ephemeral: true
            });
        }

        // Abrir modal para criar produto
        const modal = new ModalBuilder()
            .setCustomId('create_panel_product')
            .setTitle('Criar Produto para este Canal');

        const nameInput = new TextInputBuilder()
            .setCustomId('panel_product_name')
            .setLabel('Nome do Produto')
            .setPlaceholder('Ex: Conta Netflix Premium')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const priceInput = new TextInputBuilder()
            .setCustomId('panel_product_price')
            .setLabel('Preço (apenas números)')
            .setPlaceholder('Ex: 29.90')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('panel_product_description')
            .setLabel('Descrição do Produto')
            .setPlaceholder('Descreva o produto...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        const contentInput = new TextInputBuilder()
            .setCustomId('panel_product_content')
            .setLabel('Conteúdo para Entrega (1ª unidade)')
            .setPlaceholder('Email:senha ou chave...')
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