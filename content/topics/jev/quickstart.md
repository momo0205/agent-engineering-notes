## 两条访问路径

第一条是 TypeSafe 官方 early-access API：在控制台获得访问资格和密钥，使用官方 `typesafe-sdk`。第二条是 Vercel AI Gateway 暴露的 `typesafe-ai/jev` 模型；它适合已经使用 AI Gateway 的项目，但请求方言、计费和可用能力应以网关页面为准。[官方 Python SDK](https://docs.typesafe.ai/sdk/python)｜[Vercel 模型页](https://vercel.com/ai-gateway/models/jev)

本教程先走官方 Python SDK，因为它直接呈现 Choice、Score 和 Noul。**截至本页审阅日，我们尚未使用自己的有效密钥完成本地 Jev 调用；以下代码依据官方 SDK 形状整理，不冒充复现结果。**

## 建立隔离环境

```bash
python -m venv .venv
source .venv/bin/activate
pip install typesafe-sdk
export TYPESAFE_API_KEY="[REDACTED]"
```

`[REDACTED]` 只是占位符。SDK 默认从环境变量 `TYPESAFE_API_KEY` 读取密钥。不要把真实值写进 Python、Markdown、截图或命令历史；本地可使用被 `.gitignore` 排除的 `.env`，CI 使用 GitHub Actions Secret。公开仓库提交前还应运行敏感信息扫描。

## 第一次 Choice

```python
from typesafe_sdk import Choice, TypeSafeClient

state = {"task": "检查订单表中昨天开始出现的重复记录"}

with TypeSafeClient() as client:
    response = client.system_one(
        state=state,
        questions={
            "route": Choice(
                instructions="哪个执行器最适合处理这项任务？",
                criteria={
                    "search": "检索外部资料",
                    "code": "修改或调试代码",
                    "database": "查询或检查数据库",
                    "human_review": "风险或信息不足，需要人工判断",
                },
            )
        },
    )

print(response.choices["route"].choice)
```

先检查返回结构与概率，再决定业务阈值。不要因为 SDK 给出了合法枚举，就立即自动执行高风险工具。

## Score 与 Noul

Score 表达有序程度，Noul 表达一个条件成立的概率。官方 SDK 示例形状如下：

```python
from typesafe_sdk import Noul, Score

questions = {
    "risk": Score(
        instructions="这项操作的风险有多高？",
        criteria=["low", "medium", "high"],
    ),
    "needs_human": Noul(
        instructions="这项操作是否必须由人工复核？"
    ),
}

# system_one 调用后：
# response.scores["risk"].score
# response.nouls["needs_human"].noul
```

不要用 Score 代替互斥分类，也不要把接近 0.5 的 Noul 理解为“中等程度”；它表示是与否接近不确定。

## 失败必须是正常路径

程序启动时检查 `TYPESAFE_API_KEY` 是否存在，缺失就明确退出。网络调用应设置合理超时；超时、限额或服务不可用时，回退到规则、现有结构化 LLM 或人工复核，而不是默认放行。

答案空间也需要本地校验：候选不能为空，标签含义不能重叠，必须保留 `human_review` 或 `unknown`。若返回概率不足以达到你的阈值，应记录为拒答，而不是强行选择最高项。

在生产接入前记录模型版本、request id、延迟、估算成本和脱敏后的输入标识。不要记录密钥、个人信息、公司机密或可逆推出原文的完整 trace。等我们拿到 API Key 后，下一步会把这里的最小请求固定为可执行 smoke test，并把真实运行状态更新为“本地复现”。
