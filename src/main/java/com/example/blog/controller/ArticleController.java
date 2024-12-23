package com.example.blog.controller;


import blog_common.result.Result;
import com.example.blog.dto.ArticleCreateDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.Article;
import com.example.blog.entity.User;
import com.example.blog.service.ArticleCategoryService;
import com.example.blog.service.ArticleService;
import com.example.blog.service.UserService;
import com.example.blog.vo.ArticleCreateVo;
import com.example.blog.vo.UserRegisterVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


    @PostMapping("/create_article")
    public Result<ArticleCreateVo> articleCreate(@RequestBody ArticleCreateDTO articleCreateDTO)
    {
        log.info("创建文章: {}", articleCreateDTO );

        Article article = articleService.createArticle(articleCreateDTO);
        ArticleCreateVo articleCreateVo = ArticleCreateVo.builder().id(article.getId()).title(article.getTitle()).summary(article.getSummary()).content(article.getContent()).category_code(article.getCategoryCode()).status(article.getStatus()).created_by(article.getCreated_by()).creation_date(article.getCreationDate()).last_update_date(article.getLastUpdateDate()).build();
        return Result.success(articleCreateVo);
    }


}
