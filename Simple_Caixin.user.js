// ==UserScript==
// @name               极简财新
// @name:en            Simple-Caixin
// @namespace          http://www.caixin.com/
// @version            0.8.20250312
// @description        清理页面无用元素（水印、分享按钮、导航栏、评论栏、网站地图等），调整板式，专注阅读
// @description:en     A script which removed some unuseful elements on caixin.com
// @author             EAK8T6Z
// @match              *://*.caixin.com/*
// @homepageURL        https://github.com/EAK8T6Z/Simple-Caixin
// @supportURL         https://github.com/EAK8T6Z/Simple-Caixin/issues
// @grant              GM_addStyle
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              window.onurlchange
// @run-at             document-start
// @license            MPL 2.0
// @changelog          0.8.20250312 - 调整了文章题图和图注的样式
// @updateURL          https://github.com/akirayimi/Simple-Caixin/raw/refs/heads/master/Simple_Caixin.user.js
// @downloadURL        https://github.com/akirayimi/Simple-Caixin/raw/refs/heads/master/Simple_Caixin.user.js
// ==/UserScript==

(function () {
    'use strict';

    // 获取保存的设置
    const hideAiVoice = GM_getValue('hideAiVoice', true);
    const hideComment = GM_getValue('hideComment', false);
    const darkMode = GM_getValue('darkMode', false);
    const hideImages = GM_getValue('hideImages', false);

    // 护眼模式：页面加载时立即注入，避免闪烁
    if (darkMode) {
        GM_addStyle(`
            html, body { background: #f5f0e6 !important; }
        `);
    }

    // 创建设置按钮
    function createToggleButton() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0.3;
            transition: all 0.3s;
        `;

        const icon = document.createElement('div');
        icon.innerHTML = '⚙️';
        icon.style.cssText = `
            font-size: 16px;
            cursor: pointer;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: none;
            flex-direction: column;
            gap: 5px;
        `;

        // 语音按钮
        const aiButton = document.createElement('button');
        aiButton.innerHTML = `语音: ${hideAiVoice ? '已隐藏' : '已显示'}`;
        aiButton.style.cssText = `
            padding: 5px 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            white-space: nowrap;
        `;

        // 评论按钮
        const commentButton = document.createElement('button');
        commentButton.innerHTML = `评论: ${hideComment ? '已隐藏' : '已显示'}`;
        commentButton.style.cssText = aiButton.style.cssText;

        // 护眼模式按钮
        const darkButton = document.createElement('button');
        const _dark = GM_getValue('darkMode', false);
        darkButton.innerHTML = `护眼: ${_dark ? '已开启' : '已关闭'}`;
        darkButton.style.cssText = aiButton.style.cssText;
        if (_dark) {
            darkButton.style.background = '#e8dfc8';
            darkButton.style.color = '#4a3c28';
            darkButton.style.borderColor = '#c8b896';
        }

        // 图片按钮
        const imageButton = document.createElement('button');
        const _hideImages = GM_getValue('hideImages', false);
        imageButton.innerHTML = `图片: ${_hideImages ? '已隐藏' : '已显示'}`;
        imageButton.style.cssText = aiButton.style.cssText;
        if (_hideImages) {
            imageButton.style.background = '#e0e0e0';
            imageButton.style.color = '#555';
        }

        buttonContainer.appendChild(aiButton);
        buttonContainer.appendChild(commentButton);
        buttonContainer.appendChild(darkButton);
        buttonContainer.appendChild(imageButton);
        container.appendChild(icon);
        container.appendChild(buttonContainer);

        // 语音按钮点击事件
        aiButton.addEventListener('click', () => {
            const newValue = !GM_getValue('hideAiVoice', true);
            GM_setValue('hideAiVoice', newValue);
            aiButton.innerHTML = `语音: ${newValue ? '已隐藏' : '已显示'}`;
            updateStyles();
        });

        // 评论按钮点击事件
        commentButton.addEventListener('click', () => {
            const newValue = !GM_getValue('hideComment', false);
            GM_setValue('hideComment', newValue);
            commentButton.innerHTML = `评论: ${newValue ? '已隐藏' : '已显示'}`;
            updateStyles();
        });

        // 护眼模式按钮点击事件
        darkButton.addEventListener('click', () => {
            const newValue = !GM_getValue('darkMode', false);
            GM_setValue('darkMode', newValue);
            darkButton.innerHTML = `护眼: ${newValue ? '已开启' : '已关闭'}`;
            darkButton.style.background = newValue ? '#e8dfc8' : '#f0f0f0';
            darkButton.style.color = newValue ? '#4a3c28' : '';
            darkButton.style.borderColor = newValue ? '#c8b896' : '#ccc';
            updateStyles();
        });

        // 图片按钮点击事件
        imageButton.addEventListener('click', () => {
            const newValue = !GM_getValue('hideImages', false);
            GM_setValue('hideImages', newValue);
            imageButton.innerHTML = `图片: ${newValue ? '已隐藏' : '已显示'}`;
            imageButton.style.background = newValue ? '#e0e0e0' : '#f0f0f0';
            imageButton.style.color = newValue ? '#555' : '';
            updateStyles();
            applyImageHiding();
        });

        // 鼠标悬停效果
        container.addEventListener('mouseenter', () => {
            buttonContainer.style.display = 'flex';
            container.style.opacity = '1';
        });

        container.addEventListener('mouseleave', () => {
            buttonContainer.style.display = 'none';
            container.style.opacity = '0.3';
        });

        document.body.appendChild(container);
    }

    // 更新样式
    function updateStyles() {
        const hideAiVoice = GM_getValue('hideAiVoice', true);
        const hideComment = GM_getValue('hideComment', false);
        const darkMode = GM_getValue('darkMode', false);
        const hideImages = GM_getValue('hideImages', false);

        GM_addStyle(`
            .pc-aivoice, .pc-aivoice.trial {
                display: ${hideAiVoice ? 'none' : 'block'} !important;
            }
            .pc-comment {
                display: ${hideComment ? 'none' : 'block'} !important;
            }
            ${hideImages ? `
                #the_content > div.media.article_media_pic.ascar > dl > dt > img,
                #introBG,
                .articleImageB {
                    display: none !important;
                }
            ` : ''}
        `);

        if (darkMode) {
            GM_addStyle(`
                /* 护眼模式 - 基础背景与文字（牛皮纸暖色系） */
                html, body, .comMain, .conlf, #Main_Content_Val,
                .littlenav, .littlenavwarp, .Nav, .navwarp {
                    background-color: #f5f0e6 !important;
                    background-image: none !important;
                    color: #2c2c2c !important;
                }
                /* 正文与标题 */
                p, span, div, li, td, th, h1, h2, h3, h4, h5, h6, a,
                .article_content, .sumcont, .article-list {
                    color: #2c2c2c !important;
                    background-color: transparent !important;
                }
                /* 链接：使用温暖棕色，与背景协调 */
                a,
                .demolNews dt a, .demolNews dd a,
                h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,
                p a, li a, td a, span a, div a,
                .article_content a, .sumcont a, .conlf a {
                    color: #7a6a4e !important;
                }
                a:hover,
                .demolNews dt a:hover, h4 a:hover {
                    color: #5a4a32 !important;
                }
                /* 图片背景 */
                .media_pic { background-color: #ede8da !important; }
                /* 导航栏 */
                .Nav, .littlenav, .littlenavwarp {
                    border-color: #d4c9b0 !important;
                }
                /* 分隔线与边框 */
                * { border-color: #d4c9b0 !important; }
                /* 输入框 */
                input, textarea, select {
                    background-color: #ede8da !important;
                    color: #2c2c2c !important;
                }
                /* 语音播报工具条（护眼模式） */
                .cx-audio-control {
                    background-color: #ede8da !important;
                    border-top: 1px solid #c8b896 !important;
                }
                .cx-audio-title, .cx-audio-played, .cx-audio-duration, .cx-audio-ratebtn, .cx-aduio-rate-container li {
                    color: #4a3c28 !important;
                }
                .cx-aduio-rate-container {
                    background-color: #ede8da !important;
                    border: 1px solid #c8b896 !important;
                }
                .cx-aduio-rate-container li:hover, .cx-aduio-rate-actived {
                    background-color: #e8dfc8 !important;
                    color: #2c2010 !important;
                }
            `);
        }
    }

    // 图片目标选择器
    const IMAGE_SELECTORS = [
        '#the_content > div.media.article_media_pic.ascar > dl > dt > img',
        '#introBG',
        '.articleImageB',
    ];

    // 图片隐藏/显示（带占位符与悬浮缩略图）
    function applyImageHiding() {
        const hide = GM_getValue('hideImages', false);

        if (hide) {
            IMAGE_SELECTORS.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.dataset.cxHidden) return; // 已处理过，跳过

                    // 取图片 src（img 标签 or 背景图）
                    let imgSrc = '';
                    if (el.tagName === 'IMG') {
                        imgSrc = el.src || el.dataset.src || '';
                    } else {
                        const bg = window.getComputedStyle(el).backgroundImage;
                        const m = bg.match(/url\(["']?(.*?)["']?\)/);
                        imgSrc = m ? m[1] : '';
                    }

                    // 记录并隐藏原元素
                    el.dataset.cxHidden = '1';
                    el.dataset.cxOrigDisplay = el.style.display;
                    el.style.setProperty('display', 'none', 'important');

                    // 创建 [图片] 占位符
                    const ph = document.createElement('span');
                    ph.className = 'cx-img-ph';
                    ph.textContent = '[图片]';
                    ph.style.cssText = [
                        'display:inline-flex',
                        'align-items:center',
                        'justify-content:center',
                        'padding:3px 10px',
                        'background:#f5f5f5',
                        'border:1px dashed #bbb',
                        'border-radius:4px',
                        'color:#aaa',
                        'font-size:13px',
                        'user-select:none',
                        'vertical-align:middle',
                        imgSrc ? 'cursor:pointer' : 'cursor:default',
                    ].join(';');

                    // 悬浮缩略图
                    if (imgSrc) {
                        let thumb = null;
                        ph.addEventListener('mouseenter', () => {
                            thumb = document.createElement('div');
                            thumb.style.cssText = [
                                'position:fixed',
                                'z-index:999999',
                                'background:#fff',
                                'border:1px solid #ddd',
                                'border-radius:6px',
                                'padding:5px',
                                'box-shadow:0 6px 24px rgba(0,0,0,0.18)',
                                'pointer-events:none',
                                'opacity:0',
                                'transition:opacity 0.15s',
                            ].join(';');
                            const tImg = document.createElement('img');
                            tImg.src = imgSrc;
                            tImg.style.cssText = 'max-width:240px;max-height:180px;display:block;border-radius:3px';
                            thumb.appendChild(tImg);
                            document.body.appendChild(thumb);

                            const r = ph.getBoundingClientRect();
                            thumb.style.left = Math.min(r.left, window.innerWidth - 260) + 'px';
                            thumb.style.top  = (r.bottom + 8) + 'px';
                            requestAnimationFrame(() => { thumb.style.opacity = '1'; });
                        });
                        ph.addEventListener('mouseleave', () => {
                            if (thumb) { thumb.remove(); thumb = null; }
                        });
                    }

                    el.insertAdjacentElement('afterend', ph);
                });
            });
        } else {
            // 移除所有占位符
            document.querySelectorAll('.cx-img-ph').forEach(ph => ph.remove());
            // 还原原图
            document.querySelectorAll('[data-cx-hidden]').forEach(el => {
                const orig = el.dataset.cxOrigDisplay;
                el.style.removeProperty('display');
                if (orig) el.style.display = orig;
                delete el.dataset.cxHidden;
                delete el.dataset.cxOrigDisplay;
            });
        }
    }

    // 应用初始样式
    GM_addStyle(`
        /* 移除微软雅黑字体，使用浏览器默认字体 */
        * {
            font-family: revert !important;
        }
        [style*="微软雅黑"], [style*="Microsoft YaHei"] {
            font-family: unset !important;
        }

        /* 格式调整 */
        /* 调整导航栏宽度 */
        .littlenav, .littlenavwarp, .littlenavmore, .Nav {
            width: 100% !important;
        }
        /* 设置导航栏布局 */
        .littlenavwarp {
            display: flex;
            justify-content: center;
            gap: 2rem;
            box-sizing: border-box;
            max-width: 970px;
        }
        /* 左侧导航项目布局 */
        .littlenavwarp > .left {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        /* 导航菜单布局 */
        .Nav > ul {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        /* 调整主要内容区域宽度和边距 */
        .comMain {
            max-width: 990px !important;
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
        }
        /* 设置内容区域为全宽 */
        .conlf {
            width: 100% !important;
        }
        /* 调整图片边距 */
        .media.pip_none {
            padding: 20px;
        }

        /* 响应式图片处理 */
        /* 设置图片容器的基本样式 */
        .media, .media_pic {
            width: 100% !important;
            max-width: 480px !important;
            height: auto !important;
            position: relative;
        }
        /* 设置图片容器的布局和背景 */
        .media_pic {
            display: flex;
            flex-direction: column; /* 改为纵向排列 */
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
            min-height: unset !important;
        }
        /* 设置图片容器中dt元素的样式 */
        .media_pic dt {
            width: 100% !important;
            height: auto !important;
            display: flex;
            justify-content: center;
            align-items: center;
            aspect-ratio: 3 / 2;
        }
        /* 设置图片本身的样式 */
        .media_pic img {
            max-width: 100%;
            max-height: 100%;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
        }
        /* 设置说明文字的样式 */
        .media_pic dd {
            width: 100%;
            text-align: center; /* 文字居中 */
            margin: 0 0 0 0;    /* 上下左右 margin 设为0 */
        }
        /* 对不支持 aspect-ratio 的浏览器使用替代方案 */
        @supports not (aspect-ratio: 1 / 1) {
            .media_pic::before {
                content: "";
                display: block;
                padding-top: 66.6%; /* 3:2 的宽高比 */
            }
            .media_pic img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        }
        .media dd {
            width: min(100%, 480px);
            box-sizing: border-box;
        }

        /* 中等屏幕设备调整 */
        @media screen and (max-width: 998px) {
            .logimage {
                display: none; /* 隐藏财新 logo */
            }
            .Nav .navtabs {
                margin: 0;
            }
            .littlenavwarp > .searchbox {
                display: none; /* 隐藏搜索框 */
            }
        }


        /* 语音播报工具条（亮色模式） */
        .cx-audio-control {
            background-color: #ffffff !important;
            border-top: 1px solid #e0e0e0 !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05) !important;
        }

        /* 隐藏不需要的元素 */
        .sitenav, .vioce-box-cons, .icon_key, .subhead, .pip, .function01, .morelink,
        .greenBg, .redBg, .cx-wx-hb-tips, .conri, .f_ri, .fenghui_code, .comment,
        .hot_word_v2, .bottom_tong_ad, .copyright, .navBottom, .multimedia,
        .share_list, .renewals, .wifi-tips, .logo, .select-text-menu, .WB_FB_show, .adsame-banner-box, #questions_container {
            display: none !important;
        }

        /* 移除背景水印 */
        #Main_Content_Val {
            background: none !important;
        }
    `);

    // 应用语音相关样式
    updateStyles();

    // 等待 DOM 加载完成后添加按钮并应用图片隐藏
    function onDOMReady() {
        createToggleButton();
        applyImageHiding();

        // 监听 DOM 变化，处理动态加载的图片
        const observer = new MutationObserver(() => {
            applyImageHiding();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }
})();
