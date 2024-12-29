// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    fetchTopArticles();
    setupLogout();
});

// 获取顶级五篇文章
async function fetchTopArticles() {
    try {
        const response = await fetch('/article/showTop5ArticlesByLikes', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        if (response.ok && result.code === 1) {
            const articles = result.data;
            await renderArticles(articles);
        } else {
            showMessage('error', '获取文章失败', result.message || '请稍后再试。');
        }
    } catch (error) {
        console.error('获取文章错误:', error);
        showMessage('error', '获取文章错误', '请稍后再试。');
    }
}

async function fetchLikedUsers(articleId) {
    try {
        const response = await fetch(`/article/getUserWhoLikes?articleId=${articleId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        if (response.ok && result.code === 1) {
            return result.data;
        } else {
            console.error(`获取文章 ${articleId} 的点赞用户失败:`, result.message);
            return [];
        }
    } catch (error) {
        console.error(`获取文章 ${articleId} 的点赞用户错误:`, error);
        return [];
    }
}

async function renderArticles(articles) {
    const articlesContainer = document.getElementById('articles');
    const userId = JSON.parse(localStorage.getItem('user')).id;

    articlesContainer.innerHTML = ''; // 清空容器

    if (articles.length === 0) {
        articlesContainer.innerHTML = '<p>暂无热门文章。</p>';
        return;
    }

    for (const article of articles) {
        const card = document.createElement('div');
        card.className = 'article-card';

        // 获取点赞用户列表
        const likedUsers = await fetchLikedUsers(article.id);
        console.log(article.id, likedUsers);
        const likeIconClass = likedUsers.some(user => user.id === userId) ? 'like-icon liked' : 'like-icon';
        console.log(article.id, likeIconClass);
        card.innerHTML = `
            <h3>${escapeHTML(article.title)}</h3>
            <p>${escapeHTML(article.summary)}</p>
            <p class="likes">
                <span class="${likeIconClass}" data-article-id="${article.id}" title="点赞">&#128077; ${article.likes}</span>
            </p>
            <p><small>${new Date(article.creationDate).toLocaleDateString()}</small></p>
        `;

        // 点击卡片跳转到文章详情页（假设有对应的页面）
        card.querySelector('h3').addEventListener('click', () => {
            window.location.href = `/article.html?id=${article.id}`;
        });

        // 点赞图标事件
        const likeIcon = card.querySelector('.like-icon');
        likeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡，防止触发卡片点击事件
            likeArticle(article.id, likeIcon);
        });

        articlesContainer.appendChild(card);
    }
}


// 点赞文章
async function likeArticle(articleId, likeIcon) {
    try {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const response = await fetch(`/article/likeArticle?userId=${userId}&articleId=${articleId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        if (response.ok && result.code === 1) {
            const articleVo = result.data;
            likeIcon.innerHTML = `&#128077; ${articleVo.likes}`;
            likeIcon.classList.toggle('liked');
            showMessage('success', '点赞成功', '感谢您的支持！');
        } else {
            showMessage('error', '点赞失败', result.message || '请稍后再试。');
        }
    } catch (error) {
        console.error('点赞错误:', error);
        showMessage('error', '点赞错误', '请稍后再试。');
    }
}


// 设置登出按钮功能
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateHeader();
        showMessage('success', '已登出', '您已成功登出。');
    });
}

// 防止XSS攻击，转义HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
