const { MessageFlags } = require('discord.js');
const db = require('../database/queries');
const embeds = require('./embeds');
const buttons = require('./buttons');
const { isStaff } = require('./helpers');

module.exports = {
    async handleModal(interaction) {
        const { customId, user, fields } = interaction;

        if (customId === 'add_product_modal') {
            if (!isStaff(interaction.member)) return interaction.reply({ embeds: [embeds.errorEmbed('Acesso Negado', 'Apenas Staff.')], flags: MessageFlags.Ephemeral });
            const name = fields.getTextInputValue('product_name');
            const price = parseFloat(fields.getTextInputValue('product_price').replace(',', '.'));
            const description = fields.getTextInputValue('product_description');
            const content = fields.getTextInputValue('product_content');
            if (isNaN(price) || price <= 0) return interaction.reply({ embeds: [embeds.errorEmbed('Preço Inválido', 'Deve ser número > 0.')], flags: MessageFlags.Ephemeral });
            try {
                const id = await db.addProduct(name, price, description, content);
                await interaction.reply({ embeds: [embeds.successEmbed('Adicionado', `**${name}** | ID: ${id} | R$ ${price.toFixed(2)}`)], flags: MessageFlags.Ephemeral });
                await db.addLog('product_added', user.id, user.tag, `${name} (ID: ${id})`);
            } catch (e) { console.error(e); await interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Falha ao adicionar.')], flags: MessageFlags.Ephemeral }); }
        }

        if (customId.startsWith('edit_product_modal_')) {
            if (!isStaff(interaction.member)) return interaction.reply({ embeds: [embeds.errorEmbed('Acesso Negado', 'Apenas Staff.')], flags: MessageFlags.Ephemeral });
            const productId = parseInt(customId.split('_').pop());
            const name = fields.getTextInputValue('edit_name');
            const price = parseFloat(fields.getTextInputValue('edit_price').replace(',', '.'));
            const description = fields.getTextInputValue('edit_description');
            if (isNaN(price) || price <= 0) return interaction.reply({ embeds: [embeds.errorEmbed('Preço Inválido', 'Deve ser número > 0.')], flags: MessageFlags.Ephemeral });
            try {
                await db.editProduct(productId, { name, price, description });
                await interaction.reply({ embeds: [embeds.successEmbed('Atualizado', `ID ${productId}`)], flags: MessageFlags.Ephemeral });
                await db.addLog('product_edited', user.id, user.tag, `ID ${productId}`);
            } catch (e) { console.error(e); await interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Falha ao editar.')], flags: MessageFlags.Ephemeral }); }
        }

        if (customId.startsWith('add_stock_modal_')) {
            if (!isStaff(interaction.member)) return interaction.reply({ embeds: [embeds.errorEmbed('Acesso Negado', 'Apenas Staff.')], flags: MessageFlags.Ephemeral });
            const productId = parseInt(customId.split('_').pop());
            const content = fields.getTextInputValue('stock_content');
            try {
                await db.addStock(productId, content);
                await interaction.reply({ embeds: [embeds.successEmbed('Estoque Adicionado', `Produto ID ${productId}`)], flags: MessageFlags.Ephemeral });
                await db.addLog('stock_added', user.id, user.tag, `Produto ID ${productId}`);
            } catch (e) { console.error(e); await interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Falha ao adicionar estoque.')], flags: MessageFlags.Ephemeral }); }
        }

        // ===== CRIAR PRODUTO VIA PAINEL =====
        if (customId === 'create_panel_product') {
            if (!isStaff(interaction.member)) {
                return interaction.reply({ embeds: [embeds.errorEmbed('Acesso Negado', 'Apenas Staff.')], flags: MessageFlags.Ephemeral });
            }

            const name = fields.getTextInputValue('panel_product_name');
            const priceStr = fields.getTextInputValue('panel_product_price');
            const description = fields.getTextInputValue('panel_product_description');
            const content = fields.getTextInputValue('panel_product_content');
            const price = parseFloat(priceStr.replace(',', '.'));
            const channelId = interaction.channel.id;

            if (isNaN(price) || price <= 0) {
                return interaction.reply({ embeds: [embeds.errorEmbed('Preço Inválido', 'Deve ser número > 0.')], flags: MessageFlags.Ephemeral });
            }

            try {
                const productId = await db.addProductWithChannel(name, price, description, content, channelId);

                // Enviar embed do produto no canal
                const product = await db.getProduct(productId);
                const embed = embeds.productEmbed(product);
                const selectMenu = buttons.createProductSelectMenu([product]);

                await interaction.channel.send({
                    embeds: [embed],
                    components: [selectMenu]
                });

                await interaction.reply({
                    embeds: [embeds.successEmbed('Painel Criado!', `Produto **${name}** criado e vinculado a este canal!\nID: ${productId} | Preço: R$ ${price.toFixed(2)}`)],
                    flags: MessageFlags.Ephemeral
                });

                await db.addLog('product_added', user.id, user.tag, `${name} (ID: ${productId}) no canal ${channelId}`);
            } catch (e) {
                console.error(e);
                await interaction.reply({ embeds: [embeds.errorEmbed('Erro', 'Falha ao criar produto.')], flags: MessageFlags.Ephemeral });
            }
        }

    }
};