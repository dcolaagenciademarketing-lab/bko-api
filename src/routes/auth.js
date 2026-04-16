const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        return res.json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

module.exports = router;
