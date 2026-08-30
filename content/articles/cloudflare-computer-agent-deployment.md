---
title: Cloudflare Computer 能替 Agent 省掉什么，不能替它省掉什么
summary: 边缘运行环境可以减少 VPS 与沙箱运维，但不会自动解决 Agent 的权限、恢复和成本问题。
status: published
category: 架构决策
publishedAt: "2026-08-30"
updatedAt: "2026-08-30"
readingMinutes: 11
tags:
  - Cloudflare
  - 部署
  - Sandbox
  - Agent
---

## 先说结论

Cloudflare 的 Computer 能把一部分“给 Agent 准备电脑”的工作交给托管平台：Linux 用户空间、Node.js/npm、隔离执行和边缘部署都可以成为统一能力。对需要克隆仓库、安装依赖、运行测试的 Agent 来说，这比手工维护 VPS、Docker 和临时 Sandbox 更轻。

但它不是一个按下开关就完成的 Agent 基础设施。模型决策、工具白名单、Checkpoint、Trace、预算、超时和副作用审批仍然属于应用本身。

## 它适合放在哪一层

可以把系统拆成三层：

```text
Agent Harness：权限、预算、Loop、恢复、审计
          ↓
Computer 执行层：文件、命令、依赖、测试进程
          ↓
外部世界：GitHub、包仓库、第三方 API
```

Computer 更接近执行层。它可以提供一台短生命周期、可隔离的“电脑”，但不应该成为模型直接拥有的无限权限。Harness 仍要决定允许哪些命令、哪些目录、多少时间、多少输出，以及失败后是否可以重试。

## 对 Agent Evidence Lab 的意义

当前项目默认是 Java 服务，Python Worker 只用于实验和回归。Cloudflare Computer 更可能成为未来 M4 隔离实验执行面的候选，而不是替换 Java 控制面。

理想链路是：Java Agent 产生经过验证的实验计划，Harness 把有限任务提交给 Computer，Computer 返回结构化结果，结果经过校验后写入 Trace。模型不能直接获得平台凭据，也不能绕过 Checkpoint 修改运行状态。

## 它能减少哪些弯路

- 不必为每个 Agent 单独购买和维护 VPS；
- 不必手工管理一套临时 Docker 沙箱；
- 可以把依赖安装、测试运行和文件操作放在受控执行环境；
- 边缘部署和现有 Cloudflare 域名、Worker 体系更容易衔接。

这些收益主要来自运维简化，而不是 Agent 智能提升。

## 它不能自动解决哪些问题

第一，权限仍要由应用定义。一个能运行 `npm install` 的环境，如果能访问所有密钥和所有网络地址，仍然是不安全的。

第二，恢复仍要由应用定义。Computer 进程结束不代表实验成功，Agent 必须依靠结构化退出码、超时、输出上限和 Checkpoint 判断下一步。

第三，成本仍要由应用定义。平台执行时间、网络、存储和模型 Token 都可能产生费用，不能因为运行环境托管了就省略预算。

第四，数据边界仍要由应用定义。仓库源码、测试日志和环境变量可能包含敏感信息，不能直接进入模型上下文或持久化 Trace。

## 接入前要验证的最小问题

在真正迁移前，我会先做一个窄实验：给定固定仓库和固定命令，验证启动延迟、网络权限、依赖缓存、最大执行时长、输出大小、异常退出和进程清理。实验结果必须能映射回 Agent 的 Tool Contract，而不是只截一段漂亮的终端输出。

如果这条窄路径成立，再接入 Checkpoint 和 Trace；最后才考虑多个仓库、多种命令和用户触发的 API。顺序反过来，很容易把平台能力误当成产品能力。

## 最终判断

Cloudflare Computer 值得作为 Agent 执行层评估，尤其适合短任务、可隔离、需要真实 Linux 工具链的实验。它能显著减少基础设施杂务，但不会替你设计 Harness。

一个真正无痛的部署，不是把 Agent 搬到某个平台，而是让控制面、执行面和数据面之间的契约足够清晰：谁能做什么、做多久、失败如何恢复、哪些事实必须留下、哪些内容永远不能留下。

_更新时间：2026-08-30_
