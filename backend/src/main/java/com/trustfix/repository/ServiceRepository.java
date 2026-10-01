package com.trustfix.repository;

import com.trustfix.entity.Category;
import com.trustfix.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByCategory(Category category);

    List<Service> findByCategoryId(Long categoryId);

    List<Service> findByCategoryIdAndActiveTrue(Long categoryId);

    List<Service> findByActiveTrue();

    long countByActiveTrue();

    List<Service> findByNameContainingIgnoreCase(String name);
}
