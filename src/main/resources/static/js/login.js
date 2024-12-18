// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userName = document.getElementById('login-username').value.trim();
        const passWord = document.getElementById('login-password').value.trim();

        // 前端简单验证
        if (!userName || !passWord) {
            Swal.fire({
                icon: 'warning',
                title: '输入错误',
                text: '用户名和密码不能为空。',
            });
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

            if (response.ok) { // 根据你的Result类判断成功条件
                Swal.fire({
                    icon: 'success',
                    title: '登录成功！',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    // 保存token到本地存储（根据后端返回的数据结构调整）
                    localStorage.setItem('token', result.data.token);
                    // 跳转到主页或用户面板
                    window.location.href = 'index.html'; // 根据实际情况调整
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '登录失败',
                    text: result.message || '请检查您的输入。',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: '服务器错误',
                text: '请稍后再试。',
            });
        }
    });
});
