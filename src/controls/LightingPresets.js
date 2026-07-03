export const lightingPresets = {
  daylight: {
    name: '日光',
    ambient: { color: '#eef3fb', intensity: 0.35 },
    hemisphere: { sky: '#c8daee', ground: '#2a2520', intensity: 0.4 },
    keyLight: {
      color: '#fff8ee',
      intensity: 1.3,
      position: [3.5, 4.5, 2.5],
    },
    fillLight: {
      color: '#d8e6f5',
      intensity: 0.35,
      position: [-2.5, 2, -1.5],
    },
    rimLight: {
      color: '#ffffff',
      intensity: 0.6,
      position: [0, 3, -3.5],
      angle: 0.55,
      penumbra: 0.5,
    },
  },
  warm: {
    name: '暖光',
    ambient: { color: '#fff0dd', intensity: 0.4 },
    hemisphere: { sky: '#f0d8b8', ground: '#3a2818', intensity: 0.35 },
    keyLight: {
      color: '#ffe4b8',
      intensity: 1.4,
      position: [3, 4, 2],
    },
    fillLight: {
      color: '#ffd8a0',
      intensity: 0.3,
      position: [-2, 1.5, -1],
    },
    rimLight: {
      color: '#ffd088',
      intensity: 0.5,
      position: [-1, 2.5, -3],
      angle: 0.6,
      penumbra: 0.6,
    },
  },
  cool: {
    name: '冷光',
    ambient: { color: '#dde8f5', intensity: 0.35 },
    hemisphere: { sky: '#a8c4e8', ground: '#1a2028', intensity: 0.4 },
    keyLight: {
      color: '#e0ecff',
      intensity: 1.3,
      position: [3, 4, 2.5],
    },
    fillLight: {
      color: '#a8c4e8',
      intensity: 0.4,
      position: [-2.5, 2, -1.5],
    },
    rimLight: {
      color: '#c0d8ff',
      intensity: 0.6,
      position: [1, 3, -3.5],
      angle: 0.5,
      penumbra: 0.5,
    },
  },
  sunset: {
    name: '黄昏',
    ambient: { color: '#ffc898', intensity: 0.3 },
    hemisphere: { sky: '#ff9050', ground: '#2a1810', intensity: 0.35 },
    keyLight: {
      color: '#ff8844',
      intensity: 1.5,
      position: [4, 1.5, 1],
    },
    fillLight: {
      color: '#ff6633',
      intensity: 0.4,
      position: [-3, 1, -2],
    },
    rimLight: {
      color: '#ffaa66',
      intensity: 0.7,
      position: [0, 1.5, -4],
      angle: 0.7,
      penumbra: 0.7,
    },
  },
}

export const presetNames = Object.keys(lightingPresets)
export const presetLabels = Object.fromEntries(
  Object.entries(lightingPresets).map(([key, val]) => [key, val.name])
)
