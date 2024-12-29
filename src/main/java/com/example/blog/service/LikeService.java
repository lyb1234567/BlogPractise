package com.example.blog.service;

import com.example.blog.entity.Article;
import com.example.blog.entity.Like;
import com.example.blog.entity.User;

import java.util.List;

public interface LikeService {

    Article createLike(int userId, int articleId);

    int countLikes(int articleId);

    List<User> getUserWhoLikes(int articleId);
}
