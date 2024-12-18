package com.example.blog.mapper;

import com.example.blog.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {
    @Results(id = "userResultMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "userName", column = "user_name"),
            @Result(property = "name", column = "name"),
            @Result(property = "emailAddress", column = "email_address"),
            @Result(property = "token", column = "token"),
            @Result(property = "password", column = "password")
    })
    @Select("SELECT * FROM user")
    List<User> findAllUsers();

    @Select("SELECT * FROM user WHERE user_name = #{userName}")
    @ResultMap("userResultMap")
    User getByUserName(String userName);

    // 更新用户的 token
    @Update("UPDATE user SET token = #{token} WHERE user_name = #{userName}")
    void updateToken(@Param("userName") String userName, @Param("token") String token);

    void insert(User user);
}