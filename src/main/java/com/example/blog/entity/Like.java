package com.example.blog.entity;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Like {

    private int id;

    private int userId;

    private int articleId;

    private LocalDateTime creationDate;

    private LocalDateTime lastUpdateDate;
    private int lastUpdatedBy;

    private int createdBy;


}
