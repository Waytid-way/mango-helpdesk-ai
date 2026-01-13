# Contributing to Mango Helpdesk AI

ขอบคุณที่สนใจ contribute! 🎉

## 🚀 Quick Start

1. Fork repository
2. Clone fork ของคุณ
3. สร้าง branch ใหม่ (`git checkout -b feature/amazing-feature`)
4. ทำการเปลี่ยนแปลง
5. Commit (`git commit -m 'feat: add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. เปิด Pull Request

## 📝 Commit Message Convention

เราใช้ [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Feature ใหม่
- `fix`: แก้ bug
- `refactor`: Refactor code
- `docs`: Documentation
- `style`: Code formatting
- `test`: Tests
- `chore`: Maintenance

### Examples

✅ **Good:**
```
feat(backend): add Groq API integration

- Implement RAG engine with Qdrant
- Add error handling for API failures

Closes #123
```

❌ **Bad:**
```
updated stuff
```

## 🌿 Branch Naming

```
<type>/<description>

Examples:
feature/add-authentication
fix/chat-scroll-bug
refactor/rag-optimization
docs/update-readme
```

## ✅ Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Self-review of code
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Tests added/updated (if applicable)
- [ ] All tests passing
- [ ] Commit messages follow convention

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
pytest
```

## 📋 Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Max line length: 100
- Use docstrings

### JavaScript (Frontend)
- Use ES6+ features
- Prefer const/let over var
- Use meaningful variable names
- Keep components small

## 🎯 Review Process

1. Submit PR with clear description
2. Wait for CI checks to pass
3. Address review comments
4. Maintainer will merge when ready

## 💡 Need Help?

- Read [Documentation](../docs)
- Check [Issues](https://github.com/Waytid-way/mango-helpdesk-ai/issues)
- Ask in Issue discussions

## 🙏 Code of Conduct

- Be respectful
- Be constructive
- Focus on what's best for the project

---

**Thank you for contributing!** 🚀
