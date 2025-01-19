package com.example.blog.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserVo {

    private String userName;

    private String name;

    private String emailAddress;

    private String avatar;
}
