import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const micro = await prisma.category.upsert({
    where: { slug: 'micro' },
    update: {},
    create: { slug: 'micro', title: 'Мікродобрива' }
  });

  await prisma.product.upsert({
    where: { slug: 'vitera-boron' },
    update: {},
    create: {
      slug: 'vitera-boron',
      name: 'Vitera Boron',
      shortDesc: 'Бор для ріпаку, соняшнику та бобових.',
      description: 'Рідке борне добриво для підтримки генеративних процесів та стресостійкості.',
      categoryId: micro.id
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
