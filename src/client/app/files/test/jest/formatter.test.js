import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { parseData } from '../../formatter'

// Peer connection ids, report ids and stat names from a dump are used as object keys. A name such
// as `__proto__`, `constructor` or `toString` resolves to a built-in. These tests check that a dump
// with such a name does not change the built-ins, and that the name does not reach the parsed data.
const builtins = [Object.prototype, Object, Object.prototype.toString]
let ownNamesBefore

const addedNames = () => builtins.flatMap(
  (builtin, i) => Object.getOwnPropertyNames(builtin).filter(name => !ownNamesBefore[i].includes(name)))

const header = '["connectionInfo",null,"{}",1]'
const parse = lines => parseData([header, ...lines].join('\n'))

beforeEach(() => {
  ownNamesBefore = builtins.map(builtin => Object.getOwnPropertyNames(builtin))
})

afterEach(() => {
  // Keep the tests independent: remove what a failed test added.
  builtins.forEach((builtin, i) => {
    Object.getOwnPropertyNames(builtin)
      .filter(name => !ownNamesBefore[i].includes(name))
      .forEach(name => delete builtin[name])
  })
})

describe('parseData', () => {
  it('parses delta compressed getstats entries', () => {
    const client = parse([
      '["getstats","PC_0",{"a":{"type":"x","bytes":1,"timestamp":0},"timestamp":5},5]',
      '["getstats","PC_0",{"a":{"bytes":2},"timestamp":9},9]'
    ])

    expect(Object.keys(client.peerConnections)).toEqual(['PC_0'])
    expect(client.peerConnections.PC_0).toHaveLength(2)
    expect(client.peerConnections.PC_0[1].value.a).toEqual({ type: 'x', bytes: 2, timestamp: 5 })
  })

  it('ignores a report id that is the name of a built-in property in a delta', () => {
    const client = parse([
      '["getstats","PC_0",{"a":{"type":"x","timestamp":0},"timestamp":1},1]',
      '["getstats","PC_0",{"__proto__":{"added":1},"constructor":{"added":1},"toString":{"added":1},"a":{},"timestamp":2},2]'
    ])

    expect(addedNames()).toEqual([])
    expect(Object.keys(client.peerConnections.PC_0[1].value)).toEqual(['a'])
  })

  it('ignores such a report id in the first getstats entry', () => {
    const client = parse([
      '["getstats","PC_0",{"__proto__":{"added":1},"constructor":{"added":1},"toString":{"added":1},"a":{"type":"x"},"timestamp":1},1]'
    ])

    expect(addedNames()).toEqual([])
    expect(Object.keys(client.peerConnections.PC_0[0].value)).toEqual(['a'])
  })

  it('ignores such a report id in a getStats entry that is not compressed', () => {
    const client = parse([
      '["getStats","PC_0",{"__proto__":{"added":1},"constructor":{"added":1},"toString":{"added":1},"a":{"type":"x"}},1]'
    ])

    expect(addedNames()).toEqual([])
    expect(Object.keys(client.peerConnections.PC_0[0].value)).toEqual(['a'])
  })

  it('ignores such a report id that comes from the id field of a legacy report', () => {
    const client = parse([
      '["getStats","PC_0",{"c":{"type":"googComponent","id":"c"},"x":{"type":"other","id":"constructor"},' +
        '"y":{"type":"other","id":"__proto__","added":1},"__proto__":{"type":"other","added":2}},1]'
    ])
    const value = client.peerConnections.PC_0[0].value

    expect(Object.getPrototypeOf(value)).toBe(Object.prototype)
    expect(Object.keys(value)).toEqual(['c', 'transport_c'])
  })

  it('removes a stat name that is the name of a built-in property', () => {
    const client = parse([
      '["getstats","PC_0",{"a":{"type":"x","bytes":1,"constructor":2,"toString":3,"timestamp":0},"timestamp":1},1]',
      '["getstats","PC_0",{"a":{"bytes":5,"__proto__":{"added":1},"constructor":6},"timestamp":2},2]',
      '["getStats","PC_0",{"a":{"type":"x","bytes":7,"toString":8,"__proto__":9}},3]'
    ])
    const reports = client.peerConnections.PC_0.map(entry => entry.value.a)

    expect(addedNames()).toEqual([])
    reports.forEach(report => expect(Object.getPrototypeOf(report)).toBe(Object.prototype))
    expect(reports.map(report => Object.keys(report))).toEqual([
      ['type', 'bytes', 'timestamp'],
      ['type', 'bytes', 'timestamp'],
      ['type', 'bytes']
    ])
    expect(reports[1].bytes).toBe(5)
  })

  it.each([
    ['getstats', '{"added":{"any":"value"},"timestamp":1}'],
    ['create', '{}'],
    ['oniceconnectionstatechange', '"connected"']
  ])('ignores a %s entry with such a peer connection id', (type, value) => {
    let client

    expect(() => {
      client = parse([
        `["${type}","__proto__",${value},1]`,
        `["${type}","constructor",${value},1]`,
        `["${type}","toString",${value},1]`,
        '["create","PC_0",{},2]'
      ])
    }).not.toThrow()

    expect(addedNames()).toEqual([])
    expect(Object.keys(client.peerConnections)).toEqual(['PC_0'])
  })
})
