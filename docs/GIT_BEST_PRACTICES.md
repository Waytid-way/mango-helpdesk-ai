# Git Best Practices Guide

## 🎯 Commit Message Standards

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
- `feat`: Feature ใหม่
- `fix`: แก้ bug
- `refactor`: Refactor code (ไม่เปลี่ยน behavior)
- `docs`: Documentation
- `style`: Code formatting
- `test`: Tests
- `chore`: Maintenance (dependencies, config)
- `perf`: Performance
- `ci`: CI/CD

### Examples

#### ✅ Good
```
feat(backend): add RAG engine with Qdrant vector search

- Implement FastEmbed for local embeddings
- Integrate Groq API for LLM inference
- Add error handling and retry logic

Closes #123
```

```
fix(frontend): prevent infinite scroll on chat messages

The scrollToBottom function was triggering on every render.
Changed to use useEffect with proper dependencies.

Fixes #45
```

#### ❌ Bad
```
Fixed stuff
```

```
WIP
```

```
Update
```

---

## 🛠️ Useful Git Aliases

Add to your `~/.gitconfig` or run these commands:

```bash
# Beautiful log graph
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Show last 10 commits
git config --global alias.last "log -10 --oneline --decorate"

# Amend last commit (keep message)
git config --global alias.amend "commit --amend --no-edit"

# Undo last commit (keep changes)
git config --global alias.undo "reset HEAD~1 --mixed"

# Interactive rebase last 10 commits
git config --global alias.cleanup "rebase -i HEAD~10"

# Show changed files
git config --global alias.changed "diff --name-status"

# Show who changed what
git config --global alias.blame-summary "blame -w -M -C"
```

**Usage:**
```bash
git lg        # Pretty log
git last      # Last 10 commits
git amend     # Fix last commit
git cleanup   # Clean up commits
```

---

## 🌿 Branch Naming Convention

```
<type>/<short-description>

Examples:
feature/add-authentication
fix/chat-scroll-bug
refactor/rag-engine-optimization
docs/update-readme
hotfix/critical-security-issue
```

---

## 📝 Commit Message Tips

### Subject Line Rules
1. **Max 50 characters**
2. **Imperative mood**: "Add feature" not "Added feature"
3. **No period at the end**
4. **Capitalize first letter**

### Body Rules
1. **Wrap at 72 characters**
2. **Explain WHAT and WHY, not HOW**
3. **Separate subject from body with blank line**
4. **Use bullet points for multiple items**

### Footer
- Reference issues: `Closes #123`, `Fixes #45`, `Refs #67`
- Breaking changes: `BREAKING CHANGE: API endpoint changed`

---

## 🔄 Interactive Rebase Workflow

### Clean up commits before pushing

```bash
# Start interactive rebase for last 5 commits
git rebase -i HEAD~5
```

**In the editor:**
```
pick abc123 feat: add feature A
squash def456 fix: typo in feature A
pick ghi789 feat: add feature B
reword jkl012 docs: update README
drop mno345 WIP: testing
```

**Commands:**
- `pick` - Keep commit as is
- `reword` - Keep commit but edit message
- `squash` - Merge with previous commit
- `drop` - Delete commit
- `edit` - Pause to edit commit

---

## 🚫 What NOT to Commit

Add to `.gitignore`:

```gitignore
# API Keys and Secrets
.env
.env.local
*.key
*.pem

# OS Files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo

# Dependencies
node_modules/
venv/
__pycache__/

# Build artifacts
dist/
build/
*.pyc
```

---

## 🎨 Pre-commit Checklist

Before every commit:
- [ ] Code runs without errors
- [ ] Tests pass (if applicable)
- [ ] No console.log() or debug statements
- [ ] No commented-out code
- [ ] Commit message follows convention
- [ ] Related files grouped together
- [ ] No secrets or API keys

---

## 🔍 Reviewing Commits Before Push

```bash
# See what you're about to push
git log origin/main..HEAD

# Review changes in detail
git diff origin/main..HEAD

# Check for secrets (add to pre-push hook)
git diff --cached | grep -i "api_key\|password\|secret"
```

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Commit with template | `git commit` |
| Amend last commit | `git commit --amend` |
| Interactive rebase | `git rebase -i HEAD~N` |
| Undo last commit | `git reset HEAD~1` |
| Clean up branch | `git rebase -i @{u}` |
| Force push safely | `git push --force-with-lease` |

---

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Git Book](https://git-scm.com/book/en/v2)

---

**Remember:** Good commits = Good documentation = Happy team! 🎉
