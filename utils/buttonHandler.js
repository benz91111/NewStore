const { MessageFlags } = require('discord.js');
const config = require('../config/settings');
const db = require('../database/queries');
const embeds = require('./embeds');
const buttons = require('./buttons');
const helpers = require('./helpers');

module.exports = {
    async handleButton(interaction) {
        const { customId, user, guild } = interaction;

        if (customId === 'buy_product') {
            const products = await db.getAllProducts();
            const available = products.filter(p => p.stock > 0);
            if (available.length === 0) {
                return interaction.reply({ embeds: [embeds.errorEmbed('Sem Estoque', 'Todos os produtos estão esgotados.')], flags: MessageFlags.Ephemeral });
            }
            return interaction.reply({
                embeds: [embeds.infoEmbed('Selecione um Produto', 'Escolha um produto abaixo:')],
                components: [buttons.createProductSelectMenu(available)],
                flags: MessageFlags.Ephemeral
            });
        }

        if (customId === 'confirm_purchase') {
            const purchase = await db.getUserPendingPurchase(user.id);
            if (!purchase) return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Nenhuma compra pendente.')], flags: MessageFlags.Ephemeral });
            const product = await db.getProduct(purchase.product_id);
            if (!product || product.stock <= 0) return interaction.reply({ embeds: [embeds.errorEmbed('Sem Estoque', 'Produto esgotou.')], flags: MessageFlags.Ephemeral });

            const ticketChannel = await helpers.createTicketChannel(guild, user, purchase.id);
            await new Promise((resolve, reject) => {
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const dbPath = '/tmp/shop.db';
                const dbConn = new sqlite3.Database(dbPath);
                dbConn.run(`UPDATE purchases SET ticket_channel_id = ? WHERE id = ?`, [ticketChannel.id, purchase.id], function(err) { dbConn.close(); err ? reject(err) : resolve(); });
            });
            await db.createTicket(ticketChannel.id, user.id, user.tag, purchase.id);
            await ticketChannel.send({
                content: `${user} | <@&${config.roles.staff}>`,
                embeds: [embeds.ticketEmbed(user.toString(), product.name, product.price), embeds.pixEmbed()],
                components: [buttons.createPixButtons(), buttons.createCloseTicketButton()]
            });
            await db.addLog('ticket_created', user.id, user.tag, `Ticket #${purchase.id} - ${product.name}`);
            return interaction.update({
                embeds: [embeds.successEmbed('Compra Iniciada!', `Ticket: <#${ticketChannel.id}>\nRealize o PIX e aguarde.`)],
                components: []
            });
        }

        if (customId === 'cancel_purchase') {
            return interaction.update({ embeds: [embeds.errorEmbed('Compra Cancelada', 'Você cancelou.')], components: [] });
        }

        if (customId === 'copy_pix_key') {
            return interaction.reply({ content: `\`\`\`${config.pixKey}\`\`\``, flags: MessageFlags.Ephemeral });
        }

        if (customId === 'payment_done') {
            const ticket = await db.getTicket(interaction.channel.id);
            if (!ticket) return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Ticket não encontrado.')], flags: MessageFlags.Ephemeral });
            const purchase = await db.getPurchase(ticket.purchase_id);
            if (!purchase) return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Compra não encontrada.')], flags: MessageFlags.Ephemeral });
            const product = await db.getProduct(purchase.product_id);
            await interaction.message.edit({
                embeds: [embeds.paymentPendingEmbed(user.toString(), product.name, product.price)],
                components: [buttons.createConfirmPaymentButtons(), buttons.createCloseTicketButton()]
            });
            await interaction.reply({ embeds: [embeds.successEmbed('Pagamento Informado', 'Staff notificada.')], flags: MessageFlags.Ephemeral });
            await interaction.channel.send({ content: `<@&${config.roles.staff}> ${user} pagou. Aguardando confirmação.`, allowedMentions: { roles: [config.roles.staff] } });
            await db.addLog('payment_pending', user.id, user.tag, `Compra #${purchase.id}`);
        }

        if (customId === 'confirm_payment') {
            if (!helpers.isStaff(interaction.member)) return interaction.reply({ embeds: [embeds.errorEmbed('Acesso Negado', 'Apenas Staff.')], flags: MessageFlags.Ephemeral });
            const ticket = await db.getTicket(interaction.channel.id);
            if (!ticket) return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Ticket não encontrado.')], flags: MessageFlags.Ephemeral });
            const purchase = await db.getPurchase(ticket.purchase_id);
            if (!purchase || purchase.status !== 'pending') return interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Compra já processada.')], flags: MessageFlags.Ephemeral });
            const product = await db.getProduct(purchase.product_id);
            const stockItem = await db.getAvailableStock(purchase.product_id);
            if (!stockItem) return interaction.reply({ embeds: [embeds.errorEmbed('Sem Estoque', 'Sem itens disponíveis.')], flags: MessageFlags.Ephemeral });

            await db.confirmPurchase(purchase.id, interaction.user.id);
            await db.markStockAsSold(stockItem.id);
            await db.updateProductStock(purchase.product_id);
            await db.deliverPurchase(purchase.id, stockItem.content);

            const buyer = await guild.members.fetch(purchase.user_id).catch(() => null);
            if (buyer) {
                try { await buyer.send({ embeds: [embeds.deliveryEmbed(product.name, stockItem.content)] }); } catch(e) {}
                const clientRole = guild.roles.cache.get(config.roles.client);
                if (clientRole && !buyer.roles.cache.has(config.roles.client)) await buyer.roles.add(clientRole).catch(() => {});
            }
            await interaction.channel.send({ embeds: [embeds.deliveryEmbed(product.name, stockItem.content)] });
            await interaction.message.edit({
                embeds: [embeds.successEmbed('Pagamento Confirmado & Entregue', `Por ${interaction.user}`)],
                components: [buttons.createCloseTicketButton()]
            });
            await interaction.reply({ embeds: [embeds.successEmbed('Sucesso!', 'Entregue!')], flags: MessageFlags.Ephemeral });
            await db.addLog('payment_confirmed', interaction.user.id, interaction.user.tag, `Compra #${purchase.id}`);
            await db.addLog('product_delivered', purchase.user_id, purchase.user_tag, product.name);
        }

        if (customId === 'deny_payment') {
            if (!helpers.isStaff(interaction.member)) return interaction.reply({ embeds: [embeds.errorEmbed('Acesso Negado', 'Apenas Staff.')], flags: MessageFlags.Ephemeral });
            await interaction.message.edit({
                embeds: [embeds.errorEmbed('Pagamento Negado', `Negado por ${interaction.user}. Envie comprovante correto.`)],
                components: [buttons.createPixButtons(), buttons.createCloseTicketButton()]
            });
            await interaction.reply({ embeds: [embeds.warningEmbed('Negado', 'Usuário notificado.')], flags: MessageFlags.Ephemeral });
        }

        if (customId === 'close_ticket') {
            const ticket = await db.getTicket(interaction.channel.id);
            if (ticket && ticket.status === 'open') {
                await db.closeTicket(interaction.channel.id);
                await db.addLog('ticket_closed', user.id, user.tag, interaction.channel.name);
            }
            await interaction.reply({ embeds: [embeds.infoEmbed('Fechando', 'Canal será excluído em 5s...')] });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
    }
};
