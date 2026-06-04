const { PermissionsBitField } = require('discord.js');
const config = require('../config/settings');

function isStaff(member) {
    return member.roles.cache.has(config.roles.staff) ||
           member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function hasClientRole(member) {
    return member.roles.cache.has(config.roles.client);
}

async function createTicketChannel(guild, user, purchaseId) {
    const category = guild.channels.cache.get(config.categories.tickets);
    return await guild.channels.create({
        name: `ticket-${user.username}-${purchaseId}`,
        type: 0,
        parent: category || null,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: config.roles.staff, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages] }
        ]
    });
}

function formatCurrency(value) {
    return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
}

module.exports = {
    isStaff, hasClientRole, createTicketChannel, formatCurrency, formatDate
};
