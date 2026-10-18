# 🚀 How to Push Your Code to GitHub (Avoiding Secrets)

## Problem
GitHub is blocking your push because your commit history contains secrets (.env files, tokens, API keys).

## ✅ Solution: Fresh Start on New Branch

### Step 1: Create .gitignore (if not exists)
```bash
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
echo ".env.local" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pyc" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".venv/" >> .gitignore
```

### Step 2: Create a New Clean Branch
```bash
# Create and switch to a new branch
git checkout -b feature/clean-updates

# Check what files are different from remote
git status
```

### Step 3: Add Only Safe Files
```bash
# Add specific safe files/folders (NO .env files!)
git add .gitignore
git add forj-app/src/
git add services/forj-worker/app/
git add supabase/functions/
git add *.md

# Check what you're about to commit
git status
```

### Step 4: Make Sure .env is NOT Staged
```bash
# If .env shows up, remove it:
git reset HEAD .env
git reset HEAD **/.env
git reset HEAD **/*.env
```

### Step 5: Commit and Push New Branch
```bash
# Commit your changes
git commit -m "feat: Add GitHub reference feature to venture ideas and update Gemini to 2.5 Flash

- Add GitHub repository reference to venture ideas
- Fix GitHub token integration in analyzer
- Update to Gemini 2.5 Flash model
- Fix JSON payload parsing in dispatcher
- Add .gitignore for secrets protection"

# Push the new branch
git push origin feature/clean-updates
```

### Step 6: Create Pull Request
1. Go to https://github.com/pv5463/FORJ
2. You'll see a banner "Compare & pull request" for your new branch
3. Click it and create a PR
4. Review the changes (make sure NO .env files are included)
5. Merge the PR

### Step 7: Update Your Local Main
```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main
```

## 🔒 Keep Secrets Safe

### What to NEVER Commit:
- ❌ `.env` files
- ❌ Any file with actual API keys
- ❌ GitHub tokens
- ❌ OAuth secrets
- ❌ Database passwords

### What's SAFE to Commit:
- ✅ `.env.example` (with placeholder values like `your_api_key_here`)
- ✅ Source code files (`.ts`, `.tsx`, `.py`)
- ✅ Configuration files without secrets
- ✅ Documentation (`.md` files without embedded secrets)
- ✅ `.gitignore`

## 🆘 If You Already Committed Secrets

If secrets are in your commit history and you can't push:

### Option 1: New Clean Branch (Recommended - Above)

### Option 2: Remove from History (Advanced)
```bash
# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ Only if you're the only one working on the repo)
git push origin main --force
```

### Option 3: Start Fresh Repository (Last Resort)
1. Download/backup your code locally
2. Delete the .git folder
3. Run `git init` to start fresh
4. Create `.gitignore` first
5. Add only safe files
6. Push to GitHub

## ✅ Verify Before Pushing

Always check what you're about to push:
```bash
# See what files are staged
git status

# See the actual changes
git diff --cached

# If you see .env or secrets, unstage them:
git reset HEAD .env
```

## 📚 Quick Reference

**Safe workflow:**
```bash
1. Edit code
2. git status  (check what changed)
3. git add <specific-safe-files>  (NOT git add .)
4. git status  (verify .env is NOT staged)
5. git commit -m "your message"
6. git push
```

**If something went wrong:**
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Unstage all files
git reset HEAD .

# Start over
```

---

**Remember**: When in doubt, use `git status` and check what you're about to commit!
