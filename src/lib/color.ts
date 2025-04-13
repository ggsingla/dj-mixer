export const getAverageColor = (
  imageUrl: string,
  isDarkMode: boolean
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      let r = 0
      let g = 0
      let b = 0

      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }

      const pixelCount = data.length / 4
      r = Math.round(r / pixelCount)
      g = Math.round(g / pixelCount)
      b = Math.round(b / pixelCount)

      // Convert RGB to HSL
      r /= 255
      g /= 255
      b /= 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      let s = 0
      let l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }

        h /= 6
      }

      h = Math.round(h * 360)
      s = Math.round(s * 100)

      // Adjust lightness based on theme mode
      if (isDarkMode) {
        // For dark mode, keep lightness between 60% and 80%
        l = Math.max(0.7, Math.min(0.95, l))
      } else {
        // For light mode, keep lightness between 20% and 40%
        l = Math.max(0.4, Math.min(0.5, l))
      }

      l = Math.round(l * 100)

      resolve(`${h} ${s}% ${l}%`)
    }

    img.onerror = reject
  })
}
