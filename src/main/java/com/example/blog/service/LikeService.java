package com.example.blog.service;

import com.example.blog.entity.Article;
import com.example.blog.entity.Like;

public interface LikeService {

    Article createLike(int userId, int articleId);

    int countLikes(int articleId);
}
