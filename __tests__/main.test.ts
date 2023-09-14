/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import { vi, describe, beforeEach, it, expect } from 'vitest'
import * as core from '@actions/core'
import * as main from '../src/main'
import * as zx from 'zx'
import { formatInTimeZone } from 'date-fns-tz'

// Mock the GitHub Actions core library
const debugMock = vi.spyOn(core, 'debug')
const getInputMock = vi.spyOn(core, 'getInput')
const setFailedMock = vi.spyOn(core, 'setFailed')
const setOutputMock = vi.spyOn(core, 'setOutput')

// @ts-expect-error String.raw
const $Mock = vi.spyOn(zx, '$').mockImplementation((...args) => {
  // @ts-expect-error String.raw
  const str = String.raw(...args)
  console.log(str)
  return str
})

// Mock the action's main function
const runMock = vi.spyOn(main, 'run')
const MOCK_DB_URL = 'postgres://postgres:password@127.0.0.1:5432/postgres'

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts input', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'database_url':
          return MOCK_DB_URL
        case 'timezone':
          return 'UTC'
        case 'backup_path':
          return "'backup/'yyyy-MM-dd'T'HH:mm:ss'Z'"
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    const expectPathRegex = new RegExp(
      `backup/${formatInTimeZone(
        new Date(),
        'UTC',
        "yyyy-MM-dd'T'"
      )}\\d{2}:\\d{2}:\\d{2}Z`
    )
    expect(debugMock).toHaveBeenNthCalledWith(1, `Database url: ${MOCK_DB_URL}`)
    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(expectPathRegex)
    )

    expect($Mock).to.toHaveNthReturnedWith(
      1,
      expect.stringMatching(new RegExp(`--db-url '${MOCK_DB_URL}'`))
    )

    // console.log(new RegExp(`-f '${expectPathRegex.source}'`))
    expect($Mock).to.toHaveNthReturnedWith(
      1,
      expect.stringMatching(
        new RegExp(`-f '${expectPathRegex.source}/roles.sql'`)
      )
    )
    expect($Mock).to.toHaveNthReturnedWith(
      2,
      expect.stringMatching(
        new RegExp(`-f '${expectPathRegex.source}/schema.sql'`)
      )
    )
    expect($Mock).to.toHaveNthReturnedWith(
      3,
      expect.stringMatching(
        new RegExp(`-f '${expectPathRegex.source}/data.sql'`)
      )
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'files',
      main.sqlFiles.map(sql =>
        expect.stringMatching(new RegExp(`${expectPathRegex.source}/${sql}`))
      )
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'dir',
      expect.stringMatching(expectPathRegex)
    )
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'database_url':
          return ''
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toBeCalled()
  })
})
