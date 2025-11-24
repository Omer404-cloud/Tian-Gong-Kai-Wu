// 简单的游戏调试脚本
console.log('开始调试俄罗斯方块游戏...');

// 检查DOM元素是否存在
function checkDOM() {
    const elements = [
        { id: 'tetris', name: '游戏画布' },
        { id: 'nextPiece', name: '下一个方块画布' },
        { id: 'startButton', name: '开始游戏按钮' },
        { id: 'pauseButton', name: '暂停游戏按钮' },
        { id: 'restartButton', name: '重新开始按钮' },
        { id: 'score', name: '分数显示' },
        { id: 'level', name: '等级显示' },
        { id: 'positionDialog', name: '位置错误对话框' }
    ];
    
    let allExists = true;
    for (const element of elements) {
        const el = document.getElementById(element.id);
        if (!el) {
            console.error(`错误: ${element.name} (ID: ${element.id}) 不存在!`);
            allExists = false;
        } else {
            console.log(`${element.name} 存在，类型: ${el.tagName}`);
        }
    }
    return allExists;
}

// 尝试手动启动游戏的最小部分
function testGameStartup() {
    console.log('尝试手动启动游戏的最小部分...');
    
    // 获取画布和上下文
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        console.error('无法获取画布上下文!');
        return false;
    }
    
    // 尝试绘制一个简单的测试方块
    ctx.fillStyle = '#FF0D72'; // 红色
    ctx.fillRect(0, 0, 30, 30);
    console.log('已在画布上绘制测试方块');
    
    // 检查是否有game对象
    if (typeof window.game !== 'undefined') {
        console.log('找到game对象');
    }
    
    return true;
}

// 检查是否有JavaScript错误
function checkForErrors() {
    console.log('检查全局错误...');
    window.addEventListener('error', function(e) {
        console.error('捕获到JavaScript错误:', e.error.message, '在文件:', e.filename, '行号:', e.lineno);
    });
}

// 执行所有检查
function runAllChecks() {
    console.log('DOMContentLoaded状态:', document.readyState);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM已完全加载');
            checkDOM();
            testGameStartup();
            checkForErrors();
        });
    } else {
        checkDOM();
        testGameStartup();
        checkForErrors();
    }
}

// 运行检查
runAllChecks();

// 输出一些环境信息
console.log('浏览器信息:', navigator.userAgent);
console.log('文档URL:', window.location.href);