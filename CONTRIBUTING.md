# Contributing to Quantum Logistics Platform

Thank you for your interest in contributing to the Quantum Logistics Platform! This document provides guidelines and best practices for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Branch Naming](#branch-naming)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)

---

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful, inclusive, and constructive in all interactions.

---

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of this repository to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/quantum-logistics-platform.git
cd quantum-logistics-platform
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/quantum-logistics-platform.git
```

### 4. Set Up Development Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🔄 Development Workflow

### 1. Sync with Upstream

Before starting new work, sync with the main repository:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the project's code style
- Add tests for new features
- Update documentation as needed

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

Go to your fork on GitHub and click "New Pull Request".

---

## 📝 Commit Convention

We follow the **Conventional Commits** specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat:` | New feature | `feat: add QAOA algorithm support` |
| `fix:` | Bug fix | `fix: correct distance calculation for southern hemisphere` |
| `docs:` | Documentation only | `docs: update installation instructions` |
| `style:` | Code formatting (no logic change) | `style: format code with black` |
| `refactor:` | Code refactoring | `refactor: optimize quantum solver memory usage` |
| `test:` | Adding or modifying tests | `test: add unit tests for distance matrix` |
| `chore:` | Maintenance tasks | `chore: update dependencies` |
| `perf:` | Performance improvements | `perf: cache distance matrix calculations` |

### Examples

#### Good Commits

```bash
feat: implement multi-vehicle routing support
fix: resolve quantum solver RAM overflow for 5 points
docs: add API documentation for /api/calculate endpoint
refactor: extract QUBO formulation to separate module
test: add integration tests for inter-city routing
chore: upgrade Qiskit to version 1.0
```

#### Bad Commits

```bash
# Too vague
update code

# Not following convention
Added new feature

# Missing type
improve performance
```

---

## 🌿 Branch Naming

Use descriptive branch names with the following prefixes:

### Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/real-road-routing` |
| `fix/` | Bug fixes | `fix/quantum-memory-leak` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/distance-calculation` |
| `test/` | Test-related changes | `test/add-e2e-tests` |
| `chore/` | Maintenance | `chore/update-dependencies` |
| `experiment/` | Experimental features | `experiment/qaoa-10-layers` |

### Examples

```bash
feature/osrm-integration
fix/leaflet-route-rendering
docs/contributing-guide
refactor/quantum-solver-modularization
test/quantum-solver-edge-cases
chore/migrate-to-python-311
experiment/hybrid-classical-quantum
```

---

## 🔍 Pull Request Process

### 1. PR Title

Use the same convention as commits:

```
feat: add real-time traffic integration
```

### 2. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### 3. Review Process

- At least one maintainer approval required
- All CI checks must pass
- No merge conflicts
- Documentation updated if needed

---

## 🎨 Code Style

### Python

- **Follow PEP 8** style guide
- Use **type hints** where applicable
- Maximum line length: **120 characters**
- Use **docstrings** for all public functions/classes

#### Example

```python
from typing import List, Tuple

def calculate_route(
    locations: List[Location],
    algorithm: str = "classical"
) -> Tuple[List[int], float]:
    """
    Calculate the optimal route for given locations.

    Args:
        locations: List of Location objects
        algorithm: Algorithm type ("classical" or "quantum")

    Returns:
        Tuple of (route sequence, total distance)

    Raises:
        ValueError: If algorithm is invalid or too many points for quantum
    """
    pass
```

### JavaScript

- Use **ES6+ syntax**
- **camelCase** for variables and functions
- Maximum line length: **120 characters**
- Add **JSDoc** comments for complex functions

#### Example

```javascript
/**
 * Calculate optimized route using selected algorithm
 * @param {Array<Object>} locations - Array of location objects
 * @param {string} algorithm - Algorithm type ('classical' or 'quantum')
 * @returns {Promise<Object>} Route result with distance and time
 */
async function calculateRoute(locations, algorithm) {
    // Implementation
}
```

### CSS

- Use **BEM** naming convention where applicable
- Group related properties
- Use **CSS variables** for colors and common values

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python test_implementation.py

# Run specific test file
python test_api.py

# Run with verbose output
python -m pytest -v
```

### Writing Tests

- **Test file naming**: `test_<module_name>.py`
- **Test function naming**: `test_<functionality>`
- **Assertions**: Use descriptive error messages

#### Example

```python
def test_quantum_solver_with_4_points():
    """Test quantum solver with maximum allowed points"""
    locations = generate_test_locations(4)
    result = solve_quantum(locations)

    assert result['success'] is True, "Quantum solver should succeed with 4 points"
    assert len(result['route']) == 5, "Route should have 5 points (including return)"
    assert result['total_distance'] > 0, "Distance should be positive"
```

---

## 🐛 Reporting Issues

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Minimal steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Python version, browser
6. **Screenshots**: If applicable

### Issue Template

```markdown
**Description**
Brief description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: Windows 11
- Python: 3.10.5
- Browser: Chrome 120

**Screenshots**
Add screenshots if applicable
```

---

## 📚 Documentation

- Update **README.md** for major features
- Add **docstrings** to all public functions
- Update **IMPLEMENTATION_GUIDE.md** for architecture changes
- Include **code comments** for complex logic

---

## 🏆 Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project documentation

---

## ❓ Questions?

If you have questions, please:
1. Check existing issues
2. Read the documentation
3. Open a new discussion
4. Contact maintainers

---

**Thank you for contributing to Quantum Logistics Platform!** 🚀
