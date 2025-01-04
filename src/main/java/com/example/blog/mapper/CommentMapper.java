package com.example.blog.mapper;

import com.example.blog.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CommentMapper {


    @Select("SELECT * FROM comment WHERE article_id = #{articleId}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "content", column = "content"),
            @Result(property = "parentId", column = "parent_id"),
            @Result(property ="articleId",column = "article_id"),
            @Result(property="creationDate",column = "creation_date"  )
            // 添加其他需要映射的字段
    })
    List<Comment> getCommentsByArticleId(int articleId);
}
