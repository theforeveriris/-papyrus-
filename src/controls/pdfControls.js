import { useEffect } from 'react'
import { useControls, button } from 'leva'
import { pdfStore } from './pdfStore.js'

let fileInput = null

function ensureFileInput() {
  if (fileInput) return fileInput
  fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'application/pdf'
  fileInput.style.display = 'none'
  document.body.appendChild(fileInput)
  return fileInput
}

async function handlePdfLoad(onLoaded) {
  const input = ensureFileInput()
  input.value = ''
  return new Promise((resolve) => {
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve()
      onLoaded(file)
      resolve()
    }
    input.click()
  })
}

export function usePdfControls(loadPdf) {
  const [, set] = useControls('PDF文档', () => ({
    uploadBtn: button(() => handlePdfLoad(loadPdf)),
    pdfFile: '未加载',
    clearBtn: button(() => {
      pdfStore.clear()
      set({ pdfFile: '未加载' })
    }),
  }))

  useEffect(() => {
    return pdfStore.subscribe(({ fileName }) => {
      set({ pdfFile: fileName || '未加载' })
    })
  }, [set])
}
