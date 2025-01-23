package com.example.blog.mapper;


import com.example.blog.entity.Article;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ArticleMapper {
    void insert(Article article);

    List<Article> findTop5ByLikes();


    @Select("SELECT * FROM article WHERE id = #{articleId}")
    Article findById(int articleId);




    @Update("UPDATE article SET likes = #{likes} WHERE id = #{id}")
    void updateLikes(int id, int likes);

    @Select("SELECT * FROM article WHERE id = #{articleId}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "userId", column = "user_id"),
            // 添加其他需要映射的字段
    })
    Article getById(int articleId);

    @Select("SELECT * FROM article WHERE user_id = #{userId}")
    @ResultMap("com.example.blog.mapper.ArticleMapper.ArticleResultMap")
    List<Article> findByUserId(int userId);
}
