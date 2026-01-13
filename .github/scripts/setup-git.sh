#!/bin/bash
# Setup Git configuration for Mango Helpdesk AI
# Run with: bash .github/scripts/setup-git.sh

echo "🔧 Setting up Git configuration..."

# Set commit template
git config commit.template .gitmessage
echo "✅ Commit template configured"

# Set useful aliases
git config alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config alias.last "log -10 --oneline --decorate"
git config alias.amend "commit --amend --no-edit"
git config alias.undo "reset HEAD~1 --mixed"
git config alias.cleanup "rebase -i HEAD~10"
git config alias.changed "diff --name-status"
echo "✅ Git aliases configured"

# Set default branch name
git config init.defaultBranch main
echo "✅ Default branch set to 'main'"

# Enable auto-correct for typos
git config help.autocorrect 10
echo "✅ Auto-correct enabled"

# Set pull strategy to rebase
git config pull.rebase true
echo "✅ Pull strategy set to rebase"

# Enable color output
git config color.ui auto
echo "✅ Color output enabled"

echo ""
echo "🎉 Git setup complete!"
echo ""
echo "Available aliases:"
echo "  git lg        - Beautiful log graph"
echo "  git last      - Last 10 commits"
echo "  git amend     - Amend last commit (keep message)"
echo "  git undo      - Undo last commit (keep changes)"
echo "  git cleanup   - Interactive rebase last 10 commits"
echo "  git changed   - Show changed files"
echo ""
echo "Next time you commit (without -m), you'll see the template!"
