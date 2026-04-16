const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

// All routes require auth
router.use(authMiddleware);

// Get all inventories
router.get('/', async (req, res) => {
    try {
        const inventories = await prisma.inventario.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });
        return res.json(inventories);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar inventários' });
    }
});

// Get single inventory with items
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const inventory = await prisma.inventario.findUnique({
            where: { id: parseInt(id) },
            include: { items: true },
        });

        if (!inventory) {
            return res.status(404).json({ error: 'Inventário não encontrado' });
        }

        return res.json(inventory);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar detalhes do inventário' });
    }
});

// Create inventory with items
router.post('/', async (req, res) => {
    const { lojaId, lojaNome, responsavel, status, items } = req.body;

    try {
        const inventory = await prisma.inventario.create({
            data: {
                lojaId,
                lojaNome,
                responsavel,
                status: status || 'pendente',
                items: {
                    create: items || [], // array of { sku, nomeProduto, quantidadeContada }
                },
            },
            include: { items: true },
        });
        return res.status(201).json(inventory);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao criar inventário' });
    }
});

// Update inventory
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { lojaId, lojaNome, responsavel, status, items } = req.body;

    try {
        const current = await prisma.inventario.findUnique({
            where: { id: parseInt(id) },
        });

        if (!current) {
            return res.status(404).json({ error: 'Inventário não encontrado' });
        }

        if (current.status === 'finalizado') {
            return res.status(400).json({ error: 'Inventários finalizados não podem ser editados' });
        }

        // Update main fields
        // For items, we usually clear and re-create for simplicity in a "replacement" update, 
        // or manually sync. Here I'll clear and re-create if items are provided.

        const updateData = {
            lojaId,
            lojaNome,
            responsavel,
            status,
        };

        if (items) {
            // Clear current items and add new ones in a transaction
            await prisma.$transaction([
                prisma.inventarioItem.deleteMany({ where: { inventarioId: parseInt(id) } }),
                prisma.inventario.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...updateData,
                        items: {
                            create: items,
                        },
                    },
                }),
            ]);
        } else {
            await prisma.inventario.update({
                where: { id: parseInt(id) },
                data: updateData,
            });
        }

        const updated = await prisma.inventario.findUnique({
            where: { id: parseInt(id) },
            include: { items: true },
        });

        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar inventário' });
    }
});

// Delete inventory
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const current = await prisma.inventario.findUnique({
            where: { id: parseInt(id) },
        });

        if (!current) {
            return res.status(404).json({ error: 'Inventário não encontrado' });
        }

        if (current.status === 'finalizado') {
            return res.status(400).json({ error: 'Inventários finalizados não podem ser excluídos' });
        }

        await prisma.inventario.delete({
            where: { id: parseInt(id) },
        });

        return res.json({ message: 'Inventário excluído com sucesso' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao excluir inventário' });
    }
});

module.exports = router;
