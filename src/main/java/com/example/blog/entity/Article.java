package com.example.blog.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Article {

    private int id;

    private String title;

    private String summary;

    private String content;

    private int userId;
    private String categoryCode;

    private long views;

    private long likes;

    private long commentCounts;

    private char status;

    char deleteFlag;

    private LocalDateTime creationDate;

    private LocalDateTime lastUpdateDate;

    private int lastUpdatedBy;

    private int createdBy;
}
