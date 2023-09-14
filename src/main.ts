import * as core from '@actions/core'
import { formatInTimeZone } from 'date-fns-tz';
import { $ } from 'zx'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const databaseUrl: string = core.getInput('database_url');
    const timezone: string = core.getInput('timezone');
    const backupPath: string = core.getInput('backup_path');

    await $`echo ${databaseUrl}`
    await $`echo $timezone}`
    await $`echo ${formatInTimeZone(new Date, timezone, backupPath)}`
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
