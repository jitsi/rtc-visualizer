export class DatabaseAdapter {
  async connect () {
    throw new Error('connect() must be implemented by a subclass.')
  }

  /**
   * @param {{ sessionId?: string, meetingUniqueId?: string, conferenceId?: string, minDate?: number, maxDate?: number }} params
   * @returns {Promise<Array<object>>}
   */
  async doQuery (params) {
    throw new Error('doQuery() must be implemented by a subclass.')
  }
}
