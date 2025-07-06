// 后台脚本 - 处理插件的后台逻辑

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
    console.log('收藏夹管理器插件已安装');
    
    if (details.reason === 'install') {
        // 首次安装时的逻辑
        console.log('首次安装收藏夹管理器');
    } else if (details.reason === 'update') {
        // 更新时的逻辑
        console.log('收藏夹管理器已更新');
    }
});

// 监听收藏夹变化
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    console.log('新增收藏夹项目:', bookmark);
});

chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    console.log('删除收藏夹项目:', id);
});

chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
    console.log('收藏夹项目已修改:', id, changeInfo);
});

chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
    console.log('收藏夹项目已移动:', id, moveInfo);
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getBookmarks') {
        chrome.bookmarks.getTree().then(tree => {
            sendResponse({ success: true, data: tree });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // 保持消息通道开放
    }
    
    if (request.action === 'openBookmark') {
        chrome.tabs.create({ url: request.url });
        sendResponse({ success: true });
    }
});

// 右键菜单功能（可选）
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openBookmarkManager') {
        chrome.action.openPopup();
    }
});

// 创建右键菜单项
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'openBookmarkManager',
        title: '打开收藏夹管理器',
        contexts: ['page']
    });
});
