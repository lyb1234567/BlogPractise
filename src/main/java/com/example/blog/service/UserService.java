package com.example.blog.service;

import com.example.blog.dto.UserLoginDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.User;
import com.example.blog.vo.UserRegisterVo;
import org.springframework.stereotype.Service;

public interface UserService {


    public User login(UserLoginDTO userLoginDTO);

    User register(UserRegisterDTO userRegisterDTO);
}
