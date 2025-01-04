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
function buildCommentTree(comments) {
    // 用字典存所有评论，key=评论id
    const map = {};
    comments.forEach(c => {
        // 初始化子评论数组
        map[c.id] = { ...c, children: [] };
    });

    // 收集根评论
    const rootComments = [];


    comments.forEach(c => {
        const current = map[c.id];
        // 如果 parentId == 0，则是根评论
        if (c.parentId === 0) {
            rootComments.push(current);
        } else {
            // 否则，放到父评论的 children 中
            const parent = map[c.parentId];
            if (parent) {
                parent.children.push(current);
            }
        }
    });


    return rootComments;
}

/**
 * 递归渲染一条评论，以及它的子评论
 * @param {Object} commentNode - 带 children 的评论对象
 * @returns {HTMLElement} DOM节点
 */
function renderCommentNode(commentNode , depth = 0) {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';

    // 评论内容，视你的字段情况作调整
    // 这里假设后端返回了 authorName, content, createTime
    commentItem.innerHTML = `
        <p>
            <img src="${commentNode.userAvatar}"
                 alt="${commentNode.authorName}'s avatar"
                 class="comment-avatar">
            <strong class="userName">${escapeHTML(commentNode.userName || '')}</strong>
        </p>
        <p class = "comment-content">
            ${escapeHTML(commentNode.content || '')}
        </p>
        <p class="comment-date">
              ${commentNode.creationDate ? new Date(commentNode.creationDate).toLocaleDateString() : ''}
        </p>
    `;


    // 如果有子评论，递归渲染
    if (commentNode.children && commentNode.children.length > 0 ) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'comment-children';
        commentNode.children.forEach(child => {
            const childDepth = depth + 1; // 子评论的深度加 1
            const childEl = renderCommentNode(child,depth);
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

            // 若评论区隐藏，则加载并显示；若已显示，则隐藏
            if (commentsSection.style.display === 'none') {
                // 拉取评论数据
                const comments = await fetchComments(article.id);
                // 用层级方式渲染评论
                renderCommentsHierarchy(comments, commentsSection);
                // 显示评论区
                commentsSection.style.display = 'block';
            } else {
                // 隐藏评论区
                commentsSection.style.display = 'none';
            }
        });

        // 把卡片加到列表容器
        articlesContainer.appendChild(card);
    }
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
