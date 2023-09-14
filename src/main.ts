import * as core from '@actions/core'
import { formatInTimeZone } from 'date-fns-tz';
import { $, path } from 'zx'

export const sqlFiles = ['roles.sql',
  'schema.sql',
  'data.sql'
];

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const databaseUrl: string = core.getInput('database_url');
    const timezone: string = core.getInput('timezone');
    const backupPath: string = core.getInput('backup_path');


    core.debug(`Database url: ${databaseUrl}`)
    const backupDir = formatInTimeZone(new Date, timezone, backupPath)
    core.debug(`Backup dir: ${backupDir}`)

    await $`supabase db dump --db-url '${databaseUrl}' -f '${path.join(backupDir, 'roles.sql')}' --role-only`;
    await $`supabase db dump --db-url '${databaseUrl}' -f '${path.join(backupDir, 'schema.sql')}'`
    await $`supabase db dump --db-url '${databaseUrl}' -f '${path.join(backupDir, 'data.sql')}' --use-copy --data-only`

    core.setOutput('files', sqlFiles.map(f => path.join(backupDir, f)))

  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
