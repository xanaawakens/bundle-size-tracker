# Contributing to Bundle Size Tracker

First off, thank you for considering contributing to Bundle Size Tracker! It's people like you that make Bundle Size Tracker such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fork the repo and create your branch from `main`
* If you've added code that should be tested, add tests
* Ensure the test suite passes
* Make sure your code lints
* Update the documentation

## Development Process

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run the tests: `npm test`
5. Run the linter: `npm run lint`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/avixiii-dev/bundle-size-tracker.git

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

### Project Structure

```
bundle-size-tracker/
├── src/
│   ├── core/           # Core functionality
│   ├── plugins/        # Build tool plugins
│   ├── types/          # TypeScript types
│   ├── cli.ts          # CLI implementation
│   └── index.ts        # Main entry point
├── test/              # Test files
├── docs/              # Documentation
└── examples/          # Example implementations
```

## Testing

We use Jest for testing. Please add tests for any new features or bug fixes:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Style Guide

* We use TypeScript for type safety
* Follow the existing code style
* Use meaningful variable names
* Add comments for complex logic
* Keep functions small and focused

## Documentation

* Update the README.md if you change functionality
* Add JSDoc comments for new functions and classes
* Update the type definitions if you change interfaces

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
