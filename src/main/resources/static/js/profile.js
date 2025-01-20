


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
      console.log("切换到 tab:", link,tabKey);
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
        console.log("获取到的文章列表:", articleList);

        // 遍历文章列表，动态插入到 tabContent 中
        articleList.forEach((item) => {
          // 创建一个 <article> 元素
          const article = document.createElement("article");
          article.className = "activity-item";

          // 你可以根据后端返回的字段名称自行替换
          // 这里假设后端返回了 item.title, item.createTime, item.content 等字段
          article.innerHTML = `
            <header>
              <h4>${item.title}</h4>
              <time>${item.createTime || "暂无时间"}</time>
            </header>
            <p>${item.content || "暂无内容"}</p>
            <footer>
              <a href="/article.html?articleId=${item.id}">查看详情</a>
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
  } else {
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
});