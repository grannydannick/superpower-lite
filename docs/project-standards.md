# ⚙️ Project Standards

Enforcing project standards is crucial for maintaining code quality, consistency, and scalability in a React application. By establishing and adhering to a set of best practices, developers can ensure that the codebase remains clean, organized, and easy to maintain.

#### Oxlint

This project uses **Oxlint** for linting JavaScript/TypeScript. Oxlint is a fast linter from the Oxc project and supports many popular ESLint rule sets via built-in plugins.

[Oxlint Configuration](../.oxlintrc.json)

#### Oxfmt

This project uses **Oxfmt** for formatting instead of Prettier. The recommended setup is to enable “format on save” in your editor.

[Oxfmt Configuration](../.oxfmtrc.json)

#### TypeScript

TypeScript type checking is enforced via `oxlint --type-check` (backed by `oxlint-tsgolint`), so we don’t run a separate `tsc --noEmit` step in CI.

#### Absolute imports

Absolute imports should always be configured and used because it makes it easier to move files around and avoid messy import paths such as `../../../component`. Wherever you move the file, all the imports will remain intact. Here is how to configure it:

For JavaScript (`jsconfig.json`) projects:

```json
"compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
```

For TypeScript (`tsconfig.json`) projects:

```json
"compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
```

It is also possible to define multiple paths for various folders(such as `@components`, `@hooks`, etc.), but using `@/*` works very well because it is short enough so there is no need to configure multiple paths and it differs from other dependency modules so there is no confusion in what comes from `node_modules` and what is our source folder. That means that anything in the `src` folder can be accessed via `@`, e.g some file that lives in `src/components/my-component` can be accessed using `@/components/my-component` instead of `../../../components/my-component`.

#### File naming conventions

We can also enforce the file naming conventions and folder naming conventions in the project. For example, you can enforce that all files should be named in `kebab-case`. This can help you to keep your codebase consistent and easier to navigate.

Historically, this repo enforced this via `eslint-plugin-check-file`, but Oxlint does not support these file-system naming rules yet. For now, treat this as a convention (or introduce a dedicated naming tool/script if you want this enforced again).
