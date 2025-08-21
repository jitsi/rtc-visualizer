import { jest } from '@jest/globals'

export const mockExec = jest.fn()
export const mockQuery = jest.fn()
export const mockEq = jest.fn()
export const mockUsing = jest.fn()
export const mockWhere = jest.fn()
export const mockFilter = jest.fn()
export const mockBetween = jest.fn()

const queryBuilder = {
  eq: mockEq.mockReturnThis(),
  using: mockUsing.mockReturnThis(),
  where: mockWhere.mockReturnThis(),
  filter: mockFilter.mockReturnThis(),
  between: mockBetween.mockReturnThis(),
  exec: mockExec
}

const mockDynamoose = {
  model: jest.fn().mockReturnValue({
    query: mockQuery.mockReturnValue(queryBuilder)
  }),
  Condition: jest.fn().mockImplementation(() => queryBuilder),
  aws: {
    ddb: { local: jest.fn() }
  }
}

export default mockDynamoose
