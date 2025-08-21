export class FileStorageAdapter {
  /**
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async fileExists (key) {
    throw new Error('fileExists() must be implemented by a subclass.')
  }

  /**
   * @param {string} key
   * @returns {import('stream').Readable}
   */
  getFileStream (key) {
    throw new Error('getFileStream() must be implemented by a subclass.')
  }
}
