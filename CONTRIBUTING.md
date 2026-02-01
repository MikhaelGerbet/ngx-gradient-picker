# Contributing to ngx-gradient-picker

First off, thank you for considering contributing to ngx-gradient-picker! 🎉

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- Angular version
- ngx-gradient-picker version
- Browser and version
- Clear steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 💡 Suggesting Features

Feature requests are welcome! Please:
- Check if the feature has already been requested
- Describe the use case clearly
- Explain why this feature would be useful

### 🔧 Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** in `projects/ngx-gradient-picker/src/lib/`
4. **Add tests** if applicable
5. **Run tests**: `ng test ngx-gradient-picker --no-watch --browsers=ChromeHeadless`
6. **Build the library**: `ng build ngx-gradient-picker`
7. **Test the demo**: `ng serve demo`
8. **Commit** with a descriptive message

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ngx-gradient-picker.git
cd ngx-gradient-picker

# Install dependencies
npm install

# Build the library (required first time)
ng build ngx-gradient-picker

# Start the demo app
ng serve demo

# Run tests
ng test ngx-gradient-picker
```

## Project Structure

```
projects/
├── ngx-gradient-picker/     # The library
│   └── src/lib/
│       ├── gradient-picker/       # Main component
│       ├── gradient-picker-popover/
│       ├── color-stop/            # Individual stop component
│       ├── color-stops-holder/    # Stops container
│       ├── palette/               # Gradient preview
│       ├── angle-picker/          # Circular angle picker
│       ├── gradient-type-picker/  # Linear/Radial toggle
│       └── models/                # Interfaces & utilities
└── demo/                    # Demo application
```

## Coding Guidelines

- Use **Angular Signals** for state management
- Use **standalone components**
- Follow **Angular style guide**
- Use **OnPush change detection**
- Write **meaningful commit messages**
- Keep components **small and focused**

## Commit Message Format

```
type(scope): description

feat(angle-picker): add keyboard navigation
fix(color-stop): prevent drag outside bounds
docs(readme): update installation instructions
test(gradient-picker): add unit tests for CSS output
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Questions?

Feel free to open an issue with the `question` label.

---

Thank you for contributing! 🙏
