const db = require('./database');

// ==================== PRODUTOS ====================

function addProduct(name, price, description, category, content) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO products (name, price, description, category, stock, content) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, description, category || 'geral', 1, content],
            function(err) {
                if (err) return reject(err);
                // Adicionar ao estoque
                db.run(`INSERT INTO stock (product_id, content) VALUES (?, ?)`, [this.lastID, content], (err2) => {
                    if (err2) return reject(err2);
                    resolve(this.lastID);
                });
            }
        );
    });
}

function removeProduct(productId) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM products WHERE id = ?`, [productId], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}

function editProduct(productId, updates) {
    return new Promise((resolve, reject) => {
        const fields = [];
        const values = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }
        if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }

        if (fields.length === 0) return resolve(0);

        values.push(productId);
        db.run(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}

function getProduct(productId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function getProductsByCategory(category) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM products WHERE category = ? ORDER BY id DESC`, [category], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getAllProducts() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM products ORDER BY id DESC`, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function addStock(productId, content) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO stock (product_id, content) VALUES (?, ?)`, [productId, content], function(err) {
            if (err) return reject(err);
            db.run(`UPDATE products SET stock = stock + 1 WHERE id = ?`, [productId], (err2) => {
                if (err2) return reject(err2);
                resolve(this.lastID);
            });
        });
    });
}

function getAvailableStock(productId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id, content FROM stock WHERE product_id = ? AND sold = 0 LIMIT 1`,
            [productId],
            (err, row) => {
                if (err) return reject(err);
                resolve(row);
            }
        );
    });
}

function markStockAsSold(stockId) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE stock SET sold = 1 WHERE id = ?`, [stockId], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}

function updateProductStock(productId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) as count FROM stock WHERE product_id = ? AND sold = 0`,
            [productId],
            (err, row) => {
                if (err) return reject(err);
                db.run(`UPDATE products SET stock = ? WHERE id = ?`, [row.count, productId], (err2) => {
                    if (err2) return reject(err2);
                    resolve(row.count);
                });
            }
        );
    });
}

// ==================== COMPRAS ====================

function createPurchase(userId, userTag, productId, productName, price, ticketChannelId) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO purchases (user_id, user_tag, product_id, product_name, price, ticket_channel_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, userTag, productId, productName, price, ticketChannelId],
            function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

function getPurchase(purchaseId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM purchases WHERE id = ?`, [purchaseId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function getUserPendingPurchase(userId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM purchases WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
            [userId],
            (err, row) => {
                if (err) return reject(err);
                resolve(row);
            }
        );
    });
}

function confirmPurchase(purchaseId, staffId) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE purchases SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [purchaseId],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
}

function deliverPurchase(purchaseId, content) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE purchases SET status = 'delivered', delivered_content = ? WHERE id = ?`,
            [content, purchaseId],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
}

function getPurchaseHistory(userId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM purchases WHERE user_id = ? ORDER BY created_at DESC`,
            [userId],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
}

function getAllPurchases() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM purchases ORDER BY created_at DESC`, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// ==================== TICKETS ====================

function createTicket(channelId, userId, userTag, purchaseId) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO tickets (channel_id, user_id, user_tag, purchase_id) VALUES (?, ?, ?, ?)`,
            [channelId, userId, userTag, purchaseId],
            function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

function getTicket(channelId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM tickets WHERE channel_id = ?`, [channelId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function closeTicket(channelId) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE tickets SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE channel_id = ?`,
            [channelId],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
}

function getOpenTickets() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM tickets WHERE status = 'open' ORDER BY created_at DESC`, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// ==================== LOGS ====================

function addLog(type, userId, userTag, details) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO logs (type, user_id, user_tag, details) VALUES (?, ?, ?, ?)`,
            [type, userId, userTag, details],
            function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

function getLogs(limit = 50) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM logs ORDER BY created_at DESC LIMIT ?`, [limit], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}


module.exports = {
    // Produtos
    addProduct, removeProduct, editProduct, getProduct, getAllProducts,
    addStock, getAvailableStock, markStockAsSold, updateProductStock,
    
    // Compras
    createPurchase, getPurchase, getUserPendingPurchase, confirmPurchase,
    deliverPurchase, getPurchaseHistory, getAllPurchases,
    // Tickets
    createTicket, getTicket, closeTicket, getOpenTickets,
    // Logs
    addLog, getLogs
};