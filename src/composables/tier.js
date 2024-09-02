/* eslint-disable no-const-assign */
const $ = (el) => document.querySelector(el)
const $$ = (el) => document.querySelectorAll(el)

const imageInput = $('#image-input')
const itemsSection = $('#selector-items')
const resetButton = $('#reset-tier-button')
const saveButton = $('#save-tier-button')

function createItem(src) {
  const imgElement = document.createElement('img')
  imgElement.draggable = true
  imgElement.src = src
  imgElement.className = 'item-image'

  imgElement.addEventListener('dragstart', hadleDragStart)
  imgElement.addEventListener('dragend', hadleDragEnd)

  itemsSection.appendChild(imgElement)
  return imgElement
}

function useFilesToCreateItems(files) {
  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader()

      reader.onload = (eventReader) => {
        const src = eventReader.target.result
        // Verificar si la imagen ya existe en el contenedor antes de crearla
        if (!Array.from(itemsSection.children).some((img) => img.src === src)) {
          createItem(src)
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

imageInput.addEventListener('change', (event) => {
  const { files } = event.target
  useFilesToCreateItems(files)
})

let draggedElement = null
let sourceContainer = null

const rows = $$('.tier .row')

rows.forEach((row) => {
  row.addEventListener('dragover', handleDragOver)
  row.addEventListener('drop', handleDrop)
  row.addEventListener('dragleave', handleDragLeave)
})

itemsSection.addEventListener('dragover', handleDragOver)
itemsSection.addEventListener('drop', handleDrop)
itemsSection.addEventListener('dragleave', handleDragLeave)

itemsSection.addEventListener('drop', handleDropFromDesktop)
itemsSection.addEventListener('dragover', handleDragOverFromDesktop)

function handleDropFromDesktop(event) {
  event.preventDefault()
  const { currentTarget, dataTransfer } = event

  if (dataTransfer.types.includes('Files')) {
    currentTarget.classList.remove('drag-over')
    const { files } = dataTransfer
    useFilesToCreateItems(files)
  }
}
function handleDragOverFromDesktop(event) {
  event.preventDefault()

  const { currentTarget, dataTransfer } = event

  if (dataTransfer.types.includes('Files')) {
    if (sourceContainer === currentTarget) return
    currentTarget.classList.add('drag-over')
  }
}

function handleDrop(event) {
  event.preventDefault()

  const { currentTarget } = event

  if (draggedElement && sourceContainer) {
    sourceContainer.removeChild(draggedElement)
    currentTarget.appendChild(draggedElement)
  }

  currentTarget.classList.remove('drag-over')
  currentTarget.querySelector('.drag-preview')?.remove()

  sourceContainer = null
}

function handleDragOver(event) {
  event.preventDefault()
  const { currentTarget } = event

  if (sourceContainer === currentTarget) return

  currentTarget.classList.add('drag-over')

  const dragPreview = $('.drag-preview')

  if (draggedElement && !dragPreview) {
    const previewElement = draggedElement.cloneNode(true)
    previewElement.classList.add('drag-preview')
    currentTarget.appendChild(previewElement)
  }
}

function handleDragLeave(event) {
  event.preventDefault()
  const { currentTarget } = event
  currentTarget.classList.remove('drag-over')
  currentTarget.querySelector('.drag-preview')?.remove()
}

function hadleDragStart(event) {
  draggedElement = event.target
  sourceContainer = draggedElement.parentNode
  event.dataTransfer.setData('text/plain', draggedElement.src)
}

function hadleDragEnd() {
  draggedElement = null
  sourceContainer = null
}

resetButton.addEventListener('click', () => {
  const items = $$('.tier .item-image')
  items.forEach((item) => {
    item.remove()
    itemsSection.appendChild(item)
  })
})

saveButton.addEventListener('click', () => {
  const tierContainer = $('.tier')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm').then(
    ({ default: html2canvas }) => {
      html2canvas(tierContainer).then((canvas) => {
        ctx.drawImage(canvas, 0, 0)
        const imgURL = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = 'tier.png'
        downloadLink.href = imgURL
        downloadLink.click()
      })
    }
  )
})
