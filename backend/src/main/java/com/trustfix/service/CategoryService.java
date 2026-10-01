package com.trustfix.service;

import com.trustfix.entity.Category;
import com.trustfix.exception.ResourceAlreadyExistsException;
import com.trustfix.exception.ResourceNotFoundException;
import com.trustfix.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@SuppressWarnings("null")
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(Category category) {
        if (category == null || category.getName() == null || category.getName().trim().isBlank()) {
            throw new com.trustfix.exception.BadRequestException("Category name is required and cannot be blank");
        }
        category.setName(category.getName().trim());
        if (category.getDescription() != null) {
            category.setDescription(category.getDescription().trim());
        }
        if (categoryRepository.existsByName(category.getName())) {
            throw new ResourceAlreadyExistsException("Category with name '" + category.getName() + "' already exists");
        }
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Optional<Category> findByName(String name) {
        return categoryRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<Category> searchCategories(String query) {
        if (query == null || query.trim().isBlank()) {
            return categoryRepository.findAll();
        }
        return categoryRepository.findByNameContainingIgnoreCase(query.trim());
    }

    @Transactional(readOnly = true)
    public List<Category> getActiveCategories() {
        return categoryRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category updateCategory(Long id, Category updatedCategory) {
        Category existingCategory = getCategoryById(id);

        if (updatedCategory.getName() != null) {
            String trimmedName = updatedCategory.getName().trim();
            if (trimmedName.isBlank()) {
                throw new com.trustfix.exception.BadRequestException("Category name cannot be blank");
            }
            if (!trimmedName.equalsIgnoreCase(existingCategory.getName())) {
                if (categoryRepository.existsByName(trimmedName)) {
                    throw new ResourceAlreadyExistsException("Category with name '" + trimmedName + "' already exists");
                }
            }
            existingCategory.setName(trimmedName);
        }
        if (updatedCategory.getDescription() != null) {
            existingCategory.setDescription(updatedCategory.getDescription());
        }
        if (updatedCategory.getIconUrl() != null) {
            existingCategory.setIconUrl(updatedCategory.getIconUrl());
        }
        existingCategory.setActive(updatedCategory.isActive());

        return categoryRepository.save(existingCategory);
    }

    public void deactivateCategory(Long id) {
        Category category = getCategoryById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
