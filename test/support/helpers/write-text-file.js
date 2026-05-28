import { mkdir, writeFile } from 'fs/promises'
import { dirname } from 'path'

/**
 * @param {string} filePath
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function writeTextToFile(filePath, content) {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}
