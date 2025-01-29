// js/utils.js

// 显示消息提示
function showMessage(icon, title, text, timer = 3000) {
    return Swal.fire({
        icon: icon,
        title: title,
        text: text,
        timer: timer,
        showConfirmButton: false
    });
}

// 检查是否已登录
function isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
}

// 获取用户信息
function getUserInfo() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function updateHeader() {
    const loginContainer = document.querySelector('.login-container');
    const userInfo = document.querySelector('#userInfo');
    const userNameDisplay = document.querySelector('#userNameDisplay');

    if (isLoggedIn()) {
        const user = getUserInfo();
        if (user) {
            loginContainer.classList.add('hidden'); // 隐藏登录/注册按钮
            userInfo.classList.remove('hidden');    // 显示用户信息

            if (user.avatar) {
                // 显示用户头像
                userNameDisplay.innerHTML = `<img src="${user.avatar}" alt="${user.name}'s avatar" class="avatar" id="userAvatar">`;
                userNameDisplay.addEventListener('click', () => {
                    // 跳转到 profile.html
                    console.log("跳转到:"+user.id);
                    window.location.href = `/profile.html?userId=${user.id}`;
                });
                userNameDisplay.classList.add('avatar-button-style');
            } else {
                // 如果没有头像，显示用户名或一个默认头像
                userNameDisplay.textContent = user.name;
            }
        }
    } else {
        console.log('未登录');
        loginContainer.classList.remove('hidden'); // 显示登录/注册按钮
        userInfo.classList.add('hidden');          // 隐藏用户信息
    }
}
