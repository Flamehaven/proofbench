# Contributing to ProofBench

First off, thank you for considering contributing to ProofBench! 🎉

ProofBench is a **community-driven project** that aims to revolutionize mathematical proof verification through hybrid reasoning. We welcome contributions from everyone, whether you're fixing a typo, adding a feature, or improving documentation.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat everyone with kindness and respect
- **Be collaborative**: Work together constructively
- **Be inclusive**: Welcome newcomers and diverse perspectives
- **Be professional**: Keep discussions focused and productive

---

## 🚀 How to Contribute

### 1. Report Bugs 🐛

If you find a bug, please create an issue with:
- **Clear title**: Describe the bug in one sentence
- **Steps to reproduce**: Exact steps to trigger the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

**Template**:
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Environment
- OS: Windows 11
- Browser: Chrome 120
- Node.js: 20.10.0
```

### 2. Suggest Features 💡

We love new ideas! Create an issue with:
- **Problem statement**: What problem does this solve?
- **Proposed solution**: How would you solve it?
- **Alternatives**: What else did you consider?
- **Impact**: Who would benefit from this?

### 3. Submit Pull Requests 🔧

#### Quick Checklist
- [ ] Fork the repository
- [ ] Create a feature branch (`git checkout -b feature/amazing-feature`)
- [ ] Make your changes
- [ ] Add tests
- [ ] Run `npm test` and ensure all tests pass
- [ ] Run `npm run build` and ensure build succeeds
- [ ] Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- [ ] Push to your fork
- [ ] Open a pull request

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js 20+**
- **npm 10+**
- **Git**
- **Docker** (optional, for containerized development)
- **Python 3.8+** (optional, for backend utilities)

### Initial Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/proofbench.git
cd proofbench

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Start development server
npm run dev
```

### Development Workflow

```bash
# Run development server (hot reload)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Type check
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Build Storybook
npm run storybook

# Build for production
npm run build
```

---

## 📝 Commit Convention

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Test changes
- **chore**: Build process, dependencies
- **ci**: CI/CD changes
- **perf**: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(core): add topology domain support"

# Bug fix
git commit -m "fix(ui): resolve dark mode theme flickering"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(engine): simplify hybrid scoring logic"
```

---

## 🏗️ Project Structure

```
proofbench/
├── src/
│   ├── core/              # Proof verification engines
│   │   ├── symbolic_verifier.ts
│   │   ├── semantic_evaluator.ts
│   │   ├── hybrid_engine.ts
│   │   └── proof_engine.ts
│   ├── ai/                # LLM integration
│   │   └── consensus_manager.ts
│   ├── metrics/           # Quality metrics
│   │   └── lii_engine.ts
│   ├── design-system/     # UI components
│   │   ├── components/
│   │   ├── themes/
│   │   └── tokens/
│   ├── pages/             # Application pages
│   │   ├── HybridDashboard.tsx
│   │   ├── ExecutionHistory.tsx
│   │   └── ProofInputReview.tsx
│   └── utils/             # Utilities
│       └── sanitize.ts
├── tests/                 # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/         # CI/CD pipelines
├── scripts/               # Build/deploy scripts
└── docker-compose.yml     # Docker configuration
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test src/core/hybrid_engine.test.ts

# Watch mode
npm test -- --watch
```

### Writing Tests

We use **Vitest** for testing:

```typescript
import { describe, it, expect } from 'vitest';
import { HybridEngine } from './hybrid_engine';

