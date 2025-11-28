package com.enviro.app.environment_backend.repository;

import com.enviro.app.environment_backend.model.WasteCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WasteCategoryRepository extends JpaRepository<WasteCategory, Long> {
    
    // Tìm kiếm theo từ khóa trong tên hoặc mô tả
    @Query("SELECT w FROM WasteCategory w WHERE " +
           "LOWER(w.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<WasteCategory> searchByKeyword(@Param("keyword") String keyword);
    
    // Tìm category theo tên chính xác (dùng cho API get by name)
    Optional<WasteCategory> findByNameIgnoreCase(String name);
}