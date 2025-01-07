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

// 获取点赞用户
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

// 获取评论列表
async function fetchComments(articleId) {
    try {
        const response = await fetch(`/comment/getComments?articleId=${articleId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        if (response.ok && result.code === 1) {
            return result.data; // 评论数组（扁平结构，每条都有 parentId）
        } else {
            console.error('获取评论失败:', result.message || '接口返回错误');
            return [];
        }
    } catch (error) {
        console.error('获取评论错误:', error);
        return [];
    }
}

/**
 * 把扁平的评论数据构建成树状结构
 * @param {Array} comments - 从后端拿到的评论数组
 * @returns {Array} 根评论数组，每个元素包含子评论（children）
 */
function buildCommentTree(comments, parentId = 0) {
    const roots = [];
    const map = {};

    // 创建评论对象映射
    comments.forEach(comment => {
        map[comment.id] = { ...comment, children: [] };
    });

    // 构建树结构
    comments.forEach(comment => {
        if (comment.parentId === 0) {
            roots.push(map[comment.id]);
        } else {
            if (map[comment.parentId]) {
                map[comment.parentId].children.push(map[comment.id]);
                // 设置子评论的 parentUserName
                map[comment.id].parentUserName = map[comment.parentId].userName;
            }
        }
    });

    return roots;
}

/**
 * 递归渲染一条评论，以及它的子评论
 * @param {Object} commentNode - 带 children 的评论对象
 * @returns {HTMLElement} DOM节点
 */
function renderCommentNode(commentNode, depth = 0) {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';

    if (depth === 0) {
        // 根评论
        commentItem.innerHTML = `
            <p>
                <img src="${commentNode.userAvatar}"
                     alt="${commentNode.authorName}'s avatar"
                     class="comment-avatar">
                <strong class="userName">${escapeHTML(commentNode.userName || '')}</strong>
            </p>
            <p class="comment-content">
                ${escapeHTML(commentNode.content || '')}
            </p>
            <p class="comment-footer">
                <span class="comment-date">${commentNode.creationDate}</span>
                <span class="reply-button" data-comment-id="${commentNode.id}" title="回复">💬 回复</span>
            </p>
        `;
    } else if (depth === 1)  // 子评论
    {
        // 非根评论
        commentItem.innerHTML = `
            <p>
                <img src="${commentNode.userAvatar}"
                     alt="${commentNode.authorName}'s avatar"
                     class="comment-avatar">
                <strong class="userName">${escapeHTML(commentNode.userName || '')}</strong>
            </p>
            <p class="comment-content">
                ${escapeHTML(commentNode.content || '')}
            </p>
            <p class="comment-footer">
                <span class="comment-date">${commentNode.creationDate}</span>
                <span class="reply-button" data-comment-id="${commentNode.id}" title="回复">💬 回复</span>
            </p>
        `;
    }
    else if(depth>1)
    {
          commentItem.innerHTML = `
            <p>
                <img src="${commentNode.userAvatar}"
                     alt="${commentNode.authorName}'s avatar"
                     class="comment-avatar">
                <strong class="userName">${escapeHTML(commentNode.userName || '')}</strong>
                <span class="arrow">➤</span>
                <strong class="parentUserName">${escapeHTML(commentNode.parentUserName || '')}</strong>
            </p>
              <p class="comment-content">
                  ${escapeHTML(commentNode.content || '')}
              </p>
            <p class="comment-footer">
                <span class="comment-date">${commentNode.creationDate}</span>
                <span class="reply-button" data-comment-id="${commentNode.id}" title="回复">💬 回复</span>
            </p>
          `;
    }

    // 渲染子评论
    if (commentNode.children && commentNode.children.length > 0) {
        const childrenContainer = document.createElement('div');
        if ((depth+1)===1)
        {
            childrenContainer.className = 'comment-children';
        }
        if ((depth+1)>1)
        {
           childrenContainer.className = 'comment-children-nested';
        }
        commentNode.children.forEach(child => {
            const childEl = renderCommentNode(child, depth + 1);
            childrenContainer.appendChild(childEl);
        });

        commentItem.appendChild(childrenContainer);
    }

    return commentItem;
}

/**
 * 将评论（扁平数据）渲染成层级结构
 * @param {Array} comments - 扁平评论数组
 * @param {HTMLElement} container - 评论容器
 */
function renderCommentsHierarchy(comments, container) {
    container.innerHTML = ''; // 清空原有内容

    if (!comments || comments.length === 0) {
        container.innerHTML = '<p>暂无评论</p>';
        return;
    }

    // 先构建树状结构
    const roots = buildCommentTree(comments);
    // 逐个渲染根评论
    roots.forEach(root => {
        const rootEl = renderCommentNode(root);
        container.appendChild(rootEl);
    });

    // 绑定回复按钮点击事件
    const replyButtons = document.querySelectorAll(".reply-button");
    replyButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentCommentId = button.getAttribute("data-comment-id");
//            TODO: 跳转到评论编辑页并带上被回复的评论 ID ，需要参数artilceId和commentId
        });
    }); // 这里补全了缺少的括号
}

async function renderArticles(articles) {
    const articlesContainer = document.getElementById('articles');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // 若本地没有用户信息，可能需要跳转登录等
        console.warn('尚未登录或用户信息缺失');
    }

    const userId = user?.id;
    articlesContainer.innerHTML = ''; // 清空容器

    if (articles.length === 0) {
        articlesContainer.innerHTML = '<p>暂无热门文章。</p>';
        return;
    }

    for (const article of articles) {
        const card = document.createElement('div');
        card.className = 'article-card';

        // 1. 获取点赞用户，判断当前用户是否已点赞
        const likedUsers = await fetchLikedUsers(article.id);
        const isLiked = likedUsers.some(u => u.id === userId);
        const likeIconClass = isLiked ? 'like-icon liked' : 'like-icon';

        // 2. 构造点赞图标内容
        let likeIconHTML = `👍${article.likes}`;
        if (isLiked) {
            likeIconHTML = `👍🏿${article.likes}`;
        }

        // 3. 初始化评论气泡，先显示 0
        //    若后端已返回 commentCount，可替换为 article.commentCount
        const comments = await fetchComments(article.id);
        const commentIconHTML = `💬 ${comments.length}`;

        // 4. 组装文章卡片 HTML
        card.innerHTML = `
            <h3>${escapeHTML(article.title)}</h3>
            <p>${escapeHTML(article.summary)}</p>
            <p class="likes">
                <span class="${likeIconClass}" data-article-id="${article.id}" title="点赞">
                    ${likeIconHTML}
                </span>
                <span class="comment-icon" data-article-id="${article.id}" title="评论">
                    ${commentIconHTML}
                </span>
            </p>
            <p><small>${new Date(article.creationDate).toLocaleDateString()}</small></p>
            <!-- 评论区容器，默认隐藏 -->
            <div class="comments-section" style="display: none;"></div>
        `;

        // 5. 点击文章标题 -> 跳转详情页
        card.querySelector('h3').addEventListener('click', () => {
            window.location.href = `/article.html?articleId=${article.id}`;
        });

        // 6. 点赞图标事件
        const likeIcon = card.querySelector('.like-icon');
        likeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡，防止触发卡片点击
            if (likeIcon.classList.contains('liked')) {
                unlikeArticle(article.id, likeIcon);
            } else {
                likeArticle(article.id, likeIcon);
            }
        });

        // 7. 评论图标事件
        const commentIcon = card.querySelector('.comment-icon');
        const commentsSection = card.querySelector('.comments-section');
        commentIcon.addEventListener('click', async (e) => {
            e.stopPropagation();
            // 获取当前文章的评论数据
            const comments = await fetchComments(article.id);
            // 显示弹窗并渲染评论
            showCommentPopup(comments);
        });

        // 把卡片加到列表容器
        articlesContainer.appendChild(card);
    }
}

function showCommentPopup(comments, articleId) {
    const popup = document.getElementById('comment-popup');
    const popupComments = document.getElementById('popup-comments');
    const popupTitle = document.getElementById('comment-title');

    // 清空之前的评论内容
    popupComments.innerHTML = '';

    // 设置标题
    popupTitle.textContent = `${comments.length}条评论`;

    // 渲染新的评论内容
    renderCommentsHierarchy(comments, popupComments);

    // 设置 articleId 到 popup 的 data 属性
    popup.dataset.articleId = articleId;

    // 显示弹窗
    popup.style.display = 'flex';

    // 绑定提交事件
    document.getElementById('submit-comment').addEventListener('click', () => {
        submitComment(articleId);
    }, { once: true });

    // 绑定关闭事件
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('comment-popup');
        if (popup && popup.style.display === 'flex') {
            if (e.target.id === 'close-popup') {
                popup.style.display = 'none';
                document.getElementById('comment-content').value = '';
            }
        }
    });
}

function submitComment(articleId) {
    const content = document.getElementById('comment-content').value.trim();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('请登录后发表评论。');
        return;
    }
    if (content === '') {
        alert('评论内容不能为空。');
        return;
    }
    if (content.length > 500) {
        alert('评论内容不能超过 500 字符。');
        return;
    }
    const userId = user.id;
    // 发送 POST 请求到后端
    fetch('/comment/addComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            userId: userId,
            articleId: articleId,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 1) {
            // 评论成功，刷新评论列表
            fetchComments(articleId).then(comments => {
                renderCommentsHierarchy(comments, document.getElementById('popup-comments'));
                // 更新标题
                document.getElementById('comment-title').textContent = `评论 (${comments.length} 条)`;
                // 清空输入框
                document.getElementById('comment-content').value = '';
            });
        } else {
            // 显示错误信息
            alert(data.message || '评论失败，请重试。');
        }
    })
    .catch(error => {
        console.error('评论错误:', error);
        alert('评论失败，请检查网络连接。');
    });
}
// 取消文章点赞
async function unlikeArticle(articleId, likeIcon) {
    try {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const response = await fetch(`/article/unlikeArticle?userId=${userId}&articleId=${articleId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        if (response.ok && result.code === 1) {
            const articleVo = result.data;
            // 更新点赞图标
            likeIcon.innerHTML = `👍${articleVo.likes}`;
            likeIcon.classList.remove('liked');
        } else {
            showMessage('error', '取消点赞失败', result.message || '请稍后再试。');
        }
    } catch (error) {
        console.error('取消点赞错误:', error);
        showMessage('error', '取消点赞失败', error.message || '请稍后再试。');
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
            // 更新点赞图标
            likeIcon.innerHTML = `👍🏿${articleVo.likes}`;
            likeIcon.classList.add('liked');
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