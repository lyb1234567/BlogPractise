package com.example.blog.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Follow {

    private Long id; // 主键ID
    private Long followerId; // 关注者ID
    private Long followeeId; // 被关注者ID
    private LocalDateTime createdAt; // 关注时间
    private LocalDateTime updatedAt; // 更新时间
}
