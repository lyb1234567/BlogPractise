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
            renderArticles(articles);
        } else {
            showMessage('error', '获取文章失败', result.message || '请稍后再试。');
        }
    } catch (error) {
        console.error('获取文章错误:', error);
        showMessage('error', '获取文章错误', '请稍后再试。');
    }
}

// 渲染文章卡片
function renderArticles(articles) {
    const articlesContainer = document.getElementById('articles');
    articlesContainer.innerHTML = ''; // 清空容器

    if (articles.length === 0) {
        articlesContainer.innerHTML = '<p>暂无热门文章。</p>';
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <h3>${escapeHTML(article.title)}</h3>
            <p>${escapeHTML(article.summary)}</p>
            <p class="likes">👍 ${article.likes}</p>
            <p><small>${new Date(article.creationDate).toLocaleDateString()}</small></p>
        `;
        // 点击卡片跳转到文章详情页（假设有对应的页面）
        card.addEventListener('click', () => {
            window.location.href = `/article.html?id=${article.id}`;
        });
        articlesContainer.appendChild(card);
    });
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
