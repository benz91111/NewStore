const { readFileSync } = require('fs');
const { join } = require('path');

const configPath = join(__dirname, 'config.json');
let config;

try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
} catch (error) {
    console.error('Erro ao carregar config.json:', error.message);
    process.exit(1);
}

// Sobrescrever com variáveis de ambiente (prioridade para Railway)
config.token = process.env.TOKEN || config.token;
config.clientId = process.env.CLIENT_ID || config.clientId;
config.guildId = process.env.GUILD_ID || config.guildId;
config.pixKey = process.env.PIX_KEY || config.pixKey;
config.pixKeyType = process.env.PIX_KEY_TYPE || config.pixKeyType;
config.pixHolderName = process.env.PIX_HOLDER_NAME || config.pixHolderName;

// Validação
if (!config.token || config.token === 'SEU_TOKEN_AQUI') {
    console.error('❌ TOKEN não configurado! Defina a variável TOKEN no Railway ou no config.json');
    process.exit(1);
}

module.exports = config;