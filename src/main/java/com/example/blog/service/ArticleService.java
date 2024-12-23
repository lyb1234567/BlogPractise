package com.example.blog.service;

import com.example.blog.dto.ArticleCreateDTO;
import com.example.blog.entity.Article;

public interface ArticleService {
    Article createArticle(ArticleCreateDTO articleCreateDTO);
}
