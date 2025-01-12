package com.example.blog.service.serviceImpl;


import blog_common.exception.ArticleNotFoundException;
import blog_common.exception.UserNotFoundException;
import com.example.blog.entity.Article;
import com.example.blog.entity.Comment;
import com.example.blog.entity.User;
import com.example.blog.mapper.ArticleMapper;
import com.example.blog.mapper.CommentMapper;
import com.example.blog.mapper.UserMapper;
import com.example.blog.service.CommentService;
import com.example.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private UserMapper userMapper;

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

    @Override
    public Comment insertComment(int userId, int articleId, String content, int parentId) {
        User user = userMapper.findById(userId);
        Article article = articleMapper.findById(articleId);
        if (user == null)
        {
            throw new UserNotFoundException("User not found with id: " + userId);
        }

        if (article == null)
        {
            throw new ArticleNotFoundException("Article not found with id: " + articleId);
        }

        String userAvatar = userService.getAvatar(userId);
        Comment comment = new Comment();
        comment.setUserAvatar(userAvatar);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setParentId(parentId);
        comment.setArticleId(articleId);
        comment.setCreationDate(LocalDateTime.now());
        comment.setLastUpdateDate(LocalDateTime.now());
        commentMapper.insert(comment);
        return comment;

    }
}
