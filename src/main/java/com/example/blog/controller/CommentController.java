package com.example.blog.controller;

import blog_common.result.Result;
import com.example.blog.entity.Comment;
import com.example.blog.service.UserService;
import com.example.blog.service.CommentService;
import com.example.blog.vo.CommentVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/comment")
@Slf4j
public class CommentController {

    @Autowired
    private UserService userService;

    @Autowired
    private CommentService commentService;


    @GetMapping("/getComments")
    public Result<List<CommentVo>> getComments(int articleId)
    {
        log.info("获取文章的评论: articleId={}", articleId);
        List<Comment> comments = commentService.getCommentsByArticleId(articleId);
        List<CommentVo> commentVos = comments.stream().map(comment -> {
            String userName = userService.getUserName(comment.getUserId());
            return CommentVo.builder()
                    .id(comment.getId())
                    .content(comment.getContent())
                    .userId(comment.getUserId())
                    .parentId(comment.getParentId())
                    .articleId(comment.getArticleId())
                    .userAvatar(comment.getUserAvatar())
                    .creationDate(comment.getCreationDate())
                    .userName(userName)
                    .build();
        }).collect(Collectors.toList());
        return Result.success(commentVos);
    }

    @PostMapping("/insertComment")
    public Result<CommentVo> insertComment(
            @RequestParam("userId") int userId,
            @RequestParam("articleId") int articleId,
            @RequestParam("content") String content,
            @RequestParam("parentId") int parentId
    )
    {
        System.out.println(userId + " " + articleId + " " + content + " " + parentId);
        Comment comment = commentService.insertComment(userId, articleId, content, parentId);
        String userName = userService.getUserName(comment.getUserId());
        CommentVo commentVo =CommentVo.builder().id(comment.getId())
            .content(comment.getContent())
            .userId(comment.getUserId())
            .parentId(comment.getParentId())
            .articleId(comment.getArticleId())
            .userAvatar(comment.getUserAvatar())
            .creationDate(comment.getCreationDate())
            .userName(userName)
            .build();
        return Result.success(commentVo);
    }
}
