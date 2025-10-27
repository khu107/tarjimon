import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 언어 데이터 (다국어 지원)
  console.log('Seeding languages...');
  const languages = [
    {
      code: 'ko',
      nameUz: 'Koreys tili',
      nameRu: 'Корейский',
      nameEn: 'Korean',
    },
    {
      code: 'en',
      nameUz: 'Ingliz tili',
      nameRu: 'Английский',
      nameEn: 'English',
    },
    {
      code: 'zh',
      nameUz: 'Xitoy tili',
      nameRu: 'Китайский',
      nameEn: 'Chinese',
    },
    {
      code: 'vi',
      nameUz: 'Vyetnam tili',
      nameRu: 'Вьетнамский',
      nameEn: 'Vietnamese',
    },
    {
      code: 'th',
      nameUz: 'Tay tili',
      nameRu: 'Тайский',
      nameEn: 'Thai',
    },
    {
      code: 'uz',
      nameUz: 'Oʻzbek tili',
      nameRu: 'Узбекский',
      nameEn: 'Uzbek',
    },
    {
      code: 'id',
      nameUz: 'Indoneziya tili',
      nameRu: 'Индонезийский',
      nameEn: 'Indonesian',
    },
    {
      code: 'ru',
      nameUz: 'Rus tili',
      nameRu: 'Русский',
      nameEn: 'Russian',
    },
    {
      code: 'mn',
      nameUz: 'Moʻgʻul tili',
      nameRu: 'Монгольский',
      nameEn: 'Mongolian',
    },
    {
      code: 'km',
      nameUz: 'Kxmer tili',
      nameRu: 'Кхмерский',
      nameEn: 'Khmer',
    },
    {
      code: 'ne',
      nameUz: 'Nepal tili',
      nameRu: 'Непальский',
      nameEn: 'Nepali',
    },
    {
      code: 'my',
      nameUz: 'Birma tili',
      nameRu: 'Бирманский',
      nameEn: 'Burmese',
    },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }
  console.log(`${languages.length} languages created`);

  // 전문분야 데이터 (다국어 지원)
  console.log('💼 Seeding specializations...');
  const specializations = [
    {
      nameUz: 'Tibbiyot',
      nameRu: 'Медицина',
      nameEn: 'Medical',
    },
    {
      nameUz: 'Huquqiy',
      nameRu: 'Юридическая',
      nameEn: 'Legal',
    },
    {
      nameUz: 'Viza va immigratsiya',
      nameRu: 'Виза и иммиграция',
      nameEn: 'Immigration/Visa',
    },
    {
      nameUz: 'Umumiy/Kundalik',
      nameRu: 'Общая/Повседневная',
      nameEn: 'General/Daily',
    },
    {
      nameUz: 'Ish va mehnat',
      nameRu: 'Трудоустройство',
      nameEn: 'Employment/Labor',
    },
  ];

  for (const spec of specializations) {
    await prisma.specialization.create({
      data: spec,
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
