# Development tools

Platform-specific development automation lives in these directories:

- `windows/` contains Windows batch and PowerShell scripts.
- `unix/` is reserved for Linux and macOS shell scripts.

Run tools from the repository root using their platform-specific path. Each tool resolves the repository root from its own location, so it can also be launched from another working directory.
