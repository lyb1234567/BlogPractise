// 安全地转义HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// 显示消息提示（简单示例）
function showMessage(type, title, message) {
    // 例如，使用浏览器的 alert
    alert(`${title}: ${message}`);
}

// 获取 URL 参数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("urlParams:"+urlParams);  // 获取参数值
    return urlParams.get(param);
}

// 渲染文章详情
function renderArticle(article) {
    const articleContainer = document.getElementById('article-container');
    articleContainer.innerHTML = `
        <a href="javascript:history.back()" class="back-button">← 返回</a>
        <h1>${escapeHTML(article.title)}</h1>
        <p class="author">作者：${escapeHTML(article.userName)} | 发布于：${new Date(article.creationDate).toLocaleDateString()}</p>
        <div class="content">
            ${escapeHTML(article.content).replace(/\n/g, '<br>')}
        </div>
    `;
}

// 获取并渲染文章详情
async function fetchAndRenderArticle(articleId) {
    try {
        const response = await fetch(`/article/showArticle?articleId=${articleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        if (response.ok && result.code === 1) {
            const article = result.data;
            renderArticle(article);
        } else {
            showMessage('error', '获取文章失败', result.message || '请稍后再试。');
        }
    } catch (error) {
        console.error('获取文章错误:', error);
        showMessage('error', '获取文章错误', '请稍后再试。');
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    const articleId = getQueryParam('articleId');
    console.log('articleId:', articleId);
    if (articleId) {
        fetchAndRenderArticle(articleId);
    } else {
        showMessage('error', '参数错误', '未指定文章ID。');
    }
});
