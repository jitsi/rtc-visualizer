import { jest } from '@jest/globals'

export const mockFind = jest.fn()

const mockMongoose = {
  Schema: jest.fn(),
  models: {},
  model: jest.fn().mockReturnValue({
    find: mockFind
  }),
  connect: jest.fn().mockResolvedValue(),
  connection: {
    db: {}
  }
}

export default mockMongoose
