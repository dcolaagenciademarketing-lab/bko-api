const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminPass = process.env.ADMIN_PASSWORD || '199818';
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    await prisma.user.upsert({
        where: { username: 'dcola18$' },
        update: {},
        create: {
            username: 'dcola18$',
            password: hashedPassword,
        },
    });

    console.log('Seed: User created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
