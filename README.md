# Papyrus

基于 Three.js 的 Web 端纸质文件桌面物理仿真。追求摄影级质感的可交互数字桌面体验——不是"贴图+灯光"的粗糙展示，而是有物理属性的纸。

## 特性

- **真实纸张几何** — ExtrudeGeometry 带厚度与边缘倒角，非塑料板
- **物理材质** — MeshPhysicalMaterial，纤维丝绒反光（sheen）+ 逆光微透光（transmission）
- **程序化纸纹** — Canvas 2D 动态生成纤维噪点，无重复感
- **多层堆叠** — 2~5 张纸错落叠放，每张独立随机偏移
- **PDF 上传** — 选择 PDF 文件，解析首页渲染到纸张表面（pdf.js）
- **摄影级布光** — 五光源系统（环境光 + 半球光 + 主光 + 补光 + 轮廓光）+ 环境贴图反射
- **可调灯光** — 4 种预设（日光/暖光/冷光/黄昏）+ 每个光源强度独立调节
- **9 种桌面材质** — 橡木/胡桃木/樱桃木/红木/大理石/皮革/混凝土/拉丝金属/深色哑光，每种带专属 normalMap + roughnessMap
- **实时阴影** — 原生 PCFSoftShadowMap，纸张移动时阴影跟随更新
- **后处理** — SSAO 环境光遮蔽 + 微弱 Bloom 泛光
- **桌面交互** — 左键拖拽纸张平移、右键旋转、空白处拖拽轨道相机
- **风力微动** — 纸张轻微呼吸感动画
- **参数面板** — Leva 实时调节纸张/灯光/后处理/动画/场景参数

## 技术栈

| 领域 | 技术 |
|------|------|
| 渲染引擎 | Three.js r170 |
| React 封装 | @react-three/fiber 8 |
| 工具组件 | @react-three/drei 9 |
| 后处理 | @react-three/postprocessing 2 |
| 参数面板 | Leva 0.9 |
| PDF 解析 | pdfjs-dist 3.11 |
| 构建工具 | Vite 5 |
| 前端框架 | React 18 |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认运行在 `http://localhost:5173/`。

## 项目结构

```
src/
├── App.jsx                    # 应用入口，Canvas + PDF 状态
├── App.css                    # 全局样式
├── paper/
│   ├── Paper.jsx              # 纸张组件（ExtrudeGeometry + 物理材质）
│   ├── PaperStack.jsx         # 多层纸张堆叠
│   ├── usePaperTexture.js     # 程序化纸纹生成（Canvas 2D）
│   └── usePdfTexture.js       # PDF 解析为纹理（pdf.js）
├── scene/
│   ├── Scene.jsx              # 3D 场景组装
│   ├── Lighting.jsx           # 五光源系统 + 环境贴图
│   ├── Desk.jsx               # 桌面 + 边框 + 笔
│   ├── useDeskTexture.js      # 9种程序化桌面纹理 + normalMap + roughnessMap
│   └── PostProcessing.jsx     # SSAO + Bloom 后处理
├── interaction/
│   └── usePaperInteraction.js # 拖拽平移/旋转 + 风力微动
├── controls/
│   ├── useControls.js         # Leva 参数面板（纸张/灯光/后处理/动画/场景）
│   ├── LightingPresets.js     # 灯光预设数据
│   ├── pdfStore.js            # PDF 状态共享 store
│   └── pdfControls.js         # Leva PDF 上传控件
└── utils/
    └── math.js                # 种子随机数等工具函数
```

## 操作指南

| 操作 | 效果 |
|------|------|
| 左键拖拽纸张 | 在桌面平面平移纸张 |
| 右键拖拽纸张 | 绕桌面法线（Y轴）旋转纸张 |
| 拖拽空白处 | 轨道控制相机，自由观察桌面 |
| 滚轮 | 缩放相机距离 |
| Leva 面板 | 实时调节所有参数 |
| 上传 PDF | 选择文件，首页渲染到纸张表面 |

## 许可证

本项目采用 [Apache License 2.0](LICENSE)。

## 致谢

- [Three.js](https://threejs.org/) — WebGL 渲染引擎
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — Three.js 的 React 封装
- [drei](https://github.com/pmndrs/drei) — R3F 工具组件库
- [pdf.js](https://mozilla.github.io/pdf.js/) — Mozilla PDF 渲染库
- [Leva](https://github.com/pmndrs/leva) — GUI 参数面板
- [AmbientCG](https://ambientcg.com/) — PBR 纹理参考（CC0）
- [Three.js WoodNodeMaterial](https://threejs.org/docs/pages/WoodNodeMaterial.html) — 程序化木纹算法参考
