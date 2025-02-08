package com.example.blog.service.serviceImpl;

import blog_common.exception.UserNotFoundException;
import com.example.blog.Utils.JwtUtil;
import blog_common.constant.MessageConstant;
import blog_common.exception.AccountNotFoundException;
import blog_common.exception.InsertUserException;
import com.example.blog.dto.UserLoginDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.Follow;
import com.example.blog.entity.User;
import com.example.blog.mapper.FollowMapper;
import com.example.blog.mapper.UserMapper;
import com.example.blog.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {


    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FollowMapper followMapper;

    @Autowired
    private JwtUtil jwtUtil;
    @Override
    public User login(UserLoginDTO userLoginDTO) {
        String userName = userLoginDTO.getUserName();
        String password = userLoginDTO.getPassWord();
//          根据用户名查询数据库
          User user = userMapper.getByUserName(userName);

          if (user == null)
          {
              throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
          }


          String userPassword = user.getPassword();
          String encodedPassword = DigestUtils.md5DigestAsHex(password.getBytes());
          if (!encodedPassword.equals(userPassword))
          {
              throw new AccountNotFoundException(MessageConstant.ACCOUNT_PASSWORD_ERROR);
          }
          String token = jwtUtil.generateToken(userName);
          user.setToken(token);
          userMapper.updateToken(userName, token);
          return user;
    }

    @Override
    public User register(UserRegisterDTO userRegisterDTO) {

        User user = new User();
        String password = userRegisterDTO.getPassword();
        userRegisterDTO.setPassword(DigestUtils.md5DigestAsHex(password.getBytes()));
        BeanUtils.copyProperties(userRegisterDTO, user);
        user.setToken("");
        try {
            userMapper.insert(user);
            return user;
        }catch (Exception e)
        {
            throw new InsertUserException(e.getMessage());
        }
    }

    @Override
    public String getAvatar(int userId) {
        User user = userMapper.findById(userId);
        System.out.println(user);
        if (user == null)
        {
            throw new UserNotFoundException("User Not Found with id: " + userId);
        }

        return user.getAvatar();
    }

    @Override
    public String getUserName(int userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new UserNotFoundException("User Not Found with id: " + userId);
        }
        return user.getUserName();
    }

    @Override
    public User findById(int userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new UserNotFoundException("User Not Found with id: " + userId);
        }
        return user;
    }

    @Override
    public int getLikeCount(int userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new UserNotFoundException("User Not Found with id: " + userId);
        }
        return userMapper.getLikeCount(userId);
    }

    @Override
    public void insertByFollowerIdFolloweeId(int followerId, int followeeId) {
        User follower = userMapper.findById(followerId);
        User followee = userMapper.findById(followeeId);
        if (follower == null || followee == null) {
            throw new UserNotFoundException("User Not Found");
        }
        try
        {
            followMapper.insertByFollowerIdFolloweeId(followerId, followeeId);
        }catch (Exception e)
        {
            System.out.println("--------------------------------------");
            e.printStackTrace(); // 打印真正的异常类名
            throw e; // 再抛出
        }
    }

    @Override
    public List<User> getFollowers(int userId) {
        User user = userMapper.findById(userId);
        if (user == null)
        {
            throw new UserNotFoundException("User Not Found with id: " + userId);
        }
        List<User> users = userMapper.getFollowers(userId);
        return users;
    }

    @Override
    public void deleteByFollowerIdFolloweeId(int followerId,int followeeId) {

        User follower = userMapper.findById(followerId);
        User followee = userMapper.findById(followeeId);
        if (follower == null)
        {
            throw new UserNotFoundException("User Not Found with id: " + followerId);
        }

        if (followee == null)
        {
            throw new UserNotFoundException("User Not Found with id: " + followeeId);
        }

        followMapper.deleteByFollowerIdFolloweeId(followerId, followeeId);
    }

    @Override
    public boolean checkFollowStatus(int followerId, int followeeId) {
        User follower = userMapper.findById(followerId);
        User followee = userMapper.findById(followeeId);
        if (follower == null)
        {
            throw new UserNotFoundException("User Not Found with id: " + followerId);
        }

        if (followee == null)
        {
            throw new UserNotFoundException("User Not Found with id: " + followeeId);
        }
        Follow follow = followMapper.findByFollowerAndFollowee(followerId, followeeId);

        // 如果找到了关注记录，则返回 true，表示已关注
        if (follow != null) {
            return true;
        }

        // 如果没有找到记录，则返回 false，表示没有关注
        return false;

    }
}
