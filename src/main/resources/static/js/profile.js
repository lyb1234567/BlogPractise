


const user = JSON.parse(localStorage.getItem("user"));

const tabLinks = document.querySelectorAll(".profile-nav li");
const tabTitle = document.getElementById("tab-title");
const tabContent = document.getElementById("tab-content");

// 清空原有内容
tabContent.innerHTML = "";

// 设置标题
const titleMap = {
dynamic: "我的动态",
answers: "我的回答",
questions: "我的提问",
articles: "我的文章",
thoughts: "我的想法",
favorites: "我的收藏",
follows: "我的关注",
};

const tabs = {
dynamic: [],
answers: [],
questions: [],
articles: [],
thoughts: [],
favorites: [],
follows: []
};
function loadUserBasicInfo()
{
     document.querySelector(".profile-name").textContent = user.name;
     document.querySelector(".profile-desc").textContent = user.description ? user.description : "default description";
     document.querySelector(".profile-avatar img").src = user.avatar;
}

function loadProfileStats() {
    const statsList = document.querySelector('.profile-stats ul');

    // 清空现有内容
    statsList.innerHTML = '<li>⏳ 数据加载中...</li>';

    // 并行获取数据
    Promise.all([
        getArticles(user.id),
        getArticlesLikedByUserId(user.id)
    ])
    .then(([createdArticles, likedArticles]) => {
        // 清空加载状态
        statsList.innerHTML = '';

        // 创建文章统计
        const createdItem = document.createElement('li');
        createdItem.innerHTML = `📚 创作 ${createdArticles.length} 篇文章`;
        statsList.appendChild(createdItem);

        // 点赞文章统计
        const likedItem = document.createElement('li');
        likedItem.innerHTML = `❤️ 点赞 ${likedArticles.length} 篇文章`;
        statsList.appendChild(likedItem);

        // 最佳回答者认证（示例逻辑）
        if (createdArticles.length > 10) {
            const bestAnswerItem = document.createElement('li');
            bestAnswerItem.innerHTML = '🏆 优质内容创作者';
            statsList.appendChild(bestAnswerItem);
        }

        let honorsItem = document.createElement('li');
        // 其他成就数据
        getLikeCount(user.id)
          .then((likeCount) => {
            console.log('点赞数:', likeCount);
            honorsItem.innerHTML = `✨ 获得 ${likeCount} 次点赞`;
            statsList.appendChild(honorsItem);
          })
          .catch((error) => {
            console.error("获取点赞数失败:", error);
            honorsItem.innerHTML = "✨ 获取点赞数失败"; // 错误时显示友好提示
            statsList.appendChild(honorsItem);
          });

    }).catch(error => {
        console.error('加载统计数据失败:', error);
        statsList.innerHTML = `<li style="color:red;">❌ 数据加载失败: ${error}</li>`;
    });

    // 其他统计数据的获取（示例）
    // getOtherStats(user.id).then(...)
}
async function getLikeCount(userId) {
  try {
    const token = localStorage.getItem("token"); // 从本地存储获取 Token
    const response = await fetch(`/user/getLikeCount?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // 添加 Token
      },
    });
    if (!response.ok) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }
    const totalLikes = await response.text();
    return parseInt(totalLikes, 10) || 0;
  } catch (error) {
    console.error("获取点赞数失败:", error);
    return 0;
  }
}

function getArticlesLikedByUserId(userId)
{
  return new Promise((resolve, reject) => {
          // 检查 userId 是否有效
          if (!userId || isNaN(userId)) {
              return reject("无效的用户ID");
          }

          // 构造请求URL
          const url = `/article/getArticlesLikedByUserId?userId=${userId}`;

          // 使用 Fetch API 调用后端接口
          fetch(url, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json"
              }
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`请求失败，状态码: ${response.status}`);
              }
              return response.json(); // 解析 JSON 数据
          })
          .then(result => {
              if (result.code === 1) {
                  // 请求成功，解析返回的文章列表
                  resolve(result.data); // 返回 List<ArticleVo>
              } else {
                  // 请求失败，返回错误信息
                  reject(result.msg);
              }
          })
          .catch(error => {
              // 捕获请求过程中的错误
              reject(`请求过程中发生错误: ${error.message}`);
          });
      });
}
function getArticles(userId) {
    // 返回一个 Promise
    return new Promise((resolve, reject) => {
        // 检查 userId 是否有效
        if (!userId || isNaN(userId)) {
            return reject("无效的用户ID");
        }

        // 构造请求URL
        const url = `/article/getArticlesByUserId?userId=${userId}`;

        // 使用 Fetch API 调用后端接口
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`请求失败，状态码: ${response.status}`);
            }
            return response.json(); // 解析 JSON 数据
        })
        .then(result => {
            if (result.code === 1) {
                // 请求成功，解析返回的文章列表
                resolve(result.data); // 返回 List<ArticleVo>
            } else {
                // 请求失败，返回错误信息
                reject(result.msg);
            }
        })
        .catch(error => {
            // 捕获请求过程中的错误
            reject(`请求过程中发生错误: ${error.message}`);
        });
    });
}


function loadsTab()
{
  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // 切换 active
      tabLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const tabKey = link.dataset.tab;
      loadTabsInfo(tabKey);
    });
  });
}
function loadTabsInfo(tabKey) {
  // 清空原有内容
  tabContent.innerHTML = "";

  tabTitle.textContent = titleMap[tabKey] || "我的动态";

  // 如果选中的是“我的文章”tab，去请求文章数据
  if (tabKey === "articles") {
    // 注意：user 需要能正确拿到 id
    const articlesPromise = getArticles(user.id);

    articlesPromise
      .then((articleList) => {

        // 遍历文章列表，动态插入到 tabContent 中
        articleList.forEach((item) => {
          // 创建一个 <article> 元素
          const article = document.createElement("article");
          article.className = "activity-item";
            let creationDate;
            if (item && item.creationDate) {
                creationDate = item.creationDate.replace("T", " "); // 去掉 T，替换为空格
            } else {
                creationDate = "暂无时间"; // 如果 creationDate 不存在，显示默认值
            }

            // 设置 article 的 HTML 内容
            article.innerHTML = `
                <header>
                    <h6 style="color: #666">赞同了文章</h6>
                    <h4>${item.title || "暂无标题"}</h4>
                </header>
                <div class="time-wrapper"> <!-- 新增时间容器 -->
                    <time>${creationDate}</time>
                </div>
                <p>${item.content || "暂无内容"}</p>
                <footer>
                    <a href="/article.html?articleId=${item.id || ""}">查看详情</a>
                </footer>
            `;

          // 插入到 tabContent 容器中
          tabContent.appendChild(article);
        });
      })
      .catch((error) => {
        console.error("获取文章出错:", error);
        // 可以在 tabContent 中提示错误信息
        tabContent.innerHTML = `<p style="color:red;">加载文章出错：${error}</p>`;
      });
  } else if (tabKey === "dynamic")
  {
      const articlesLikedPromise = getArticlesLikedByUserId(user.id);
      articlesLikedPromise
            .then((articleList) => {
              // 遍历文章列表，动态插入到 tabContent 中
                articleList.forEach((item) => {
                // 创建一个 <article> 元素
                const article = document.createElement("article");
                article.className = "activity-item";
                // 获取 creationDate 并格式化
                let creationDate;
                if (item && item.creationDate) {
                    creationDate = item.creationDate.replace("T", " "); // 去掉 T，替换为空格
                } else {
                    creationDate = "暂无时间"; // 如果 creationDate 不存在，显示默认值
                }

                // 设置 article 的 HTML 内容
                article.innerHTML = `
                    <header>
                        <h6 style="color: #666">赞同了文章</h6>
                        <h4>${item.title || "暂无标题"}</h4>
                    </header>
                    <div class="time-wrapper"> <!-- 新增时间容器 -->
                        <time>${creationDate}</time>
                    </div>
                    <p>${item.content || "暂无内容"}</p>
                    <footer>
                        <a href="/article.html?articleId=${item.id || ""}">查看详情</a>
                    </footer>
                `;
                tabContent.appendChild(article);
              });
            })
            .catch((error) => {
              console.error("获取文章出错:", error);
              // 可以在 tabContent 中提示错误信息
              tabContent.innerHTML = `<p style="color:red;">加载文章出错：${error}</p>`;
            });
  }
  else {
    // 如果选中的是其他 tab，则执行你原先的逻辑
    // （比如从一个本地对象 tabs 中获取内容后再渲染）
    // 这里给一个示例，假设你有个 tabs 对象存放其他 tab 的内容
    if (tabs[tabKey] && Array.isArray(tabs[tabKey])) {
      tabs[tabKey].forEach((item) => {
        const article = document.createElement("article");
        article.className = "activity-item";
        article.innerHTML = `
          <header>
            <h4>${item.title}</h4>
            <time>${item.time}</time>
          </header>
          <p>${item.content}</p>
          <footer>
            <a href="#">查看详情</a>
          </footer>
        `;
        tabContent.appendChild(article);
      });
    } else {
      // 没有内容的情况
      tabContent.innerHTML = "<p>暂无内容</p>";
    }
  }
}




document.addEventListener("DOMContentLoaded", () => {
    loadUserBasicInfo();
    loadsTab();
    loadProfileStats();
    const initialTab = document.querySelector('[data-tab="dynamic"]');
    if (initialTab) {
        initialTab.classList.add("active"); // 设置初始active状态
        loadTabsInfo("dynamic"); // 主动加载动态内容
    }
});