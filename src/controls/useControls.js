import { useControls, folder } from 'leva'
import { presetLabels } from './LightingPresets.js'

export function usePaperControls() {
  return useControls('纸张', {
    geometryFolder: folder({
      width: { value: 1.0, min: 0.3, max: 2.0, step: 0.01, label: '宽度' },
      height: { value: 1.414, min: 0.3, max: 3.0, step: 0.01, label: '高度' },
      depth: { value: 0.004, min: 0.001, max: 0.02, step: 0.0005, label: '厚度' },
    }),
    materialFolder: folder({
      color: { value: '#f8f7f4', label: '颜色' },
      roughness: { value: 0.75, min: 0, max: 1, step: 0.01, label: '粗糙度' },
      metalness: { value: 0.0, min: 0, max: 1, step: 0.01, label: '金属度' },
      sheen: { value: 0.15, min: 0, max: 1, step: 0.01, label: '丝绒感' },
      sheenRoughness: { value: 0.6, min: 0, max: 1, step: 0.01, label: '丝绒粗糙' },
      transmission: { value: 0.08, min: 0, max: 1, step: 0.01, label: '透光率' },
      bumpScale: { value: 0.002, min: 0, max: 0.01, step: 0.0005, label: '凹凸强度' },
    }),
  })
}

export function useLightingControls() {
  return useControls('灯光系统', {
    preset: {
      value: 'daylight',
      label: '灯光预设',
      options: presetLabels,
    },
    shadows: { value: true, label: '阴影' },
    envIntensity: { value: 0.4, min: 0, max: 2, step: 0.05, label: '环境贴图强度' },
    keyIntensity: { value: 1.3, min: 0, max: 3, step: 0.05, label: '主光强度' },
    fillIntensity: { value: 0.35, min: 0, max: 2, step: 0.05, label: '补光强度' },
    rimIntensity: { value: 0.6, min: 0, max: 2, step: 0.05, label: '轮廓光强度' },
    ambientIntensity: { value: 0.35, min: 0, max: 1.5, step: 0.05, label: '环境光强度' },
    hemiIntensity: { value: 0.4, min: 0, max: 1.5, step: 0.05, label: '半球光强度' },
  })
}

export function usePostProcessingControls() {
  return useControls('后处理', {
    ssaoFolder: folder({
      ssaoEnabled: { value: true, label: 'SSAO 开启' },
      ssaoIntensity: { value: 1.2, min: 0, max: 3, step: 0.1, label: '强度' },
      ssaoRadius: { value: 0.15, min: 0.01, max: 0.5, step: 0.01, label: '半径' },
      ssaoSamples: { value: 21, min: 5, max: 51, step: 2, label: '采样数' },
    }),
    bloomFolder: folder({
      bloomEnabled: { value: true, label: 'Bloom 开启' },
      bloomIntensity: { value: 0.3, min: 0, max: 2, step: 0.05, label: '强度' },
      bloomThreshold: { value: 0.8, min: 0, max: 1, step: 0.01, label: '阈值' },
      bloomSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01, label: '平滑度' },
    }),
  })
}

export function useAnimationControls() {
  return useControls('动画', {
    windEnabled: { value: true, label: '风力微动' },
    windIntensity: { value: 0.008, min: 0, max: 0.05, step: 0.001, label: '风力强度' },
    windSpeed: { value: 0.4, min: 0, max: 2, step: 0.05, label: '风速' },
  })
}

export function useSceneControls() {
  return useControls('场景', {
    paperCount: { value: 3, min: 1, max: 5, step: 1, label: '纸张数量' },
    deskColor: { value: '#3a2820', label: '桌面颜色' },
    deskType: {
      value: 'oak',
      label: '桌面材质',
      options: {
        oak: '橡木',
        walnut: '胡桃木',
        cherry: '樱桃木',
        mahogany: '红木',
        marble: '大理石',
        leather: '皮革',
        concrete: '混凝土',
        metal: '拉丝金属',
        dark: '深色哑光',
      },
    },
  })
}
