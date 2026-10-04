# Automatic Git Synchronization Rule

ALWAYS automatically verify (`npm run build`), stage, commit, and push any new code changes or additions to the user's GitHub repository:
- Remote: origin (https://github.com/haribashyam/antigravitytest.git)
- Branch: main

## Guidelines
1. Do NOT wait for the user to ask or remind you to push code to GitHub. Every time code or content is added or modified in the workspace, automatically push it.
2. Before pushing, always run `npm run build` to verify there are no compilation or type check errors so that deployments do not break.
3. Check `git status` and `git diff`:
   - If there are uncommitted or untracked changes, stage and commit them with a descriptive commit message.
   - If local commits are ahead of remote, push to `origin main`.
   - If there are no new changes (local and remote are in sync), do not make empty commits or duplicate pushes.
