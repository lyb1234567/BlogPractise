package com.example.blog.service;

import com.example.blog.dto.UserLoginDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.Follow;
import com.example.blog.entity.User;
import com.example.blog.vo.UserRegisterVo;
import org.springframework.stereotype.Service;

import java.util.List;

public interface UserService {


    public User login(UserLoginDTO userLoginDTO);

    User register(UserRegisterDTO userRegisterDTO);

    String getAvatar(int userId);

    String getUserName(int userId);

    User findById(int userId);

    int getLikeCount(int userId);

    void insertByFollowerIdFolloweeId(int followerId, int followeeId);

    List<User> getFollowers(int userId);

    void deleteByFollowerIdFolloweeId(int followerId, int followeeId);

    boolean checkFollowStatus(int followerId, int followeeId);
}
