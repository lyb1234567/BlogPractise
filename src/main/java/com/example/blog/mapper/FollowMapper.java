package com.example.blog.mapper;


import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FollowMapper {


    void insertByFollowerIdFolloweeId(int followerId, int followeeId);
}
