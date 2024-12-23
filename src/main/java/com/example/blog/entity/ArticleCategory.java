package com.example.blog.entity;


import lombok.Data;

import java.sql.Date;
import java.time.LocalDateTime;

@Data
public class ArticleCategory {

    private int id;

    private String category_zh_name;

    private String category_en_name;

    private String category_code;

    char delete_flag;

    private LocalDateTime creation_date;

    private LocalDateTime last_update_date;

    private int last_updated_by;

    private int created_by;
}
