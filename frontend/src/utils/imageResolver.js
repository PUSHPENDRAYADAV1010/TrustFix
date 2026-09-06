/**
 * TrustFix Central Image & Avatar Resolver
 * Provides deterministic, high-quality, category- and service-specific imagery
 * so each home service and provider has a relevant, distinct visual representation without duplicates.
 */

// Category default banner / card images (Curated, vibrant, 100% distinct)
const CATEGORY_IMAGES = {
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
  plumbing: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
  'ac-repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
  'ac repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
  ac: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
  'appliance-repair': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80',
  'appliance repair': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80',
  appliance: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80',
  painting: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
  carpentry: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
  'pest-control': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80',
  'pest control': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80',
};

// Specific service images sequenced logically by trade and granular task
const SERVICE_IMAGES = [
  // 1. Electrical Sequencing
  { keywords: ['switchboard', 'socket', 'modular', 'mcb', 'switch'], url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['wiring', 'cable', 'rewiring', 'short circuit', 'wire'], url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['fan', 'light', 'chandelier', 'bulb', 'fixture', 'fitting'], url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['inverter', 'fuse', 'power trip', 'voltage', 'generator'], url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['electrical repair', 'electrician', 'electrical inspection'], url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80' },

  // 2. Plumbing Sequencing
  { keywords: ['bathroom fixture', 'washbasin', 'shower', 'mixer tap', 'faucet', 'sanitary'], url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['leak', 'drain', 'pipe', 'flush', 'clog', 'sewage', 'tap repair', 'plumbing repair'], url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['water tank', 'motor', 'pump', 'overhead tank'], url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['geyser', 'water heater', 'boiler'], url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80' },

  // 3. Cleaning Sequencing
  { keywords: ['kitchen', 'chimney', 'degreasing', 'gas stove', 'cabinet clean'], url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['bathroom', 'toilet', 'tile scrubbing', 'washroom'], url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['sofa', 'carpet', 'upholstery', 'mattress', 'couch'], url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['full home', 'deep clean', 'sanitization', 'deep cleaning', 'home cleaning'], url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80' },

  // 4. AC Repair Sequencing
  { keywords: ['gas refill', 'cooling', 'refrigerant', 'gas charging', 'freon'], url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['jet service', 'jet cleaning', 'coil clean', 'deep jet', 'servicing'], url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['installation', 'uninstallation', 'split ac', 'window ac', 'compressor'], url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&auto=format&fit=crop&q=80' },

  // 5. Appliance Repair Sequencing
  { keywords: ['washing machine', 'laundry', 'front load', 'top load', 'drum'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['refrigerator', 'fridge', 'freezer', 'double door', 'single door'], url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['microwave', 'oven', 'stove', 'induction', 'chimney repair'], url: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80' },

  // 6. Painting Sequencing
  { keywords: ['interior wall', 'emulsion', 'roller', 'touch-up', 'primer', 'painting'], url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['exterior', 'waterproofing', 'dampness', 'seepage', 'texture'], url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80' },

  // 7. Carpentry Sequencing
  { keywords: ['door lock', 'lock', 'latch', 'handle', 'hinge', 'door repair'], url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80' },
  { keywords: ['furniture', 'wood', 'table', 'chair', 'bed', 'wardrobe', 'cabinet'], url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80' },
];

/**
 * Resolves a high-quality, relevant image for a service
 */
export const resolveServiceImage = (service = {}) => {
  // If backend provided a valid specific image URL, use it
  if (service.imageUrl && service.imageUrl.startsWith('http') && !service.imageUrl.includes('placeholder')) {
    return service.imageUrl;
  }
  if (service.image && service.image.startsWith('http') && !service.image.includes('placeholder')) {
    return service.image;
  }

  const nameText = `${service.name || ''} ${service.description || ''} ${service.categoryName || ''}`.toLowerCase();

  // 1. Match specific granular task keywords
  for (const item of SERVICE_IMAGES) {
    if (item.keywords.some((kw) => nameText.includes(kw))) {
      return item.url;
    }
  }

  // 2. Category-level mapping
  const catKey = (service.categoryName || '').toLowerCase().trim();
  if (CATEGORY_IMAGES[catKey]) {
    return CATEGORY_IMAGES[catKey];
  }

  for (const key of Object.keys(CATEGORY_IMAGES)) {
    if (catKey.includes(key) || key.includes(catKey)) {
      return CATEGORY_IMAGES[key];
    }
  }

  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80';
};

/**
 * Resolves a high-quality, category banner image
 */
export const resolveCategoryImage = (categoryName = '') => {
  const key = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return CATEGORY_IMAGES[key] || CATEGORY_IMAGES[categoryName.toLowerCase()] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80';
};

// Stable distinct provider avatars (100% Unique per professional profile)
const PROVIDER_AVATARS = [
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=240&auto=format&fit=crop&q=80', // Rajesh Kumar (Electrician)
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80', // Priya Sharma (Plumber)
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80', // Amit Verma (AC tech)
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80', // Vikram Singh (Cleaning)
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80', // Anand Verma (Technician)
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80', // Sunita Rao (Specialist)
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80', // Rahul Deshmukh (Carpenter)
];

// Distinct Customer / User Avatars
const CUSTOMER_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', // Neha
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80', // Rohan
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', // Ananya
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', // Karan
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', // Pooja
];

/**
 * Resolves a distinct, professional avatar for each provider
 */
export const resolveProviderAvatar = (provider = {}) => {
  if (provider.avatarUrl && provider.avatarUrl.startsWith('http')) {
    return provider.avatarUrl;
  }
  if (provider.avatar && provider.avatar.startsWith('http')) {
    return provider.avatar;
  }

  const name = (provider.name || provider.userName || provider.businessName || '').toLowerCase();
  if (name.includes('rajesh')) return PROVIDER_AVATARS[0];
  if (name.includes('priya')) return PROVIDER_AVATARS[1];
  if (name.includes('amit')) return PROVIDER_AVATARS[2];
  if (name.includes('vikram')) return PROVIDER_AVATARS[3];
  if (name.includes('anand')) return PROVIDER_AVATARS[4];
  if (name.includes('sunita')) return PROVIDER_AVATARS[5];
  if (name.includes('rahul')) return PROVIDER_AVATARS[6];

  const id = Number(provider.id || provider.userId || 0);
  const index = Math.abs(id % PROVIDER_AVATARS.length);
  return PROVIDER_AVATARS[index] || PROVIDER_AVATARS[0];
};

/**
 * Resolves a distinct avatar for a customer or review author
 */
export const resolveCustomerAvatar = (user = {}) => {
  if (user?.avatar && user.avatar.startsWith('http')) return user.avatar;
  if (user?.avatarUrl && user.avatarUrl.startsWith('http')) return user.avatarUrl;
  
  const id = Number(user?.id || user?.userId || 1);
  const index = Math.abs(id % CUSTOMER_AVATARS.length);
  return CUSTOMER_AVATARS[index];
};
