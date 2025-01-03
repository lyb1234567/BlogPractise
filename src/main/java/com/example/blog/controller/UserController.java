package com.example.blog.controller;

import blog_common.result.Result;
import com.example.blog.dto.UserLoginDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.mapper.UserMapper;
import com.example.blog.entity.User;
import com.example.blog.service.UserService;
import com.example.blog.vo.UserLoginVo;
import com.example.blog.vo.UserRegisterVo;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

   @Autowired
    private UserService userService;

   @PostMapping("/login")
    public Result<UserLoginVo> login(@RequestBody UserLoginDTO userLoginDTO) {

       log.info("用户登录: {}", userLoginDTO);

       User user = userService.login(userLoginDTO);

       UserLoginVo userLoginVo = UserLoginVo.builder()
                                            .id(user.getId())
                                            .userName(user.getUserName()).token(user.getToken()).emailAddress(user.getEmailAddress()).name(user.getName()).avatar(user.getAvatar()).build();
       return Result.success(userLoginVo);
    }

    @PostMapping("/register")
    public Result<UserRegisterVo> login(@RequestBody UserRegisterDTO userRegisterDTO)
    {
        log.info("用户注册: {}", userRegisterDTO);

        User user = userService.register(userRegisterDTO);
        UserRegisterVo userRegisterVoResult = UserRegisterVo.builder().userName(user.getUserName()).emailAddress(user.getEmailAddress()).name(user.getName()).build();
        return Result.success(userRegisterVoResult);
    }
}
