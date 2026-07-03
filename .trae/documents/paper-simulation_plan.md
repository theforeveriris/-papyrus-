# Three.js 纸质文件桌面仿真 — 实现计划

## 一、项目研究结论

### 1.1 项目定位
- **核心目标**：在Web端实现高真实感的纸质文件物理仿真，追求"有物理属性的纸"而非"贴图+灯光"的粗糙展示
- **技术对标**：摄影级质感，可交互的动态数字桌面
- **差异化壁垒**：执行深度——程序化纹理 + 物理材质 + 三灯布光 + 后处理管线 + 多层堆叠 + 实时参数调节
- **约束条件**：纯前端项目，无后端服务

### 1.2 技术选型确认
| 技术领域 | 选型方案 | 选型理由 |
|---------|---------|---------|
| UI框架 | React 18 | 用户明确选择，组件化开发，生态成熟 |
| 3D引擎 | @react-three/fiber | Three.js的React声明式封装，组件化思想 |
| 3D工具库 | @react-three/drei | 提供OrbitControls、ContactShadows等常用组件 |
| 后处理 | @react-three/postprocessing | EffectComposer的React封装，SSAO/Bloom开箱即用 |
| 参数面板 | Leva | React生态最流行的实时参数调节面板，调试体验好 |
| 构建工具 | Vite | 轻量快速，HMR热更新，适合React项目 |
| 几何方案 | ExtrudeGeometry + 倒角 | 替代PlaneGeometry实现真实厚度 |
| 材质方案 | MeshPhysicalMaterial | 支持sheen/transmission/thickness等纸张特有光学属性 |
| 纹理方案 | Canvas 2D 程序化生成 | 避免重复贴图，纤维噪点+细腻渐变动态生成 |

### 1.3 视觉风格：洁净新纸张
- 基调：白皙干净、细腻纹理，现代简约风
- 颜色：偏冷白 `#f8f7f4`，轻微蓝灰调
- 纹理：细腻纤维、低对比度、无明显泛黄
- 桌面：深灰/黑色哑光桌面，高对比度突出纸张

### 1.4 现有工作区状态
- 工作目录 `/workspace` 为空，从零开始搭建
- 无现有代码、依赖、配置文件

---

## 二、文件与模块结构设计

```
/workspace
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                    # React入口
│   ├── App.jsx                     # 根组件，整合场景+UI
│   ├── styles/
│   │   └── index.css               # 全局样式
│   ├── scene/
│   │   ├── Scene.jsx               # 3D场景根组件（Canvas内）
│   │   ├── Lighting.jsx            # 布光系统（多预设切换）
│   │   ├── Desk.jsx                # 桌面环境（桌面平面+小物件）
│   │   └── PostProcessing.jsx      # 后处理管线
│   ├── paper/
│   │   ├── PaperStack.jsx          # 多层纸张堆叠容器
│   │   ├── Paper.jsx               # 单张纸组件
│   │   ├── usePaperGeometry.js     # 纸张几何体Hook（Extrude+倒角）
│   │   ├── usePaperMaterial.js     # 纸张材质Hook（PhysicalMaterial）
│   │   └── usePaperTexture.js      # 程序化纹理Hook（Canvas生成）
│   ├── interaction/
│   │   ├── DragRotate.js           # 拖拽旋转+惯性逻辑
│   │   └── WindAnimation.js        # 风力微动画
│   ├── controls/
│   │   ├── LightingPresets.js      # 光源预设数据（日光/暖光/冷光/黄昏）
│   │   └── useControls.js          # Leva参数面板配置
│   └── utils/
│       └── math.js                 # 数学工具
└── public/
```

---

## 三、分步实现计划

### 阶段一：项目脚手架搭建
**目标**：建立可运行的React+R3F基础项目

1. **初始化项目配置**
   - 创建 `package.json`，配置完整依赖
   - 依赖列表：`react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `leva`, `vite`, `@vitejs/plugin-react`
   - 创建 `vite.config.js`，配置React插件与开发服务器
   - 创建 `index.html` 与 `src/main.jsx` 入口
   - 配置基础CSS样式（全屏、深色背景、字体）

2. **搭建场景基础框架**
   - 实现 `App.jsx`：Leva面板 + Canvas容器
   - 实现 `Scene.jsx`：Canvas内场景框架（相机、渲染设置）
   - 配置基础渲染循环与自适应
   - 验证：React + R3F 基础场景可正常渲染，无报错

### 阶段二：纸张核心视觉（几何+纹理+材质）
**目标**：单张洁净新纸张，具备真实厚度与细腻质感

3. **纸张几何体**
   - 实现 `usePaperGeometry.js` Hook
   - 使用 `Shape` 定义A4纸张轮廓（比例 1:1.414）
   - `ExtrudeGeometry` 参数：`depth: 0.02`，`bevelEnabled: true`
   - 倒角参数精细调节：`bevelThickness`, `bevelSize`, `bevelSegments`
   - UV映射确保纹理正确贴合

4. **程序化纹理生成（洁净新纸风格）**
   - 实现 `usePaperTexture.js` Hook
   - Canvas 2D 动态生成：
     - 冷白底色 `#f8f7f4`（洁净新纸，偏冷调）
     - 30000+ 细腻纤维噪点（低密度、低对比度）
     - 细微纸张颗粒感（非泛黄，而是细腻肌理）
     - 极微弱的边缘阴影（纸张边缘自然暗化）
   - 同时输出为 `map`（颜色纹理）和 `bumpMap`（凹凸纹理）
   - 纹理尺寸自适应：桌面端 2048，移动端 1024

