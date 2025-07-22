class BookmarkManager {
    constructor() {
        this.bookmarks = [];
        this.filteredBookmarks = [];
        this.searchTerm = '';
        this.folderStates = new Map(); // 记录文件夹展开状态
        
        this.initializeElements();
        this.bindEvents();
        this.loadBookmarks();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.noResults = document.getElementById('noResults');
        this.totalCount = document.getElementById('totalCount');
        this.folderCount = document.getElementById('folderCount');
        this.bookmarkCount = document.getElementById('bookmarkCount');
        this.expandAllBtn = document.getElementById('expandAll');
        this.collapseAllBtn = document.getElementById('collapseAll');
        this.refreshBtn = document.getElementById('refreshBookmarks');
    }

    bindEvents() {
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRenderBookmarks();
        });

        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.searchTerm = '';
            this.filterAndRenderBookmarks();
            this.searchInput.focus();
        });

        this.expandAllBtn.addEventListener('click', () => {
            this.expandAllFolders();
        });

        this.collapseAllBtn.addEventListener('click', () => {
            this.collapseAllFolders();
        });

        this.refreshBtn.addEventListener('click', () => {
            this.loadBookmarks();
        });
    }

    async loadBookmarks() {
        try {
            this.showLoading(true);
            const bookmarkTree = await chrome.bookmarks.getTree();
            this.bookmarks = this.flattenBookmarks(bookmarkTree[0]);
            this.filteredBookmarks = [...this.bookmarks];
            this.updateStats();
            this.renderBookmarks();
            this.showLoading(false);
        } catch (error) {
            console.error('加载收藏夹失败:', error);
            this.showLoading(false);
        }
    }

    flattenBookmarks(node, path = []) {
        const bookmarks = [];
        
        if (node.children) {
            // 这是一个文件夹
            const folderPath = [...path, node.title].filter(Boolean);
            
            if (node.title) { // 排除根节点
                bookmarks.push({
                    id: node.id,
                    title: node.title,
                    type: 'folder',
                    path: folderPath,
                    children: node.children || [],
                    parentId: node.parentId
                });
            }

            // 递归处理子节点
            for (const child of node.children) {
                bookmarks.push(...this.flattenBookmarks(child, folderPath));
            }
        } else {
            // 这是一个书签
            bookmarks.push({
                id: node.id,
                title: node.title,
                url: node.url,
                type: 'bookmark',
                path: path,
                parentId: node.parentId,
                dateAdded: node.dateAdded
            });
        }
        
        return bookmarks;
    }

    filterAndRenderBookmarks() {
        if (!this.searchTerm) {
            this.filteredBookmarks = [...this.bookmarks];
        } else {
            this.filteredBookmarks = this.bookmarks.filter(bookmark => {
                const titleMatch = bookmark.title.toLowerCase().includes(this.searchTerm);
                const urlMatch = bookmark.url && bookmark.url.toLowerCase().includes(this.searchTerm);
                const pathMatch = bookmark.path.some(p => p.toLowerCase().includes(this.searchTerm));
                
                return titleMatch || urlMatch || pathMatch;
            });
        }
        
        this.updateStats();
        this.renderBookmarks();
    }

    renderBookmarks() {
        if (this.filteredBookmarks.length === 0) {
            this.showNoResults(true);
            return;
        }

        this.showNoResults(false);
        
        // 构建树形结构
        const tree = this.buildTree(this.filteredBookmarks);
        this.bookmarksList.innerHTML = this.renderTree(tree);
        
        // 绑定事件
        this.bindBookmarkEvents();
    }

    buildTree(bookmarks) {
        const folders = bookmarks.filter(b => b.type === 'folder');
        const bookmarkItems = bookmarks.filter(b => b.type === 'bookmark');
        
        // 构建文件夹层次结构
        const folderMap = new Map();
        const rootFolders = [];
        
        folders.forEach(folder => {
            folderMap.set(folder.id, { ...folder, children: [] });
        });
        
        folders.forEach(folder => {
            const folderNode = folderMap.get(folder.id);
            const parent = folderMap.get(folder.parentId);
            
            if (parent) {
                parent.children.push(folderNode);
            } else {
                rootFolders.push(folderNode);
            }
        });
        
        // 将书签添加到对应文件夹
        bookmarkItems.forEach(bookmark => {
            const parent = folderMap.get(bookmark.parentId);
            if (parent) {
                parent.children.push(bookmark);
            } else {
                rootFolders.push(bookmark);
            }
        });
        
        return rootFolders;
    }

    renderTree(nodes, level = 0) {
        return nodes.map(node => {
            if (node.type === 'folder') {
                return this.renderFolder(node, level);
            } else {
                return this.renderBookmark(node, level);
            }
        }).join('');
    }

    renderFolder(folder, level) {
        const isExpanded = this.folderStates.get(folder.id) !== false; // 默认展开
        const childrenCount = folder.children.length;
        const bookmarkCount = folder.children.filter(c => c.type === 'bookmark').length;
        
        const childrenHtml = folder.children.length > 0 ? 
            `<div class="folder-children ${isExpanded ? 'expanded' : ''}" data-folder-id="${folder.id}">
                ${this.renderTree(folder.children, level + 1)}
            </div>` : '';
        
        return `
            <div class="bookmark-folder">
                <div class="folder-header" data-folder-id="${folder.id}" style="padding-left: ${20 + level * 16}px">
                    <span class="folder-toggle ${isExpanded ? 'expanded' : ''}">▶</span>
                    <span class="folder-icon">📁</span>
                    <span class="folder-name">${this.highlightText(folder.title)}</span>
                    <span class="folder-count">${bookmarkCount}</span>
                </div>
                ${childrenHtml}
            </div>
        `;
    }

    renderBookmark(bookmark, level) {
        const favicon = bookmark.url ? 
            `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16` : 
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/></svg>';
        
        const displayUrl = bookmark.url ? new URL(bookmark.url).hostname : '';
        
        return `
            <div class="bookmark-item" data-url="${bookmark.url || ''}" style="padding-left: ${20 + level * 16}px">
                <img class="bookmark-favicon" src="${favicon}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 16 16\\"><rect width=\\"16\\" height=\\"16\\" fill=\\"%23ddd\\"/></svg>'">
                <span class="bookmark-title">${this.highlightText(bookmark.title)}</span>
                <span class="bookmark-url">${displayUrl}</span>
            </div>
        `;
    }

    highlightText(text) {
        if (!this.searchTerm || !text) return text;
        
        const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    bindBookmarkEvents() {
        // 文件夹点击事件
        document.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const folderId = e.currentTarget.dataset.folderId;
                this.toggleFolder(folderId);
            });
        });

        // 书签点击事件
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                if (url) {
                    chrome.tabs.create({ url });
                    window.close();
                }
            });
        });
    }

    toggleFolder(folderId) {
        const isExpanded = this.folderStates.get(folderId) !== false;
        this.folderStates.set(folderId, !isExpanded);
        
        const toggle = document.querySelector(`[data-folder-id="${folderId}"] .folder-toggle`);
        const children = document.querySelector(`.folder-children[data-folder-id="${folderId}"]`);
        
        if (toggle && children) {
            if (isExpanded) {
                toggle.classList.remove('expanded');
                children.classList.remove('expanded');
            } else {
                toggle.classList.add('expanded');
                children.classList.add('expanded');
            }
        }
    }

    expandAllFolders() {
        const folders = this.filteredBookmarks.filter(b => b.type === 'folder');
        folders.forEach(folder => {
            this.folderStates.set(folder.id, true);
        });
        this.renderBookmarks();
    }

    collapseAllFolders() {
        const folders = this.filteredBookmarks.filter(b => b.type === 'folder');
        folders.forEach(folder => {
            this.folderStates.set(folder.id, false);
        });
        this.renderBookmarks();
    }

    updateStats() {
        const folders = this.filteredBookmarks.filter(b => b.type === 'folder');
        const bookmarkItems = this.filteredBookmarks.filter(b => b.type === 'bookmark');
        
        this.totalCount.textContent = this.filteredBookmarks.length;
        this.folderCount.textContent = `文件夹: ${folders.length}`;
        this.bookmarkCount.textContent = `书签: ${bookmarkItems.length}`;
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
        this.bookmarksList.style.display = show ? 'none' : 'block';
    }

    showNoResults(show) {
        this.noResults.style.display = show ? 'block' : 'none';
        this.bookmarksList.style.display = show ? 'none' : 'block';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new BookmarkManager();
});