describe('HybridEngine', () => {
  it('should verify valid algebraic equation', async () => {
    const engine = new HybridEngine(pool, ['mock-llm']);
    const result = await engine.verifyStep({
      id: 'test1',
      equation: { lhs: 'x + 2', rhs: '2 + x' },
      claim: 'Commutative property',
      domain: 'algebra'
    });

    expect(result.symbolic.valid).toBe(true);
    expect(result.pass).toBe(true);
  });
});
```

### Test Coverage Requirements
- **Core modules**: ≥80% coverage
- **UI components**: ≥70% coverage
- **Utilities**: ≥90% coverage

---

## 📚 Documentation

### Code Documentation

Use **TSDoc** for TypeScript:

```typescript
/**
 * Verifies a proof step using hybrid reasoning
 *
 * @param step - The proof step to verify
 * @returns Hybrid verification result with LII score
 *
 * @example
 * ```ts
 * const result = await engine.verifyStep({
 *   id: 'step1',
 *   equation: { lhs: 'x + 2', rhs: '2 + x' },
 *   domain: 'algebra'
 * });
 * ```
 */
async verifyStep(step: ProofStep): Promise<HybridStepResult> {
  // Implementation
}
```

### README Updates

When adding features:
1. Update **Features** section
2. Add to **Quick Start** if needed
3. Update **Roadmap** if completing a planned feature

---

## 🎨 Code Style

### TypeScript
- Use **PascalCase** for classes and interfaces
- Use **camelCase** for variables and functions
- Use **UPPER_CASE** for constants
- Prefer `const` over `let`
- Use arrow functions for callbacks
- Use optional chaining (`?.`) and nullish coalescing (`??`)

```typescript
// ✅ Good
const calculateLII = (steps: number, errors: number): number => {
  return Math.max(0, 100 - errors * 5);
};

// ❌ Bad
function calculate_lii(steps, errors) {
  var result = 100 - errors * 5;
  if (result < 0) result = 0;
  return result;
}
```

### React Components
- Use **functional components** with hooks
- Use **TypeScript** for props
- Extract complex logic to custom hooks
- Use **Emotion** for styling

```typescript
// ✅ Good
interface FeedbackPanelProps {
  messages: FeedbackMessage[];
  onDismiss?: (id: string) => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  messages,
  onDismiss
}) => {
  return (
    <div>
      {messages.map(msg => (
        <FeedbackItem key={msg.id} {...msg} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
```

---

## 🔍 Pull Request Process

### Before Submitting
1. **Sync with main**: `git pull origin main`
2. **Run tests**: `npm test`
3. **Build**: `npm run build`
4. **Lint**: `npm run lint`
5. **Update docs**: If API changed

### PR Title Format

```
<type>(<scope>): <subject>

Examples:
feat(core): add topology domain support
fix(ui): resolve dark mode theme flickering
docs(readme): update installation instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Added unit tests
- [ ] Added integration tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Build succeeds
```

### Review Process
1. **Automated checks**: CI/CD runs automatically
2. **Code review**: Maintainers will review within 48 hours
3. **Feedback**: Address review comments
4. **Approval**: Requires 1 maintainer approval
5. **Merge**: Maintainer will merge after approval

---

## 🌟 Recognition

Contributors will be:
- ✨ Listed in `CONTRIBUTORS.md`
- 🏆 Mentioned in release notes
- 💎 Added to GitHub contributors page

---

## 🚀 First-Time Contributors

New to open source? Here are some **good first issues**:

- 🟢 **good first issue** - Easy fixes, documentation improvements
- 🔵 **help wanted** - Medium difficulty, well-defined scope
- 🟡 **enhancement** - New features, larger scope

### Learning Resources
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [Vitest Guide](https://vitest.dev/guide/)

---

## 💬 Questions?

- **GitHub Discussions**: [Ask the community](https://github.com/flamehaven/proofbench/discussions)
- **Discord**: [Join our Discord server](https://discord.gg/proofbench)
- **Email**: flamehaven@example.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

<div align="center">

**Thank you for contributing to ProofBench!** 🙏

[⭐ Star on GitHub](https://github.com/flamehaven/proofbench) • [🐛 Report Bug](https://github.com/flamehaven/proofbench/issues) • [💡 Request Feature](https://github.com/flamehaven/proofbench/issues)

</div>
