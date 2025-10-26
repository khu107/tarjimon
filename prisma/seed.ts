import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ===== 언어 마스터 데이터 =====
  console.log('Seeding languages...');

  const languages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' }, // xitoy (필수!)
    { code: 'vi', name: 'Tiếng Việt' }, // vetnam (필수!)
    { code: 'th', name: 'ภาษาไทย' }, // tailand (필수!)
    { code: 'uz', name: 'Oʻzbekcha' },
    { code: 'id', name: 'Bahasa Indonesia' }, // indonesia
    { code: 'ru', name: 'Русский' },
    { code: 'mn', name: 'Монгол' }, // mangol
    { code: 'km', name: 'ភាសាខ្មែរ' }, // kambodia
    { code: 'ne', name: 'नेपाली' }, // nepal
    { code: 'my', name: 'မြန်မာဘာသာ' }, // mianmar
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }

  console.log(`${languages.length} languages created`);

  // ===== 전문분야 마스터 데이터 =====
  console.log('Seeding specializations...');

  const specializations = [
    { name: '의료' }, // 병원, 약국, 건강보험
    { name: '법률' }, // 법률 상담, 소송
    { name: '출입국/비자' }, // 비자, 체류, 외국인등록
    { name: '일반/생활' }, // 일상 대화, 쇼핑, 은행 등
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
