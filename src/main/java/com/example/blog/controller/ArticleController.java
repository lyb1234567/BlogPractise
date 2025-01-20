package com.example.blog.controller;


import blog_common.result.Result;
import com.example.blog.dto.ArticleCreateDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.Article;
import com.example.blog.entity.User;
import com.example.blog.service.ArticleCategoryService;
import com.example.blog.service.ArticleService;
import com.example.blog.service.LikeService;
import com.example.blog.service.UserService;
import com.example.blog.vo.ArticleCreateVo;
import com.example.blog.vo.ArticleVo;
import com.example.blog.vo.UserLikeVo;
import com.example.blog.vo.UserRegisterVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/article")
@Slf4j
public class ArticleController {

    @Autowired
    private UserService userService;

    @Autowired
    private ArticleCategoryService articleCategoryService;

    @Autowired
    private ArticleService articleService;

    @Autowired
    private LikeService likeService;


    @PostMapping("/createArticle")
    public Result<ArticleCreateVo> articleCreate(@RequestBody ArticleCreateDTO articleCreateDTO)
    {
        log.info("创建文章: {}", articleCreateDTO );
        Article article = articleService.createArticle(articleCreateDTO);
        ArticleCreateVo articleCreateVo = ArticleCreateVo.builder().id(article.getId()).title(article.getTitle()).summary(article.getSummary()).content(article.getContent()).category_code(article.getCategoryCode()).status(article.getStatus()).created_by(article.getCreatedBy()).creation_date(article.getCreationDate()).last_update_date(article.getLastUpdateDate()).build();
        return Result.success(articleCreateVo);
    }

    // 获取点赞数最高的前五篇文章
    // 获取点赞数最高的前五篇文章
    @GetMapping("/showTop5ArticlesByLikes")
    public Result<List<ArticleVo>> getTop5Articles() {
        log.info("获取点赞数最高的前五篇文章");
        List<Article> topArticles = articleService.getTop5ArticlesByLikes();
        List<ArticleVo> articleVos = topArticles.stream().map(article ->
                ArticleVo.builder()
                        .id(article.getId())
                        .title(article.getTitle())
                        .summary(article.getSummary())
                        .likes(article.getLikes())
                        .creationDate(article.getCreationDate())
                        .build()
        ).toList();
        return Result.success(articleVos);
    }


   @PostMapping("/likeArticle")
    public Result<ArticleVo> likeArticle(@RequestParam("userId") int userId, @RequestParam("articleId") int articleId)
   {
       log.info("点赞文章: userId={}, articleId={}", userId, articleId);
       Article article= likeService.createLike(userId, articleId);
       ArticleVo articleVo = ArticleVo.builder().id(article.getId()).title(article.getTitle()).summary(article.getSummary()).likes(article.getLikes()).creationDate(article.getCreationDate()).build();
       return Result.success(articleVo);
   }

   @PostMapping("/unlikeArticle")
    public Result<ArticleVo> unlikeArticle(@RequestParam("userId") int userId, @RequestParam("articleId") int articleId)
   {
       log.info("取消点赞文章: userId={}, articleId={}", userId, articleId);
       Article article= likeService.deleteLike(userId, articleId);
       ArticleVo articleVo = ArticleVo.builder().id(article.getId()).title(article.getTitle()).summary(article.getSummary()).likes(article.getLikes()).creationDate(article.getCreationDate()).build();
       return Result.success(articleVo);
   }
   @GetMapping("/getUserWhoLikes")
    public Result<List<UserLikeVo>> getUserWhoLikes(@RequestParam("articleId") int articleId)
    {
        log.info("获取点赞文章的用户: articleId={}", articleId);
        List<User> usersWhoLikes = likeService.getUserWhoLikes(articleId);
        List<UserLikeVo> userLikeVos = usersWhoLikes.stream().map(user ->
                UserLikeVo.builder()
                        .id(user.getId())
                        .userName(user.getUserName())
                        .build()
        ).toList();
        return Result.success(userLikeVos);
    }

    @GetMapping("/showArticle")
    public Result<ArticleVo> showArticle(@RequestParam("articleId") int articleId)
    {
        log.info("获取文章: articleId={}", articleId);
        Article article = articleService.getById(articleId);
        ArticleVo articleVo = ArticleVo.builder().id(article.getId()).title(article.getTitle()).summary(article.getSummary()).likes(article.getLikes()).creationDate(article.getCreationDate()).userId(article.getUserId()).content(article.getContent()).build();
        return Result.success(articleVo);
    }

    @GetMapping("/getArticle")
    public Result<ArticleVo> getArticle(@RequestParam("articleId") int articleId)
    {
        log.info("获取文章: articleId={}", articleId);
        Article article = articleService.getById(articleId);
        ArticleVo articleVo = ArticleVo.builder().id(article.getId()).title(article.getTitle()).summary(article.getSummary()).likes(article.getLikes()).creationDate(article.getCreationDate()).userId(article.getUserId()).content(article.getContent()).build();
        return Result.success(articleVo);
    }

    @GetMapping("/getArticlesByUserId")
    public Result<List<ArticleVo>> getArticlesByUserId(@RequestParam("userId") int userId)
    {
        log.info("根据用户ID获取文章: userId={}", userId);
        List<Article> articles = articleService.getByUserId(userId);
        List<ArticleVo> articleVos = articles.stream()
                .map(article -> ArticleVo.builder()
                        .id(article.getId())
                        .title(article.getTitle())
                        .summary(article.getSummary())
                        .likes(article.getLikes())
                        .creationDate(article.getCreationDate())
                        .userId(article.getUserId())
                        .content(article.getContent())
                        .build())
                .collect(Collectors.toList());
        return Result.success(articleVos);
    }

}
