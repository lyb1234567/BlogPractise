package com.example.blog.vo;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ArticleVo {
    private int id;
    private String title;


    private int userId;
    private String summary;
    private long likes;

    private String content;
    private LocalDateTime creationDate;
}
