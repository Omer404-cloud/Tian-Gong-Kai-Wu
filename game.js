document.addEventListener('DOMContentLoaded', function() {
    // 获取画布和上下文
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('nextPiece');
    const nextCtx = nextCanvas.getContext('2d');
    
    // 获取游戏状态元素
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const gameOverElement = document.getElementById('gameOver');
    const finalScoreElement = document.getElementById('finalScore');
    const finalLinesElement = document.getElementById('finalLines');
    
    // 获取开始游戏按钮
    const startButton = document.getElementById('startButton');
    
    // 获取对话框元素
    const confirmDialog = document.getElementById('confirmDialog');
    const positionDialog = document.getElementById('positionDialog');
    
    // 获取按钮
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');
    const restartButton2 = document.getElementById('restartButton2');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    let rememberButton = document.getElementById('rememberButton');
    
    // 获取控制按钮
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const downButton = document.getElementById('downButton');
    const rotateButton = document.getElementById('rotateButton');
    const hardDropButton = document.getElementById('hardDropButton');
    
    // 游戏配置
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const NEXT_BLOCK_SIZE = 24;
    
    // 调整画布大小
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    // 方块颜色
    const COLORS = [
        null, // 空
        '#FF0D72', // I
        '#0DC2FF', // J
        '#0DFF72', // L
        '#F538FF', // O
        '#FF8E0D', // S
        '#FFE138', // T
        '#3877FF', // Z
        '#7000FF', // 耖(chào) - 紫色
        '#00FFC3', // 耖框 - 青色
        '#FF0062', // 耖齿 - 粉色
        '#FFC700', // 扶手 - 金色
        '#7B68EE', // 耕作农具 - 靛蓝色
        '#FF69B4', // 整地农具 - 热粉色
        '#00CED1', // 宋明时期 - 暗青色
        '#98FB98', // 长方形木框 - 淡绿色
        '#FFD700', // 木制(1) - 金色
        '#FF7F50', // 承载部件并保持结构稳定 - 珊瑚色
        '#1E90FF', // 垂直向下的长齿状 - 深蓝色
        '#FF7F00', // 铁制或木制 - 橙色
        '#8A2BE2', // 破碎土块与平整田面 - 紫色
        '#FF4500', // 便于人手握持的杆状 - 红色
        '#00CED1', // 木制(2) - 青色
        '#FFFF00', // 控制方向与深度 - 黄色
        '#7B68EE', // 量值列1 - 靛蓝色
        '#FF69B4', // 量值列2 - 热粉色
        '#00CED1', // 量值列3 - 暗青色
        '#98FB98', // 量值列4 - 淡绿色
        '#FFD700', // 量值列5 - 金色
        '#FF7F50', // 量值列6 - 珊瑚色
        '#1E90FF', // 量值列7 - 深蓝色
        '#FF7F00', // 量值列8 - 橙色
        '#8A2BE2', // 量值列9 - 紫色
        '#FF4500', // 量值列10 - 红色
        '#00CED1', // 量值列11 - 青色
        '#FFFF00'  // 量值列12 - 黄色
    ];
    
    // 方块形状定义
    const SHAPES = [
        [], // 空
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
        [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
        [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
        [[4, 4], [4, 4]], // O
        [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
        [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
        [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
    ];
    
    // 创建空游戏板
    function createEmptyBoard() {
        return Array(ROWS).fill().map(() => Array(COLS).fill(0));
    }
    
    // 游戏状态
    let board = createEmptyBoard();
    let score = 0;
    let level = 1;
    let dropInterval = 1000; // 初始下落速度（毫秒）
    let dropCounter = 0;
    let lastTime = 0;
    let gameId = null;
    let isPaused = false;
    
    // 当前关卡主题
    let currentTheme = 'chao'; // 'chao' 表示耖
    let currentThemeIndex = 0;
    
    // 主题列表
    const themes = ['chao', 'weng', 'yun', 'liandao', 'shimo'];
    
    // 主题数据 - 存储所有关卡的三元组内容
    const themeData = {
        // 第一关：耖
        'chao': {
            displayName: '耖（chào）',
            objectPieces: [
                {text: '耖', type: 7, size: '1x3'},
                {text: '耖', type: 7, size: '1x3'},
                {text: '耖', type: 7, size: '1x3'},
                {text: '耖框', type: 8, size: '1x3'},
                {text: '耖框', type: 8, size: '1x3'},
                {text: '耖框', type: 8, size: '1x3'},
                {text: '耖齿', type: 9, size: '1x3'},
                {text: '耖齿', type: 9, size: '1x3'},
                {text: '耖齿', type: 9, size: '1x3'},
                {text: '扶手', type: 10, size: '1x3'},
                {text: '扶手', type: 10, size: '1x3'},
                {text: '扶手', type: 10, size: '1x3'}
            ],
            featurePieces: [
                {text: '用途', type: 11, size: '1x3'},
                {text: '类别', type: 12, size: '1x3'},
                {text: '所属朝代', type: 13, size: '1x3'},
                {text: '形状', type: 14, size: '1x3'},
                {text: '材质', type: 15, size: '1x3'},
                {text: '作用', type: 16, size: '1x3'},
                {text: '形状', type: 17, size: '1x3'},
                {text: '材质', type: 18, size: '1x3'},
                {text: '作用', type: 19, size: '1x3'},
                {text: '形状', type: 20, size: '1x3'},
                {text: '材质', type: 21, size: '1x3'},
                {text: '作用', type: 22, size: '1x3'}
            ],
            valuePieces: [
                {text: '耕作农具', type: 23, size: '1x3'},
                {text: '整地农具', type: 24, size: '1x3'},
                {text: '宋明时期', type: 25, size: '1x3'},
                {text: '长方形木框', type: 26, size: '1x3'},
                {text: '木制', type: 27, size: '1x3'},
                {text: '承载部件并保持结构稳定', type: 28, size: '1x3'},
                {text: '垂直向下的长齿状', type: 29, size: '1x3'},
                {text: '铁制或木制', type: 30, size: '1x3'},
                {text: '破碎土块及平整田面', type: 31, size: '1x3'},
                {text: '便于人手握持的杆状', type: 32, size: '1x3'},
                {text: '木制', type: 33, size: '1x3'},
                {text: '控制方向与深度', type: 34, size: '1x3'}
            ],
            wuYuanTriplets: {
                // 耖相关三元组
                '耖-用途': '耕作农具',
                '耖-类别': '整地农具',
                '耖-所属朝代': '宋明时期',
                // 耖框相关三元组
                '耖框-形状': '长方形木框',
                '耖框-材质': '木制',
                '耖框-作用': '承载部件并保持结构稳定',
                // 耖齿相关三元组
                '耖齿-形状': '垂直向下的长齿状',
                '耖齿-材质': '铁制或木制',
                '耖齿-作用': '破碎土块及平整田面',
                // 扶手相关三元组
                '扶手-形状': '便于人手握持的杆状',
                '扶手-材质': '木制',
                '扶手-作用': '控制方向与深度'
            },
        },
        
        // 第二关：瓮
        'weng': {
            displayName: '瓮（wèng）',
            objectPieces: [
                {text: '瓮(wèng)', type: 7, size: '1x3'},
                {text: '瓮(wèng)', type: 7, size: '1x3'},
                {text: '瓮(wèng)', type: 7, size: '1x3'},
                {text: '瓮(wèng)', type: 7, size: '1x3'},
                {text: '瓮口', type: 8, size: '1x3'},
                {text: '瓮口', type: 8, size: '1x3'},
                {text: '瓮口', type: 8, size: '1x3'},
                {text: '瓮身', type: 9, size: '1x3'},
                {text: '瓮身', type: 9, size: '1x3'},
                {text: '瓮身', type: 9, size: '1x3'},
                {text: '瓮底', type: 10, size: '1x3'},
                {text: '瓮底', type: 10, size: '1x3'},
                {text: '瓮底', type: 10, size: '1x3'}
            ],
            featurePieces: [
                {text: '用途', type: 11, size: '1x3'},
                {text: '材质', type: 12, size: '1x3'},
                {text: '所属时代', type: 13, size: '1x3'},
                {text: '形状特征', type: 14, size: '1x3'},
                {text: '形状', type: 15, size: '1x3'},
                {text: '作用', type: 16, size: '1x3'},
                {text: '特点', type: 17, size: '1x3'},
                {text: '形状', type: 18, size: '1x3'},
                {text: '作用', type: 19, size: '1x3'},
                {text: '特点', type: 20, size: '1x3'},
                {text: '形状', type: 21, size: '1x3'},
                {text: '作用', type: 22, size: '1x3'},
                {text: '特点', type: 23, size: '1x3'}
            ],
            valuePieces: [
                {text: '储存容器', type: 24, size: '1x4'},
                {text: '陶制为主', type: 25, size: '1x4'},
                {text: '从新石器时代延续至今', type: 26, size: '1x4'},
                {text: '腹大口小颈短', type: 27, size: '1x4'},
                {text: '小圆口', type: 28, size: '1x4'},
                {text: '装入/倒出物品及密封防变', type: 29, size: '1x4'},
                {text: '边缘较厚', type: 30, size: '1x4'},
                {text: '鼓腹状', type: 31, size: '1x4'},
                {text: '储存物品的主要空间', type: 32, size: '1x4'},
                {text: '绘制纹饰体现地域文化', type: 33, size: '1x4'},
                {text: '多为平底', type: 34, size: '1x4'},
                {text: '稳固支撑瓮身', type: 35, size: '1x4'},
                {text: '较厚', type: 36, size: '1x4'}
            ],
            wuYuanTriplets: {
                // 瓮相关三元组
                '瓮(wèng)-用途': '储存容器',
                '瓮(wèng)-材质': '陶制为主',
                '瓮(wèng)-所属时代': '从新石器时代延续至今',
                '瓮(wèng)-形状特征': '腹大口小颈短',
                // 瓮口相关三元组
                '瓮口-形状': '小圆口',
                '瓮口-作用': '装入/倒出物品及密封防变',
                '瓮口-特点': '边缘较厚',
                // 瓮身相关三元组
                '瓮身-形状': '鼓腹状',
                '瓮身-作用': '储存物品的主要空间',
                '瓮身-特点': '绘制纹饰体现地域文化',
                // 瓮底相关三元组
                '瓮底-形状': '多为平底',
                '瓮底-作用': '稳固支撑瓮身',
                '瓮底-特点': '较厚'
            }
        },
        
        // 第三关：耘
        'yun': {
            displayName: '耘（yún）',
            objectPieces: [
                {text: '耘(yún)', type: 7, size: '1x3'},
                {text: '耘(yún)', type: 7, size: '1x3'},
                {text: '耘(yún)', type: 7, size: '1x3'},
                {text: '耘爪', type: 8, size: '1x3'},
                {text: '耘爪', type: 8, size: '1x3'},
                {text: '耘爪', type: 8, size: '1x3'},
                {text: '耘荡', type: 9, size: '1x3'},
                {text: '耘荡', type: 9, size: '1x3'},
                {text: '耘荡', type: 9, size: '1x3'}
            ],
            featurePieces: [
                {text: '用途', type: 11, size: '1x3'},
                {text: '所属时代', type: 12, size: '1x3'},
                {text: '材质', type: 13, size: '1x3'},
                {text: '形状', type: 14, size: '1x3'},
                {text: '材质', type: 15, size: '1x3'},
                {text: '作用', type: 16, size: '1x3'},
                {text: '形状', type: 17, size: '1x3'},
                {text: '材质', type: 18, size: '1x3'},
                {text: '作用', type: 19, size: '1x3'}
            ],
            valuePieces: [
                {text: '除草松土', type: 20, size: '1x4'},
                {text: '明代', type: 21, size: '1x4'},
                {text: '多为木质或竹质', type: 22, size: '1x4'},
                {text: '类似手指状(五个一组)', type: 23, size: '1x4'},
                {text: '竹片或铁制', type: 24, size: '1x4'},
                {text: '便于农人抓扯杂草', type: 25, size: '1x4'},
                {text: '底部扁平上有长柄', type: 26, size: '1x4'},
                {text: '木头', type: 27, size: '1x4'},
                {text: '在稻行间推行除草松土', type: 28, size: '1x4'}
            ],
            wuYuanTriplets: {
                // 耘相关三元组
                '耘(yún)-用途': '除草松土',
                '耘(yún)-所属时代': '明代',
                '耘(yún)-材质': '多为木质或竹质',
                // 耘爪相关三元组
                '耘爪-形状': '类似手指状(五个一组)',
                '耘爪-材质': '竹片或铁制',
                '耘爪-作用': '便于农人抓扯杂草',
                // 耘荡相关三元组
                '耘荡-形状': '底部扁平上有长柄',
                '耘荡-材质': '木头',
                '耘荡-作用': '在稻行间推行除草松土'
            }
        },
        
        // 第四关：镰刀
        'liandao': {
            displayName: '镰刀（lián dāo）',
            objectPieces: [
                {text: '镰刀（lián dāo）', type: 7, size: '1x3'},
                {text: '镰刀（lián dāo）', type: 7, size: '1x3'},
                {text: '镰刀（lián dāo）', type: 7, size: '1x3'},
                {text: '刀刃', type: 8, size: '1x3'},
                {text: '刀刃', type: 8, size: '1x3'},
                {text: '刀刃', type: 8, size: '1x3'},
                {text: '刀柄', type: 9, size: '1x3'},
                {text: '刀柄', type: 9, size: '1x3'},
                {text: '刀柄', type: 9, size: '1x3'}
            ],
            featurePieces: [
                {text: '用途', type: 11, size: '1x3'},
                {text: '所属时代', type: 12, size: '1x3'},
                {text: '材质', type: 13, size: '1x3'},
                {text: '形状', type: 14, size: '1x3'},
                {text: '材质', type: 15, size: '1x3'},
                {text: '作用', type: 16, size: '1x3'},
                {text: '形状', type: 17, size: '1x3'},
                {text: '材质', type: 18, size: '1x3'},
                {text: '作用', type: 19, size: '1x3'}
            ],
            valuePieces: [
                {text: '收割庄稼/割草等', type: 20, size: '1x4'},
                {text: '明代前', type: 21, size: '1x4'},
                {text: '铁质+木制', type: 22, size: '1x4'},
                {text: '呈弧形且刃口锋利', type: 23, size: '1x4'},
                {text: '铁制', type: 24, size: '1x4'},
                {text: '切割庄稼/草等', type: 25, size: '1x4'},
                {text: '多为直条形便于握持', type: 26, size: '1x4'},
                {text: '多为木材', type: 27, size: '1x4'},
                {text: '便于手持并操控镰刀', type: 28, size: '1x4'}
            ],
            wuYuanTriplets: {
                // 镰刀相关三元组
                '镰刀（lián dāo）-用途': '收割庄稼/割草等',
                '镰刀（lián dāo）-所属时代': '明代前',
                '镰刀（lián dāo）-材质': '铁质+木制',
                // 刀刃相关三元组
                '刀刃-形状': '呈弧形且刃口锋利',
                '刀刃-材质': '铁制',
                '刀刃-作用': '切割庄稼/草等',
                // 刀柄相关三元组
                '刀柄-形状': '多为直条形便于握持',
                '刀柄-材质': '多为木材',
                '刀柄-作用': '便于手持并操控镰刀'
            }
        },
        
        // 第五关：石磨
        'shimo': {
            displayName: '石磨（shí mò）',
            objectPieces: [
                {text: '石磨（shí mò）', type: 7, size: '1x3'},
                {text: '石磨（shí mò）', type: 7, size: '1x3'},
                {text: '石磨（shí mò）', type: 7, size: '1x3'},
                {text: '上磨盘', type: 8, size: '1x3'},
                {text: '上磨盘', type: 8, size: '1x3'},
                {text: '上磨盘', type: 8, size: '1x3'},
                {text: '下磨盘', type: 9, size: '1x3'},
                {text: '下磨盘', type: 9, size: '1x3'},
                {text: '下磨盘', type: 9, size: '1x3'},
                {text: '磨齿', type: 10, size: '1x3'},
                {text: '磨齿', type: 10, size: '1x3'},
                {text: '磨齿', type: 10, size: '1x3'},
                {text: '磨盘轴', type: 11, size: '1x3'},
                {text: '磨盘轴', type: 11, size: '1x3'},
                {text: '磨盘轴', type: 11, size: '1x3'}
            ],
            featurePieces: [
                {text: '所属朝代', type: 12, size: '1x3'},
                {text: '用途', type: 13, size: '1x3'},
                {text: '材质', type: 14, size: '1x3'},
                {text: '形状', type: 15, size: '1x3'},
                {text: '材质', type: 16, size: '1x3'},
                {text: '作用', type: 17, size: '1x3'},
                {text: '形状', type: 18, size: '1x3'},
                {text: '材质', type: 19, size: '1x3'},
                {text: '作用', type: 20, size: '1x3'},
                {text: '形状', type: 21, size: '1x3'},
                {text: '材质', type: 22, size: '1x3'},
                {text: '作用', type: 23, size: '1x3'},
                {text: '形状', type: 24, size: '1x3'},
                {text: '材质', type: 25, size: '1x3'},
                {text: '作用', type: 26, size: '1x3'}
            ],
            valuePieces: [
                {text: '明代前已广泛应用', type: 27, size: '1x4'},
                {text: '将谷物等粮食研磨成粉/浆等', type: 28, size: '1x4'},
                {text: '主要由石料制成', type: 29, size: '1x4'},
                {text: '圆形中间有孔且边缘有把手或推杆位置', type: 30, size: '1x4'},
                {text: '石料', type: 31, size: '1x4'},
                {text: '转动时与下磨盘配合研磨粮食', type: 32, size: '1x4'},
                {text: '圆形相对固定且表面有磨齿', type: 33, size: '1x4'},
                {text: '圆形相对固定且表面有磨齿', type: 34, size: '1x4'},
                {text: '石料', type: 35, size: '1x4'},
                {text: '与上磨盘相对提供研磨的基础面', type: 36, size: '1x4'},
                {text: '多为放射状或螺旋状的凸起', type: 37, size: '1x4'},
                {text: '石料', type: 38, size: '1x4'},
                {text: '增加摩擦力使粮食在研磨时更易破碎', type: 39, size: '1x4'},
                {text: '圆柱形', type: 40, size: '1x4'},
                {text: '石料或硬木', type: 41, size: '1x4'},
                {text: '连接上下磨盘保证上磨盘围绕其转动', type: 42, size: '1x4'}
            ],
            wuYuanTriplets: {
                // 石磨相关三元组
                '石磨（shí mò）-所属朝代': '明代前已广泛应用',
                '石磨（shí mò）-用途': '将谷物等粮食研磨成粉/浆等',
                '石磨（shí mò）-材质': '主要由石料制成',
                // 上磨盘相关三元组
                '上磨盘-形状': '圆形中间有孔且边缘有把手或推杆位置',
                '上磨盘-材质': '石料',
                '上磨盘-作用': '转动时与下磨盘配合研磨粮食',
                // 下磨盘相关三元组
                '下磨盘-形状': '圆形相对固定且表面有磨齿',
                '下磨盘-材质': '石料',
                '下磨盘-作用': '与上磨盘相对提供研磨的基础面',
                // 磨齿相关三元组
                '磨齿-形状': '多为放射状或螺旋状的凸起',
                '磨齿-材质': '石料',
                '磨齿-作用': '增加摩擦力使粮食在研磨时更易破碎',
                // 磨盘轴相关三元组
                '磨盘轴-形状': '圆柱形',
                '磨盘轴-材质': '石料或硬木',
                '磨盘轴-作用': '连接上下磨盘保证上磨盘围绕其转动'
            }
        }
    };
    
    // 定义长方形方块形状 - 所有方块都是长方形
    const RECTANGULAR_SHAPES = {
        '1x3': [[1, 1, 1]], // 1行3列
        '2x3': [[1, 1, 1], [1, 1, 1]], // 2行3列
        '3x3': [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3行3列 - 仅用于普通方块
        '1x4': [[1, 1, 1, 1]] // 1行4列 - 用于特征列新方块
    };
    
    // 对象列特定文字方块信息 - 全部使用长方形方块
    // 横向3格，纵向多个方块组合填满19个格子
    let objectPieces = [
        {text: '耖(chào)', type: 7, size: '1x3'},  // 1行3列 - 紫色
        {text: '耖(chào)', type: 7, size: '1x3'},  // 1行3列 - 紫色
        {text: '耖(chào)', type: 7, size: '1x3'},  // 1行3列 - 紫色
        {text: '耖框', type: 8, size: '1x3'},       // 1行3列 - 青色
        {text: '耖框', type: 8, size: '1x3'},       // 1行3列 - 青色
        {text: '耖框', type: 8, size: '1x3'},       // 1行3列 - 青色
        {text: '耖齿', type: 9, size: '1x3'},       // 1行3列 - 粉色
        {text: '耖齿', type: 9, size: '1x3'},       // 1行3列 - 粉色
        {text: '耖齿', type: 9, size: '1x3'},       // 1行3列 - 粉色
        {text: '扶手', type: 10, size: '1x3'},      // 1行3列 - 金色
        {text: '扶手', type: 10, size: '1x3'},      // 1行3列 - 金色
        {text: '扶手', type: 10, size: '1x3'}       // 1行3列 - 金色
    ];
    
    // 特征列特定文字方块信息 - 全部使用长方形方块
    // 横向4格，纵向多个方块组合填满19个格子
    let featurePieces = [
        {text: '用途', type: 11, size: '1x3'},              // 1行3列 - 靛蓝色
        {text: '类别', type: 12, size: '1x3'},              // 1行3列 - 热粉色
        {text: '所属朝代', type: 13, size: '1x3'},          // 1行3列 - 暗青色
        {text: '形状', type: 14, size: '1x3'},              // 1行3列 - 淡绿色
        {text: '材质', type: 15, size: '1x3'},              // 1行3列 - 金色
        {text: '作用', type: 16, size: '1x3'},              // 1行3列 - 珊瑚色
        {text: '形状', type: 17, size: '1x3'},              // 1行3列 - 深蓝色
        {text: '材质', type: 18, size: '1x3'},              // 1行3列 - 橙色
        {text: '作用', type: 19, size: '1x3'},              // 1行3列 - 紫色
        {text: '形状', type: 20, size: '1x3'},              // 1行3列 - 红色
        {text: '材质', type: 21, size: '1x3'},              // 1行3列 - 青色
        {text: '作用', type: 22, size: '1x3'}               // 1行3列 - 黄色
    ];
    
    // 量值列特定文字方块信息 - 全部使用长方形方块
    // 横向3格，纵向多个方块组合填满19个格子
    let valuePieces = [
        {text: '耕作农具', type: 23, size: '1x3'},              // 1行3列 - 靛蓝色
        {text: '整地农具', type: 24, size: '1x3'},              // 1行3列 - 热粉色
        {text: '宋明时期', type: 25, size: '1x3'},              // 1行3列 - 暗青色
        {text: '长方形木框', type: 26, size: '1x3'},            // 1行3列 - 淡绿色
        {text: '木制', type: 27, size: '1x3'},                  // 1行3列 - 金色
        {text: '承载部件并保持结构稳定', type: 28, size: '1x3'},  // 1行3列 - 珊瑚色
        {text: '垂直向下的长齿状', type: 29, size: '1x3'},       // 1行3列 - 深蓝色
        {text: '铁制或木制', type: 30, size: '1x3'},            // 1行3列 - 橙色
        {text: '破碎土块及平整田面', type: 31, size: '1x3'},     // 1行3列 - 紫色
        {text: '便于人手握持的杆状', type: 32, size: '1x3'},     // 1行3列 - 红色
        {text: '木制', type: 33, size: '1x3'},                  // 1行3列 - 青色
        {text: '控制方向与深度', type: 34, size: '1x3'}          // 1行3列 - 黄色
    ];
    
    // 加载主题数据
    function loadTheme(themeName) {
        if (themeData[themeName]) {
            currentTheme = themeName;
            wuYuanTriplets = themeData[themeName].wuYuanTriplets;
            objectPieces = themeData[themeName].objectPieces;
            featurePieces = themeData[themeName].featurePieces;
            valuePieces = themeData[themeName].valuePieces;
            return true;
        }
        return false;
    }
    
    // 初始化主题数据
    wuYuanTriplets = themeData[currentTheme].wuYuanTriplets;
    objectPieces = themeData[currentTheme].objectPieces;
    featurePieces = themeData[currentTheme].featurePieces;
    valuePieces = themeData[currentTheme].valuePieces;
    
    // 当前等待放置的对象方块索引
    let currentObjectIndex = 0;
    
    // 当前等待放置的特征方块索引
    let currentFeatureIndex = 0;
    
    // 需要重置的错误方块
    let wrongPiece = null;
    
    // 错误方块队列，用于存储需要在后续下落周期中重新生成的方块
    let errorPieceQueue = [];
    
    // 用于跟踪当前应该生成哪种类型的方块 (0: 对象列, 1: 特征列, 2: 普通方块)
    // 存储已完成的三元组，用于防止重复出现
    let completedTriplets = new Set();
    // 所有需要完成的三元组数量
    let totalTriplets = Object.keys(themeData[currentTheme].wuYuanTriplets).length;
    let pieceTypeSequence = [];
    let currentSequenceIndex = 0;
    
    // 当前方块和下一个方块
    let currentPiece;
    let nextPiece;
    
    // 初始化方块生成序列
    function initializePieceSequence() {
        // 特殊处理第一关（chao）、第二关（weng）、第三关（yun）、第四关（liandao）和第五关（shimo）的方块序列
        if (currentTheme === 'chao' || currentTheme === 'weng' || currentTheme === 'yun' || currentTheme === 'liandao' || currentTheme === 'shimo') {
            // 根据当前主题动态生成方块序列
            const orderedSequence = [];
            
            // 获取当前主题的wuYuanTriplets数据
            const triplets = themeData[currentTheme].wuYuanTriplets;
            const themeObjectPieces = themeData[currentTheme].objectPieces;
            const themeFeaturePieces = themeData[currentTheme].featurePieces;
            const themeValuePieces = themeData[currentTheme].valuePieces;
            
            // 遍历当前主题的所有三元组，创建序列
            for (const [key, value] of Object.entries(triplets)) {
                // 解析键，获取对象和特征
                const [objectText, featureText] = key.split('-');
                
                // 查找对应的对象索引
                const objectIndex = themeObjectPieces.findIndex(piece => piece.text === objectText);
                // 查找对应的特征索引
                const featureIndex = themeFeaturePieces.findIndex(piece => piece.text === featureText);
                // 查找对应的量值索引
                const valueIndex = themeValuePieces.findIndex(piece => piece.text === value);
                
                // 如果都找到了，添加到序列中
                if (objectIndex !== -1 && featureIndex !== -1 && valueIndex !== -1) {
                    orderedSequence.push(
                        {type: 0, index: objectIndex}, // 对象
                        {type: 1, index: featureIndex}, // 特征
                        {type: 2, index: valueIndex}    // 量值
                    );
                }
            }
            
            // 收集所有未完成的三元组（保持三元组的完整性）
            const incompleteTriplets = [];
            
            // 遍历所有三元组，每组3个元素
            for (let i = 0; i < orderedSequence.length; i += 3) {
                // 获取这组三元组的三个元素
                const objectItem = orderedSequence[i];
                const featureItem = orderedSequence[i + 1];
                const valueItem = orderedSequence[i + 2];
                
                // 获取对应的文本
                const objectText = objectPieces[objectItem.index].text;
                const featureText = featurePieces[featureItem.index].text;
                const valueText = valuePieces[valueItem.index].text;
                
                // 构建三元组键
                const tripletKey = `${objectText}-${featureText}-${valueText}`;
                
                // 如果这个三元组未完成，添加到未完成列表中
                if (!completedTriplets.has(tripletKey)) {
                    incompleteTriplets.push([objectItem, featureItem, valueItem]);
                }
            }
            
            // 按用户需求修改：将三元组分成每2个一组的块，仅在块内随机打乱
            const blockSize = 2;
            const blocks = [];
            
            // 将三元组分成块
            for (let i = 0; i < incompleteTriplets.length; i += blockSize) {
                blocks.push(incompleteTriplets.slice(i, i + blockSize));
            }
            
            // 创建最终的方块序列
            const filteredSequence = [];
            
            // 处理每个块
            blocks.forEach(block => {
                // 在块内随机打乱三元组的顺序
                if (block.length > 1) {
                    // Fisher-Yates打乱算法
                    for (let i = block.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [block[i], block[j]] = [block[j], block[i]];
                    }
                }
                
                // 将块中的所有三元组元素添加到最终序列
                block.forEach(triplet => {
                    // 随机打乱每个三元组内元素的顺序
                    const shuffledTriplet = [...triplet];
                    for (let i = shuffledTriplet.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledTriplet[i], shuffledTriplet[j]] = [shuffledTriplet[j], shuffledTriplet[i]];
                    }
                    filteredSequence.push(...shuffledTriplet);
                });
            });
            
            // 如果没有未完成的三元组方块，添加一些普通方块
            if (filteredSequence.length === 0) {
                // 添加5个普通方块
                for (let i = 0; i < 5; i++) {
                    filteredSequence.push({type: -1}); // 普通方块标记
                }
            }
            
            pieceTypeSequence = filteredSequence;
            currentSequenceIndex = 0;
        } else {
            // 其他关卡保持原有逻辑
            // 根据当前主题动态生成方块序列
            const orderedSequence = [];
            
            // 获取当前主题的wuYuanTriplets数据
            const triplets = themeData[currentTheme].wuYuanTriplets;
            const themeObjectPieces = themeData[currentTheme].objectPieces;
            const themeFeaturePieces = themeData[currentTheme].featurePieces;
            const themeValuePieces = themeData[currentTheme].valuePieces;
            
            // 遍历当前主题的所有三元组，创建序列
            for (const [key, value] of Object.entries(triplets)) {
                // 解析键，获取对象和特征
                const [objectText, featureText] = key.split('-');
                
                // 查找对应的对象索引
                const objectIndex = themeObjectPieces.findIndex(piece => piece.text === objectText);
                // 查找对应的特征索引
                const featureIndex = themeFeaturePieces.findIndex(piece => piece.text === featureText);
                // 查找对应的量值索引
                const valueIndex = themeValuePieces.findIndex(piece => piece.text === value);
                
                // 如果都找到了，添加到序列中
                if (objectIndex !== -1 && featureIndex !== -1 && valueIndex !== -1) {
                    orderedSequence.push(
                        {type: 0, index: objectIndex}, // 对象
                        {type: 1, index: featureIndex}, // 特征
                        {type: 2, index: valueIndex}    // 量值
                    );
                }
            }
            
            // 收集所有未完成的三元组（保持三元组的完整性）
            const incompleteTriplets = [];
            
            // 遍历所有12组三元组
            for (let i = 0; i < orderedSequence.length; i += 3) {
                // 获取这组三元组的三个元素
                const objectItem = orderedSequence[i];
                const featureItem = orderedSequence[i + 1];
                const valueItem = orderedSequence[i + 2];
                
                // 获取对应的文本
                const objectText = objectPieces[objectItem.index].text;
                const featureText = featurePieces[featureItem.index].text;
                const valueText = valuePieces[valueItem.index].text;
                
                // 构建三元组键
                const tripletKey = `${objectText}-${featureText}-${valueText}`;
                
                // 如果这个三元组未完成，添加到未完成列表中
                if (!completedTriplets.has(tripletKey)) {
                    incompleteTriplets.push([objectItem, featureItem, valueItem]);
                }
            }
            
            // 对未完成的三元组进行随机排序
            for (let i = incompleteTriplets.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [incompleteTriplets[i], incompleteTriplets[j]] = [incompleteTriplets[j], incompleteTriplets[i]];
            }
            
            // 将随机排序后的三元组展开到filteredSequence中
            const filteredSequence = [];
            for (const triplet of incompleteTriplets) {
                filteredSequence.push(...triplet);
            }
            
            // 如果没有未完成的三元组方块，添加一些普通方块
            if (filteredSequence.length === 0) {
                // 添加5个普通方块
                for (let i = 0; i < 5; i++) {
                    filteredSequence.push({type: -1}); // 普通方块标记
                }
            }
            
            pieceTypeSequence = filteredSequence;
            currentSequenceIndex = 0;
        }
    }
    
    // 辅助函数：打乱数组顺序
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 生成新方块 - 所有方块都是长方形
    function createPiece() {
        // 首先检查是否有错误方块需要重新生成
        if (errorPieceQueue.length > 0) {
            // 从队列中取出最早的错误方块
            const errorPiece = errorPieceQueue.shift();
            // 重置位置，使其从顶部重新下落
            return {
                ...errorPiece,
                x: Math.floor(COLS / 2) - 1,
                y: 0
            };
        }
        
        // 如果序列为空或已用完，初始化新序列
        if (pieceTypeSequence.length === 0 || currentSequenceIndex >= pieceTypeSequence.length) {
            initializePieceSequence();
        }
        
        // 根据序列生成方块
        const sequenceItem = pieceTypeSequence[currentSequenceIndex];
        currentSequenceIndex++;
        
        if (sequenceItem.type === 0) {
            // 生成对象列方块
            const piece = objectPieces[sequenceItem.index];
            const type = piece.type;
            const size = piece.size;
            const shape = RECTANGULAR_SHAPES[size];
            // 根据方块宽度计算居中位置
            const x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
            const y = 0;
            
            return {x, y, shape, type, text: piece.text, size: size, pieceType: 'object'};
        } else if (sequenceItem.type === 1) {
            // 生成特征列方块
            const piece = featurePieces[sequenceItem.index];
            const type = piece.type;
            const size = piece.size;
            const shape = RECTANGULAR_SHAPES[size];
            // 根据方块宽度计算居中位置
            const x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
            const y = 0;
            
            return {x, y, shape, type, text: piece.text, size: size, pieceType: 'feature'};
        } else if (sequenceItem.type === 2) {
            // 生成量值列方块
            const piece = valuePieces[sequenceItem.index];
            const type = piece.type;
            const size = piece.size;
            const shape = RECTANGULAR_SHAPES[size];
            // 根据方块宽度计算居中位置
            const x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
            const y = 0;
            
            return {x, y, shape, type, text: piece.text, size: size, pieceType: 'value'};
        }
        
        // 如果没有特定类型的方块需要生成，则生成长方形普通方块
        const type = Math.floor(Math.random() * 7) + 1; // 1-7对应不同颜色
        // 随机选择长方形尺寸，按照需求比例分布：3x3、1x3、1x3、2x3
        const sizes = ['3x3', '1x3', '1x3', '2x3'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const shape = RECTANGULAR_SHAPES[size];
        // 计算居中位置
        const x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
        const y = 0;
        
        return {x, y, shape, type, size: size};
    }
    
    // 检查碰撞
    function checkCollision(piece, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    // 检查边界和已存在的方块
                    if (newX < 0 || newX >= COLS || newY >= ROWS || 
                        (newY >= 0 && board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // 检查方块是否完全位于指定列范围内
    function isPieceInColumnRange(piece, startCol, endCol) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const boardX = piece.x + x;
                    if (boardX < startCol || boardX > endCol) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    // 将当前方块固定到游戏板上
    function lockPiece() {
        let isCorrectPlacement = true;
        let pointsGained = 0;
        
        // 检查是否是特定文字方块，并且位置是否正确
        if (currentPiece.text) {
            if (currentPiece.pieceType === 'object') {
                // 对象列方块检查
                if (!isPieceInColumnRange(currentPiece, 0, 2)) {
                    // 对象列方块放错位置：显示弹窗提醒
                    showPositionErrorDialog(currentPiece.text, 'object');
                    isCorrectPlacement = false;
                    return; // 不固定方块，返回
                }
            } else if (currentPiece.pieceType === 'feature') {
                // 特征列方块检查
                if (!isPieceInColumnRange(currentPiece, 3, 5)) {
                    // 特征列方块放错位置：显示弹窗提醒
                    showPositionErrorDialog(currentPiece.text, 'feature');
                    isCorrectPlacement = false;
                    return; // 不固定方块，返回
                }
            } else if (currentPiece.pieceType === 'value') {
                // 量值列方块检查
                if (!isPieceInColumnRange(currentPiece, 6, 9)) {
                    // 量值列方块放错位置：显示弹窗提醒
                    showPositionErrorDialog(currentPiece.text, 'value');
                    isCorrectPlacement = false;
                    return; // 不固定方块，返回
                }
                
                // 检查量值列方块是否与已放置的对象和特征方块形成正确的三元组
                // 1. 找到同一行的对象列方块
                const objectText = findSameRowObject(currentPiece.y);
                // 2. 找到同一行的特征列方块
                const featureText = findSameRowFeature(currentPiece.y);
                
                if (objectText && featureText) {
                    // 3. 检查三元组是否正确
                    const tripletKey = `${objectText}-${featureText}`;
                    const correctValue = wuYuanTriplets[tripletKey];
                    
                    if (correctValue && currentPiece.text !== correctValue) {
                        // 量值不正确：显示弹窗提醒正确的三元组
                        showWuYuanErrorDialog(currentPiece.text, objectText, featureText, correctValue);
                        isCorrectPlacement = false;
                        return; // 不固定方块，返回
                    } else if (correctValue && currentPiece.text === correctValue) {
                        // 量值正确：记录已完成的三元组
                        const tripletKey = `${objectText}-${featureText}-${correctValue}`;
                        completedTriplets.add(tripletKey);
                          
                        // 将量值方块的尺寸从1x3调整为1x4
                        // 1. 清除当前1x3方块在游戏板上的位置
                        for (let y = 0; y < currentPiece.shape.length; y++) {
                            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                                if (currentPiece.shape[y][x] !== 0) {
                                    const boardY = currentPiece.y + y;
                                    const boardX = currentPiece.x + x;
                                    board[boardY][boardX] = 0;
                                }
                            }
                        }
                        
                        // 2. 更新方块尺寸和形状为1x4
                        const updatedShape = RECTANGULAR_SHAPES['1x4'];
                        
                        // 3. 更新currentPiece的shape和size属性，确保所有渲染和放置逻辑使用更新后的尺寸
                        currentPiece.shape = updatedShape;
                        currentPiece.size = '1x4';
                        
                        // 4. 重新放置为1x4尺寸的方块
                        // 对于底部行，保持原始类型不变（保留类别文字显示）
                        const bottomRow = ROWS - 1;
                        for (let y = 0; y < updatedShape.length; y++) {
                            for (let x = 0; x < updatedShape[y].length; x++) {
                                if (updatedShape[y][x] !== 0) {
                                    const boardY = currentPiece.y + y;
                                    const boardX = currentPiece.x + x;
                                    // 确保在游戏板范围内
                                    if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                                        // 如果是底部行，保持原始类型不变
                                        if (boardY === bottomRow) {
                                            // 底部行保持原来的紫色类型(4)
                                            board[boardY][boardX] = 4;
                                        } else {
                                            // 其他行使用当前方块类型
                                            board[boardY][boardX] = currentPiece.type;
                                        }
                                    }
                                }
                            }
                        }
                          
                        // 自动填补1x1空方块到量值列
                        // 查找量值方块下方的空白位置
                        let emptyY = currentPiece.y + updatedShape.length;
                        let emptyX = currentPiece.x + Math.floor(updatedShape[0].length / 2);
                          
                        // 确保位置在游戏板范围内
                        if (emptyY < ROWS && emptyX >= 6 && emptyX <= 9) {
                            // 创建一个1x1的空方块
                            const emptyPieceType = 100; // 使用一个特殊的类型ID表示空方块
                            board[emptyY][emptyX] = emptyPieceType;
                        }
                        
                        // 立即渲染游戏板以显示更新后的方块和新增的空方块
                        drawBoard();
                    }
                }
            }
        }
        
        // 将方块固定到游戏板上
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x] !== 0) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    
                    if (boardY >= 0) {
                        // 保存方块类型
                        board[boardY][boardX] = currentPiece.type;
                    }
                }
            }
        }
        
        // 如果放置正确，增加分数
        if (isCorrectPlacement && currentPiece.text) {
            score += 1; // 每填对一个方块得1分
            updateGameInfo(); // 更新分数显示
        }
        
        // 检查是否有可以消除的行（但现在不消除）
        checkLines();
        
        // 检查是否所有三元组都已完成
        checkWinCondition();
        
        // 生成新方块
        currentPiece = nextPiece;
        nextPiece = createPiece();
        
        // 检查游戏是否结束
        if (checkCollision(currentPiece)) {
            gameOver();
        }
        
        // 渲染下一个方块
        drawNextPiece();
    }
    
    // 查找同一行的对象列方块文字
    function findSameRowObject(row) {
        // 创建类型到文字的映射
        const typeToText = new Map();
        for (let i = 0; i < objectPieces.length; i++) {
            typeToText.set(objectPieces[i].type, objectPieces[i].text);
        }
        
        // 检查对象列（0-2列）
        for (let x = 0; x <= 2; x++) {
            const type = board[row][x];
            if (typeToText.has(type)) {
                return typeToText.get(type);
            }
        }
        return null;
    }
    
    // 查找同一行的特征列方块文字
    function findSameRowFeature(row) {
        // 创建类型到文字的映射
        const typeToText = new Map();
        for (let i = 0; i < featurePieces.length; i++) {
            typeToText.set(featurePieces[i].type, featurePieces[i].text);
        }
        
        // 检查特征列（3-5列）
        for (let x = 3; x <= 5; x++) {
            const type = board[row][x];
            if (typeToText.has(type)) {
                return typeToText.get(type);
            }
        }
        return null;
    }
    
    // 检查并消除完整的行 - 现在不消除包含正确三元组的行
    function checkLines() {
        // 根据用户需求，不再消除完整的行
        // 正确填写的三元组方块将保留在原位置
    }
    
    // 检查是否所有三元组都已完成
    function checkWinCondition() {
        if (completedTriplets.size >= totalTriplets) {
            // 所有三元组都已完成，触发过关效果
            showWinEffect();
        }
    }
    
    // 显示过关效果（彩带动画和音效）
    function showWinEffect() {
        // 暂停游戏
        if (!isPaused) {
            togglePause();
        }
        
        // 播放人群喝彩音效
        Sounds.crowdCheer();
        
        // 创建彩带动画
        createConfettiAnimation();
        
        // 显示过关提示
        showWinDialog();
    }
    
    // 创建彩带动画
    function createConfettiAnimation() {
        const confettiContainer = document.createElement('div');
        confettiContainer.id = 'confetti-container';
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        document.body.appendChild(confettiContainer);
        
        // 创建彩色粒子
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        for (let i = 0; i < 200; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -20 + 'px';
            confetti.style.opacity = Math.random() * 0.7 + 0.3;
            confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
            
            // 添加动画
            confetti.style.animation = 'fall ' + (Math.random() * 3 + 2) + 's linear forwards';
            
            confettiContainer.appendChild(confetti);
        }
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
        
        // 动画结束后清理
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
            document.head.removeChild(style);
        }, 5000);
    }
    
    // 显示过关对话框
    function showWinDialog() {
        // 创建过关对话框
        const winDialog = document.createElement('div');
        winDialog.className = 'confirm-dialog';
        
        // 检查是否有下一关
        const hasNextLevel = currentThemeIndex < themes.length - 1;
        
        // 检查是否所有关卡都已完成
        const isAllLevelsCompleted = currentThemeIndex === themes.length - 1;
        
        // 获取当前关卡的显示名称
        let currentLevelName = '';
        if (currentTheme === 'chao') {
            currentLevelName = '关卡 1 - 耖（chào）';
        } else if (currentTheme === 'weng') {
            currentLevelName = '关卡 2 - 瓮（wèng）';
        } else if (currentTheme === 'yun') {
            currentLevelName = '关卡 3 - 耘（yún）';
        } else if (currentTheme === 'liandao') {
            currentLevelName = '关卡 4 - 镰刀（lián dāo）';
        } else if (currentTheme === 'shimo') {
            currentLevelName = '关卡 5 - 石磨（shí mò）';
        }
        
        if (isAllLevelsCompleted) {
            // 所有关卡都已完成，显示全部通关提示
            winDialog.innerHTML = `
                <div class="confirm-content">
                    <h3 style="color: #4ECDC4;">恭喜你全部通关</h3>
                    <p>您已成功完成所有关卡的挑战！</p>
                    <div class="confirm-buttons">
                        <button id="restartAllButton" class="btn">重新游戏</button>
                    </div>
                </div>
            `;
        } else {
            // 仅当前关卡完成，显示普通过关提示
            winDialog.innerHTML = `
                <div class="confirm-content">
                    <h3 style="color: #4ECDC4;">恭喜你！</h3>
                    <p>你已成功完成${currentLevelName}的三元组合</p>
                    <div class="confirm-buttons">
                        <button id="nextLevelButton" class="btn">下一关</button>
                        <button id="restartButton3" class="btn">重新开始</button>
                    </div>
                </div>
            `;
        }
        
        document.body.appendChild(winDialog);
        winDialog.style.display = 'flex';
        
        // 添加重新开始按钮事件
        if (document.getElementById('restartButton3')) {
            document.getElementById('restartButton3').addEventListener('click', function() {
                document.body.removeChild(winDialog);
                startGame();
            });
        }
        
        // 添加重新游戏按钮事件（所有关卡完成时）
        if (document.getElementById('restartAllButton')) {
            document.getElementById('restartAllButton').addEventListener('click', function() {
                document.body.removeChild(winDialog);
                // 重置到第一关
                currentThemeIndex = 0;
                loadTheme(themes[currentThemeIndex]);
                startGame();
            });
        }
        
        // 添加下一关按钮事件（如果存在）
        if (hasNextLevel && document.getElementById('nextLevelButton')) {
            document.getElementById('nextLevelButton').addEventListener('click', function() {
                document.body.removeChild(winDialog);
                // 进入下一关
                currentThemeIndex++;
                loadTheme(themes[currentThemeIndex]);
                startGame();
            });
        }
    }
    
    // 检查一行是否包含完整的正确三元组
    function hasCompleteTriplet(row) {
        // 检查是否有完整的对象-特征-量值三元组
        // 创建类型到文字的映射
        const objectTypeToText = new Map();
        for (let i = 0; i < objectPieces.length; i++) {
            objectTypeToText.set(objectPieces[i].type, objectPieces[i].text);
        }
        
        const featureTypeToText = new Map();
        for (let i = 0; i < featurePieces.length; i++) {
            featureTypeToText.set(featurePieces[i].type, featurePieces[i].text);
        }
        
        const valueTypeToText = new Map();
        for (let i = 0; i < valuePieces.length; i++) {
            valueTypeToText.set(valuePieces[i].type, valuePieces[i].text);
        }
        
        // 检查是否存在对象方块、特征方块和量值方块
        let hasObject = false;
        let hasFeature = false;
        let hasValue = false;
        let objectText = null;
        let featureText = null;
        let valueText = null;
        
        for (let x = 0; x < COLS; x++) {
            const type = board[row][x];
            if (objectTypeToText.has(type)) {
                hasObject = true;
                objectText = objectTypeToText.get(type);
            } else if (featureTypeToText.has(type)) {
                hasFeature = true;
                featureText = featureTypeToText.get(type);
            } else if (valueTypeToText.has(type)) {
                hasValue = true;
                valueText = valueTypeToText.get(type);
            }
        }
        
        // 检查是否形成了正确的三元组
        if (hasObject && hasFeature && hasValue) {
            const tripletKey = `${objectText}-${featureText}`;
            const correctValue = wuYuanTriplets[tripletKey];
            return correctValue && correctValue === valueText;
        }
        
        return false;
    }
    
    // 旋转方块 - 完全禁用旋转功能
    function rotate(piece) {
        // 不执行任何旋转操作，旋转功能已完全禁用
        return false;
    }
    
    // 绘制方块
    function drawBlock(ctx, x, y, type, blockSize) {
        ctx.fillStyle = COLORS[type];
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // 添加边框和高光效果
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // 添加内部高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * blockSize + 4, y * blockSize + 4, blockSize - 8, blockSize - 8);
    }
    
    // 绘制游戏板
    function drawBoard() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制已固定的方块
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] !== 0) {
                    drawBlock(ctx, x, y, board[y][x], BLOCK_SIZE);
                }
            }
        }
        
        // 绘制当前方块
        if (currentPiece) {
            // 先计算方块占据的范围用于文字绘制
            let minX = Infinity, maxX = -Infinity;
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x] !== 0) {
                        const boardX = currentPiece.x + x;
                        const boardY = currentPiece.y + y;
                        if (boardY >= 0) { // 只绘制在可见区域内的方块
                            drawBlock(ctx, boardX, boardY, currentPiece.type, BLOCK_SIZE);
                            minX = Math.min(minX, boardX);
                            maxX = Math.max(maxX, boardX);
                        }
                    }
                }
            }
            
            // 如果是特定文字方块，绘制文字
            if (currentPiece.text) {
                const blockCount = maxX - minX + 1;
                const rows = currentPiece.shape.length; // 获取方块的行数
                drawTextInBlock(currentPiece.text, minX, currentPiece.y, blockCount, '#ffffff', rows);
            }
        }
        
        // 检查是否存在底部的特殊方块，如果存在则绘制文字
        const bottomRow = ROWS - 1;
        if (board[bottomRow][0] === 2 && board[bottomRow][1] === 2 && board[bottomRow][2] === 2) {
            // 在最左侧1X3方块上绘制"对象"
            drawTextInBlock('对象', 0, bottomRow, 3, '#ffffff');
        }
        
        if (board[bottomRow][3] === 3 && board[bottomRow][4] === 3 && board[bottomRow][5] === 3) {
            // 在中间1X3方块上绘制"特征"
            drawTextInBlock('特征', 3, bottomRow, 3, '#ffffff');
        }
        
        if (board[bottomRow][6] === 4 && board[bottomRow][7] === 4 && board[bottomRow][8] === 4 && board[bottomRow][9] === 4) {
            // 在最右侧1X4方块上绘制"量值"
            drawTextInBlock('量值', 6, bottomRow, 4, '#ffffff');
        }
        
        // 绘制已锁定的特殊文字方块
        drawLockedSpecialPieces();
    }
    
    // 绘制下一个方块（显示文字内容）
    function drawNextPiece() {
        // 先使用不透明背景完全清除画布，避免文字残留
        nextCtx.fillStyle = '#000000';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        // 再绘制半透明背景
        nextCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        // 绘制文本的函数 - 支持自动换行
        function drawWrappedText(text, x, y, maxWidth, fontSize) {
            nextCtx.fillStyle = '#ffffff';
            nextCtx.font = `${fontSize}px 微软雅黑, sans-serif`;
            nextCtx.textAlign = 'center';
            nextCtx.textBaseline = 'middle';
            
            const words = text.split(''); // 中文按单个字符分割
            const lines = [];
            let currentLine = '';
            
            // 逐字检查是否需要换行
            for (let i = 0; i < words.length; i++) {
                const testLine = currentLine + words[i];
                const metrics = nextCtx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > maxWidth && i > 0) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);
            
            // 计算总高度并调整起始位置以实现垂直居中
            const lineHeight = fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            const startY = y - (totalHeight / 2) + (lineHeight / 2);
            
            // 绘制每一行文字
            for (let i = 0; i < lines.length; i++) {
                nextCtx.fillText(lines[i], x, startY + (i * lineHeight));
            }
        }
        
        const margin = 15;
        const maxWidth = nextCanvas.width - (margin * 2);
        
        if (nextPiece && nextPiece.text) {
            // 初始字体大小设为较大值
            let fontSize = 18;
            
            // 检查是否需要缩小字体以适应行数限制
            // 假设最多显示4行
            const estimatedMaxLines = 4;
            const lineHeight = fontSize * 1.2;
            
            // 计算文本长度，估算可能的行数
            const charCount = nextPiece.text.length;
            const charsPerLine = Math.floor(maxWidth / (fontSize * 0.5)); // 估算每行可显示的中文字符数
            const estimatedLines = Math.ceil(charCount / charsPerLine);
            
            // 如果估算行数超过限制，适当缩小字体
            if (estimatedLines > estimatedMaxLines && fontSize > 10) {
                fontSize = Math.max(10, fontSize - (estimatedLines - estimatedMaxLines) * 2);
            }
            
            // 绘制自动换行的文字
            drawWrappedText(nextPiece.text, nextCanvas.width / 2, nextCanvas.height / 2, maxWidth, fontSize);
        } else if (nextPiece) {
            // 对于没有文字的普通方块，显示默认文本
            nextCtx.fillStyle = '#ffffff';
            nextCtx.font = '16px 微软雅黑, sans-serif';
            nextCtx.textAlign = 'center';
            nextCtx.textBaseline = 'middle';
            nextCtx.fillText('普通方块', nextCanvas.width / 2, nextCanvas.height / 2);
        } else {
            // 如果没有下一个方块，显示默认文本
            nextCtx.fillStyle = '#ffffff';
            nextCtx.font = '16px 微软雅黑, sans-serif';
            nextCtx.textAlign = 'center';
            nextCtx.textBaseline = 'middle';
            nextCtx.fillText('准备中...', nextCanvas.width / 2, nextCanvas.height / 2);
        }
    }
    
    // 更新游戏信息显示
    function updateGameInfo() {
        scoreElement.textContent = score;
        // 显示关卡和当前主题的物元名称
        if (currentTheme === 'chao') {
            levelElement.textContent = `关卡 ${1} - 耖（chào）`;
        } else if (currentTheme === 'weng') {
            levelElement.textContent = `关卡 ${2} - 瓮（wèng）`;
        } else if (currentTheme === 'yun') {
            levelElement.textContent = `关卡 ${3} - 耘（yún）`;
        } else if (currentTheme === 'liandao') {
            levelElement.textContent = `关卡 ${4} - 镰刀（lián dāo）`;
        } else if (currentTheme === 'shimo') {
            levelElement.textContent = `关卡 ${5} - 石磨（shí mò）`;
        }
    }
    
    // 游戏主循环
    function gameLoop(time = 0) {
        if (!isPaused) {
            const deltaTime = time - lastTime;
            lastTime = time;
            
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                moveDown();
            }
        }
        
        drawBoard();
        gameId = requestAnimationFrame(gameLoop);
    }
    
    // 移动方块
    function movePiece(dir) {
        if (checkCollision(currentPiece, dir, 0)) return false;
        currentPiece.x += dir;
        Sounds.move();
        return true;
    }
    
    // 方块下移
    function moveDown() {
        if (!checkCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
            dropCounter = 0;
        } else {
            lockPiece();
        }
    }
    
    // 方块快速下落
    function hardDrop() {
        while (!checkCollision(currentPiece, 0, 1)) {
            currentPiece.y++;
        }
        Sounds.drop();
        lockPiece();
    }
    
    // 在指定位置的方块内绘制文字
    function drawTextInBlock(text, startX, startY, blockCount, color, rows = 1) {
        // 根据方块数量和行数动态调整字体大小，确保文字在方块内完整显示
        let fontSize = 14;
        if (blockCount === 3) {
            fontSize = 13; // 对于3格宽的方块，使用适中字体
        } else if (blockCount === 4) {
            fontSize = 12; // 对于4格宽的方块，使用稍小字体
        }
        
        // 确保字体大小适合文字长度
        const textWidthEstimate = text.length * fontSize * 0.55;
        const availableWidth = blockCount * BLOCK_SIZE - 10; // 减去边距
        if (textWidthEstimate > availableWidth) {
            fontSize = Math.floor((availableWidth / text.length) * 1.8);
        }
        
        // 对于特别长的文字，进一步减小字体
        if (text.length > 6) {
            fontSize = Math.max(6, Math.floor(fontSize * 0.7));
        }
        
        // 确保字体大小不小于6px
        fontSize = Math.max(6, fontSize);
        
        // 设置文字样式
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 计算文字位置
        const totalWidth = blockCount * BLOCK_SIZE;
        const totalHeight = rows * BLOCK_SIZE;
        const centerX = (startX * BLOCK_SIZE) + (totalWidth / 2);
        const centerY = (startY * BLOCK_SIZE) + (totalHeight / 2);
        
        // 先绘制描边
        ctx.strokeText(text, centerX, centerY);
        // 再绘制填充
        ctx.fillText(text, centerX, centerY);
    }
    
    // 绘制已锁定的特殊文字方块
    function drawLockedSpecialPieces() {
        // 存储已处理的方块位置，避免重复绘制
        const processedPositions = new Set();
        
        // 创建一个类型到文字的映射，避免重复查找
        const typeToText = new Map();
        // 添加对象列方块
        for (let i = 0; i < objectPieces.length; i++) {
            const piece = objectPieces[i];
            if (!typeToText.has(piece.type)) {
                typeToText.set(piece.type, piece.text);
            }
        }
        // 添加特征列方块
        for (let i = 0; i < featurePieces.length; i++) {
            const piece = featurePieces[i];
            if (!typeToText.has(piece.type)) {
                typeToText.set(piece.type, piece.text);
            }
        }
        // 添加量值列方块
        for (let i = 0; i < valuePieces.length; i++) {
            const piece = valuePieces[i];
            if (!typeToText.has(piece.type)) {
                typeToText.set(piece.type, piece.text);
            }
        }
        
        // 检查所有已锁定的特殊方块
        for (let y = 0; y < ROWS - 1; y++) { // 不检查底部行
            for (let x = 0; x < COLS; x++) {
                // 只查找文字方块类型（对象列、特征列和量值列）
                if (board[y][x] >= 7 && board[y][x] <= 42) { // 增加到42以覆盖石磨主题的所有量值类型
                    const type = board[y][x];
                    const posKey = `${x},${y}`;
                    
                    // 只处理未处理过的位置
                    if (!processedPositions.has(posKey)) {
                        // 判断列类型
                        const isObjectColumn = x >= 0 && x <= 2;
                        const isFeatureColumn = x >= 3 && x <= 5;
                        const isValueColumn = x >= 6 && x <= 9;
                        
                        // 根据列类型应用不同的绘制逻辑
                        if (isObjectColumn) {
                            // 对象列：查找该类型方块的连续范围（支持垂直合并）
                            let minX = x, maxX = x;
                            let rowCount = 1;
                            
                            // 查找同一行的连续方块
                            while (maxX + 1 < COLS && board[y][maxX + 1] === type) {
                                maxX++;
                            }
                            
                            // 查找垂直方向的连续方块
                            let nextY = y + 1;
                            let isNextRowComplete = true;
                            while (nextY < ROWS - 1) {
                                for (let checkX = minX; checkX <= maxX; checkX++) {
                                    if (board[nextY][checkX] !== type) {
                                        isNextRowComplete = false;
                                        break;
                                    }
                                }
                                if (isNextRowComplete) {
                                    rowCount++;
                                    nextY++;
                                } else {
                                    break;
                                }
                            }
                            
                            // 标记这些位置为已处理
                            for (let currentRow = y; currentRow < y + rowCount; currentRow++) {
                                for (let checkX = minX; checkX <= maxX; checkX++) {
                                    processedPositions.add(`${checkX},${currentRow}`);
                                }
                            }
                            
                            // 绘制文字
                            const text = typeToText.get(type) || '';
                            const blockCount = maxX - minX + 1;
                            drawTextInBlock(text, minX, y, blockCount, '#ffffff', rowCount);
                        } else if (isFeatureColumn || isValueColumn) {
                            // 特征列或量值列：为每个独立方块区域单独绘制文字
                            // 查找该类型方块的单个方块区域范围
                            let minX = x, maxX = x;
                            let rowCount = 1;
                            
                            // 查找同一行的连续方块
                            while (maxX + 1 < COLS && board[y][maxX + 1] === type) {
                                maxX++;
                            }
                            
                            // 标记这些位置为已处理
                            for (let checkX = minX; checkX <= maxX; checkX++) {
                                processedPositions.add(`${checkX},${y}`);
                            }
                            
                            // 绘制文字
                            const text = typeToText.get(type) || '';
                            const blockCount = maxX - minX + 1;
                            drawTextInBlock(text, minX, y, blockCount, '#ffffff', rowCount);
                        }
                    }
                }
            }
        }
    }
    
    // 开始游戏
    function startGame() {
        // 重置游戏状态
        board = createEmptyBoard();
        score = 0;
        level = 1;
        dropInterval = 1000;
        isPaused = false;
        currentObjectIndex = 0;
        currentFeatureIndex = 0;
        wrongPiece = null;
        errorPieceQueue = [];
        pieceTypeSequence = [];
        completedTriplets = new Set(); // 重置已完成三元组集合
        
        // 更新当前主题的三元组总数
        totalTriplets = Object.keys(themeData[currentTheme].wuYuanTriplets).length;
        
        // 在底部放置三块特殊方块（长方形）
        const bottomRow = ROWS - 1;
        
        // 最左侧：1X3长方形方块 - "对象"
        const objType = 2; // 蓝色方块
        for (let x = 0; x <= 2; x++) {
            board[bottomRow][x] = objType;
        }
        
        // 中间：1X3长方形方块 - "特征"
        const featureType = 3; // 绿色方块
        for (let x = 3; x <= 5; x++) {
            board[bottomRow][x] = featureType;
        }
        
        // 最右侧：1X4长方形方块 - "量值"
        const valueType = 4; // 紫色方块
        for (let x = 6; x <= 9; x++) {
            board[bottomRow][x] = valueType;
        }
        
        // 生成新方块
        currentPiece = createPiece();
        nextPiece = createPiece();
        
        // 更新显示
        updateGameInfo();
        drawNextPiece();
        
        // 隐藏游戏结束界面和确认对话框
        gameOverElement.style.display = 'none';
        confirmDialog.style.display = 'none';
        
        // 确保位置错误对话框存在
        if (!positionDialog) {
            positionDialog = document.getElementById('positionDialog');
            if (positionDialog) {
                positionDialog.style.display = 'none';
            }
        }
        
        // 确保记住按钮事件监听存在
        if (rememberButton) {
            // 先移除可能存在的旧监听
            const newRememberButton = rememberButton.cloneNode(true);
            rememberButton.parentNode.replaceChild(newRememberButton, rememberButton);
            rememberButton = newRememberButton;
            rememberButton.addEventListener('click', hidePositionErrorDialog);
        }
        
        // 更新按钮状态
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        // 启动游戏循环
        if (gameId) {
            cancelAnimationFrame(gameId);
        }
        lastTime = 0;
        dropCounter = 0;
        gameLoop();
    }
    
    // 显示位置错误提示对话框
    function showPositionErrorDialog(text, pieceType) {
        console.log('显示位置错误提示:', text, pieceType);
        
        // 保存当前方块信息到错误队列，用于后续重新生成
        if (currentPiece.text) {
            // 将错误方块添加到队列开头，确保它会在后续周期中最先重新生成
            errorPieceQueue.unshift({...currentPiece});
        }
        
        // 暂停游戏
        if (!isPaused) {
            togglePause();
        }
        
        // 显示明确的提示信息，告知正确放置位置
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            if (pieceType === 'object') {
                errorMessage.textContent = `"${text}" 应放置在"对象"列！`;
            } else if (pieceType === 'feature') {
                errorMessage.textContent = `"${text}" 应放置在"特征"列！`;
            } else if (pieceType === 'value') {
                errorMessage.textContent = `"${text}" 应放置在"量值"列！`;
            }
        }
        
        // 确保对话框元素存在并设置更强的显示样式
        if (positionDialog) {
            // 显示对话框，并设置更强的样式确保可见
            positionDialog.style.display = 'flex';
            positionDialog.style.position = 'fixed';
            positionDialog.style.top = '0';
            positionDialog.style.left = '0';
            positionDialog.style.width = '100%';
            positionDialog.style.height = '100%';
            positionDialog.style.justifyContent = 'center';
            positionDialog.style.alignItems = 'center';
            positionDialog.style.zIndex = '9999';
            positionDialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            console.log('对话框已设置为显示状态');
        } else {
            console.error('positionDialog元素未找到');
        }
    }
    
    // 显示物元三元组错误提示对话框
    function showWuYuanErrorDialog(wrongValue, objectText, featureText, correctValue) {
        // 保存当前方块信息到错误队列，用于后续重新生成
        if (currentPiece.text) {
            // 将错误方块添加到队列开头，确保它会在后续周期中最先重新生成
            errorPieceQueue.unshift({...currentPiece});
        }
        
        // 暂停游戏
        if (!isPaused) {
            togglePause();
        }
        
        // 显示明确的提示信息，告知正确的三元组
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `该方块正确的三元组应为（${objectText}，${featureText}，${correctValue}），而不是（${objectText}，${featureText}，${wrongValue}）！`;
        }
        
        // 显示对话框
        positionDialog.style.display = 'flex';
        positionDialog.style.zIndex = '9999';
    }
    
    // 隐藏位置错误提示对话框并恢复游戏
    function hidePositionErrorDialog() {
        positionDialog.style.display = 'none';
        
        // 清除当前错误方块，使其从界面移除
        wrongPiece = null;
        
        // 生成一个新的方块继续游戏
        // 注意：错误方块会在后续的下落周期中通过createPiece函数重新生成
        currentPiece = createPiece();
        
        // 恢复游戏
        if (isPaused && score > 0) {
            togglePause();
        }
    }
    
    // 显示确认对话框
    function showConfirmDialog() {
        console.log('showConfirmDialog called');
        
        // 无论游戏状态如何，都显示确认对话框
        // 暂停游戏
        if (!isPaused) {
            togglePause();
        }
        
        // 强制显示确认对话框
        confirmDialog.style.display = 'flex';
        
        // 确保对话框在最上层
        confirmDialog.style.zIndex = '9999';
    }
    
    // 确认重新开始游戏
    function confirmRestart() {
        console.log('confirmRestart called');
        confirmDialog.style.display = 'none';
        startGame();
    }
    
    // 取消重新开始游戏
    function cancelRestart() {
        console.log('cancelRestart called');
        confirmDialog.style.display = 'none';
        // 恢复游戏
        if (score > 0) {
            togglePause();
        }
    }
    
    // 暂停/继续游戏
    function togglePause() {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '继续游戏' : '暂停游戏';
        
        // 切换按钮颜色样式
        if (isPaused) {
            pauseButton.classList.add('paused');
        } else {
            pauseButton.classList.remove('paused');
        }
    }
    
    // 游戏结束
    function gameOver() {
        cancelAnimationFrame(gameId);
        
        // 播放游戏结束音效
        Sounds.gameOver();
        
        // 显示游戏结束界面
        finalScoreElement.textContent = score;
        finalLinesElement.textContent = 0; // 始终显示0，因为我们移除了行数统计
        gameOverElement.style.display = 'block';
        
        // 更新按钮状态
        startButton.disabled = false;
        pauseButton.disabled = true;
    }
    
    // 键盘事件处理
    function handleKeyDown(event) {
        if (isPaused && event.key !== 'Escape') return;
        
        switch (event.key) {
            case 'ArrowLeft':
                movePiece(-1);
                break;
            case 'ArrowRight':
                movePiece(1);
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                if (rotate(currentPiece)) {
                    Sounds.rotate();
                }
                break;
            case ' ':
                hardDrop();
                break;
            case 'Escape':
                if (!isPaused && score > 0) {
                    togglePause();
                }
                break;
        }
    }
    
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);
    
    // 按钮事件监听
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', showConfirmDialog);
    restartButton2.addEventListener('click', startGame);
    confirmYes.addEventListener('click', confirmRestart);
    confirmNo.addEventListener('click', cancelRestart);
    rememberButton.addEventListener('click', hidePositionErrorDialog);
    
    // 控制按钮事件监听
    leftButton.addEventListener('click', function() {
        if (!isPaused) movePiece(-1);
    });
    
    rightButton.addEventListener('click', function() {
        if (!isPaused) movePiece(1);
    });
    
    downButton.addEventListener('click', function() {
        if (!isPaused) moveDown();
    });
    
    hardDropButton.addEventListener('click', function() {
        if (!isPaused) hardDrop();
    });
    
    // 初始化下一个方块显示
    drawNextPiece();
});