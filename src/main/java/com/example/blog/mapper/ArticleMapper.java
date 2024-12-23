package com.example.blog.mapper;


import com.example.blog.entity.Article;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArticleMapper {
    void insert(Article article);
}
