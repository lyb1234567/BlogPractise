package com.example.blog.entity;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Comment {

    private int id;
    private int userId;
    private String  content;

    private String userAvatar;

    private int parentId;
    private int articleId;

    private LocalDateTime creationDate;

    private LocalDateTime lastUpdateDate;

    private int last_updated_by;

    private int created_by;
}
