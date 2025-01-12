package com.example.blog.service;


import com.example.blog.entity.Comment;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByArticleId(int articleId);

    Comment insertComment(int userId, int articleId, String content, int parentId);
}
