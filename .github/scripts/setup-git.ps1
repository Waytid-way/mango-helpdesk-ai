# Setup Git configuration for Mango Helpdesk AI (Windows PowerShell)
# Run with: .\\.github\\scripts\\setup-git.ps1

Write-Host "🔧 Setting up Git configuration..." -ForegroundColor Cyan

# Set commit template
git config commit.template .gitmessage
Write-Host "✅ Commit template configured" -ForegroundColor Green

# Set useful aliases
git config alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config alias.last "log -10 --oneline --decorate"
git config alias.amend "commit --amend --no-edit"
git config alias.undo "reset HEAD~1 --mixed"
git config alias.cleanup "rebase -i HEAD~10"
git config alias.changed "diff --name-status"
Write-Host "✅ Git aliases configured" -ForegroundColor Green

# Set default branch name
git config init.defaultBranch main
Write-Host "✅ Default branch set to 'main'" -ForegroundColor Green

# Enable auto-correct for typos
git config help.autocorrect 10
Write-Host "✅ Auto-correct enabled" -ForegroundColor Green

# Set pull strategy to rebase
git config pull.rebase true
Write-Host "✅ Pull strategy set to rebase" -ForegroundColor Green

# Enable color output
git config color.ui auto
Write-Host "✅ Color output enabled" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Git setup complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Available aliases:" -ForegroundColor Cyan
Write-Host "  git lg        - Beautiful log graph"
Write-Host "  git last      - Last 10 commits"
Write-Host "  git amend     - Amend last commit (keep message)"
Write-Host "  git undo      - Undo last commit (keep changes)"
Write-Host "  git cleanup   - Interactive rebase last 10 commits"
Write-Host "  git changed   - Show changed files"
Write-Host ""
Write-Host "Next time you commit (without -m), you'll see the template!" -ForegroundColor Yellow
