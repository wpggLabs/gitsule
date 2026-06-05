# Future Actions

Gitsule V1 is a personal GitHub rediscovery and memory library.

Repository actions are V2/V3 only. They must not compromise the local-first memory system or turn Gitsule into a generic GitHub browser.

## Planned Future Actions

- Open repository in browser
- Open repository in VS Code / Cursor
- Open repository with Codex
- Open repository with Claude Code
- Clone repository locally
- Install supported projects
- Launch supported projects
- Stop supported projects
- Uninstall supported projects

## Architecture Rule

Repository memory and repository actions must stay separate.

Repository memory includes:
- why saved
- next action
- notes
- status
- collections
- last opened
- revisit history

Repository actions include:
- open
- clone
- install
- launch
- stop
- uninstall

Do not mix these into the same model.

## Safety Rule

Gitsule must never run arbitrary repository commands automatically.

Future install, launch, stop, and uninstall actions must require reviewed recipes.

No arbitrary script execution is allowed.

Recipes must be explicit, inspectable, and tied to supported project types.

## Future Action Statuses

- unsupported
- open_only
- clone_ready
- recipe_available
- installed
- update_available
- blocked

## Future Recipe Types

- browser
- local_folder
- vscode
- cursor
- codex
- claude
- windows_installer
- portable_zip
- docker_compose
- wsl_launcher

## Not Allowed Without Review

- arbitrary PowerShell scripts
- curl pipe shell commands
- unknown install scripts
- admin commands
- destructive commands
