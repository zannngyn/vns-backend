import { PrismaClient, Gender, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Categories ──────────────────────────────────
  const categories = await Promise.all(
    [
      { name: 'Áo thun', slug: 'ao-thun' },
      { name: 'Áo sơ mi', slug: 'ao-so-mi' },
      { name: 'Áo khoác', slug: 'ao-khoac' },
      { name: 'Quần dài', slug: 'quan-dai' },
      { name: 'Quần short', slug: 'quan-short' },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      }),
    ),
  );
  console.log(`  ✔ ${categories.length} categories`);

  // ── Brands ──────────────────────────────────────
  const brands = await Promise.all(
    [
      { name: 'VIESTYLE', slug: 'viestyle', logo: null },
      { name: 'Local Brand X', slug: 'local-brand-x', logo: null },
      { name: 'Urban Basics', slug: 'urban-basics', logo: null },
    ].map((b) =>
      prisma.brand.upsert({
        where: { slug: b.slug },
        update: {},
        create: b,
      }),
    ),
  );
  console.log(`${brands.length} brands`);

  // ── Colors ──────────────────────────────────────
  const colorsData = [
    { name: 'Đen', hexCode: '#000000', tone: 'dark' },
    { name: 'Trắng', hexCode: '#FFFFFF', tone: 'light' },
    { name: 'Xám', hexCode: '#808080', tone: 'neutral' },
    { name: 'Navy', hexCode: '#001F3F', tone: 'dark' },
    { name: 'Be', hexCode: '#F5F5DC', tone: 'neutral' },
    { name: 'Xanh rêu', hexCode: '#4B5320', tone: 'dark' },
    { name: 'Nâu', hexCode: '#8B4513', tone: 'warm' },
  ];
  const colors = await Promise.all(
    colorsData.map((c) =>
      prisma.color.upsert({
        where: { name: c.name },
        update: {},
        create: c,
      }),
    ),
  );
  console.log(`  ✔ ${colors.length} colors`);

  // ── Sizes ──────────────────────────────────────
  const sizesData = [
    { name: 'S', sortOrder: 1 },
    { name: 'M', sortOrder: 2 },
    { name: 'L', sortOrder: 3 },
    { name: 'XL', sortOrder: 4 },
    { name: 'XXL', sortOrder: 5 },
  ];
  const sizes = await Promise.all(
    sizesData.map((s) =>
      prisma.size.upsert({
        where: { name: s.name },
        update: {},
        create: s,
      }),
    ),
  );
  console.log(`${sizes.length} sizes`);

  // ── Styles ──────────────────────────────────────
  const stylesData = [
    { name: 'Minimal', description: 'Phong cách tối giản, gọn gàng' },
    { name: 'Streetwear', description: 'Phong cách đường phố, năng động' },
    { name: 'Smart Casual', description: 'Phong cách bán trang trọng, đi làm' },
    { name: 'Sporty', description: 'Phong cách thể thao, khỏe khoắn' },
    { name: 'Vintage', description: 'Phong cách cổ điển, hoài niệm' },
  ];
  const styles = await Promise.all(
    stylesData.map((s) =>
      prisma.style.upsert({
        where: { name: s.name },
        update: {},
        create: s,
      }),
    ),
  );
  console.log(`${styles.length} styles`);

  // ── Shipping Methods ──────────────────────────────
  const shippingMethods = await Promise.all(
    [
      { name: 'Giao hàng tiêu chuẩn', fee: 30000, estimatedDays: 5 },
      { name: 'Giao hàng nhanh', fee: 50000, estimatedDays: 2 },
      { name: 'Giao hàng hỏa tốc', fee: 80000, estimatedDays: 1 },
    ].map((s) =>
      prisma.shippingMethod.upsert({
        where: { name: s.name },
        update: {},
        create: s,
      }),
    ),
  );
  console.log(`${shippingMethods.length} shipping methods`);

  // ── Products + SKUs ──────────────────────────────
  const productsData = [
    {
      name: 'Áo thun oversize basic',
      slug: 'ao-thun-oversize-basic',
      description: 'Áo thun oversize form rộng, chất cotton 100%, thoáng mát. Phù hợp mặc hàng ngày.',
      material: 'Cotton 100%',
      gender: Gender.UNISEX,
      categorySlug: 'ao-thun',
      brandSlug: 'viestyle',
      styles: ['Minimal', 'Streetwear'],
      basePrice: 250000,
      colorNames: ['Đen', 'Trắng', 'Xám'],
    },
    {
      name: 'Áo thun cổ tròn regular fit',
      slug: 'ao-thun-co-tron-regular',
      description: 'Áo thun cổ tròn dáng vừa vặn. Chất liệu cotton pha, co giãn tốt.',
      material: 'Cotton pha Spandex',
      gender: Gender.UNISEX,
      categorySlug: 'ao-thun',
      brandSlug: 'urban-basics',
      styles: ['Minimal', 'Smart Casual'],
      basePrice: 199000,
      colorNames: ['Đen', 'Trắng', 'Navy'],
    },
    {
      name: 'Áo sơ mi dài tay Oxford',
      slug: 'ao-so-mi-dai-tay-oxford',
      description: 'Áo sơ mi Oxford dài tay, cổ đứng, phù hợp đi làm văn phòng hoặc đi chơi.',
      material: 'Oxford Cotton',
      gender: Gender.MALE,
      categorySlug: 'ao-so-mi',
      brandSlug: 'viestyle',
      styles: ['Smart Casual'],
      basePrice: 450000,
      colorNames: ['Trắng', 'Xám', 'Navy'],
    },
    {
      name: 'Áo sơ mi linen ngắn tay',
      slug: 'ao-so-mi-linen-ngan-tay',
      description: 'Áo sơ mi linen tự nhiên, thoáng mát cho mùa hè. Form regular.',
      material: 'Linen',
      gender: Gender.UNISEX,
      categorySlug: 'ao-so-mi',
      brandSlug: 'local-brand-x',
      styles: ['Minimal', 'Vintage'],
      basePrice: 380000,
      colorNames: ['Trắng', 'Be', 'Xanh rêu'],
    },
    {
      name: 'Áo khoác bomber local brand',
      slug: 'ao-khoac-bomber-local',
      description: 'Áo khoác bomber 2 lớp, chất vải dù chống nước nhẹ. Có lót bên trong.',
      material: 'Vải dù pha Polyester',
      gender: Gender.UNISEX,
      categorySlug: 'ao-khoac',
      brandSlug: 'local-brand-x',
      styles: ['Streetwear'],
      basePrice: 650000,
      colorNames: ['Đen', 'Xanh rêu', 'Nâu'],
    },
    {
      name: 'Áo khoác hoodie zip',
      slug: 'ao-khoac-hoodie-zip',
      description: 'Áo hoodie có khóa kéo, chất nỉ bông dày dặn. Form oversize.',
      material: 'Nỉ bông 350gsm',
      gender: Gender.UNISEX,
      categorySlug: 'ao-khoac',
      brandSlug: 'viestyle',
      styles: ['Streetwear', 'Sporty'],
      basePrice: 550000,
      colorNames: ['Đen', 'Xám', 'Navy'],
    },
    {
      name: 'Quần dài kaki slim fit',
      slug: 'quan-dai-kaki-slim',
      description: 'Quần kaki dáng ôm vừa phải, chất vải kaki mềm co giãn. Phù hợp đi làm.',
      material: 'Kaki pha Spandex',
      gender: Gender.MALE,
      categorySlug: 'quan-dai',
      brandSlug: 'urban-basics',
      styles: ['Smart Casual', 'Minimal'],
      basePrice: 420000,
      colorNames: ['Đen', 'Be', 'Nâu'],
    },
    {
      name: 'Quần dài jogger thể thao',
      slug: 'quan-dai-jogger-the-thao',
      description: 'Quần jogger bo gấu, chất nỉ da cá co giãn. Phù hợp tập gym và casual.',
      material: 'Nỉ da cá Polyester',
      gender: Gender.UNISEX,
      categorySlug: 'quan-dai',
      brandSlug: 'viestyle',
      styles: ['Sporty', 'Streetwear'],
      basePrice: 350000,
      colorNames: ['Đen', 'Xám'],
    },
    {
      name: 'Quần short đũi nam',
      slug: 'quan-short-dui-nam',
      description: 'Quần short đũi thoáng mát, dáng rộng thoải mái cho mùa hè.',
      material: 'Đũi Cotton',
      gender: Gender.MALE,
      categorySlug: 'quan-short',
      brandSlug: 'local-brand-x',
      styles: ['Minimal', 'Vintage'],
      basePrice: 280000,
      colorNames: ['Be', 'Trắng', 'Xanh rêu'],
    },
    {
      name: 'Quần short thể thao nữ',
      slug: 'quan-short-the-thao-nu',
      description: 'Quần short thể thao nữ, có lót trong, chất vải khô nhanh.',
      material: 'Polyester Dry-fit',
      gender: Gender.FEMALE,
      categorySlug: 'quan-short',
      brandSlug: 'urban-basics',
      styles: ['Sporty'],
      basePrice: 220000,
      colorNames: ['Đen', 'Xám', 'Navy'],
    },
  ];

  const sizeNames = ['S', 'M', 'L', 'XL'];

  for (const pData of productsData) {
    const category = categories.find((c) => c.slug === pData.categorySlug)!;
    const brand = brands.find((b) => b.slug === pData.brandSlug)!;

    const product = await prisma.product.upsert({
      where: { slug: pData.slug },
      update: {},
      create: {
        name: pData.name,
        slug: pData.slug,
        description: pData.description,
        material: pData.material,
        gender: pData.gender,
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    // Style tags
    for (const styleName of pData.styles) {
      const style = styles.find((s) => s.name === styleName)!;
      await prisma.productStyleTag.upsert({
        where: {
          productId_styleId: { productId: product.id, styleId: style.id },
        },
        update: {},
        create: { productId: product.id, styleId: style.id },
      });
    }

    // SKUs (color × size combinations)
    for (const colorName of pData.colorNames) {
      const color = colors.find((c) => c.name === colorName)!;
      for (const sizeName of sizeNames) {
        const size = sizes.find((s) => s.name === sizeName)!;
        const skuCode = `${pData.slug}-${colorName.toLowerCase().replace(/\s/g, '')}-${sizeName.toLowerCase()}`;

        await prisma.productSku.upsert({
          where: { skuCode },
          update: {},
          create: {
            skuCode,
            price: pData.basePrice,
            stock: Math.floor(Math.random() * 50) + 10,
            productId: product.id,
            colorId: color.id,
            sizeId: size.id,
          },
        });
      }
    }
  }
  console.log(`  ✔ ${productsData.length} products with SKUs & style tags`);

  // ── Admin User ──────────────────────────────────
  const adminPassword = 'admin';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@viestyle.vn' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: 'admin@viestyle.vn',
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          fullName: 'VIESTYLE Admin',
        },
      },
    },
  });
  console.log(`Admin user: ${adminUser.email}`);

  console.log('\nSeeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
