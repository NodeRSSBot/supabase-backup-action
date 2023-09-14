import * as core from '@actions/core'
import { formatInTimeZone } from 'date-fns-tz'
import { $, fs, path } from 'zx'

export const sqlFiles = ['roles.sql', 'schema.sql', 'data.sql']

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const databaseUrl: string = core.getInput('database_url', {
      required: true
    })
    const timezone: string = core.getInput('timezone')
    const backupPath: string = core.getInput('backup_path')

    core.debug(`Database url: ${databaseUrl}`)
    const backupDir = formatInTimeZone(new Date(), timezone, backupPath)
    core.debug(`Backup dir: ${backupDir}`)
    await fs.ensureDir(backupDir)

    await $`supabase db dump --db-url '${databaseUrl}' -f '${path.join(
      backupDir,
      'roles.sql'
    )}' --role-only`
    await $`supabase db dump --db-url '${databaseUrl}' -f '${path.join(
      backupDir,
      'schema.sql'
    )}'`
    await $`supabase db dump --db-url '${databaseUrl}' -f '${path.join(
      backupDir,
      'data.sql'
    )}' --use-copy --data-only`

    core.setOutput(
      'files',
      sqlFiles.map(f => path.join(backupDir, f))
    )
    core.setOutput('dir', backupDir)
  } catch (error: any) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.stack)
  }
}
