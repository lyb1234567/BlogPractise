package com.example.blog.service.serviceImpl;


import blog_common.exception.ArticleNotFoundException;
import com.example.blog.entity.Article;
import com.example.blog.entity.Comment;
import com.example.blog.mapper.ArticleMapper;
import com.example.blog.mapper.CommentMapper;
import com.example.blog.service.CommentService;
import com.example.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private UserService userService;

    @Override
    public List<Comment> getCommentsByArticleId(int articleId) {

        Article article = articleMapper.findById(articleId);
        if(article == null)
        {
            throw new ArticleNotFoundException("Article Not Found");
        }
        List<Comment> comments = commentMapper.getCommentsByArticleId(articleId);
        for (Comment comment : comments) {
            String userAvatar = userService.getAvatar(comment.getUserId());
            comment.setUserAvatar(userAvatar);
        }
        return comments;
    }
}
