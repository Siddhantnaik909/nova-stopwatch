# Contributing to NOVA Stopwatch

First off, thank you for considering contributing to NOVA Stopwatch! It's people like you that make NOVA such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the JavaScript styleguide (ESLint rules)
* Include appropriate test cases
* Document any new features in the README
* Update the CHANGELOG.md
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Example:
```
Add timer preset buttons

- Implement preset configurations (1m, 5m, 10m, 15m, 30m, 1h)
- Add adjust buttons for fine-tuning
- Update UI to reflect selected preset

Fixes #123
```

### JavaScript Styleguide

This project uses ESLint and Prettier for code quality:

```bash
# Format code
npm run format

# Lint code
npm run lint
```

Key conventions:
* Use `const` and `let`, avoid `var`
* Use arrow functions when appropriate
* Use descriptive variable names
* Add JSDoc comments for public methods
* Use strict mode (`"use strict"`)

### CSS Styleguide

* Use CSS custom properties (variables) for colors and spacing
* Use BEM naming convention for complex selectors
* Mobile-first approach for responsive design
* Organize styles by component/section
* Use meaningful variable names

### HTML Styleguide

* Use semantic HTML5 elements
* Include ARIA labels for interactive elements
* Use proper heading hierarchy
* Include alt text for images
* Test with screen readers

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested
* `wontfix` - This will not be worked on

### Project Structure

```
src/
├── index.html       # Main HTML
├── app.js           # Application logic
├── style.css        # Styling
└── [utilities]      # Helper modules (planned)
```

## Getting Started with Development

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/nova-stopwatch.git
cd nova-stopwatch
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```
Opens http://localhost:8000

4. **Make your changes**
- Create a feature branch: `git checkout -b feature/amazing-feature`
- Commit changes: `git commit -am 'Add amazing feature'`
- Push to branch: `git push origin feature/amazing-feature`
- Open a Pull Request

5. **Run quality checks**
```bash
npm run lint    # Check code quality
npm run format  # Auto-format code
npm run build   # Validate build
```

## Development Workflow

1. Pick an issue or create one for your feature
2. Discuss the approach in the issue comments
3. Create a feature branch
4. Implement the feature with tests
5. Ensure all checks pass
6. Submit a pull request with a clear description

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

## License

By contributing to NOVA Stopwatch, you agree that your contributions will be licensed under its MIT License.
