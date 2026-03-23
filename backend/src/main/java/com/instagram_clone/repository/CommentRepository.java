package com.instagram_clone.repository;

import com.instagram_clone.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdOrderByVoteCountDesc(Long postId);
}
