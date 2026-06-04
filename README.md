# 🤖 Bot de Vendas Discord

Bot completo para loja de produtos digitais com pagamento PIX manual e entrega automática.

## 🚀 Deploy no Railway

### 1. Crie o projeto no Railway
- Acesse [railway.app](https://railway.app)
- Clique em **New Project** → **Deploy from GitHub repo**
- Selecione seu repositório

### 2. Configure as Variáveis de Ambiente
Vá em **Variables** e adicione:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `TOKEN` | Token do seu bot Discord | ✅ Sim |
| `CLIENT_ID` | Application ID do bot | ✅ Sim |
| `GUILD_ID` | ID do seu servidor | ✅ Sim |
| `PIX_KEY` | Sua chave PIX | ✅ Sim |
| `PIX_KEY_TYPE` | Tipo da chave (email, cpf, cnpj, telefone) | ❌ Padrão: email |
| `PIX_HOLDER_NAME` | Nome do titular da chave PIX | ❌ Padrão: config.json |

> 💡 **Dica**: O `TOKEN` é a única variável realmente obrigatória no Railway. Os outros podem ficar no `config.json`.

### 3. Deploy automático
O Railway detecta o `package.json` e instala as dependências automaticamente.

### 4. Primeira execução
Após o deploy, use o comando `/setup` no Discord para criar cargos e canais automaticamente.

---

## 💻 Rodando Localmente

```bash
# 1. Clone o repositório
git clone <url>
cd discord-sales-bot

# 2. Instale as dependências
npm install

# 3. Configure o config.json
# Edite config/config.json com seus dados

# 4. Inicie o bot
npm start
```

---

## ✨ Funcionalidades

- 🛒 **Sistema de Produtos**: Adicionar, remover, editar, listar e controlar estoque
- 💰 **Sistema de Compra**: Carrinho privado com seleção de produtos
- 🏦 **PIX Manual**: Chave PIX configurável com botões de cópia e confirmação
- 🎟 **Sistema de Ticket**: Canais privados para cada compra
- ✅ **Confirmação Manual**: Staff confirma pagamentos
- 🎁 **Entrega Automática**: Produto enviado na DM e no ticket
- 👑 **Cargos**: Staff e Cliente criados automaticamente
- 📊 **Sistema de Logs**: Registro completo de todas as ações
- 💾 **Banco de Dados**: SQLite para persistência

---

## 🎮 Comandos

### Usuário
| Comando | Descrição |
|---------|-----------|
| `/comprar` | Iniciar uma compra |
| `/historico` | Ver histórico de compras |

### Staff
| Comando | Descrição |
|---------|-----------|
| `/setup` | Configurar cargos e canais automaticamente |
| `/painel` | Enviar painel de vendas no canal |
| `/adicionarproduto` | Adicionar novo produto |
| `/removerproduto` | Remover produto |
| `/editarproduto` | Editar produto existente |
| `/listarprodutos` | Listar todos os produtos |
| `/adicionarestoque` | Adicionar estoque a um produto |
| `/logs` | Ver logs do sistema |

---

## ⚙️ Configuração do config.json

Edite `config/config.json` (valores não definidos no Railway):

```json
{
  "token": "SEU_TOKEN_AQUI_OU_VAIVEL_DE_AMBIENTE",
  "clientId": "SEU_CLIENT_ID",
  "guildId": "SEU_GUILD_ID",
  "pixKey": "sua-chave-pix@email.com",
  "pixKeyType": "email",
  "pixHolderName": "Sua Loja Digital",
  "categories": {
    "tickets": "ID_CATEGORIA_TICKETS",
    "logs": "ID_CATEGORIA_LOGS"
  },
  "roles": {
    "staff": "ID_CARGO_STAFF",
    "client": "ID_CARGO_CLIENTE"
  },
  "channels": {
    "logs": "ID_CANAL_LOGS",
    "salesPanel": "ID_CANAL_PAINEL"
  }
}
```

> **Nota**: `token`, `clientId`, `guildId`, `pixKey`, `pixKeyType` e `pixHolderName` podem ser definidos via variáveis de ambiente no Railway (prioridade sobre o config.json).

---

## 📝 Primeiros Passos

1. Crie um bot no [Discord Developer Portal](https://discord.com/developers/applications)
2. Ative as intents: `Guild Members`, `Message Content`
3. Convide o bot para seu servidor com permissões de administrador
4. Execute `/setup` para criar cargos e canais automaticamente
5. Atualize o `config.json` com os IDs gerados (ou use variáveis de ambiente)
6. Adicione produtos com `/adicionarproduto`
7. Envie o painel com `/painel`

---

## ⚠️ Importante

- O bot precisa de permissão de **Administrador** para criar cargos e canais
- Atualize o `config.json` com os IDs após rodar `/setup`
- Mantenha o token do bot em segurança (use variáveis de ambiente!)

---

## 📄 Licença

MIT
