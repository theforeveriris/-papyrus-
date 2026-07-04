import { useState, useEffect } from 'react'
import { useControls, button, folder } from 'leva'
import { paperStateStore } from './paperStateStore.js'

export function usePaperLayerControls() {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [layerCount, setLayerCount] = useState(0)

  useEffect(() => {
    return paperStateStore.subscribe(({ papers, selectedIndex: si }) => {
      setSelectedIndex(si)
      setLayerCount(papers.length)
    })
  }, [])

  const hasSelection = selectedIndex >= 0
  const label = hasSelection ? `第 ${selectedIndex + 1} 张` : '未选中'

  useControls('纸张图层', () => ({
    info: { value: label, label: '当前选中', editable: false },
    hint: {
      value: hasSelection ? '可调整图层顺序，重叠时决定谁在上' : '先在场景中点击选中一张纸',
      label: '提示',
      editable: false,
    },
    actions: folder({
      moveUp: button(
        () => {
          if (hasSelection) paperStateStore.moveLayer(selectedIndex, 1)
        },
        { label: '↑ 上移一层' }
      ),
      moveDown: button(
        () => {
          if (hasSelection) paperStateStore.moveLayer(selectedIndex, -1)
        },
        { label: '↓ 下移一层' }
      ),
      bringFront: button(
        () => {
          if (hasSelection) paperStateStore.bringToFront(selectedIndex)
        },
        { label: '置顶' }
      ),
      sendBack: button(
        () => {
          if (hasSelection) paperStateStore.sendToBack(selectedIndex)
        },
        { label: '置底' }
      ),
    }),
    resetBtn: button(() => {
      paperStateStore.resetAll(layerCount || 3, 0.004)
    }, { label: '重置全部顺序' }),
  }))
}
