# Agent 工程笔记

面向 Agent 工程实践的公开笔记站点，基于 vinext 和 Cloudflare Workers 构建。

## 本地开发

需要 Node.js 22.13.0 或更高版本。

```bash
npm install
npm run dev
```

## 验证

```bash
npm run verify
```

该命令依次运行测试、敏感信息检查、站内链接检查和生产构建。

额外的独立检查：

```bash
npm run lint
npm run typecheck
```
