// 创建简单图标的脚本
// 在浏览器控制台中运行此脚本来生成图标文件

function createSimpleIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#4facfe');
    gradient.addColorStop(1, '#00f2fe');
    
    // 绘制圆形背景
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制白色边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制书本图标
    const bookSize = size * 0.4;
    const bookX = (size - bookSize) / 2;
    const bookY = (size - bookSize) / 2;
    
    // 书本主体
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bookX, bookY, bookSize, bookSize * 0.8);
    
    // 书签
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(bookX + bookSize * 0.7, bookY - bookSize * 0.1, bookSize * 0.15, bookSize * 0.4);
    
    // 文字线条
    ctx.fillStyle = '#6c757d';
    const lineHeight = size * 0.02;
    const lineSpacing = size * 0.06;
    const textX = bookX + bookSize * 0.15;
    let textY = bookY + bookSize * 0.25;
    
    for (let i = 0; i < 4; i++) {
        const lineWidth = bookSize * (0.5 + Math.random() * 0.3);
        ctx.fillRect(textX, textY, lineWidth, lineHeight);
        textY += lineSpacing;
    }
    
    return canvas.toDataURL('image/png');
}

// 生成不同尺寸的图标
const sizes = [16, 32, 48, 128];
const icons = {};

sizes.forEach(size => {
    icons[`icon${size}`] = createSimpleIcon(size);
});

console.log('图标已生成，请复制以下数据：');
console.log(JSON.stringify(icons, null, 2));

// 下载函数
function downloadIcon(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 下载所有图标
sizes.forEach(size => {
    downloadIcon(icons[`icon${size}`], `icon${size}.png`);
});

console.log('所有图标文件已开始下载！');
