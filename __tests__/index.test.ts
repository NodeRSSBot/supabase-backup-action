/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as main from '../src/main'
import { vi, describe, it, expect } from 'vitest'
// Mock the action's entrypoint
const runMock = vi
  .spyOn(main, 'run')
  .mockImplementation(async () => Promise.resolve())

describe('index', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await import('../src/index')

    expect(runMock).toHaveBeenCalled()
  })
})
