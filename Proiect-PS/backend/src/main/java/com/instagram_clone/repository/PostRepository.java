package com.instagram_clone.repository;

import com.instagram_clone.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    List<Post> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
