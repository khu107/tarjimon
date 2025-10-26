"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding...');
    console.log('Seeding languages...');
    const languages = [
        { code: 'ko', name: '한국어' },
        { code: 'en', name: 'English' },
        { code: 'zh', name: '中文' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'th', name: 'ภาษาไทย' },
        { code: 'uz', name: 'Oʻzbekcha' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'ru', name: 'Русский' },
        { code: 'mn', name: 'Монгол' },
        { code: 'km', name: 'ភាសាខ្មែរ' },
        { code: 'ne', name: 'नेपाली' },
        { code: 'my', name: 'မြန်မာဘာသာ' },
    ];
    for (const lang of languages) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: {},
            create: lang,
        });
    }
    console.log(`${languages.length} languages created`);
    console.log('Seeding specializations...');
    const specializations = [
        { name: '의료' },
        { name: '법률' },
        { name: '출입국/비자' },
        { name: '일반/생활' },
        { name: '고용/노동' },
    ];
    for (const spec of specializations) {
        await prisma.specialization.upsert({
            where: { name: spec.name },
            update: {},
            create: spec,
        });
    }
    console.log(`${specializations.length} specializations created`);
    console.log('Seeding completed!');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map