5. **物理材质配置**
   - 实现 `usePaperMaterial.js` Hook
   - `MeshPhysicalMaterial` 参数（洁净新纸调优）：
     - `color: 0xf8f7f4`（冷白）
     - `roughness: 0.75`（比旧纸略光滑）
     - `metalness: 0.0`
     - `sheen: 0.15`（轻微纤维反光，不过分）
     - `transmission: 0.08`（新纸透光略明显）
     - `thickness: 0.02`
     - `side: DoubleSide`
   - 接入程序化纹理的 map 和 bumpMap

6. **单张纸组件**
   - 实现 `Paper.jsx` 组件
   - 整合几何 + 材质 + 纹理
   - 支持 position/rotation 等props透传
   - 支持接收/投射阴影

### 阶段三：多层纸张堆叠
**目标**：2-3张纸错位堆叠，增强真实感

7. **纸张堆叠组件**
   - 实现 `PaperStack.jsx` 组件
   - 2-3张纸错落叠放，每张有微小的位置偏移和旋转差异
   - 每张纸Y轴高度递增（错开厚度）
   - 每层纸张纹理略有差异（程序化生成时种子不同）
   - 确保层间阴影正确投射

### 阶段四：摄影级布光系统（多预设）
**目标**：五光源布光 + 4种预设一键切换

8. **多光源系统**
   - 实现 `Lighting.jsx` 组件
   - 五光源组合（可通过Leva调节）：
     1. `AmbientLight` — 环境散射基底
     2. `HemisphereLight` — 天空/地面反射
     3. `DirectionalLight(Key)` — 主光源，投射阴影
     4. `DirectionalLight(Fill)` — 补光，消除死黑
     5. `SpotLight(Rim)` — 轮廓光，分离纸与桌面

9. **光源预设系统**
   - 实现 `LightingPresets.js` 预设数据
   - 4种布光预设（每种预设调整各光源颜色/强度/位置）：
     1. **日光** — 冷白主光，明亮通透
     2. **暖光** — 暖黄主光，温馨室内感
     3. **冷光** — 冷蓝调，科技/办公感
     4. **黄昏** — 橙红低角度，戏剧感
   - Leva面板提供下拉选择器切换预设

10. **阴影系统**
    - 启用 `shadowMap`，类型 `PCFSoftShadowMap`
    - 主光阴影相机参数精细调节
    - 桌面平面接收阴影
    - 考虑使用 drei 的 `ContactShadows` 增强接触阴影效果

### 阶段五：桌面环境细节
**目标**：真实桌面环境，增强场景沉浸感

11. **桌面实现**
    - 实现 `Desk.jsx` 组件
    - 深色哑光桌面平面（深灰/黑色，突出白纸张）
    - 程序化桌面纹理（细微颗粒/木纹，低调不抢戏）
    - 桌面接收阴影

12. **桌面点缀物件**
    - 在桌面添加1-2个简约小物件（可选，用于构图平衡）
    - 例如：一支笔、一个回形针、一枚硬币（低多边形，不喧宾夺主）
    - 物件投射/接收阴影

### 阶段六：后处理管线
**目标**：SSAO环境遮蔽 + 微弱Bloom泛光

13. **后处理管线搭建**
    - 实现 `PostProcessing.jsx` 组件
    - 使用 `@react-three/postprocessing` 的 `EffectComposer`
    - 效果管线：
      - `SSAOEffect`（环境光遮蔽，调节半径/强度/阈值）
      - `BloomEffect`（极微弱泛光，低强度低阈值）
    - 支持Leva实时调节后处理参数
    - 移动端自动降级（检测移动设备，降低SSAO采样率或禁用）

### 阶段七：动态交互系统
**目标**：鼠标拖拽旋转 + 惯性 + 风力微动

14. **拖拽旋转交互**
    - 实现拖拽旋转逻辑（基于R3F的useFrame + 事件系统）
    - 鼠标/触摸按下/移动/释放事件
    - 拖拽时更新纸张堆叠的旋转（yaw + pitch）
    - 俯仰角限制 `[-0.5, 0.5]` 弧度
    - 惯性缓动：记录拖拽速度，释放后 lerp 衰减

15. **风力微动动画**
    - 实现风力微动（useFrame动画）
    - sin/cos 时间函数叠加轻微旋转（三个不同频率）
    - 振幅极小，营造呼吸感
    - 每张纸微动略有差异（相位偏移），更自然
    - 与拖拽旋转叠加

### 阶段八：Leva参数控制面板
**目标**：全方位实时参数调节，便于调试与展示

