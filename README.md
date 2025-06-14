# typescript-mcp

![typescript-mcp](https://img.shields.io/badge/typescript-mcp-blue?style=flat&logo=typescript)

> ⚠️ **This project is under active development.** APIs and features may change without notice.

Welcome to the **typescript-mcp** repository! This project offers a specialized TypeScript MCP server that enhances code manipulation and analysis capabilities. It aims to bridge the gap in functionality that traditional IDEs might lack, particularly in semantic refactorings like "Go to Definition" or "Rename."

## Table of Contents

- [Motivation](#motivation)
- [Installation](#installation)
  - [Quick Setup with --init=claude](#quick-setup-with--initclaude)
  - [Optional: Prompt](#optional-prompt)
- [Features](#features)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Releases](#releases)

## Motivation

Roo and Claude Code encounter issues with errors in their IDEs but struggle with semantic refactorings. This limitation can hinder productivity and lead to frustration. The **typescript-mcp** project addresses this by providing functionality equivalent to the Language Server Protocol (LSP). 

While large language models (LLMs) excel in many areas, they often fall short in precise tasks like word counting. To remedy this, our tool counts by lines and symbols, offering a more reliable and effective solution.

## Installation

### Quick Setup with --init=claude

Setting up **typescript-mcp** in your project is straightforward. Follow these steps:

```bash
npm install typescript typescript-mcp -D
npx typescript-mcp --init=claude
# Creates/updates .mcp.json with typescript-mcp configuration
# Creates/updates .claude/settings.json with permissions
```

After running the initialization command, you can start using Claude with:

```bash
claude
```

### Optional: Prompt

For those looking to optimize their refactoring process, consider the following prompt:

```markdown
## CRITICAL: Tool Usage Priority for Refactoring

**When performing refactoring operations (rename, move, etc.) on...
```

## Features

- **Advanced Code Analysis**: Analyze TypeScript code with precision.
- **Semantic Refactorings**: Perform operations like renaming and moving with ease.
- **Custom Configuration**: Easily customize settings to fit your workflow.
- **Integration with Existing Tools**: Works seamlessly with popular IDEs and editors.
- **Line and Symbol Counting**: Reliable metrics for code evaluation.

## Usage

After installation, you can utilize the features of **typescript-mcp** in your development workflow. 

1. **Run Claude**: Start the tool by executing `claude` in your terminal.
2. **Configure Settings**: Adjust settings in `.claude/settings.json` to suit your needs.
3. **Perform Refactorings**: Use the tool to perform semantic refactorings as needed.

For more advanced usage, refer to the documentation provided in the repository.

## Contributing

We welcome contributions to **typescript-mcp**! If you have ideas for improvements or new features, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them with clear messages.
4. Push your changes to your forked repository.
5. Submit a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Releases

To stay updated on the latest changes, please visit the [Releases](https://github.com/brayanepv1/typescript-mcp/releases) section. Here, you can find the latest versions and updates.

---

Thank you for your interest in **typescript-mcp**! We hope this tool enhances your TypeScript development experience. For any questions or feedback, feel free to open an issue in the repository.