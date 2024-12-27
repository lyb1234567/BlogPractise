package com.example.blog.service.serviceImpl;

import blog_common.exception.ArticleNotFoundException;
import blog_common.exception.UserNotFoundException;
import com.example.blog.entity.Article;
import com.example.blog.entity.Like;
import com.example.blog.entity.User;
import com.example.blog.mapper.ArticleMapper;
import com.example.blog.mapper.LikeMapper;
import com.example.blog.mapper.UserMapper;
import com.example.blog.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private LikeMapper likeMapper;


    @Override
    public Article createLike(int userId, int articleId) {
//         search for user
        User user = userMapper.findById(userId);

        Article article = articleMapper.findById(articleId);
        if(user == null)
        {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        if (article == null)
        {
            throw new ArticleNotFoundException("Article not found with id: " + articleId);
        }
        likeMapper.insertLike(userId, articleId);
        int curLikes = countLikes(articleId);
        article.setLikes(curLikes);
        return article;
    }

    @Override
    public int countLikes(int articleId) {
        return likeMapper.countLikesByArticleId(articleId);
    }
}