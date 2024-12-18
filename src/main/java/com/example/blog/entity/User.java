package com.example.blog.entity;


import lombok.Data;
import org.apache.ibatis.annotations.Result;

@Data
public class User {


    private long id;




    private String userName;

    private String name;

    private String emailAddress;

    private String token;

    private String password;



}