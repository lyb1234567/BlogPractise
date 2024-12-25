package com.example.blog.mapper;


import com.example.blog.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ArticleMapper {
    void insert(Article article);

    @Select("SELECT * FROM article WHERE delete_flag != 'Y' ORDER BY likes DESC LIMIT 5")
    List<Article> findTop5ByLikes();
}
