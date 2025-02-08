    /**
     * 使用 KaTeX 渲染数学公式
     * 遍历指定元素下的所有文本节点，替换行内和块级公式为 KaTeX 渲染结果
     * 若渲染出错，则保留原始 TeX 代码
     */
    function renderMathInElement(element) {
      // 创建 TreeWalker 遍历所有文本节点
      var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
      var node;
      var textNodes = [];
      while(node = walker.nextNode()){
        textNodes.push(node);
      }
      textNodes.forEach(function(textNode) {
        // 跳过 CODE 或 PRE 标签内的文本
        if (textNode.parentNode && (textNode.parentNode.tagName === 'CODE' || textNode.parentNode.tagName === 'PRE')) {
          return;
        }
        var originalText = textNode.nodeValue;
        // 处理块级公式：$$...$$
        var replaced = originalText.replace(/\$\$([\s\S]+?)\$\$/g, function(match, formula) {
          try {
            return katex.renderToString(formula, {displayMode: true, throwOnError: true});
          } catch (e) {
            return match;
          }
        });
        // 处理行内公式：$...$
        replaced = replaced.replace(/\$([^$]+?)\$/g, function(match, formula) {
          try {
            return katex.renderToString(formula, {displayMode: false, throwOnError: true});
          } catch (e) {
            return match;
          }
        });
        if (replaced !== originalText) {
          // 将替换后的 HTML 转换为节点并替换原文本节点
          var span = document.createElement('span');
          span.innerHTML = replaced;
          textNode.parentNode.replaceChild(span, textNode);
        }
      });
    }

    /**
     * 更新预览区内容并保存数据到 localStorage
     * 说明：
     *  - 使用 marked 将摘要和正文内容转换为 HTML
     *  - 标题使用 <h1> 标签显示，摘要以灰色引用块展示
     *  - 调用 highlight.js 为代码块添加语法高亮
     *  - 调用 renderMathInElement 渲染数学公式
     *  - 更新最后保存时间戳
     */
    function updatePreview() {
      var title = document.getElementById('title').value;
      var abstract = document.getElementById('abstract').value;
      var content = document.getElementById('content').value;

      var previewHtml = "";
      if(title) {
        previewHtml += "<h1>" + title + "</h1>";
      }
      if(abstract) {
        // 使用 marked 解析 Markdown，摘要包裹在 blockquote 中
        previewHtml += "<blockquote>" + marked.parse(abstract) + "</blockquote>";
      }
      if(content) {
        previewHtml += marked.parse(content);
      }

      var previewContainer = document.getElementById('preview');
      previewContainer.innerHTML = previewHtml;

      // 对预览区中所有代码块进行语法高亮处理
      previewContainer.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });

      // 使用 KaTeX 渲染数学公式
      renderMathInElement(previewContainer);

      // 更新最后保存时间显示
      var now = new Date();
      document.getElementById('lastSaved').innerText = "最后保存时间：" + now.toLocaleString();
    }

    /**
     * 保存编辑器中的内容到 localStorage（键名 editorData）
     */
    function saveContent() {
      var data = {
        title: document.getElementById('title').value,
        abstract: document.getElementById('abstract').value,
        content: document.getElementById('content').value,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('editorData', JSON.stringify(data));
      // 更新最后保存时间显示
      document.getElementById('lastSaved').innerText = "最后保存时间：" + new Date().toLocaleString();
    }

    /**
     * 页面加载时从 localStorage 中恢复上次编辑的内容
     */
    function loadContent() {
      var data = localStorage.getItem('editorData');
      if(data) {
        try {
          var obj = JSON.parse(data);
          if(obj.title) document.getElementById('title').value = obj.title;
          if(obj.abstract) document.getElementById('abstract').value = obj.abstract;
          if(obj.content) document.getElementById('content').value = obj.content;
        } catch(e) {
          console.error("解析保存数据出错：", e);
        }
      }
    }

    // 为输入框添加实时更新及自动保存事件
    document.getElementById('title').addEventListener('input', function() {
      updatePreview();
      saveContent();
    });
    document.getElementById('abstract').addEventListener('input', function() {
      updatePreview();
      saveContent();
    });
    document.getElementById('content').addEventListener('input', function() {
      updatePreview();
      saveContent();
    });

    // 提交按钮事件：调用后端接口创建文章
    document.getElementById('submitBtn').addEventListener('click', function() {
      // 从 localStorage 获取 userId（需提前设置，如用户登录后保存到 localStorage）
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.id;
      if(!userId) {
        alert("请先登录或设置 userId到localStorage中！");
        return;
      }

      // 收集编辑区数据
      var title = document.getElementById('title').value;
      var summary = document.getElementById('abstract').value;
      var content = document.getElementById('content').value;

      console.log(userId);
      // 构造传递给后端的DTO对象
      var payload = {
        userId: parseInt(userId),            // userId 源自 localStorage（转换为数字）
        title: title,
        summary: summary,
        content: content,
        categoryCode: "DEFAULT",             // 默认分类代码，可根据实际需求调整或增加输入项
        status: 'A'                          // 默认状态，例如 'A' 表示正常
      };

      console.log(payload);

      // 调用后端接口（需确保接口跨域、CSRF 等问题已处理）
      fetch("/article/createArticle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if(response.ok) return response.json();
        else throw new Error("网络请求错误");
      })
      .then(data => {
        alert("文章提交成功！");
        console.log("后台返回数据:", data);
        // 提交成功后可清除自动保存的编辑内容
        localStorage.removeItem('editorData');
      })
      .catch(error => {
        console.error("提交文章出错:", error);
        alert("提交文章失败！");
      });
    });

    // 上传封面：示例中仅在控制台打印文件名，可根据需要添加预览或上传功能
    document.getElementById('coverUpload').addEventListener('change', function(event) {
      var file = event.target.files[0];
      if(file) {
        console.log("上传的封面文件:", file.name);
        // 此处可添加图片预览或上传处理逻辑
      }
    });

    // 页面加载时恢复数据并更新预览区
    window.addEventListener('load', function() {
      loadContent();
      updatePreview();
    });