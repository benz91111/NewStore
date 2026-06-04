const { EmbedBuilder } = require('discord.js');
const config = require('../config/settings');

function createEmbed(title, description, color = config.colors.primary) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'Loja Digital' });
}

function successEmbed(title, description) {
    return createEmbed(`${config.emojis.check} ${title}`, description, config.colors.success);
}

function errorEmbed(title, description) {
    return createEmbed(`${config.emojis.cross} ${title}`, description, config.colors.danger);
}

function warningEmbed(title, description) {
    return createEmbed(`${config.emojis.alert} ${title}`, description, config.colors.warning);
}

function infoEmbed(title, description) {
    return createEmbed(`${config.emojis.info} ${title}`, description, config.colors.info);
}

function productEmbed(product) {
    const stockStatus = product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque';
    return new EmbedBuilder()
        .setTitle(`${config.emojis.package} ${product.name}`)
        .setDescription(product.description || 'Sem descrição.')
        .addFields(
            { name: 'Preço', value: `R$ ${product.price.toFixed(2)}`, inline: true },
            { name: 'Estoque', value: stockStatus, inline: true }
        )
        .setColor(config.colors.primary)
        .setTimestamp();
}

function cartEmbed(product, total) {
    return new EmbedBuilder()
        .setTitle(`${config.emojis.cart} Seu Carrinho`)
        .setDescription('Você está comprando:')
        .addFields(
            { name: 'Produto', value: product.name, inline: true },
            { name: 'Preço', value: `R$ ${product.price.toFixed(2)}`, inline: true },
            { name: 'Total', value: `R$ ${total.toFixed(2)}`, inline: false }
        )
        .setColor(config.colors.primary)
        .setTimestamp()
        .setFooter({ text: 'Clique em Confirmar Compra para prosseguir' });
}

function pixEmbed() {
    return new EmbedBuilder()
        .setTitle(`${config.emojis.pix} Pagamento via PIX`)
        .setDescription('Para concluir sua compra, realize o pagamento via PIX.')
        .addFields(
            { name: 'Chave PIX', value: `\`\`\`${config.pixKey}\`\`\``, inline: false },
            { name: 'Titular', value: config.pixHolderName, inline: true },
            { name: 'Tipo', value: config.pixKeyType.toUpperCase(), inline: true }
        )
        .setColor(config.colors.warning)
        .setTimestamp()
        .setFooter({ text: 'Após o pagamento, clique em Já Efetuei o Pagamento' });
}

function ticketEmbed(user, product, price) {
    return new EmbedBuilder()
        .setTitle(`${config.emojis.ticket} Ticket de Compra`)
        .setDescription(`Compra iniciada por ${user}`)
        .addFields(
            { name: 'Produto', value: product, inline: true },
            { name: 'Valor', value: `R$ ${price.toFixed(2)}`, inline: true },
            { name: 'Status', value: 'Aguardando pagamento...', inline: false }
        )
        .setColor(config.colors.info)
        .setTimestamp();
}

function paymentPendingEmbed(user, product, price) {
    return new EmbedBuilder()
        .setTitle(`${config.emojis.loading} Pagamento Pendente`)
        .setDescription(`${user} informou que efetuou o pagamento.`)
        .addFields(
            { name: 'Produto', value: product, inline: true },
            { name: 'Valor', value: `R$ ${price.toFixed(2)}`, inline: true }
        )
        .setColor(config.colors.warning)
        .setTimestamp()
        .setFooter({ text: 'Aguardando confirmação da Staff' });
}

function deliveryEmbed(productName, content) {
    return new EmbedBuilder()
        .setTitle(`${config.emojis.package} Entrega do Produto`)
        .setDescription('Obrigado pela compra! Aqui está o seu produto:')
        .addFields(
            { name: 'Produto', value: productName, inline: false },
            { name: 'Conteúdo', value: `\`\`\`${content}\`\`\``, inline: false }
        )
        .setColor(config.colors.success)
        .setTimestamp()
        .setFooter({ text: 'Guarde este conteúdo em local seguro!' });
}

function salesPanelEmbed() {
    return new EmbedBuilder()
        .setTitle('Loja Digital')
        .setDescription('Bem-vindo à nossa loja! Aqui você encontra os melhores produtos digitais.')
        .addFields(
            { name: 'Pagamento', value: 'Aceitamos PIX', inline: true },
            { name: 'Entrega', value: 'Automática após confirmação', inline: true },
            { name: 'Produtos', value: 'Clique em Comprar para ver os disponíveis', inline: false }
        )
        .setColor(config.colors.primary)
        .setTimestamp()
        .setFooter({ text: 'Clique no botão abaixo para começar' });
}

function logEmbed(type, user, details) {
    const colors = {
        'purchase': config.colors.primary,
        'payment_confirmed': config.colors.success,
        'product_delivered': config.colors.success,
        'ticket_created': config.colors.info,
        'ticket_closed': config.colors.danger
    };
    const emojis = {
        'purchase': config.emojis.cart,
        'payment_confirmed': config.emojis.check,
        'product_delivered': config.emojis.package,
        'ticket_created': config.emojis.ticket,
        'ticket_closed': config.emojis.cross
    };
    return new EmbedBuilder()
        .setTitle(`${emojis[type] || ''} ${type.replace(/_/g, ' ').toUpperCase()}`)
        .setDescription(details)
        .addFields(
            { name: 'Usuário', value: user || 'Sistema', inline: true },
            { name: 'Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor(colors[type] || config.colors.primary)
        .setTimestamp();
}

module.exports = {
    createEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed,
    productEmbed, cartEmbed, pixEmbed, ticketEmbed,
    paymentPendingEmbed, deliveryEmbed, salesPanelEmbed, logEmbed
};
