const { MessageFlags } = require('discord.js');
const db = require('../database/queries');
const embeds = require('./embeds');
const buttons = require('./buttons');

module.exports = {
    async handleSelect(interaction) {
        const { customId, user } = interaction;
        if (customId === 'select_product') {
            const productId = parseInt(interaction.values[0]);
            const product = await db.getProduct(productId);
            
            // Verificar se produto pertence a este canal
            const channelProducts = await db.getProductsByChannel(interaction.channel.id);
            const isFromThisChannel = channelProducts.some(p => p.id === productId);
            if (!isFromThisChannel) {
                return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Este produto não está disponível neste canal.')], flags: MessageFlags.Ephemeral });
            }
            if (!product) return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Produto não encontrado.')], flags: MessageFlags.Ephemeral });
            if (product.stock <= 0) return interaction.reply({ embeds: [embeds.errorEmbed('Sem Estoque', 'Esgotado.')], flags: MessageFlags.Ephemeral });
            const pending = await db.getUserPendingPurchase(user.id);
            if (pending) return interaction.reply({ embeds: [embeds.warningEmbed('Pendente', 'Finalize a compra atual primeiro.')], flags: MessageFlags.Ephemeral });

            await db.createPurchase(user.id, user.tag, product.id, product.name, product.price, null);
            await db.addLog('purchase', user.id, user.tag, `${product.name} - R$ ${product.price.toFixed(2)}`);
            await interaction.update({
                embeds: [embeds.cartEmbed(product, product.price)],
                components: [buttons.createCartButtons()]
            });
        }
    }
};
