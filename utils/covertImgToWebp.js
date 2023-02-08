const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')

module.exports = async (file) => {
  const outputPath = path.resolve(process.cwd(), 'public/output_files')
  try {
    const outFileName = file.originalname.slice(0, file.originalname.lastIndexOf('.')) + '_out'
    const buffer = await fs.promises.readFile(path.resolve(file.path))
    const outPath = path.join(outputPath, `${outFileName}.webp`)
    await sharp(buffer, {animated: true}).webp().toFile(outPath)
    return {path: outPath, name: `${outFileName}.webp`, originalPath: path.resolve(file.path)}
  } catch (error) {
    throw error
  }
}