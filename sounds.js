// 音效管理对象
const Sounds = {
    // 初始化音效
    init() {
        // 创建音效上下文
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不受支持，游戏将没有音效');
            this.disabled = true;
            return;
        }
        
        this.disabled = false;
        
        // 创建不同音效的配置
        this.sounds = {
            move: {
                frequency: 440, // A4音
                duration: 0.05,
                volume: 0.3
            },
            rotate: {
                frequency: 587.33, // D5音
                duration: 0.1,
                volume: 0.4
            },
            drop: {
                frequency: 659.25, // E5音
                duration: 0.2,
                volume: 0.5
            },
            clear: {
                frequency: 783.99, // G5音
                duration: 0.3,
                volume: 0.6
            },
            gameOver: {
                frequency: 220, // A3音
                duration: 1.0,
                volume: 0.7
            },
            levelUp: {
                frequency: 880, // A5音
                duration: 0.5,
                volume: 0.5
            },
            crowdCheer: {
                // 人群喝彩音效：使用多个频率的叠加来模拟人群声音
                frequencies: [330, 392, 440, 523, 659], // E4, G4, A4, C5, E5
                duration: 1.5,
                volume: 0.7,
                delayBetweenNotes: 0.02
            }
        };
    },
    
    // 播放音效的通用方法
    playSound(type) {
        if (this.disabled || !this.sounds[type]) return;
        
        const config = this.sounds[type];
        
        // 对于简单音效（单个频率）
        if (config.frequency) {
            // 创建振荡器节点
            const oscillator = this.audioContext.createOscillator();
            
            // 创建音量节点
            const gainNode = this.audioContext.createGain();
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置音效参数
            oscillator.type = 'sine'; // 正弦波音色
            oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
            
            // 设置音量变化，使声音有淡出效果
            gainNode.gain.setValueAtTime(config.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + config.duration);
            
            // 开始和停止音效
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + config.duration);
        }
    },
    
    // 播放人群喝彩音效
    crowdCheer() {
        if (this.disabled || !this.sounds.crowdCheer) return;
        
        const config = this.sounds.crowdCheer;
        const currentTime = this.audioContext.currentTime;
        
        // 为每个频率创建一个振荡器，模拟人群中的不同声音
        config.frequencies.forEach((frequency, index) => {
            // 创建振荡器节点
            const oscillator = this.audioContext.createOscillator();
            
            // 创建音量节点
            const gainNode = this.audioContext.createGain();
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置音效参数
            oscillator.type = 'sine'; // 正弦波音色
            oscillator.frequency.setValueAtTime(frequency, currentTime + (index * config.delayBetweenNotes));
            
            // 随机调整音量，让声音听起来更自然
            const randomVolume = config.volume * (0.8 + Math.random() * 0.4);
            
            // 设置音量变化，使声音有淡出效果
            gainNode.gain.setValueAtTime(0, currentTime + (index * config.delayBetweenNotes));
            gainNode.gain.exponentialRampToValueAtTime(randomVolume, currentTime + 0.1 + (index * config.delayBetweenNotes));
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + config.duration);
            
            // 开始和停止音效
            oscillator.start(currentTime + (index * config.delayBetweenNotes));
            oscillator.stop(currentTime + config.duration);
        });
    },
    
    // 播放移动音效
    move() {
        this.playSound('move');
    },
    
    // 播放旋转音效
    rotate() {
        this.playSound('rotate');
    },
    
    // 播放下落音效
    drop() {
        this.playSound('drop');
    },
    
    // 播放消除行音效
    clear() {
        this.playSound('clear');
    },
    
    // 播放游戏结束音效
    gameOver() {
        this.playSound('gameOver');
    },
    
    // 播放升级音效
    levelUp() {
        this.playSound('levelUp');
    },
    
    // 启用/禁用音效
    toggle() {
        this.disabled = !this.disabled;
        return !this.disabled;
    }
};

// 页面加载完成后初始化音效
document.addEventListener('DOMContentLoaded', function() {
    // 由于浏览器自动播放政策，需要用户交互后才能初始化AudioContext
    function initAudio() {
        Sounds.init();
        document.removeEventListener('keydown', initAudio);
        document.removeEventListener('click', initAudio);
    }
    
    // 添加事件监听器，在用户第一次交互时初始化音效
    document.addEventListener('keydown', initAudio);
    document.addEventListener('click', initAudio);
});