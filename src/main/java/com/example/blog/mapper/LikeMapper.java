package com.example.blog.mapper;


import com.example.blog.entity.Article;
import com.example.blog.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface LikeMapper {

    @Insert("INSERT INTO `like` (article_id, user_id) VALUES (#{articleId}, #{userId})")
    void insertLike(int userId, int articleId);

    @Select("SELECT COUNT(*) FROM `like` WHERE article_id = #{articleId}")
    int countLikesByArticleId(int articleId);


    @Select("SELECT u.* FROM user u INNER JOIN `like` l ON u.id = l.user_id WHERE l.article_id = #{articleId}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "userName", column = "user_name"),
            // 添加其他需要映射的字段
    })
    List<User> getUserWhoLikes(int articleId);

    @Delete("DELETE FROM `like` WHERE user_id = #{userId} AND article_id = #{articleId}")
    void deleteLike(int userId, int articleId);

    @Select("SELECT a.*, l.creation_date AS like_creation_date FROM article a INNER JOIN `like` l ON a.id = l.article_id WHERE l.user_id = #{userId}")
    @ResultMap("com.example.blog.mapper.ArticleMapper.ArticleResultLikeMap")
    List<Article> findLikedByUserId(int userId);
}
