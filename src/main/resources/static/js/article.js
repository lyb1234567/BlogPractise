/***** 全局变量：存储评论结构 *****/
let commentMap = {};   // commentId -> node
let rootComments = []; // 顶级评论数组

// ========== 主题切换 (示例) ==========
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });
}




// ========== 获取 URL 中的 articleId ==========
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get("articleId");

// ========== 渲染文章内容 ==========
async function renderArticle() {
  const articleTitleEl = document.getElementById("articleTitle");
  const articleAuthorEl = document.getElementById("articleAuthor");
  const articleContentEl = document.getElementById("articleContent");
  const articleNotFoundEl = document.getElementById("articleNotFound");

  if (!articleId) {
    articleTitleEl.textContent = "文章 ID 无效";
    articleAuthorEl.textContent = "作者：未知";
    articleContentEl.textContent = "未提供有效的文章 ID。";
    return;
  }

  try {
    const articleResponse = await fetch(`/article/getArticle?articleId=${articleId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!articleResponse.ok) {
      throw new Error(`文章请求失败，状态码: ${articleResponse.status}`);
    }

    const articleData = await articleResponse.json();
    if (articleData.code === 1 && articleData.data) {
      const article = articleData.data;

      // 请求作者信息
      const userResponse = await fetch(`/user/getUser?userId=${article.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!userResponse.ok) {
        throw new Error(`用户请求失败，状态码: ${userResponse.status}`);
      }
      const userData = await userResponse.json();

      // 渲染文章标题、作者、内容
      articleTitleEl.textContent = article.title || "无标题";
      articleAuthorEl.textContent = `作者：${userData.code === 1 && userData.data ? userData.data.name : "未知"}`;
      articleContentEl.innerHTML = article.content || "无内容";

      // 隐藏“未找到”，显示文章内容
      articleNotFoundEl.style.display = "none";
      articleTitleEl.style.display = "block";
      articleAuthorEl.style.display = "block";
      articleContentEl.style.display = "block";
    } else {
      showArticleNotFound();
    }
  } catch (error) {
    console.error("加载文章失败:", error);
    articleTitleEl.textContent = "加载失败";
    articleAuthorEl.textContent = "作者：未知";
    articleContentEl.textContent = "无法加载文章内容，请稍后重试。";
  }
}

function showArticleNotFound() {
  const articleTitleEl = document.getElementById("articleTitle");
  const articleAuthorEl = document.getElementById("articleAuthor");
  const articleContentEl = document.getElementById("articleContent");
  const articleNotFoundEl = document.getElementById("articleNotFound");

  articleTitleEl.style.display = "none";
  articleAuthorEl.style.display = "none";
  articleContentEl.style.display = "none";
  articleNotFoundEl.style.display = "block";
}

