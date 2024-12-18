// js/register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userName = document.getElementById('register-username').value.trim();
        const name = document.getElementById('register-name').value.trim();
        const emailAddress = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        // 前端验证
        if (!userName || !name || !emailAddress || !password) {
            Swal.fire({
                icon: 'warning',
                title: '输入错误',
                text: '所有字段都必须填写。',
            });
            return;
        }

        // 密码验证
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            Swal.fire({
                icon: 'warning',
                title: '密码不符合要求',
                text: '密码必须至少8个字符，包含一个大写字母和一个特殊字符。',
            });
            return;
        }

        const data = { userName, name, emailAddress, password };

        try {
            const response = await fetch('/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            console.log(result)
            if (response.ok) { // 根据你的Result类判断成功条件
                Swal.fire({
                    icon: 'success',
                    title: '注册成功！',
                    text: '请登录您的账号。',
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    // 跳转到登录页面
                    window.location.href = 'login.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '注册失败',
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
