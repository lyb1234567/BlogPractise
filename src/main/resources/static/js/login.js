// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userName = document.getElementById('login-username').value.trim();
        const passWord = document.getElementById('login-password').value.trim();
        // 前端简单验证
        if (!userName || !passWord) {
            showMessage('warning', '输入错误', '用户名和密码不能为空。');
            return;
        }

        const data = { userName, passWord };

        try {
            const response = await fetch('/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.code === 1) {
                 showMessage('success', '登录成功！', '', 1500);
                 // 保存 token 和用户信息到 localStorage
                 localStorage.setItem('token', result.data.token);
                 localStorage.setItem('user', JSON.stringify(result.data));
                 // 跳转到主页
                 setTimeout(() => {
                     window.location.href = 'index.html';
                 }, 1500);
             } else {
                 showMessage('error', '登录失败', result.message || '请检查您的输入。');
             }
        } catch (error) {
            console.error('Error:', error);
            showMessage('error', '服务器错误', '请稍后再试。');
        }
    });
});
