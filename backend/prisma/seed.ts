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
      name: 'Áo thun oversize basic', 
      slug: 'ao-thun-oversize-basic', 
      description: 'Áo thun form rộng, chất cotton 100%, thoáng mát và bền bỉ. Phù hợp cho mọi hoạt động hàng ngày.', 
      material: 'Cotton 100%', 
      gender: 'UNISEX' as Gender, 
      categorySlug: 'ao-thun', 
      brandSlug: 'viestyle', 
      styles: ['Minimal', 'Streetwear'], 
      basePrice: 250000, 
      colorNames: ['Đen', 'Trắng', 'Xám'],
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571945153237-4929e783ee4a?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo thun cổ tròn regular fit', 
      slug: 'ao-thun-co-tron-regular', 
      description: 'Áo thun cổ tròn dáng vừa vặn, tôn dáng người mặc. Phù hợp cho phong cách tối giản.', 
      material: 'Cotton pha', 
      gender: 'UNISEX' as Gender, 
      categorySlug: 'ao-thun', 
      brandSlug: 'urban-basics', 
      styles: ['Minimal', 'Smart Casual'], 
      basePrice: 199000, 
      colorNames: ['Đen', 'Trắng', 'Navy'],
      thumbnail: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo sơ mi dài tay Oxford', 
      slug: 'ao-so-mi-dai-tay-oxford', 
      description: 'Áo sơ mi Oxford chất liệu cao cấp, ít nhăn, dễ ủi. Sự lựa chọn hoàn hảo cho dân văn phòng.', 
      material: 'Oxford Cotton', 
      gender: 'MALE' as Gender, 
      categorySlug: 'ao-so-mi', 
      brandSlug: 'viestyle', 
      styles: ['Smart Casual', 'Office'], 
      basePrice: 450000, 
      colorNames: ['Trắng', 'Xám', 'Navy'],
      thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo sơ mi linen ngắn tay', 
      slug: 'ao-so-mi-linen-ngan-tay', 
      description: 'Chất liệu linen tự nhiên, thấm hút mồ hôi tốt. Mang lại cảm giác thoải mái trong những ngày hè.', 
      material: 'Linen', 
      gender: 'UNISEX' as Gender, 
      categorySlug: 'ao-so-mi', 
      brandSlug: 'local-brand-x', 
      styles: ['Minimal', 'Vintage'], 
      basePrice: 380000, 
      colorNames: ['Trắng', 'Be', 'Xanh rêu'],
      thumbnail: 'https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1626497748470-2819bc264e1c?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo khoác bomber local', 
      slug: 'ao-khoac-bomber-local', 
      description: 'Áo khoác bomber 2 lớp, thiết kế hiện đại, phối được với nhiều loại trang phục khác nhau.', 
      material: 'Polyester', 
      gender: 'UNISEX' as Gender, 
      categorySlug: 'ao-khoac', 
      brandSlug: 'local-brand-x', 
      styles: ['Streetwear'], 
      basePrice: 650000, 
      colorNames: ['Đen', 'Xanh rêu', 'Nâu'],
      thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo khoác hoodie zip', 
      slug: 'ao-khoac-hoodie-zip', 
      description: 'Áo hoodie khóa kéo, chất nỉ bông dày dặn, giữ ấm tốt. Form áo hiện đại.', 
      material: 'Nỉ bông', 
      gender: 'UNISEX' as Gender, 
      categorySlug: 'ao-khoac', 
      brandSlug: 'viestyle', 
      styles: ['Streetwear', 'Sporty'], 
      basePrice: 550000, 
      colorNames: ['Đen', 'Xám', 'Navy'],
      thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Quần dài kaki slim fit', 
      slug: 'quan-dai-kaki-slim', 
      description: 'Quần kaki dáng slim fit ôm vừa phải, chất vải co giãn nhẹ. Thoải mái vận động suốt ngày dài.', 
      material: 'Kaki', 
      gender: 'MALE' as Gender, 
      categorySlug: 'quan-dai', 
      brandSlug: 'urban-basics', 
      styles: ['Smart Casual', 'Office'], 
      basePrice: 420000, 
      colorNames: ['Đen', 'Be', 'Nâu'],
      thumbnail: 'https://images.unsplash.com/photo-1473966968600-fa804b86940a?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1473966968600-fa804b86940a?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Quần jogger thể thao', 
      slug: 'quan-dai-jogger-the-thao', 
      description: 'Quần jogger chất nỉ da cá, phù hợp cho việc tập luyện hoặc mặc ở nhà.', 
      material: 'Nỉ', 
      gender: 'UNISEX' as Gender, 
      categorySlug: 'quan-dai', 
      brandSlug: 'viestyle', 
      styles: ['Sporty', 'Streetwear'], 
      basePrice: 350000, 
      colorNames: ['Đen', 'Xám'],
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Váy dạo phố hoa nhí',
      slug: 'vay-dao-pho-hoa-nhi',
      description: 'Váy hoa nhí phong cách trẻ trung, nữ tính. Chất liệu voan mềm mại.',
      material: 'Voan',
      gender: 'FEMALE' as Gender,
      categorySlug: 'vay-dam',
      brandSlug: 'zara',
      styles: ['Minimal', 'Vintage'],
      basePrice: 490000,
      colorNames: ['Trắng', 'Đỏ', 'Vàng'],
      thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Giày Sneaker Streetwear',
      slug: 'giay-sneaker-streetwear',
      description: 'Giày sneaker phong cách đường phố, êm chân, bền bỉ.',
      material: 'Da / Cao su',
      gender: 'UNISEX' as Gender,
      categorySlug: 'giay-dep',
      brandSlug: 'nike',
      styles: ['Streetwear', 'Sporty'],
      basePrice: 1200000,
      colorNames: ['Trắng', 'Đen', 'Navy'],
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Túi xách Tote Canvas',
      slug: 'tui-xach-tote-canvas',
      description: 'Túi Tote chất liệu canvas dày dặn, in hình nghệ thuật.',
      material: 'Canvas',
      gender: 'FEMALE' as Gender,
      categorySlug: 'phu-kien',
      brandSlug: 'local-brand-x',
      styles: ['Minimal', 'Vintage'],
      basePrice: 150000,
      colorNames: ['Be', 'Đen'],
      thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594235412402-b5cae4817a9a?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Mũ lưỡi trai Basic',
      slug: 'mu-luoi-trai-basic',
      description: 'Mũ lưỡi trai thêu logo đơn giản, form chuẩn.',
      material: 'Kaki cotton',
      gender: 'UNISEX' as Gender,
      categorySlug: 'phu-kien',
      brandSlug: 'viestyle',
      styles: ['Minimal', 'Streetwear'],
      basePrice: 120000,
      colorNames: ['Đen', 'Trắng', 'Navy', 'Xanh rêu'],
      thumbnail: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo thun Polo cá sấu',
      slug: 'ao-thun-polo-ca-sau',
      description: 'Áo thun Polo chất vải cá sấu co giãn 4 chiều, giữ form tốt.',
      material: 'Pique Cotton',
      gender: 'MALE' as Gender,
      categorySlug: 'ao-thun',
      brandSlug: 'urban-basics',
      styles: ['Smart Casual', 'Office'],
      basePrice: 320000,
      colorNames: ['Trắng', 'Đen', 'Navy', 'Xám'],
      thumbnail: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Quần Jeans Straight Fit',
      slug: 'quan-jeans-straight-fit',
      description: 'Quần Jeans dáng đứng cổ điển, bền màu.',
      material: 'Denim',
      gender: 'MALE' as Gender,
      categorySlug: 'quan-dai',
      brandSlug: 'levis',
      styles: ['Streetwear', 'Vintage'],
      basePrice: 850000,
      colorNames: ['Navy', 'Đen'],
      thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Chân váy Tennis ngắn',
      slug: 'chan-vay-tennis-ngan',
      description: 'Chân váy xếp ly phong cách thể thao nữ tính.',
      material: 'Polyester pha',
      gender: 'FEMALE' as Gender,
      categorySlug: 'vay-dam',
      brandSlug: 'local-brand-x',
      styles: ['Sporty', 'Y2K'],
      basePrice: 280000,
      colorNames: ['Trắng', 'Đen'],
      thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1627576561502-30fb15e57620?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Áo khoác gió dù',
      slug: 'ao-khoac-gio-du',
      description: 'Áo khoác gió mỏng nhẹ, chống tia UV.',
      material: 'Nylon',
      gender: 'UNISEX' as Gender,
      categorySlug: 'ao-khoac',
      brandSlug: 'uniqlo',
      styles: ['Minimal', 'Sporty'],
      basePrice: 390000,
      colorNames: ['Xám', 'Navy', 'Xanh rêu'],
      thumbnail: 'https://images.unsplash.com/photo-1620403775050-6a9718fc8067?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1620403775050-6a9718fc8067?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Bộ đồ mặc nhà lụa',
      slug: 'bo-do-mac-nha-lua',
      description: 'Bộ đồ pijama lụa mềm mại, sang trọng.',
      material: 'Lụa Satin',
      gender: 'FEMALE' as Gender,
      categorySlug: 'do-bo',
      brandSlug: 'zara',
      styles: ['Loungewear'],
      basePrice: 450000,
      colorNames: ['Be', 'Trắng', 'Đỏ'],
      thumbnail: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1590608897129-79da98d15969?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Giày chạy bộ Performance',
      slug: 'giay-chay-bo-performance',
      description: 'Giày chuyên dụng cho chạy bộ, công nghệ đệm khí.',
      material: 'Mesh / Poly',
      gender: 'UNISEX' as Gender,
      categorySlug: 'giay-dep',
      brandSlug: 'adidas',
      styles: ['Sporty'],
      basePrice: 1800000,
      colorNames: ['Đen', 'Xám', 'Trắng'],
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552346154-21d328109a27?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      name: 'Thắt lưng da bò thật',
      slug: 'that-lung-da-bo-that',
      description: 'Thắt lưng da bò nguyên tấm, khóa kim loại không gỉ.',
      material: 'Da bò',
      gender: 'MALE' as Gender,
      categorySlug: 'phu-kien',
      brandSlug: 'levis',
      styles: ['Office', 'Minimal'],
      basePrice: 350000,
      colorNames: ['Đen', 'Nâu'],
      thumbnail: 'https://images.unsplash.com/photo-1624222247344-550fbadec94f?q=80&w=1000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1624222247344-550fbadec94f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1624388301533-333e660fd63a?q=80&w=1000&auto=format&fit=crop'
      ]
    }
  ];

  const sizeNames = ['S', 'M', 'L'];

  for (const pData of productsData) {
    const category = categories.find((c) => c.slug === pData.categorySlug)!;
    const brand = brands.find((b) => b.slug === pData.brandSlug)!;

    const product = await prisma.product.upsert({
      where: { slug: pData.slug },
      update: {
        name: pData.name,
        thumbnail: pData.thumbnail,
        images: pData.images || [],
      },
      create: {
        name: pData.name,
        slug: pData.slug,
        description: pData.description,
        material: pData.material,
        gender: pData.gender,
        thumbnail: pData.thumbnail,
        images: pData.images || [],
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
