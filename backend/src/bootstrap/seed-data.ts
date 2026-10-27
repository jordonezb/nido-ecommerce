/**
 * Datos iniciales para el Auto-Seed del catálogo Nido Colombia y usuarios de demostración.
 * Cumple con los requerimientos de la prueba técnica TANKU:
 * - 2 Usuarios: Mateo (GIVER) y Valentina (RECEIVER con preferencias).
 * - 8 Productos que cubren las 5 categorías requeridas: Moda, Tecnología, Hogar, Belleza, Experiencias.
 * - Rango de precio: $85.000 COP a $220.000 COP (alrededor del ticket promedio de $95.000 COP).
 * - Imágenes reales de Unsplash y variantes completas en JSON.
 */

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'GIVER' | 'RECEIVER' | 'CUSTOMER';
  preferencesJson: string[];
}

export interface SeedProductVariant {
  [key: string]: string | number;
  id: string;
  name: string;
  stock: number;
  sku: string;
}

export interface SeedProduct {
  id: string;
  title: string;
  brand: string;
  category: 'Moda' | 'Tecnología' | 'Hogar' | 'Belleza' | 'Experiencias';
  priceCop: number;
  image: string;
  description: string;
  variantsJson: SeedProductVariant[];
  tagsJson: string[];
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'user-mateo',
    name: 'Mateo Gómez',
    email: 'mateo@nido.com.co',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    role: 'GIVER',
    preferencesJson: ['diseño sostenible', 'arquitectura', 'fotografia analoga'],
  },
  {
    id: 'user-valentina',
    name: 'Valentina Ríos',
    email: 'valentina@nido.com.co',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    role: 'RECEIVER',
    preferencesJson: [
      'cafe de especialidad',
      'audio hi-fi',
      'minimalismo',
      'bienestar',
      'experiencias gastronomicas',
    ],
  },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  // 1. MODA - Prenda Premium
  {
    id: 'prod-moda-1',
    title: 'Chaqueta Denim Oversize Nido Vintage',
    brand: 'Nido Studio Medellín',
    category: 'Moda',
    priceCop: 145000,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    description: 'Chaqueta de mezclilla 100% algodón colombiano con lavado vintage artesanal y corte oversize relajado.',
    variantsJson: [
      { id: 's-vintage', name: 'Talla S - Lavado Vintage Claro', stock: 12, sku: 'ND-DNM-S' },
      { id: 'm-vintage', name: 'Talla M - Lavado Vintage Claro', stock: 18, sku: 'ND-DNM-M' },
      { id: 'l-vintage', name: 'Talla L - Lavado Vintage Claro', stock: 10, sku: 'ND-DNM-L' },
    ],
    tagsJson: ['moda', 'denim', 'oversize', 'minimalismo', 'urbano'],
  },
  // 2. MODA - Confort Minimalista
  {
    id: 'prod-moda-2',
    title: 'Hoodie Algodón Orgánico Minimal',
    brand: 'Nido Basics',
    category: 'Moda',
    priceCop: 115000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: 'Saco hoodie con capucha en felpa de algodón orgánico perchado. Suavidad extrema y silueta boxy contemporánea.',
    variantsJson: [
      { id: 'arena-s', name: 'Color Arena - Talla S', stock: 15, sku: 'ND-HD-ARS' },
      { id: 'arena-m', name: 'Color Arena - Talla M', stock: 20, sku: 'ND-HD-ARM' },
      { id: 'oliva-m', name: 'Color Oliva Zen - Talla M', stock: 14, sku: 'ND-HD-OLM' },
    ],
    tagsJson: ['moda', 'minimalismo', 'confort', 'sostenible', 'bienestar'],
  },
  // 3. TECNOLOGÍA - Audio Hi-Fi
  {
    id: 'prod-tec-1',
    title: 'Audífonos Inalámbricos Hi-Fi Nido Sound Pure',
    brand: 'Acoustic Labs',
    category: 'Tecnología',
    priceCop: 195000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Cancelación activa de ruido ambiental, drivers de 40mm con sonido espacial y hasta 35 horas de autonomía.',
    variantsJson: [
      { id: 'negro-mate', name: 'Edición Negro Mate Titán', stock: 25, sku: 'AL-HIFI-BLK' },
      { id: 'plata-glaciar', name: 'Edición Plata Glaciar', stock: 16, sku: 'AL-HIFI-SLV' },
    ],
    tagsJson: ['tecnologia', 'audio hi-fi', 'minimalismo', 'inalambrico', 'trabajo'],
  },
  // 4. TECNOLOGÍA - Parlante Nórdico
  {
    id: 'prod-tec-2',
    title: 'Parlante Bluetooth Portátil Acabado Nogal',
    brand: 'Nordic Sound',
    category: 'Tecnología',
    priceCop: 155000,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    description: 'Sonido estéreo envolvente de 360 grados recubierto en madera natural de nogal y rejilla de tela acústica.',
    variantsJson: [
      { id: 'madera-nogal', name: 'Madera Natural de Nogal', stock: 18, sku: 'NS-SPK-WNT' },
      { id: 'roble-claro', name: 'Madera Roble Escandinavo', stock: 11, sku: 'NS-SPK-OAK' },
    ],
    tagsJson: ['tecnologia', 'audio hi-fi', 'minimalismo', 'hogar', 'diseño'],
  },
  // 5. HOGAR - Café de Especialidad
  {
    id: 'prod-hog-1',
    title: 'Set Barista Prensa Francesa & Café Geisha Huila',
    brand: 'Café de Origen Colombia',
    category: 'Hogar',
    priceCop: 98000,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    description: 'Prensa francesa de émbolo en vidrio borosilicato y acero inoxidable + 250g de Café Geisha cultivado a 1.850 msnm.',
    variantsJson: [
      { id: 'molienda-media', name: 'Prensa + Café Molienda Media (Ideal Prensa)', stock: 30, sku: 'CF-SET-MED' },
      { id: 'grano-entero', name: 'Prensa + Café en Grano Tostado', stock: 20, sku: 'CF-SET-GRN' },
    ],
    tagsJson: ['hogar', 'cafe de especialidad', 'experiencias gastronomicas', 'bienestar'],
  },
  // 6. HOGAR - Difusor Aromaterapia
  {
    id: 'prod-hog-2',
    title: 'Difusor Ultrasónico Cerámica & Dúo Aceites Esenciales',
    brand: 'Aura Botánica',
    category: 'Hogar',
    priceCop: 128000,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    description: 'Difusor silencioso con cúpula de cerámica artesanal, luz cálida tenue y aceites puros de Lavanda y Bergamota.',
    variantsJson: [
      { id: 'ceramica-blanca', name: 'Cerámica Blanca Zen + Lavanda & Eucalipto', stock: 22, sku: 'AB-DIF-WHT' },
      { id: 'ceramica-terracota', name: 'Cerámica Terracota + Bergamota & Cedro', stock: 15, sku: 'AB-DIF-TER' },
    ],
    tagsJson: ['hogar', 'bienestar', 'minimalismo', 'relajacion'],
  },
  // 7. BELLEZA - Cuidado Botánico
  {
    id: 'prod-bel-1',
    title: 'Kit Ritual Botánico Facial Revitalizante',
    brand: 'Piel Pura Lab',
    category: 'Belleza',
    priceCop: 89000,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    description: 'Sérum antioxidante de Vitamina C estabilizada + Gel hidratante con Ácido Hialurónico vegetal y extracto de té verde.',
    variantsJson: [
      { id: 'kit-dia-noche', name: 'Edición Completa Dúo Día & Noche (30ml c/u)', stock: 35, sku: 'PP-KIT-FAC' },
    ],
    tagsJson: ['belleza', 'bienestar', 'cuidado-personal', 'organico', 'minimalismo'],
  },
  // 8. EXPERIENCIAS - Cata Gastronómica
  {
    id: 'prod-exp-1',
    title: 'Cata Guiada de Café Especialidad & Repostería de Autor',
    brand: 'Nido Experience Labs',
    category: 'Experiencias',
    priceCop: 165000,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    description: 'Experiencia inmersiva para 2 personas con barista certificado: degustación de 4 variedades exóticas y maridaje dulce.',
    variantsJson: [
      { id: 'bogota-sab', name: 'Sede Chapinero (Bogotá) - Cupo 2 personas', stock: 12, sku: 'EXP-BOG-2P' },
      { id: 'medellin-sab', name: 'Sede El Poblado (Medellín) - Cupo 2 personas', stock: 10, sku: 'EXP-MED-2P' },
    ],
    tagsJson: ['experiencias', 'cafe de especialidad', 'experiencias gastronomicas', 'bienestar'],
  },
];
