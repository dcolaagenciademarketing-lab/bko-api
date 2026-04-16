const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// All routes require auth
router.use(authMiddleware);

// Get all clients
router.get('/', async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return res.json(clients);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

// Create client
router.post('/', async (req, res) => {
    const {
        nome,
        whatsapp,
        email,
        nicho,
        valor,
        duracaoContrato,
        dataInicio,
        dataVencimento,
        status,
        observacoes,
        contratoPDFBase64,
    } = req.body;

    try {
        const client = await prisma.client.create({
            data: {
                nome,
                whatsapp,
                email,
                nicho,
                valor,
                duracaoContrato,
                dataInicio: new Date(dataInicio),
                dataVencimento: new Date(dataVencimento),
                status,
                observacoes,
                contratoPDFBase64,
            },
        });
        return res.status(201).json(client);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});

// Update client
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Convert dates if present
    if (data.dataInicio) data.dataInicio = new Date(data.dataInicio);
    if (data.dataVencimento) data.dataVencimento = new Date(data.dataVencimento);

    try {
        const client = await prisma.client.update({
            where: { id: parseInt(id) },
            data,
        });
        return res.json(client);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.client.delete({
            where: { id: parseInt(id) },
        });
        return res.json({ message: 'Cliente excluído com sucesso' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao excluir cliente' });
    }
});

module.exports = router;
