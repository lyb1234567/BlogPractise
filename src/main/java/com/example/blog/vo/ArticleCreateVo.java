package com.example.blog.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ArticleCreateVo implements Serializable {


    private int id;
    private String title;

    private String summary;

    private String content;

    private String category_code;

    private char status;

    private int created_by;

    private LocalDateTime creation_date;

    private LocalDateTime last_update_date;

}
