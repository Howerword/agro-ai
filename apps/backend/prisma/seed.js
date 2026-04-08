"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'microfertilizers' },
            update: {},
            create: {
                slug: 'microfertilizers',
                name: 'Мікродобрива',
                description: 'Рішення для листкового живлення та корекції дефіцитів.',
                seoTitle: 'Мікродобрива для агровиробників | Vitera',
                seoDescription: 'Каталог мікродобрив для точного живлення польових культур.'
            }
        }),
        prisma.category.upsert({
            where: { slug: 'specialty-products' },
            update: {},
            create: {
                slug: 'specialty-products',
                name: 'Спеціальні продукти',
                description: 'Біостимулятори, антистресанти та комплексні програми.',
                seoTitle: 'Спеціальні агропродукти | Vitera',
                seoDescription: 'Каталог спеціальних агрорішень для підвищення врожайності.'
            }
        })
    ]);
    const soybeanProgram = await prisma.program.upsert({
        where: { slug: 'soybean-nutrition-program' },
        update: {},
        create: {
            slug: 'soybean-nutrition-program',
            title: 'Програма живлення сої',
            description: 'Схема для активізації азотфіксації, розвитку бульбочок та вирівнювання посівів.',
            targetCrops: ['соя'],
            targetProblems: ['дефіцит бору', 'слабкий старт', 'стрес після гербіцидів'],
            seoTitle: 'Програма живлення сої | Vitera',
            seoDescription: 'Комплексна програма підживлення сої для стабільної врожайності.'
        }
    });
    const cornProgram = await prisma.program.upsert({
        where: { slug: 'corn-stress-recovery' },
        update: {},
        create: {
            slug: 'corn-stress-recovery',
            title: 'Антистрес для кукурудзи',
            description: 'Програма відновлення кукурудзи після гербіцидного і температурного стресу.',
            targetCrops: ['кукурудза'],
            targetProblems: ['гербіцидний стрес', 'похолодання', 'дефіцит цинку'],
            seoTitle: 'Антистресова програма для кукурудзи | Vitera',
            seoDescription: 'Рекомендації з відновлення кукурудзи та посилення стартового росту.'
        }
    });
    await prisma.product.upsert({
        where: { slug: 'nutrivant-drip' },
        update: {},
        create: {
            slug: 'nutrivant-drip',
            sku: 'VT-ND-001',
            name: 'Нутрівант Дріп',
            shortDescription: 'Водорозчинне NPK-добриво для фертигації та крапельного зрошення.',
            description: 'Продукт для інтенсивних систем живлення з акцентом на рівномірне внесення елементів через систему фертигації.',
            manufacturer: 'Atlantica Agricola',
            formFactor: 'Водорозчинний кристал',
            application: 'Фертигація, крапельне зрошення',
            cropTags: ['овочі', 'ягоди', 'сад'],
            benefits: ['швидке засвоєння', 'стабільне живлення', 'сумісність у бакових сумішах'],
            composition: {
                nitrogen: '12%',
                phosphorus: '48%',
                potassium: '8%',
                microelements: ['Zn', 'B', 'Mn']
            },
            dosage: {
                fertigation: '2-5 кг/га',
                foliar: '1-2 кг/га'
            },
            seoTitle: 'Нутрівант Дріп | Добриво для фертигації',
            seoDescription: 'Нутрівант Дріп для точного живлення овочів, ягід та саду.',
            categoryId: categories[0].id,
            programs: {
                connect: [{ id: soybeanProgram.id }]
            }
        }
    });
    await prisma.product.upsert({
        where: { slug: 'biostimulator-anti-stress' },
        update: {},
        create: {
            slug: 'biostimulator-anti-stress',
            sku: 'VT-BS-011',
            name: 'Біостимулятор Anti-Stress',
            shortDescription: 'Антистресант для відновлення фотосинтетичної активності після стресу.',
            description: 'Спрямований на швидке відновлення ростових процесів, активацію кореневої системи та зменшення наслідків температурних і гербіцидних стресів.',
            manufacturer: 'Vitera',
            formFactor: 'Рідкий концентрат',
            application: 'Листкове підживлення',
            cropTags: ['кукурудза', 'соняшник', 'зернові'],
            benefits: ['антистресова дія', 'підсилення фотосинтезу', 'швидке відновлення'],
            composition: {
                aminoAcids: '18%',
                seaweedExtract: '6%'
            },
            dosage: {
                foliar: '0.5-1.0 л/га'
            },
            seoTitle: 'Anti-Stress для польових культур | Vitera',
            seoDescription: 'Антистресовий біостимулятор для кукурудзи, соняшнику та зернових.',
            categoryId: categories[1].id,
            programs: {
                connect: [{ id: cornProgram.id }]
            }
        }
    });
    await prisma.article.upsert({
        where: { slug: 'yak-pidibraty-dobryvo-dlya-soyi' },
        update: {},
        create: {
            slug: 'yak-pidibraty-dobryvo-dlya-soyi',
            title: 'Як підібрати добриво для сої',
            excerpt: 'Практичні орієнтири для вибору програм живлення сої за фазами розвитку.',
            content: 'Контент для блогу зберігається у CMS або БД та може бути імпортований із чинного сайту для SEO-міграції.',
            seoTitle: 'Як підібрати добриво для сої | Blog',
            seoDescription: 'Огляд факторів вибору добрив для сої та практичні поради агронома.',
            isPublished: true,
            publishedAt: new Date()
        }
    });
    await prisma.case.upsert({
        where: { slug: 'soybean-yield-case-polissya' },
        update: {},
        create: {
            slug: 'soybean-yield-case-polissya',
            title: 'Кейс підвищення врожайності сої на Поліссі',
            summary: 'Комбінація мікродобрив і корекції дефіциту бору підвищила рівномірність розвитку.',
            content: 'Тут зберігатиметься повний кейс із результатами, фото та агрономічним коментарем.',
            crop: 'соя',
            region: 'Полісся',
            outcome: '+0.34 т/га до контролю',
            seoTitle: 'Кейс по сої на Поліссі | Vitera',
            seoDescription: 'Результати застосування програми живлення сої у виробничих умовах.'
        }
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
