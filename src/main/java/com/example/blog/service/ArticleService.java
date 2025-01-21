package com.example.blog.service;

import com.example.blog.dto.ArticleCreateDTO;
import com.example.blog.entity.Article;

import java.util.List;

public interface ArticleService {
    Article createArticle(ArticleCreateDTO articleCreateDTO);

    List<Article> getTop5ArticlesByLikes();

    Article getById(int articleId);

    List<Article> getByUserId(int userId);

    List<Article> likedByUserId(int userId);
}
