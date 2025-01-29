package com.example.blog.controller;

import blog_common.result.Result;
import com.example.blog.dto.UserLoginDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.Follow;
import com.example.blog.mapper.UserMapper;
import com.example.blog.entity.User;
import com.example.blog.service.UserService;
import com.example.blog.vo.UserLoginVo;
import com.example.blog.vo.UserRegisterVo;
import com.example.blog.vo.UserVo;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
                                            .userName(user.getUserName()).token(user.getToken()).emailAddress(user.getEmailAddress()).name(user.getName()).description(user.getDescription()).avatar(user.getAvatar()).build();
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

    @GetMapping("/getUser")
    public Result<UserVo> getUser(@RequestParam("userId") int userId)
    {
        log.info("获取用户: userId={}", userId);
        User user = userService.findById(userId);
        UserVo userVo = UserVo.builder().userId(user.getId()).userName(user.getUserName()).name(user.getName()).avatar(user.getAvatar()).emailAddress(user.getEmailAddress()).build();
        return Result.success(userVo);
    }

    @GetMapping("/getLikeCount")
    public int getLikeCount(@RequestParam("userId") int userId)
    {
        log.info("获取用户点数: userId={}", userId);
        return userService.getLikeCount(userId);
    }

    @PostMapping("/follow")
    public Result<String> insertByFollowerIdFolloweeId(@RequestParam("followerId") int followerId, @RequestParam("followeeId") int followeeId) {
        log.info("开始关注: followerId={}, followeeId={}", followerId, followeeId);
            userService.insertByFollowerIdFolloweeId(followerId, followeeId);
            return Result.success("关注成功");
    }

    @GetMapping("/getFollowers")
    public Result<List<UserVo>> getFollowers(@RequestParam("userId") int userId)
    {
        log.info("获取关注: userId={}", userId);
        List <User> users = userService.getFollowers(userId);
        List<UserVo> userVos = users.stream().map(user -> UserVo.builder().userId(user.getId()).userName(user.getUserName()).name(user.getName()).emailAddress(user.getEmailAddress()).avatar(user.getAvatar()).build()).collect(Collectors.toList());
        return Result.success(userVos);
    }


}
