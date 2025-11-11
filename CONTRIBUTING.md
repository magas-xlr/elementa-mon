# 🤝 Contributing to ElementaMon

Thank you for your interest in contributing to ElementaMon! This document provides guidelines and best practices for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Communication](#communication)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to:

- Be respectful and considerate
- Welcome diverse perspectives
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, trolling, or discriminatory behavior
- Personal attacks or insults
- Publishing others' private information
- Spamming or excessive self-promotion
- Any conduct that could reasonably be considered inappropriate

### Enforcement

Violations of the code of conduct may result in:

1. Warning
2. Temporary ban from the project
3. Permanent ban from the project

Report violations to: conduct@elementamon.com

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js >= 22.11.0
- pnpm >= 9.0.0
- Docker >= 24.0
- Git

### Initial Setup

```powershell
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/elementa-mon.git
cd elementa-mon

# Add upstream remote
git remote add upstream https://github.com/magas-xlr/elementa-mon.git

# Install dependencies
pnpm install

# Set up environment
Copy-Item .env.example .env
# Edit .env with your configuration

# Start Docker services
docker-compose up -d postgres mongodb redis

# Run tests to verify setup
pnpm test
```

### Read the Documentation

Before contributing, familiarize yourself with:

- [README.md](README.md) - Project overview
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
- [BEST_PRACTICES.md](BEST_PRACTICES.md) - Best practices
- [ROADMAP.md](ROADMAP.md) - Project roadmap
- Architecture specifications (BACKOFFICE_SPEC.md, MARKETING_SITE_SPEC.md, etc.)

---

## 🔄 Development Workflow

### 1. Find an Issue

- Browse [open issues](https://github.com/magas-xlr/elementa-mon/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to express interest
- Wait for maintainer approval before starting work

### 2. Create a Branch

Follow our branch naming convention:

```powershell
# Feature branch
git checkout -b feat/add-pet-evolution

# Bug fix branch
git checkout -b fix/battle-timer-bug

# Documentation branch
git checkout -b docs/update-readme

# Refactor branch
git checkout -b refactor/optimize-pet-service

# Performance improvement
git checkout -b perf/lazy-load-sprites
```

### 3. Make Changes

- Write clean, maintainable code
- Follow coding standards (see below)
- Add unit tests for new features
- Update documentation as needed
- Keep commits atomic and focused

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```powershell
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(battle): add turn timer with visual countdown"
git commit -m "fix(auth): resolve JWT token expiration issue"
git commit -m "docs(readme): add installation instructions"
git commit -m "test(pets): add unit tests for pet evolution"
git commit -m "refactor(cards): simplify card effect calculation"
git commit -m "perf(battle): optimize damage calculation"
git commit -m "chore(deps): update Angular to version 20.1.0"
```

**Commit Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, configs)
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

**Scopes**: `battle`, `pets`, `cards`, `auth`, `inventory`, `deck-builder`, `shell`, `backoffice`, `marketing`, etc.

### 5. Sync with Upstream

Regularly sync your fork with upstream:

```powershell
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main

# Rebase your feature branch
git checkout feat/your-feature
git rebase main
```

### 6. Push and Create Pull Request

```powershell
# Push your branch
git push origin feat/your-feature

# Go to GitHub and create a Pull Request
```

---

## 💻 Coding Standards

### TypeScript

**General Rules**:

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Avoid `any` - use `unknown` if necessary
- Export all public APIs

**Example**:

```typescript
// ✅ Good
interface Pet {
  id: string;
  name: string;
  elementalType: ElementalType;
  level: number;
}

enum ElementalType {
  Fire = 'Fire',
  Water = 'Water',
  Electric = 'Electric',
}

function evolvePet(pet: Pet): Pet {
  return {
    ...pet,
    level: pet.level + 1,
  };
}

// ❌ Bad
let pet: any = { name: 'Charmander' }; // Don't use 'any'
function evolve(p) {
  // Missing types
  p.level++;
}
```

### Angular Components

**Best Practices**:

- Use standalone components
- Implement OnPush change detection
- Use signals for reactive state
- Avoid logic in templates
- Keep components focused and small

**Example**:

```typescript
import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-card.component.html',
  styleUrls: ['./pet-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetCardComponent {
  pet = signal<Pet | null>(null);
  isAlive = computed(() => {
    const p = this.pet();
    return p && p.currentHP > 0;
  });

  onAttack(): void {
    // Handle attack
  }
}
```

### Naming Conventions

| Type       | Convention             | Example                        |
| ---------- | ---------------------- | ------------------------------ |
| Components | PascalCase + Component | `BattleArenaComponent`         |
| Services   | PascalCase + Service   | `PetsService`                  |
| Interfaces | PascalCase             | `ElementaMon`, `Card`          |
| Enums      | PascalCase             | `ElementalType`                |
| Constants  | UPPER_SNAKE_CASE       | `MAX_HAND_SIZE`                |
| Variables  | camelCase              | `currentPet`, `playerHand`     |
| Functions  | camelCase              | `calculateDamage`, `evolvePet` |
| Files      | kebab-case             | `battle-arena.component.ts`    |
| Classes    | PascalCase             | `BattleEngine`                 |

### File Organization

```
component-folder/
├── component-name.component.ts       # Component logic
├── component-name.component.html     # Template
├── component-name.component.scss     # Styles
├── component-name.component.spec.ts  # Unit tests
└── index.ts                          # Public API
```

### Import Order

```typescript
// 1. Angular core
import { Component, OnInit } from '@angular/core';

// 2. Angular modules
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// 3. Third-party libraries
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

// 4. Internal libraries
import { ElementaMon, Card } from '@elementamon/shared/models';

// 5. Local imports
import { BattleService } from './battle.service';
```

---

## 🧪 Testing Guidelines

### Unit Tests

**Requirements**:

- Minimum 80% code coverage
- Test all public methods
- Test edge cases and error handling
- Use descriptive test names

**Example**:

```typescript
describe('PetService', () => {
  let service: PetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('evolvePet', () => {
    it('should increase pet level by 1', () => {
      const pet: Pet = { id: '1', name: 'Charmander', level: 1 };
      const evolved = service.evolvePet(pet);
      expect(evolved.level).toBe(2);
    });

    it('should throw error if pet is at max level', () => {
      const pet: Pet = { id: '1', name: 'Charizard', level: 100 };
      expect(() => service.evolvePet(pet)).toThrowError('Max level reached');
    });
  });
});
```

### E2E Tests

**Use Playwright for E2E tests**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Battle Arena', () => {
  test('should display player pets', async ({ page }) => {
    await page.goto('/battle');

    const pets = page.locator('.player-pet');
    await expect(pets).toHaveCount(3);
  });

  test('should allow playing a card', async ({ page }) => {
    await page.goto('/battle');

    const card = page.locator('.hand-card').first();
    await card.click();

    await expect(page.locator('.battle-log')).toContainText('Card played');
  });
});
```

### Running Tests

```powershell
# Run all tests
pnpm test

