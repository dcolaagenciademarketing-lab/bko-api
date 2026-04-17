const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Validação básica
    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    try {
        // 2. Verificar conexão e buscar usuário
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // 3. Validar senha
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // 4. Verificar JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('ERRO: JWT_SECRET não configurado no ambiente');
            return res.status(500).json({ error: 'Erro de configuração no servidor' });
        }

        // 5. Gerar token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        return res.json({ token });
    } catch (err) {
        // Log detalhado para debug no Render
        console.error('Erro na rota /login:', err);
        return res.status(500).json({
            error: 'Erro interno no servidor',
            details: err.message // Mostrando o erro real para o usuário identificar o problema
        });
    }
});

module.exports = router;
