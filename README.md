# 五子棋游戏 - CNB部署版

一个使用 HTML5 Canvas 实现的五子棋游戏，部署在 CNB.cool 平台，支持在线对战。

## 🎮 游戏特性

- ✨ **精美界面**: 现代化设计，渐变色背景
- 🎯 **标准规则**: 15×15棋盘，五子连珠获胜
- 🔄 **悔棋功能**: 支持撤销上一步操作
- 📊 **游戏统计**: 实时显示步数和游戏时间
- 📝 **历史记录**: 显示每一步的详细信息
- 🔊 **音效系统**: 落子、获胜、悔棋音效（可开关）
- 📱 **响应式**: 适配桌面和移动设备

## 🚀 在线访问

### CNB.cool 部署地址
- 组织仓库: `https://863ailab.cnb.cool/gomoku-cnb`
- 个人仓库: `https://heidao.cnb.cool/gomoku-cnb`

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **绘图**: HTML5 Canvas API
- **音效**: Web Audio API
- **部署**: GitHub Pages (CNB.cool)

## 📁 项目结构

```
gomoku-cnb/
├── index.html          # 游戏主页面
├── assets/             # 静态资源
│   ├── css/           # 样式文件
│   │   └── style.css  # 主样式表
│   ├── js/            # JavaScript文件
│   │   └── game.js    # 游戏逻辑
│   └── images/        # 图片资源
├── README.md          # 项目说明
├── CLAUDE.md          # Claude配置
└── .gitignore         # Git忽略文件
```

## 🎯 游戏规则

1. 黑子先手，双方轮流落子
2. 首先在横、竖、斜任意方向形成连续五子的一方获胜
3. 棋盘填满无人获胜则为平局

## 🔧 本地开发

```bash
# 克隆仓库
git clone https://cnb.cool/863ailab/gomoku-cnb.git

# 进入目录
cd gomoku-cnb

# 使用Python启动本地服务器
python3 -m http.server 8000

# 访问 http://localhost:8000
```

## 📱 移动端支持

游戏已针对移动设备优化：
- 触摸落子支持
- 响应式布局
- 自适应画布大小

## 🌟 特色功能

### 最后一手标记
红点标记最新落子位置，便于追踪游戏进程。

### 实时统计
- 显示当前玩家
- 记录已下步数
- 显示游戏时长

### 历史记录
详细记录每一步的：
- 步数编号
- 落子方（黑/白）
- 坐标位置

## 🔮 未来计划

- [ ] AI对战模式
- [ ] 在线多人对战
- [ ] 棋谱保存与分享
- [ ] 多种主题皮肤
- [ ] 语音聊天功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

🎮 享受游戏时光！