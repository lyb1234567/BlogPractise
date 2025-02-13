document.addEventListener("DOMContentLoaded", () => {
    // 从 URL 中获取 userId
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");

    // 获取页面中的 tab 相关 DOM
    const tabLinks = document.querySelectorAll(".profile-nav li");
    const tabTitle = document.getElementById("tab-title");
    const tabContent = document.getElementById("tab-content");

    // 如果没有提供 userId，直接报错并处理
    if (!userId) {
        console.error("未提供 userId");
        document.querySelector(".profile-name").textContent = "未知用户";
        return;
    }

    console.log("访问的用户ID:", userId);

    /**
     * 先去服务器获取当前用户信息
     */
    let user = null;
    fetch(`/user/getUser?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.code === 1) {
            user = result.data; // 拿到后端返回的用户 JSON
            console.log("从服务器获取到的用户:", user);

            // 在此处更新页面的用户信息
            document.querySelector(".profile-name").textContent = user.name || "未知用户";
            document.querySelector(".profile-desc").textContent = user.description || "暂无简介";
            document.querySelector(".profile-avatar img").src = user.avatar || "/default-avatar.png";
        } else {
            console.error("获取用户信息失败:", result.msg);
            document.querySelector(".profile-name").textContent = "未知用户";
        }
    })
    .catch(error => {
        console.error("获取用户信息出错:", error);
        document.querySelector(".profile-name").textContent = "未知用户";
    });

    // 加载统计信息
    loadProfileStats(userId);

    // 绑定 tab 切换事件
    loadsTab(userId);

    // 设定默认 tab（例如 "dynamic"）
    const initialTab = document.querySelector('[data-tab="dynamic"]');
    if (initialTab) {
        initialTab.classList.add("active"); // 设置初始 active 状态
        loadTabsInfo("dynamic", userId);    // 加载动态内容
    }
});

/**
 * 加载用户的统计信息（文章数、点赞数等）
 */
function loadProfileStats(userId) {
    const statsList = document.querySelector('.profile-stats ul');
    statsList.innerHTML = '<li>⏳ 数据加载中...</li>';

    Promise.all([
        getArticles(userId),
        getArticlesLikedByUserId(userId),
        getLikeCount(userId)
    ])
    .then(([createdArticles, likedArticles, likeCount]) => {
        statsList.innerHTML = '';
        statsList.innerHTML += `<li>📚 创作 ${createdArticles.length} 篇文章</li>`;
        statsList.innerHTML += `<li>❤️ 点赞 ${likedArticles.length} 篇文章</li>`;
        statsList.innerHTML += `<li>✨ 获得 ${likeCount} 次点赞</li>`;

        if (createdArticles.length > 10) {
            statsList.innerHTML += `<li>🏆 优质内容创作者</li>`;
        }
    })
    .catch(error => {
        console.error('加载统计数据失败:', error);
        statsList.innerHTML = `<li style="color:red;">❌ 数据加载失败: ${error}</li>`;
    });
}

/**
 * 绑定 tab 切换事件
 */
function loadsTab(userId) {
    const tabLinks = document.querySelectorAll(".profile-nav li");
    tabLinks.forEach((link) => {
        link.addEventListener("click", () => {
            tabLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
            const tabKey = link.dataset.tab;
            loadTabsInfo(tabKey, userId);
        });
    });
}

/**
 * 根据 tabKey 加载对应 tab 的数据
 */
function loadTabsInfo(tabKey, userId) {
    const tabTitle = document.getElementById("tab-title");
    const tabContent = document.getElementById("tab-content");
    tabContent.innerHTML = "";

    const titleMap = {
        dynamic: "我的动态",
        answers: "我的回答",
        questions: "我的提问",
        articles: "我的文章",
        thoughts: "我的想法",
        favorites: "我的收藏",
        follows: "我的关注",
    };

    tabTitle.textContent = titleMap[tabKey] || "我的动态";

    if (tabKey === "articles") {
        getArticles(userId).then(articleList => {
            if (articleList.length === 0) {
                tabContent.innerHTML = "<p>暂无文章</p>";
            } else {
                articleList.forEach(item => {
                    const article = document.createElement("article");
                    article.className = "activity-item";
                    let creationDate = item.creationDate
                        ? item.creationDate.replace("T", " ")
                        : "暂无时间";


                    article.innerHTML = `
                        <header>
                            <h4>${item.title || "暂无标题"}</h4>
                        </header>
                        <div class="time-wrapper"><time>${creationDate}</time></div>
                        <p>${item.content || "暂无内容"}</p>
                        <footer>
                            <a href="/article.html?articleId=${item.id || ""}">查看详情</a>
                        </footer>
                    `;
                    tabContent.appendChild(article);
                });
            }
        }).catch(error => {
            console.error("获取文章出错:", error);
            tabContent.innerHTML = `<p style="color:red;">加载文章出错：${error}</p>`;
        });
    }else if (tabKey === "dynamic")
         {
             const tabContent = document.getElementById("tab-content");
             tabContent.innerHTML = ""; // 清空内容

             // 先加载发表的文章列表
             getArticles(userId)
                 .then(createdArticles => {
                     if (createdArticles && createdArticles.length > 0) {
                         createdArticles.forEach(item => {
                             const article = document.createElement("article");
                             article.className = "activity-item";
                             let creationDate = item.creationDate
                                 ? item.creationDate.replace("T", " ")
                                 : "暂无时间";


                             const shortContentLength= 100;
                             const fullContent = item.content || "暂无内容";
                             let shortContent;
                             let readMoreLinkHTML = ''; // 初始化 "阅读全文" 链接的 HTML 为空

                             if (fullContent.length > shortContentLength) {
                                 shortContent = fullContent.substring(0, shortContentLength) + "...";
                                 readMoreLinkHTML = `<a href="#" class="read-more-link">阅读全文</a>`; // 如果内容超长，添加 "阅读全文" 链接
                             } else {
                                 shortContent = fullContent;
                                 // 如果内容不超长，则 readMoreLinkHTML 保持为空，不添加链接
                             }

                             article.innerHTML = `
                                 <header>
                                     <h6 style="color: #666">发表了文章</h6>
                                     <h4>${item.title || "暂无标题"}</h4>
                                 </header>
                                 <div class="time-wrapper"><time>${creationDate}</time></div>
                                 <div class="article-content-wrapper">  <!-- 新增 wrapper 包裹短内容和链接 -->
                                    <div class="article-short-content">${shortContent}</div>  <!-- 短内容 -->
                                    ${readMoreLinkHTML}  <!-- 插入 "阅读全文" 链接，如果 readMoreLinkHTML 为空，则不插入任何内容 -->
                                 </div>
                                 <div class="article-full-content" style="display: none;">${fullContent}</div>  <!-- 完整内容，初始隐藏 -->
                                 <footer>
                                     <a href="/article.html?articleId=${item.id || ""}">查看详情</a>
                                 </footer>
                             `;
                             tabContent.appendChild(article);
                         });
                     } else {
                         tabContent.innerHTML += "<p>暂无动态</p>"; // 如果之前没有内容，就显示 “暂无动态”
                     }

                    tabContent.addEventListener('click', function(event) {
                        if (event.target.classList.contains('read-more-link')) {
                            event.preventDefault();

                            const readMoreLink = event.target;

                            const article = readMoreLink.closest('.activity-item'); //  直接从 readMoreLink 向上找 .activity-item
                            console.log("article:", article); //  添加这行，用来检查是否找到了 article

                            if (article) { // 确保 article 不是 null，再继续操作
                                const fullContentDiv = article.querySelector('.article-full-content');
                                const shortContentDiv = article.querySelector('.article-short-content');

                                if (fullContentDiv.style.display === 'none') {
                                    fullContentDiv.style.display = 'block';
                                    shortContentDiv.style.display = 'none';
                                    readMoreLink.textContent = '收起全文';
                                } else {
                                    fullContentDiv.style.display = 'none';
                                    shortContentDiv.style.display = 'block';
                                    readMoreLink.textContent = '阅读全文';
                                }
                            } else {
                                console.error("错误： 找不到 .activity-item 父元素 for read-more-link", readMoreLink); //  添加错误提示
                            }
                        }
                    });

                     // 再加载点赞的文章列表
                     return getArticlesLikedByUserId(userId); // 返回 Promise，链式调用
                 })
                 .then(likedArticles => {
                     if (likedArticles && likedArticles.length > 0) {
                         likedArticles.forEach(item => {
                             const article = document.createElement("article");
                             article.className = "activity-item";

                             const creationDate = item.creationDate
                                 ? item.creationDate.replace("T", " ")
                                 : "暂无时间";

                             article.innerHTML = `
                                 <header>
                                     <h6 style="color: #666">赞同了文章</h6>
                                     <h4>${item.title || "暂无标题"}</h4>
                                 </header>
                                 <div class="time-wrapper">
                                     <time>${creationDate}</time>
                                 </div>
                                 <p>${item.content || "暂无内容"}</p>
                                 <footer>
                                     <a href="/article.html?articleId=${item.id || ""}">查看详情</a>
                                 </footer>
                             `;
                             tabContent.appendChild(article);
                         });
                     } else if (tabContent.innerHTML.trim() === "<p>暂无动态</p>") {
                         // 如果之前已经显示了 “暂无动态”，这里就不再重复显示
                     } else if (tabContent.innerHTML.trim() === "") {
                         tabContent.innerHTML = "<p>暂无动态</p>"; // 如果发表的文章也没有，点赞的文章也没有，显示 “暂无动态”
                     }
                 })
                 .catch(error => {
                     console.error("获取动态出错:", error);
                     tabContent.innerHTML = `<p style="color:red;">加载动态出错：${error}</p>`;
                 });
         }
    else if (tabKey === "follows") {
        fetch(`/user/getFollowers?userId=${userId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`请求失败，状态码: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.code === 1) {
                const followers = result.data;
                console.log(`获取到关注列表: ${JSON.stringify(followers, null, 2)}, userid: ${userId}`);
                tabContent.innerHTML = followers.length === 0
                    ? "<p>你还没有关注任何人</p>"
                    : "";

                followers.forEach(userVo => {
                    const followItem = document.createElement("div");
                    followItem.className = "follow-item";
                    followItem.innerHTML = `
                        <div class="follow-avatar">
                            <img src="${userVo.avatar || '/default-avatar.png'}" alt="用户头像">
                        </div>
                        <div class="follow-info">
                            <h4>
                                ${
                                    userVo.name
                                        ? `<a href="/profile.html?userId=${userVo.userId}" class="user-link">${userVo.name}</a>`
                                        : "未知用户"
                                }
                            </h4>
                            <p>${userVo.description || "暂无简介"}</p>
                        </div>
                        <div class="follow-action">
                            <button class="follow-btn followed" disabled>已关注</button>
                        </div>
                    `;
                    tabContent.appendChild(followItem);
                });
            } else {
                tabContent.innerHTML = `<p style="color:red;">加载失败: ${result.msg}</p>`;
            }
        })
        .catch(error => {
            console.error("获取关注列表失败:", error);
            tabContent.innerHTML = `<p style="color:red;">获取关注列表失败: ${error.message}</p>`;
        });
    } else {
        // 其他 tab 可自由扩展
        tabContent.innerHTML = "<p>其他功能暂未实现</p>";
    }
}

/**
 * 获取用户的点赞数量
 */
async function getLikeCount(userId) {
    try {
        const response = await fetch(`/user/getLikeCount?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }
        // 如果后端只返回一个数字字符串，比如 "13"
        // 可以用 parseInt 转成数字
        return parseInt(await response.text(), 10) || 0;
    } catch (error) {
        console.error("获取点赞数失败:", error);
        return 0;
    }
}

/**
 * 获取用户的文章
 */
function getArticles(userId) {
    return fetch(`/article/getArticlesByUserId?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }
        return response.json();
    })
    .then(result => result.code === 1 ? result.data : [])
    .catch(error => {
        console.error("获取文章出错:", error);
        return [];
    });
}


/**
 * 获取用户点赞的文章
 */
function getArticlesLikedByUserId(userId) {
    return fetch(`/article/getArticlesLikedByUserId?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }
        return response.json();
    })
    .then(result => result.code === 1 ? result.data : [])
    .catch(error => {
        console.error("获取点赞文章失败:", error);
        return [];
    });
}
