package com.example.blog.mapper;


import com.example.blog.entity.Follow;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FollowMapper {


    void insertByFollowerIdFolloweeId(int followerId, int followeeId);


    void deleteByFollowerIdFolloweeId(int followerId, int followeeId);

    Follow findByFollowerAndFollowee(int followerId, int followeeId);
}