# Run tests for specific project
pnpm nx test shell

# Run tests in watch mode
pnpm test --watch

# Run E2E tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

---

## 🔍 Pull Request Process

### Before Submitting

Ensure your PR:

- [ ] Passes all linting checks (`pnpm lint`)
- [ ] Passes all tests (`pnpm test`)
- [ ] Has adequate test coverage (80%+)
- [ ] Follows coding standards
- [ ] Updates documentation if needed
- [ ] Has a clear, descriptive title
- [ ] References related issue(s)

### PR Template

When creating a PR, use this template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue

Closes #123

## Changes Made

- Added pet evolution system
- Updated pet service with evolution logic
- Added unit tests for evolution

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

[Add screenshots or GIFs]

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
- [ ] Works on all browsers
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer reviews
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

### Merge Strategy

- Squash and merge for feature branches
- Rebase and merge for hotfixes
- Merge commit for release branches

---

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description

A clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Screenshots

[Add screenshots]

## Environment

- OS: Windows 11
- Browser: Chrome 120
- Node Version: 22.11.0
- App Version: 1.0.0

## Additional Context

Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description

Clear description of the feature

## Problem Statement

What problem does this solve?

## Proposed Solution

How should this work?

## Alternatives Considered

Other solutions you've thought about

## Additional Context

Mockups, examples, references
```

---

## 💬 Communication

### Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Discord**: Real-time chat (link in README)
- **Email**: conduct@elementamon.com (code of conduct violations)

### Response Time

- Critical bugs: 24 hours
- Bug reports: 48 hours
- Feature requests: 1 week
- Pull requests: 2-3 days

---

## 🎓 Learning Resources

### For New Contributors

- [Angular Documentation](https://angular.dev)
- [Nx Documentation](https://nx.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev)
- [NgRx Documentation](https://ngrx.io)

### Internal Resources

- [BEST_PRACTICES.md](BEST_PRACTICES.md) - Comprehensive best practices
- [ARCHITECTURE.md](README.md#architecture) - System architecture
- [API_DOCS.md](docs/API_DOCS.md) - API documentation

---

## 🏆 Recognition

Contributors will be recognized in:

- README contributors section
- Release notes
- Discord announcements
- Annual contributor awards

### Contribution Levels

- **🌱 Seedling**: 1-5 PRs merged
- **🌿 Sapling**: 6-15 PRs merged
- **🌳 Tree**: 16-30 PRs merged
- **🌲 Forest**: 31+ PRs merged

---

## ❓ FAQ

**Q: I'm new to open source. Where should I start?**
A: Look for issues labeled `good first issue`. These are beginner-friendly tasks.

**Q: How long does it take to review a PR?**
A: Usually 2-3 days. Complex PRs may take longer.

**Q: Can I work on multiple issues at once?**
A: It's better to focus on one issue at a time to ensure quality.

**Q: My PR was rejected. What should I do?**
A: Read the feedback carefully, make requested changes, and resubmit.

**Q: Can I add a new dependency?**
A: Discuss with maintainers first. We prefer to keep dependencies minimal.

---

## 📝 License

By contributing to ElementaMon, you agree that your contributions will be licensed under the project's license (see [LICENSE](LICENSE) file).

---

## 🙏 Thank You

Thank you for contributing to ElementaMon! Your time and effort help make this project better for everyone.

**Happy coding! 🎮**
