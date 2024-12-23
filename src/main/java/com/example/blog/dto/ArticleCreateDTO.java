package com.example.blog.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class ArticleCreateDTO implements Serializable {

    private int userId;
    private String title;

    private String summary;

    private String content;

    private String categoryCode;

    private char status;

}
