# Supabase backup

> Backup supabase using supabase cli

## Usage

Input and output can be found in [action.yml](action.yml)

## Example

```yml
name: Backup

# Controls when the workflow will run
on:
  schedule:
    - cron: '40 */3 * * *'
  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - name: Backup database
        id: backup
        uses: NodeRSSBot/supabase-backup-action@main # use main branch for now
        with:
          database_url: ${{ secrets.PG_URI }}
      - name: multi-file-commit
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          # The commit message for the commit.
          commit_message: 'backup'
          commit_author: Author <actions@github.com>
          file_pattern: ${{ steps.backup.outputs.dir }}
          
``````
