import { PrismaClient, Gender, Role, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Categories ──────────────────────────────────
  const categoriesData = [
    { name: 'Áo thun', slug: 'ao-thun', description: 'Áo thun cơ bản và thời trang' },
    { name: 'Áo sơ mi', slug: 'ao-so-mi', description: 'Áo sơ mi công sở và dạo phố' },
    { name: 'Áo khoác', slug: 'ao-khoac', description: 'Áo khoác các loại' },
    { name: 'Quần dài', slug: 'quan-dai', description: 'Quần tây, jeans, kaki' },
    { name: 'Quần short', slug: 'quan-short', description: 'Quần short nam nữ' },
    { name: 'Váy đầm', slug: 'vay-dam', description: 'Váy dạo phố và dự tiệc' },
    { name: 'Đồ bộ', slug: 'do-bo', description: 'Đồ bộ mặc nhà' },
    { name: 'Đồ lót', slug: 'do-lot', description: 'Đồ lót nam nữ' },
    { name: 'Giày dép', slug: 'giay-dep', description: 'Giày thể thao, cao gót' },
    { name: 'Phụ kiện', slug: 'phu-kien', description: 'Mũ, kính, thắt lưng' },
  ];
  const categories = await Promise.all(
    categoriesData.map((c) =>
      prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }),
    ),
  );
  console.log(`  ✔ ${categories.length} categories`);

  // ── Brands ──────────────────────────────────────
  const brandsData = [
    { name: 'VIESTYLE', slug: 'viestyle' },
    { name: 'Local Brand X', slug: 'local-brand-x' },
    { name: 'Urban Basics', slug: 'urban-basics' },
    { name: 'Zara', slug: 'zara' },
    { name: 'H&M', slug: 'hm' },
    { name: 'Uniqlo', slug: 'uniqlo' },
    { name: 'Nike', slug: 'nike' },
    { name: 'Adidas', slug: 'adidas' },
    { name: 'Puma', slug: 'puma' },
    { name: 'Levis', slug: 'levis' },
  ];
  const brands = await Promise.all(
    brandsData.map((b) =>
      prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: b }),
    ),
  );
  console.log(`  ✔ ${brands.length} brands`);

  // ── Colors ──────────────────────────────────────
  const colorsData = [
    { name: 'Đen', hexCode: '#000000', tone: 'dark' },
    { name: 'Trắng', hexCode: '#FFFFFF', tone: 'light' },
    { name: 'Xám', hexCode: '#808080', tone: 'neutral' },
    { name: 'Navy', hexCode: '#001F3F', tone: 'dark' },
    { name: 'Be', hexCode: '#F5F5DC', tone: 'neutral' },
    { name: 'Xanh rêu', hexCode: '#4B5320', tone: 'dark' },
    { name: 'Nâu', hexCode: '#8B4513', tone: 'warm' },
    { name: 'Đỏ', hexCode: '#FF0000', tone: 'warm' },
    { name: 'Xanh lá', hexCode: '#00FF00', tone: 'light' },
    { name: 'Vàng', hexCode: '#FFFF00', tone: 'warm' },
  ];
  const colors = await Promise.all(
    colorsData.map((c) =>
      prisma.color.upsert({ where: { name: c.name }, update: {}, create: c }),
    ),
  );
  console.log(`  ✔ ${colors.length} colors`);

  // ── Sizes ──────────────────────────────────────
  const sizesData = [
    { name: 'XS', sortOrder: 1 },
    { name: 'S', sortOrder: 2 },
    { name: 'M', sortOrder: 3 },
    { name: 'L', sortOrder: 4 },
    { name: 'XL', sortOrder: 5 },
    { name: 'XXL', sortOrder: 6 },
    { name: '3XL', sortOrder: 7 },
    { name: 'Free Size', sortOrder: 8 },
    { name: '39', sortOrder: 9 },
    { name: '40', sortOrder: 10 },
  ];
  const sizes = await Promise.all(
    sizesData.map((s) =>
      prisma.size.upsert({ where: { name: s.name }, update: {}, create: s }),
    ),
  );
  console.log(`  ✔ ${sizes.length} sizes`);

  // ── Styles ──────────────────────────────────────
  const stylesData = [
    { name: 'Minimal', description: 'Phong cách tối giản' },
    { name: 'Streetwear', description: 'Phong cách đường phố' },
    { name: 'Smart Casual', description: 'Phong cách đi làm thoải mái' },
    { name: 'Sporty', description: 'Phong cách thể thao' },
    { name: 'Vintage', description: 'Phong cách hoài cổ' },
    { name: 'Office', description: 'Phong cách công sở cứng' },
    { name: 'Party', description: 'Đồ đi tiệc' },
    { name: 'Loungewear', description: 'Đồ mặc nhà' },
    { name: 'Y2K', description: 'Phong cách năm 2000' },
    { name: 'Grunge', description: 'Phong cách nổi loạn' },
  ];
  const styles = await Promise.all(
    stylesData.map((s) =>
      prisma.style.upsert({ where: { name: s.name }, update: {}, create: s }),
    ),
  );
  console.log(`  ✔ ${styles.length} styles`);

  // ── Shipping Methods ──────────────────────────────
  const shippingMethodsData = [
    { name: 'Giao hàng tiêu chuẩn', fee: 30000, estimatedDays: 5 },
    { name: 'Giao hàng nhanh', fee: 50000, estimatedDays: 2 },
    { name: 'Giao hàng hỏa tốc', fee: 80000, estimatedDays: 1 },
    { name: 'GHTK', fee: 32000, estimatedDays: 4 },
    { name: 'Viettel Post', fee: 35000, estimatedDays: 4 },
    { name: 'AhaMove', fee: 55000, estimatedDays: 1 },
    { name: 'GrabExpress', fee: 60000, estimatedDays: 1 },
    { name: 'Giao tiết kiệm', fee: 20000, estimatedDays: 7 },
    { name: 'CPN Nội Bài', fee: 40000, estimatedDays: 3 },
    { name: 'VNPost', fee: 25000, estimatedDays: 6 },
  ];
  const shippingMethods = await Promise.all(
    shippingMethodsData.map((s) =>
      prisma.shippingMethod.upsert({ where: { name: s.name }, update: {}, create: s }),
    ),
  );
  console.log(`  ✔ ${shippingMethods.length} shipping methods`);

  // ── Coupons ──────────────────────────────────────
  const couponsData = [
    { code: 'WELCOME10', discountType: DiscountType.PERCENTAGE, discountValue: 10, minOrderValue: 200000, maxDiscountValue: 50000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
    { code: 'FREESHIP50K', discountType: DiscountType.FIXED_AMOUNT, discountValue: 50000, minOrderValue: 300000, maxDiscountValue: 50000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
    { code: 'SUMMER20', discountType: DiscountType.PERCENTAGE, discountValue: 20, minOrderValue: 500000, maxDiscountValue: 100000, startDate: new Date('2024-06-01'), endDate: new Date('2030-08-31') },
    { code: 'WINTER30', discountType: DiscountType.PERCENTAGE, discountValue: 30, minOrderValue: 1000000, maxDiscountValue: 200000, startDate: new Date('2024-11-01'), endDate: new Date('2030-01-31') },
    { code: 'NEWYEAR50', discountType: DiscountType.FIXED_AMOUNT, discountValue: 500000, minOrderValue: 2000000, maxDiscountValue: 500000, startDate: new Date('2024-01-01'), endDate: new Date('2030-01-10') },
    { code: 'SALE15', discountType: DiscountType.PERCENTAGE, discountValue: 15, minOrderValue: 350000, maxDiscountValue: 70000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
    { code: 'VIP100K', discountType: DiscountType.FIXED_AMOUNT, discountValue: 100000, minOrderValue: 1000000, maxDiscountValue: 100000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
    { code: 'FLASH25', discountType: DiscountType.PERCENTAGE, discountValue: 25, minOrderValue: 400000, maxDiscountValue: 100000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
    { code: 'STREET10', discountType: DiscountType.PERCENTAGE, discountValue: 10, minOrderValue: 250000, maxDiscountValue: 40000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
    { code: 'BIRTHDAY', discountType: DiscountType.FIXED_AMOUNT, discountValue: 200000, minOrderValue: 500000, maxDiscountValue: 200000, startDate: new Date('2024-01-01'), endDate: new Date('2030-12-31') },
  ];
  const coupons = await Promise.all(
    couponsData.map((c) =>
      prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c }),
    ),
  );
  console.log(`  ✔ ${coupons.length} coupons`);

  // ── Products + SKUs ──────────────────────────────
  const productsData = [
    {
      name: 'Áo thun oversize basic', slug: 'ao-thun-oversize-basic', description: 'Áo thun form rộng, chất cotton 100%.', material: 'Cotton 100%', gender: 'UNISEX' as Gender, categorySlug: 'ao-thun', brandSlug: 'viestyle', styles: ['Minimal', 'Streetwear'], basePrice: 250000, colorNames: ['Đen', 'Trắng', 'Xám'],
    },
    {
      name: 'Áo thun cổ tròn regular fit', slug: 'ao-thun-co-tron-regular', description: 'Áo thun cổ tròn dáng vừa vặn.', material: 'Cotton pha', gender: 'UNISEX' as Gender, categorySlug: 'ao-thun', brandSlug: 'urban-basics', styles: ['Minimal', 'Smart Casual'], basePrice: 199000, colorNames: ['Đen', 'Trắng', 'Navy'],
    },
    {
      name: 'Áo sơ mi dài tay Oxford', slug: 'ao-so-mi-dai-tay-oxford', description: 'Áo sơ mi Oxford đi làm.', material: 'Oxford Cotton', gender: 'MALE' as Gender, categorySlug: 'ao-so-mi', brandSlug: 'viestyle', styles: ['Smart Casual', 'Office'], basePrice: 450000, colorNames: ['Trắng', 'Xám', 'Navy'],
    },
    {
      name: 'Áo sơ mi linen ngắn tay', slug: 'ao-so-mi-linen-ngan-tay', description: 'Áo sơ mi linen mùa hè.', material: 'Linen', gender: 'UNISEX' as Gender, categorySlug: 'ao-so-mi', brandSlug: 'local-brand-x', styles: ['Minimal', 'Vintage'], basePrice: 380000, colorNames: ['Trắng', 'Be', 'Xanh rêu'],
    },
    {
      name: 'Áo khoác bomber local', slug: 'ao-khoac-bomber-local', description: 'Áo khoác bomber 2 lớp.', material: 'Polyester', gender: 'UNISEX' as Gender, categorySlug: 'ao-khoac', brandSlug: 'local-brand-x', styles: ['Streetwear'], basePrice: 650000, colorNames: ['Đen', 'Xanh rêu', 'Nâu'],
    },
    {
      name: 'Áo khoác hoodie zip', slug: 'ao-khoac-hoodie-zip', description: 'Áo hoodie khóa kéo.', material: 'Nỉ bông', gender: 'UNISEX' as Gender, categorySlug: 'ao-khoac', brandSlug: 'viestyle', styles: ['Streetwear', 'Sporty'], basePrice: 550000, colorNames: ['Đen', 'Xám', 'Navy'],
    },
    {
      name: 'Quần dài kaki slim fit', slug: 'quan-dai-kaki-slim', description: 'Quần kaki mềm đi làm.', material: 'Kaki', gender: 'MALE' as Gender, categorySlug: 'quan-dai', brandSlug: 'urban-basics', styles: ['Smart Casual', 'Office'], basePrice: 420000, colorNames: ['Đen', 'Be', 'Nâu'],
    },
    {
      name: 'Quần jogger thể thao', slug: 'quan-dai-jogger-the-thao', description: 'Quần jogger nỉ da cá.', material: 'Nỉ', gender: 'UNISEX' as Gender, categorySlug: 'quan-dai', brandSlug: 'viestyle', styles: ['Sporty', 'Streetwear'], basePrice: 350000, colorNames: ['Đen', 'Xám'],
    },
    {
      name: 'Quần short đũi nam', slug: 'quan-short-dui-nam', description: 'Quần short thoáng mát.', material: 'Đũi', gender: 'MALE' as Gender, categorySlug: 'quan-short', brandSlug: 'local-brand-x', styles: ['Minimal', 'Loungewear'], basePrice: 280000, colorNames: ['Be', 'Trắng', 'Xanh rêu'],
    },
    {
      name: 'Quần short thể thao nữ', slug: 'quan-short-the-thao-nu', description: 'Quần short lót trong.', material: 'Dry-fit', gender: 'FEMALE' as Gender, categorySlug: 'quan-short', brandSlug: 'adidas', styles: ['Sporty'], basePrice: 220000, colorNames: ['Đen', 'Xám', 'Navy'],
    },
  ];

  const sizeNames = ['S', 'M', 'L'];

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

    // SKUs
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
            stock: 20,
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
    update: { passwordHash: hashedPassword },
    create: {
      email: 'admin@viestyle.vn',
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      profile: { create: { fullName: 'VIESTYLE Admin' } },
    },
  });
  console.log(`  ✔ Default Admin user: ${adminUser.email}`);

  console.log('\\nSeeding completed successfully! 🚀');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
