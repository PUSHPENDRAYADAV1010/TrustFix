import apiClient from './api';
import { resolveServiceImage, resolveCategoryImage } from '../utils/imageResolver';
import { sanitizeCategoryName, sanitizeCategoryDescription } from '../utils/categoryIcons';
import { mockCategories } from '../mock/categories';
import { mockServices } from '../mock/services';

export const categoryService = {
  // =========================
  // GET ALL CATEGORIES
  // =========================
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((category) => {
          const cleanName = sanitizeCategoryName(category.name);
          const cleanDesc = sanitizeCategoryDescription(category.description, cleanName);
          const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          return {
            id: category.id,
            rawName: category.name,
            name: cleanName,
            slug,
            icon: cleanName,
            image: resolveCategoryImage(cleanName),
            description: cleanDesc,
            providerCount: 6,
            active: category.active !== false,
          };
        });
      }
    } catch (error) {
      console.warn('[categoryService] Backend fetch failed for categories, using rich mock categories:', error.message);
    }

    // Graceful fallback to mock categories
    return mockCategories.map((c) => ({
      id: c.id,
      rawName: c.name,
      name: c.name,
      slug: c.slug,
      icon: c.icon || c.name,
      image: c.image || resolveCategoryImage(c.name),
      description: c.description,
      providerCount: c.providerCount || 8,
      active: true,
    }));
  },

  // =========================
  // GET SERVICES BY CATEGORY ID OR ALL
  // =========================
  getServices: async (filters = {}) => {
    let result = [];
    try {
      let url = '/services/active';
      if (
        filters.categoryId !== undefined &&
        filters.categoryId !== null &&
        filters.categoryId !== '' &&
        filters.categoryId !== 'all'
      ) {
        url = `/services/category/${filters.categoryId}`;
      }

      const response = await apiClient.get(url);
      if (Array.isArray(response.data) && response.data.length > 0) {
        result = response.data;
      }
    } catch (error) {
      console.warn('[categoryService] Backend fetch failed for services, using mock services:', error.message);
    }

    if (result.length === 0) {
      result = mockServices;
      if (filters.categoryId && filters.categoryId !== 'all') {
        result = result.filter(s => String(s.categoryId) === String(filters.categoryId));
      }
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (service) =>
          service.name?.toLowerCase().includes(q) ||
          service.description?.toLowerCase().includes(q) ||
          service.categoryName?.toLowerCase().includes(q)
      );
    }

    return result.map((service) => {
      const resolvedImg = service.image || resolveServiceImage(service);
      const cleanCatName = sanitizeCategoryName(service.categoryName);

      return {
        id: service.id,
        name: service.name,
        description: service.description,
        shortDescription: service.shortDescription || service.description,
        basePrice: service.basePrice || service.startingPrice || 499,
        price: service.basePrice || service.startingPrice || 499,
        startingPrice: service.startingPrice || service.basePrice || 499,
        durationInMinutes: service.durationInMinutes || service.durationMinutes || 60,
        durationMinutes: service.durationInMinutes || service.durationMinutes || 60,
        categoryId: service.categoryId,
        categoryName: cleanCatName,
        image: resolvedImg,
        imageUrl: resolvedImg,
        rating: service.rating || 4.9,
        reviewCount: service.reviewCount || 28,
        providerCount: service.providerCount || 5,
        included: service.included || [
          "Certified technician doorstep visit & inspection",
          "Complete diagnostic check and safety evaluation",
          "Standard labor & precision repair execution",
          "30-day TrustFix post-service warranty guarantee"
        ],
        excluded: service.excluded || [
          "Replacement spare parts and hardware billed separately with invoice",
          "Concealed wall cutting or major masonry work"
        ],
        active: service.active !== false,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });
  },

  // =========================
  // GET SERVICE BY ID
  // =========================
  getServiceById: async (id) => {
    try {
      const response = await apiClient.get(`/services/${id}`);
      if (response.data) {
        const service = response.data;
        const resolvedImg = resolveServiceImage(service);
        const cleanCatName = sanitizeCategoryName(service.categoryName);

        return {
          id: service.id,
          name: service.name,
          description: service.description,
          shortDescription: service.description,
          basePrice: service.basePrice,
          price: service.basePrice,
          startingPrice: service.basePrice,
          durationInMinutes: service.durationInMinutes || 60,
          categoryId: service.categoryId,
          categoryName: cleanCatName,
          image: resolvedImg,
          imageUrl: resolvedImg,
          rating: 4.9,
          reviewCount: 28,
          providerCount: 3,
          included: [
            "Certified technician doorstep visit & inspection",
            "Complete diagnostic check and safety evaluation",
            "Standard labor & precision repair execution",
            "30-day TrustFix post-service warranty guarantee"
          ],
          excluded: [
            "Replacement spare parts and hardware billed separately with invoice",
            "Concealed wall cutting or major masonry work"
          ],
          active: service.active,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        };
      }
    } catch (error) {
      console.warn(`[categoryService] Backend fetch failed for service ID ${id}, using mock data:`, error.message);
    }

    const mock = mockServices.find(s => String(s.id) === String(id)) || mockServices[0];
    return {
      id: mock.id,
      name: mock.name,
      description: mock.description,
      shortDescription: mock.shortDescription || mock.description,
      basePrice: mock.startingPrice || 499,
      price: mock.startingPrice || 499,
      startingPrice: mock.startingPrice || 499,
      durationInMinutes: mock.durationMinutes || 60,
      categoryId: mock.categoryId,
      categoryName: mock.categoryName,
      image: mock.image,
      imageUrl: mock.image,
      rating: mock.rating || 4.9,
      reviewCount: mock.reviewCount || 28,
      providerCount: mock.providerCount || 4,
      included: mock.included,
      excluded: mock.excluded,
      active: true,
    };
  },
};