package com.example.blog.service.serviceImpl;

import blog_common.exception.UserNotFoundException;
import com.example.blog.Utils.JwtUtil;
import blog_common.constant.MessageConstant;
import blog_common.exception.AccountNotFoundException;
import blog_common.exception.InsertUserException;
import com.example.blog.dto.UserLoginDTO;
import com.example.blog.dto.UserRegisterDTO;
import com.example.blog.entity.User;
import com.example.blog.mapper.UserMapper;
import com.example.blog.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
public class UserServiceImpl implements UserService {


    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;
    @Override
    public User login(UserLoginDTO userLoginDTO) {
        String userName = userLoginDTO.getUserName();
        String password = userLoginDTO.getPassWord();
        System.out.println(userName);
        System.out.println("Password: " + password);
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
}