// ========== 1. 获取所有评论 ==========
async function fetchComments(articleId) {
  try {
    const response = await fetch(`/comment/getComments?articleId=${articleId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const result = await response.json();
    if (response.ok && result.code === 1) {
      return result.data; // 评论数组
    } else {
      console.error('获取评论失败:', result.message || '接口返回错误');
      return [];
    }
  } catch (error) {
    console.error('获取评论错误:', error);
    return [];
  }
}

// ========== 2. 构建评论树 ==========
function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  // 创建节点映射
  comments.forEach(comment => {
    // 每条评论对象上，初始化 children, totalReplies
    map[comment.id] = {
      ...comment,
      children: [],
      totalReplies: 0
    };
  });

  // 组装树结构 + 给子节点加上 parentUserName
  comments.forEach(comment => {
    const node = map[comment.id];
    if (comment.parentId === 0) {
      roots.push(node);
    } else {
      if (map[comment.parentId]) {
        map[comment.parentId].children.push(node);
        node.parentUserName = map[comment.parentId].userName;
      }
    }
  });

  // 计算子孙数量
  roots.forEach(root => computeDescendantCount(root));

  return { map, roots };
}

/** 递归计算某个节点下所有子孙评论数量 */
function computeDescendantCount(node) {
  let sum = node.children.length;
  node.children.forEach(child => {
    sum += computeDescendantCount(child);
  });
  node.totalReplies = sum;
  return sum;
}

// ========== 3. 事件委托：点击「回复」按钮 -> 弹出表单 -> 提交并局部插入 ==========
function enableReplyDelegation(commentContainer, articleId) {
  let activeReplyForm = null;

  commentContainer.addEventListener("click", async (e) => {
    // 判断是否点击了 .reply-button
    if (e.target && e.target.classList.contains("reply-button")) {
      // 若已有表单，先移除
      if (activeReplyForm) {
        activeReplyForm.remove();
        activeReplyForm = null;
      }

      const button = e.target;
      const currentCommentId = +button.getAttribute("data-comment-id");

      // 创建表单
      const replyForm = document.createElement('form');
      replyForm.classList.add('reply-form');
      replyForm.innerHTML = `
        <textarea placeholder="输入你的回复..." required></textarea>
        <div class="reply-form-actions">
          <button type="submit" class="submit-reply">提交回复</button>
          <button type="button" class="cancel-reply">取消</button>
        </div>
      `;

      // 插到按钮后面
      button.parentNode.insertBefore(replyForm, button.nextSibling);
      activeReplyForm = replyForm;

      // 表单提交事件
      replyForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const content = replyForm.querySelector("textarea").value.trim();
        if (!content) {
          alert("回复内容不能为空");
          return;
        }

        try {
          // 1) 调后端插入，返回新评论数据
          const newCommentData = await insertComment(articleId, currentCommentId, content);

          // 2) 在本地数据结构插入
          const newNode = handleNewlyInsertedComment(newCommentData);

          // 3) 在页面上局部插入DOM，无需刷新
          const parentDOM = document.querySelector(`.comment-item[data-comment-id="${currentCommentId}"]`);
          if (parentDOM) {
            const childContainer = parentDOM.querySelector(`.comment-children[data-children-container="${currentCommentId}"]`);
            if (childContainer) {
              // 如果父容器存在但折叠，自动展开并插入新回复
              if (childContainer.classList.contains('hidden')) {
                childContainer.classList.remove('hidden');
                const viewBtn = parentDOM.querySelector('.view-replies-btn');
                if (viewBtn) {
                  viewBtn.textContent = '收起';
                }
              }
              // 将新回复渲染到子容器中
              const parentDepth = parseInt(parentDOM.dataset.depth, 10) || 0;
              const newEl = renderSingleComment(newNode, parentDepth + 1);
              childContainer.appendChild(newEl);

            } else {
              // 如果父节点从未创建 childrenContainer，动态创建并默认展开
              const newChildrenContainer = document.createElement('div');
              newChildrenContainer.classList.add('comment-children');
              newChildrenContainer.dataset.childrenContainer = currentCommentId;
              // 默认展示
              newChildrenContainer.classList.remove('hidden');

              const parentDepth = parseInt(parentDOM.dataset.depth, 10) || 0;
              const newEl = renderSingleComment(newNode, parentDepth + 1);
              newChildrenContainer.appendChild(newEl);

              // 创建“查看/收起”按钮
              const viewRepliesBtn = document.createElement('button');
              viewRepliesBtn.className = 'view-replies-btn';
              viewRepliesBtn.textContent = '收起';
              viewRepliesBtn.addEventListener("click", () => {
                if (newChildrenContainer.classList.contains('hidden')) {
                  newChildrenContainer.classList.remove('hidden');
                  viewRepliesBtn.textContent = '收起';
                } else {
                  newChildrenContainer.classList.add('hidden');
                  viewRepliesBtn.textContent = `查看 ${newNode.totalReplies} 条回复`;
                }
              });

              // 把按钮和容器插入父评论DOM
              parentDOM.appendChild(viewRepliesBtn);
              parentDOM.appendChild(newChildrenContainer);
            }
          } else {
            // 父节点DOM不存在 => 说明这是新的根评论
            rootComments.push(newNode);
            const container = document.getElementById('commentList');
            const newRootEl = renderSingleComment(newNode, 0);
            container.appendChild(newRootEl);
          }

        } catch (err) {
          console.error("回复失败:", err);
          alert("回复失败，请重试");
        }

        // 移除回复表单
        replyForm.remove();
        activeReplyForm = null;
      });

      // 取消按钮
      const cancelBtn = replyForm.querySelector(".cancel-reply");
      cancelBtn.addEventListener("click", () => {
        replyForm.remove();
        activeReplyForm = null;
      });

      // 聚焦
      replyForm.querySelector("textarea").focus();
    }
  });
}

// ========== 4. 在本地数据结构插入新节点 + 设置 parentUserName + 更新父 totalReplies ==========
function handleNewlyInsertedComment(newCommentData) {
  // 建立新节点
  const newNode = {
    ...newCommentData,
    children: [],
    totalReplies: 0
  };

  // 存进全局map
  commentMap[newNode.id] = newNode;

  // 找到父节点
  if (newNode.parentId && commentMap[newNode.parentId]) {
    const parentNode = commentMap[newNode.parentId];
    // 给新节点赋 parentUserName = 父节点的 userName
    newNode.parentUserName = parentNode.userName;

    // 放进父节点children
    parentNode.children.push(newNode);

    // 递归给祖先 totalReplies+1
    incrementTotalRepliesUpChain(newNode.parentId);
  } else {
    // 是根评论
    rootComments.push(newNode);
  }

  return newNode;
}

/** 往上级一路加 totalReplies */
function incrementTotalRepliesUpChain(commentId) {
  let current = commentMap[commentId];
  while (current) {
    current.totalReplies++;
    if (current.parentId && current.parentId !== 0) {
      current = commentMap[current.parentId];
    } else {
      current = null;
    }
  }
}

// ========== 5. renderSingleComment: 渲染单条评论DOM(不递归) ==========
function renderSingleComment(comment, depth) {
  const commentItem = document.createElement('div');
  commentItem.className = 'comment-item';
  commentItem.dataset.commentId = comment.id;
  commentItem.dataset.depth = depth;

  let html = '';

  // 根据深度展示不同结构
  if (depth === 0) {
    html = `
      <p>
        <img src="${comment.userAvatar || ''}"
             alt="${escapeHTML(comment.userName || '')}"
             class="comment-avatar">
        <strong class="userName">${escapeHTML(comment.userName || '')}</strong>
      </p>
      <p class="comment-content">${escapeHTML(comment.content || '')}</p>
      <p class="comment-footer">
        <span class="comment-date">${comment.creationDate || ''}</span>
        <span class="reply-button" data-comment-id="${comment.id}" title="回复">💬 回复</span>
      </p>
    `;
  } else if (depth === 1) {
    html = `
      <p>
        <img src="${comment.userAvatar || ''}"
             alt="${escapeHTML(comment.userName || '')}"
             class="comment-avatar">
        <strong class="userName">${escapeHTML(comment.userName || '')}</strong>
      </p>
      <p class="comment-content">${escapeHTML(comment.content || '')}</p>
      <p class="comment-footer">
        <span class="comment-date">${comment.creationDate || ''}</span>
        <span class="reply-button" data-comment-id="${comment.id}" title="回复">💬 回复</span>
      </p>
    `;
  } else {
    // 更深层：显示 parentUserName
    html = `
      <p>
        <img src="${comment.userAvatar || ''}"
             alt="${escapeHTML(comment.userName || '')}"
             class="comment-avatar">
        <strong class="userName">${escapeHTML(comment.userName || '')}</strong>
        <span class="arrow">➤</span>
        <strong class="parentUserName">${escapeHTML(comment.parentUserName || '')}</strong>
      </p>
      <p class="comment-content">${escapeHTML(comment.content || '')}</p>
      <p class="comment-footer">
        <span class="comment-date">${comment.creationDate || ''}</span>
        <span class="reply-button" data-comment-id="${comment.id}" title="回复">💬 回复</span>
      </p>
    `;
  }

  commentItem.innerHTML = html;

  // 若有子孙评论，用 totalReplies 判断
  if (comment.totalReplies > 0) {
    const viewRepliesBtn = document.createElement('button');
    viewRepliesBtn.className = 'view-replies-btn';
    viewRepliesBtn.textContent = `查看 ${comment.totalReplies} 条回复`;

    const childrenContainer = document.createElement('div');
    childrenContainer.classList.add('comment-children', 'hidden');
    // 标记该容器属于哪个 commentId
    childrenContainer.dataset.childrenContainer = comment.id;

    // 展开/收起
    viewRepliesBtn.addEventListener("click", () => {
      if (childrenContainer.classList.contains('hidden')) {
        if (!childrenContainer.hasChildNodes()) {
          renderNestedComments(comment.children, childrenContainer, depth + 1);
        }
        childrenContainer.classList.remove('hidden');
        viewRepliesBtn.textContent = '收起';
      } else {
        childrenContainer.classList.add('hidden');
        viewRepliesBtn.textContent = `查看 ${comment.totalReplies} 条回复`;
      }
    });

    commentItem.appendChild(viewRepliesBtn);
    commentItem.appendChild(childrenContainer);
  }

  return commentItem;
}

// ========== 递归渲染一批评论节点（完整渲染子孙）==========
function renderNestedComments(comments, container, depth = 0) {
  comments.forEach(comment => {
    const el = renderSingleComment(comment, depth);
    container.appendChild(el);
  });
}

// ========== 插入新评论(请求后端) ==========
async function insertComment(articleId, parentId, content) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('用户未登录');

  const formData = new URLSearchParams();
  formData.append('userId', user.id);
  formData.append('articleId', articleId);
  formData.append('content', content);
  formData.append('parentId', parentId);

  const response = await fetch('/comment/insertComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData.toString()
  });
  const result = await response.json();
  if (response.ok && result.code === 1) {
    // 后端返回的新评论数据
    return result.data;
  } else {
    throw new Error(result.message || '插入评论失败');
  }
}

// ========== 转义HTML ==========
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ========== 页面初始化逻辑 ==========
(async function initPage() {
  // 1. 渲染文章
  await renderArticle();

  // 2. 如果有 articleId，获取并渲染评论
  if (articleId) {
    const comments = await fetchComments(articleId);
    const { map, roots } = buildCommentTree(comments);

    // 存到全局
    commentMap = map;
    rootComments = roots;

    // 初次渲染
    const commentContainer = document.getElementById('commentList');
    renderNestedComments(rootComments, commentContainer, 0);

    // 显示评论数量
    document.getElementById('comment-title').textContent = `评论 ${comments.length} 条`;

    // 启用事件委托
    enableReplyDelegation(commentContainer, articleId);
  }

  const submitCommentBtn = document.getElementById("submit-comment");
    const contentEl = document.getElementById("comment-content");
    if (submitCommentBtn && contentEl) {
      submitCommentBtn.addEventListener("click", async () => {
        const content = contentEl.value.trim();
        if (!content) {
          alert("评论内容不能为空");
          return;
        }

        try {
          // 提交根评论（父评论ID = 0）
          const newCommentData = await insertComment(articleId, 0, content);
          // 在本地插入到数据结构
          const newNode = handleNewlyInsertedComment(newCommentData);

          // 将新根评论 DOM 追加到评论列表
          const container = document.getElementById('commentList');
          const newRootEl = renderSingleComment(newNode, 0);
          container.appendChild(newRootEl);

          // 清空输入框
          contentEl.value = '';
          const comments = await fetchComments(articleId);
          document.getElementById('comment-title').textContent = `评论 ${comments.length} 条`;

        } catch (err) {
          console.error("发布评论失败:", err);
          alert("发布评论失败，请稍后重试");
        }
      });
    }
})();
