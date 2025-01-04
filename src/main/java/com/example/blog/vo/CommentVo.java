package com.example.blog.vo;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CommentVo {

    private int id;
    private int userId;
    private String  content;

    private String userAvatar;
    private int parentId;
    private int articleId;

    private LocalDateTime creationDate;

    private String userName;



}
