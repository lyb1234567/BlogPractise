package com.example.blog.service.serviceImpl;

import com.example.blog.dto.ArticleCreateDTO;
import com.example.blog.entity.Article;
import com.example.blog.entity.User;
import com.example.blog.mapper.ArticleMapper;
import com.example.blog.mapper.UserMapper;
import com.example.blog.service.ArticleService;
import com.example.blog.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.plaf.synth.SynthOptionPaneUI;
import java.time.LocalDateTime;
import java.util.Date;

@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    UserMapper userMapper;

    @Autowired
    ArticleMapper articleMapper;
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
        System.out.println(article);
        articleMapper.insert(article);
        return article;
    }
}
