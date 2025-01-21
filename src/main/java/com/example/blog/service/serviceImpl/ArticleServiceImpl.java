package com.example.blog.service.serviceImpl;

import blog_common.exception.ArticleNotFoundException;
import blog_common.exception.UserNotFoundException;
import com.example.blog.dto.ArticleCreateDTO;
import com.example.blog.entity.Article;
import com.example.blog.entity.User;
import com.example.blog.mapper.ArticleMapper;
import com.example.blog.mapper.LikeMapper;
import com.example.blog.mapper.UserMapper;
import com.example.blog.service.ArticleService;
import com.example.blog.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.plaf.synth.SynthOptionPaneUI;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private LikeMapper likeMapper;
    @Override
    public Article createArticle(ArticleCreateDTO articleCreateDTO) {
        Article article = new Article();

        BeanUtils.copyProperties(articleCreateDTO, article);

        User user = userMapper.findById(articleCreateDTO.getUserId());
        if(user == null)
        {
           throw new IllegalArgumentException("User not found");
        }
        // 设置创建时间和更新时间为当前时间
        LocalDateTime now = LocalDateTime.now();
        article.setCreationDate(now);
        article.setLastUpdateDate(now);
        article.setLikes(0);
        article.setViews(0);
        article.setCommentCounts(0);
        articleMapper.insert(article);
        return article;
    }

    @Override
    public List<Article> getTop5ArticlesByLikes() {
        List<Article> articles = articleMapper.findTop5ByLikes();
        return articles;
    }

    @Override
    public Article getById(int articleId) {
        Article article = articleMapper.getById(articleId);


        if (article == null)
        {
            throw new ArticleNotFoundException("Article not found");
        }

        return article;
    }

    @Override
    public List<Article> getByUserId(int userId) {
        User user = userMapper.findById(userId);
        if (user == null)
        {
            throw new UserNotFoundException("User not found");
        }
        List<Article> articles = articleMapper.findByUserId(userId);
        return articles;
    }

    @Override
    public List<Article> likedByUserId(int userId) {
        User user = userMapper.findById(userId);
        if (user ==null)
        {
            throw new UserNotFoundException("User not found");
        }
        List<Article>articles  = likeMapper.findLikedByUserId(userId);
        return articles;
    }
}