16. **参数面板集成**
    - 实现 `useControls.js`，集中配置Leva面板
    - 分类折叠面板：
      - **材质参数**：roughness, sheen, transmission, metalness, color等
      - **灯光参数**：各光源强度/颜色/位置
      - **灯光预设**：下拉选择器
      - **后处理参数**：SSAO强度/半径、Bloom强度/阈值
      - **动画参数**：风力强度、惯性系数
      - **场景参数**：纸张数量、桌面颜色
    - 所有参数实时响应，无需刷新

### 阶段九：性能优化与打磨
**目标**：移动端适配 + 视觉微调 + 代码质量

17. **移动端适配**
    - 纹理尺寸自适应（设备像素比 + 屏幕尺寸）
    - 后处理降级：移动端降低SSAO采样率，或自动禁用
    - 触摸事件支持
    - 响应式布局：Leva面板在移动端可折叠/隐藏

18. **视觉打磨**
    - 微调材质参数（洁净新纸风格校准）
    - 微调4种灯光预设的参数
    - 微调SSAO和Bloom参数（确保微妙不夸张）
    - 微调纸张堆叠布局（错落感自然）
    - 整体色彩校正与色调统一

19. **代码质量**
    - 组件化清晰，职责单一
    - 自定义Hook封装可复用逻辑
    - 关键参数集中管理，便于调节
    - 清理无用代码与调试日志

---

## 四、潜在依赖与注意事项

### 4.1 依赖清单
| 依赖包 | 版本范围 | 用途 |
|-------|---------|------|
| `react` | ^18.0.0 | UI框架 |
| `react-dom` | ^18.0.0 | React DOM渲染 |
| `three` | ^0.160.0 | Three.js核心 |
| `@react-three/fiber` | ^8.15.0 | Three.js React封装 |
| `@react-three/drei` | ^9.90.0 | R3F工具组件库 |
| `@react-three/postprocessing` | ^2.15.0 | 后处理效果 |
| `leva` | ^0.9.0 | 参数调节面板 |
| `vite` | ^5.0.0 | 构建工具 |
| `@vitejs/plugin-react` | ^4.2.0 | Vite React插件 |

### 4.2 技术风险与应对
| 风险点 | 影响 | 应对策略 |
|-------|------|---------|
| SSAO性能开销大 | 移动端帧率下降 | 移动端自动检测并降级：降低采样率或禁用SSAO |
| 多层纸张draw call增加 | 性能下降 | 控制在2-3张，使用实例化或合并几何体（如需要） |
| 程序化纹理生成耗时 | 首屏加载延迟 | 纹理生成异步，期间显示占位材质；优化绘制逻辑 |
| ExtrudeGeometry倒角参数敏感 | 边缘效果不佳 | 多组参数预设，通过Leva实时调节找到最佳值 |
| MeshPhysicalMaterial的transmission兼容性 | 旧设备渲染异常 | 提供fallback开关，transmission设为0退化为Standard效果 |
| Leva面板在移动端遮挡内容 | 移动端体验差 | 移动端默认折叠，或提供隐藏/显示切换按钮 |

### 4.3 性能预算
- **纹理分辨率**：桌面端 2048x2048，移动端 1024x1024
- **目标帧率**：桌面端 60fps，移动端 30fps+
- **Draw Call**：控制在 15 以内（纸张×3 + 桌面 + 桌面小物 + 光源辅助）
- **后处理开销**：SSAO为主要开销，移动端降级为低质量或禁用

---

## 五、验证标准（交付验收）

- [ ] React + @react-three/fiber 技术栈正常运行
- [ ] 2-3张A4纸模型堆叠，具备真实厚度与边缘倒角
- [ ] 程序化纹理（洁净新纸风格），无重复感
- [ ] MeshPhysicalMaterial 物理材质（sheen/transmission/roughness）
- [ ] 五光源布光系统（主光/补光/轮廓光/环境光/半球光）
- [ ] 4种灯光预设一键切换（日光/暖光/冷光/黄昏）
- [ ] PCFSoftShadowMap 软阴影 + 接触阴影增强
- [ ] SSAO 环境光遮蔽（纸张与桌面、纸张层间缝隙变暗）
- [ ] 微弱 Bloom 高光泛光
- [ ] 鼠标/触摸拖拽旋转 + 惯性缓动动画
- [ ] 俯仰角限制，防止翻转过度
- [ ] 风力微动动画（轻微摇摆呼吸感，每层略有差异）
- [ ] Leva 参数面板（材质/灯光/后处理/动画实时调节）
- [ ] 深色桌面环境 + 桌面小物件点缀
- [ ] 移动端自适应（纹理降级 + 后处理降级 + 触摸支持）
- [ ] 窗口 resize 自适应
- [ ] 纯前端，无后端依赖
- [ ] 代码模块化，组件结构清晰

---

## 六、实施顺序总览

```
脚手架搭建 → 纸张几何 → 程序化纹理 → 物理材质 → 多层堆叠
    ↓
  布光系统 → 光源预设 → 桌面环境 → 阴影系统
    ↓
  后处理管线 → 拖拽交互 → 风力动画
    ↓
  Leva参数面板 → 性能优化 → 视觉打磨
```

每个阶段完成后均可独立验证，确保逐步推进、问题早发现。
