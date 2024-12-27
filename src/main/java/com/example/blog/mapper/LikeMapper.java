package com.example.blog.mapper;


import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface LikeMapper {

    @Insert("INSERT INTO like (article_id, user_id) VALUES (#{articleId}, #{userId})")
    void insertLike(int articleId, int userId);

    @Select("SELECT COUNT(*) FROM like WHERE article_id = #{articleId}")
    int countLikesByArticleId(int articleId);
}
