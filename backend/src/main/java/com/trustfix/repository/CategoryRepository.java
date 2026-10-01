package com.trustfix.repository;

import com.trustfix.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    List<Category> findByActiveTrue();

    long countByActiveTrue();

    List<Category> findByNameContainingIgnoreCase(String name);
}
