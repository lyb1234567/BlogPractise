package com.example.blog.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserLoginVo implements Serializable {

    private long id;

    private String userName;

    private String name;

    private String emailAddress;

    private String token;

    private String avatar;


}
