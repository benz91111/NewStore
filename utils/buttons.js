const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function createBuyButton() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('buy_product')
            .setLabel('Comprar')
            .setStyle(ButtonStyle.Primary)
    );
}

function createCartButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('confirm_purchase')
            .setLabel('Confirmar Compra')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel_purchase')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Danger)
    );
}

function createPixButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('copy_pix_key')
            .setLabel('Copiar Chave PIX')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('payment_done')
            .setLabel('Já Efetuei o Pagamento')
            .setStyle(ButtonStyle.Success)
    );
}

function createConfirmPaymentButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('confirm_payment')
            .setLabel('Confirmar Pagamento')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('deny_payment')
            .setLabel('Negar Pagamento')
            .setStyle(ButtonStyle.Danger)
    );
}

function createCloseTicketButton() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Fechar Ticket')
            .setStyle(ButtonStyle.Danger)
    );
}

function createProductSelectMenu(products) {
    const options = products.map(p =>
        new StringSelectMenuOptionBuilder()
            .setLabel(`${p.name} - R$ ${p.price.toFixed(2)}`)
            .setDescription(`${p.description || 'Sem descrição'} | Estoque: ${p.stock}`)
            .setValue(p.id.toString())
            .setEmoji(p.stock > 0 ? '📦' : '❌')
    );
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_product')
            .setPlaceholder('Selecione um produto...')
            .addOptions(options)
    );
}

module.exports = {
    createBuyButton, createCartButtons, createPixButtons,
    createConfirmPaymentButtons, createCloseTicketButton,
    createProductSelectMenu
};
