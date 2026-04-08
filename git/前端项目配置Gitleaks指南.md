# 前端项目配置Gitleaks指南

## 什么是 Gitleaks

[Gitleaks](https://github.com/gitleaks/gitleaks) 是一个用于检测和防止代码仓库中硬编码敏感信息（secrets）的 **SAST（静态应用安全测试）** 工具。

它可以扫描：

*   API Keys
    
*   密码和凭证
    
*   私钥
    
*   Token（JWT、OAuth 等）
    
*   数据库连接字符串
    
*   云服务凭证（AWS、GCP、Azure 等）
    

## 为什么需要 Gitleaks

| 场景 | 风险 |
| --- | --- |
| 不小心提交了 `.env` 文件 | 所有 API 密钥暴露 |
| 在代码中硬编码测试 Token | Token 被恶意使用 |
| 复制粘贴时包含了密码 | 账户安全风险 |
| 提交了私钥文件 | 服务器被入侵风险 |

**Git 历史是永久的！** 即使删除了敏感文件，历史记录中仍然存在。预防比补救更重要。

---

## 前置条件

*   [x] Node.js 22.x
    
*   [x] pnpm / npm / yarn（任一包管理器）
    
*   [x] Git 2.9+（支持 core.hooksPath）
    

---

## 安装步骤

### 步骤 1: 安装 Gitleaks

Gitleaks 是一个独立的命令行工具，需要单独安装。

#### macOS (推荐使用 Homebrew)

```bash
brew install gitleaks
```

#### 团队目前没有windows暂不考虑windows

### 步骤 2: 安装 Husky

在项目根目录执行以下命令：

#### 2.1 安装 Husky 依赖

```bash
# 使用 pnpm
pnpm add -D husky

# 使用 npm
npm install --save-dev husky

# 使用 yarn
yarn add -D husky

```

#### 2.2 初始化 Husky

```bash
# 使用 pnpm
pnpm exec husky install

# 使用 npm
npx husky install

# 使用 yarn
yarn husky install

```

执行后会创建 `.husky/` 目录：

```plaintext
.husky/
├── _/
│   ├── .gitignore
│   └── husky.sh
└── .gitignore

```

#### 2.3 配置自动安装（重要！）

在 `package.json` 中添加 `prepare` 脚本，确保团队成员克隆项目后自动启用 Git hooks：

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}

```
> **注意**: `prepare` 是 npm 的生命周期脚本，会在 `npm install` / `pnpm install` 后自动执行。

---

### 步骤 3: 创建 Pre-commit Hook

创建一个在每次 `git commit` 前运行的 hook 脚本。

#### 3.1 创建 hook 文件

```bash
# 使用 pnpm
pnpm exec husky add .husky/pre-commit ""

# 使用 npx
npx husky add .husky/pre-commit ""

```

#### 3.2 编辑 hook 内容

打开 `.husky/pre-commit` 文件，替换为以下内容：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔒 Running pre-commit security checks..."

# 检测 gitleaks 是否安装
if ! command -v gitleaks >/dev/null 2>&1; then
  echo ""
  echo "❌ 错误: gitleaks 未安装，禁止提交！"
  echo ""
  echo "   请先安装 gitleaks:"
  echo "   brew install gitleaks"
  echo ""
  exit 1
fi

echo "🔍 Running gitleaks security scan..."
gitleaks protect --staged --verbose --redact

```

#### 3.3 参数说明

| 参数 | 说明 |
| --- | --- |
| `protect` | 保护模式，扫描即将提交的内容 |
| `--staged` | 只扫描已暂存（staged）的文件 |
| `--verbose` | 显示详细扫描信息 |
| `--redact` | 在输出中隐藏敏感信息的具体值 |

#### 3.4 确保脚本可执行

```bash
chmod +x .husky/pre-commit
```
---

### 步骤 4: 配置 Gitleaks 规则

在项目根目录创建 `.gitleaks.toml` 配置文件，自定义扫描规则。

#### 4.1 创建配置文件

```bash
touch .gitleaks.toml
```

#### 4.2 基础配置

```toml
# .gitleaks.toml

# 继承 gitleaks 内置的默认规则
[extend]
useDefault = true

# 配置白名单，排除不需要扫描的路径
[[allowlists]]
paths = [
  # 公共资源目录
  '''(?:^|/)public/''',
  # 构建输出目录
  '''(?:^|/)dist/''',
  '''(?:^|/)build/''',
  '''(?:^|/)node_modules/''',
  # 示例环境变量文件
  '''\.env\.example$''',
  # 锁文件
  '''package-lock\.json$''',
  '''pnpm-lock\.yaml$''',
  '''yarn\.lock$''',
]

```

#### 4.3 高级配置 - 自定义规则

```toml
# .gitleaks.toml

[extend]
useDefault = true

# 白名单路径
[[allowlists]]
paths = [
  '''(?:^|/)public/''',
  '''(?:^|/)dist/''',
  '''\.env\.example$''',
]

# 白名单正则 - 允许特定格式的假数据
[[allowlists]]
regexes = [
  # 允许测试用的假 token
  '''test[-_]?token''',
  '''fake[-_]?api[-_]?key''',
  # 允许文档中的示例
  '''your[-_]?api[-_]?key[-_]?here''',
]

# 添加自定义检测规则
[[rules]]
id = "custom-api-key"
description = "检测自定义格式的 API Key"
regex = '''(?i)my_custom_api_key\s*[=:]\s*['"][a-zA-Z0-9]{32,}['"]'''
tags = ["key", "custom"]

# 按文件类型排除
[[rules]]
id = "generic-api-key"
allowlist = { paths = ['''\.md$''', '''\.txt$'''] }

```
---

### 步骤 5: 配置 GitHub Actions (可选)

除了本地 pre-commit 检查，建议在 CI/CD 中也添加 Gitleaks 扫描作为最后一道防线。

#### 5.1 创建 workflow 文件

创建 `.github/workflows/gitleaks.yml`：

```yaml
name: gitleaks
on:
  pull_request:
  push:
  workflow_dispatch:
  schedule:
    - cron: "0 20 * * 6" # 每周日北京时间凌晨 4 点（UTC 周六 20:00）
jobs:
  scan:
    name: gitleaks
    # 私有仓库需要使用 github-runner 不然机器人无法访问
    runs-on: github-runner
    permissions:
      contents: read # 读取代码
      pull-requests: write # 在 PR 中添加评论
      issues: write # 创建 issue（可选）
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }} # Only required for Organizations, not personal accounts.
          # 最好显示指定一下，因为目前测试的8.24.x版本 读取不到.gitleaks.toml文件
          GITLEAKS_VERSION: "8.30.0"

      # 钉钉通知 - 仅扫描失败时推送
      - name: Send DingTalk Notification
        if: failure()
        env:
          DINGTALK_WEBHOOK: ${{ secrets.DINGTALK_WEBHOOK }}
        run: |
          curl -X POST "$DINGTALK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
              \"msgtype\": \"markdown\",
              \"markdown\": {
                \"title\": \"🚨 Gitleaks 检测到敏感信息泄露\",
                \"text\": \"## 🚨 Gitleaks 检测到敏感信息泄露\n\n- **仓库**: ${{ github.repository }}\n- **分支**: ${{ github.ref_name }}\n- **提交者**: ${{ github.actor }}\n- **触发方式**: ${{ github.event_name }}\n\n[🔗 查看详情](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})\"
              },
              \"at\": {
                \"isAtAll\": true
              }
            }"

```

钉钉群效果

![图片.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/mxPOG5zmY7GeQnKa/img/181f962e-1aa6-4c52-b716-c49002c29aaf.png)

#### 5.2 私有仓库配置

如果是私有仓库，可能需要使用自托管 runner：

```yaml
jobs:
  scan:
    name: Gitleaks Security Scan
    # 使用自托管 runner 很重要不然访问403
    runs-on: github-runner

```
---

## 常用命令

```bash
# 扫描整个仓库历史
gitleaks detect --source . --verbose

# 只扫描暂存的文件（pre-commit 使用）
gitleaks protect --staged --verbose

# 扫描特定分支的差异
gitleaks detect --source . --log-opts="main..HEAD"

# 生成报告文件
gitleaks detect --source . --report-path ./gitleaks-report.json

# 使用自定义配置文件
gitleaks detect --source . --config .gitleaks.toml

# 显示所有内置规则
gitleaks rules

```

可以在 `package.json` 中添加便捷脚本：

```json
{
  "scripts": {
    "security:scan": "gitleaks detect --source . --verbose",
    "security:staged": "gitleaks protect --staged --verbose"
  }
}

```
---

## 配置详解

### `.gitleaks.toml` 完整示例

```toml
# 标题
title = "Gitleaks Config"

# 继承默认规则
[extend]
useDefault = true

# 全局白名单路径
[[allowlists]]
description = "Global allowlist for non-sensitive paths"
paths = [
  '''(?:^|/)public/''',
  '''(?:^|/)dist/''',
  '''(?:^|/)\.env\.example$''',
  '''(?:^|/)package-lock\.json$''',
  '''(?:^|/)pnpm-lock\.yaml$''',
]

# 白名单 - 允许特定提交
[[allowlists]]
description = "Allow specific commits"
commits = [
  "abc123def456",  # 已知的安全提交
]

# 白名单 - 按正则排除误报
[[allowlists]]
description = "False positive patterns"
regexes = [
  '''EXAMPLE_.*''',
  '''PLACEHOLDER_.*''',
]

# 自定义规则示例
[[rules]]
id = "shopify-api-key"
description = "Shopify API Key"
regex = '''shpat_[a-fA-F0-9]{32}'''
tags = ["shopify", "api", "key"]
keywords = ["shpat_"]

[[rules]]
id = "stripe-secret-key"
description = "Stripe Secret Key"
regex = '''sk_live_[a-zA-Z0-9]{24,}'''
tags = ["stripe", "key", "secret"]
keywords = ["sk_live_"]

```

### 白名单策略说明

| 类型 | 用途 | 示例 |
| --- | --- | --- |
| `paths` | 排除特定路径 | `dist/`, `public/` |
| `regexes` | 排除匹配特定模式的内容 | 假数据、示例代码 |
| `commits` | 排除特定提交 | 已审核的历史提交 |
| `stopwords` | 排除包含特定词的行 | `example`, `test` |

### 仓库重置所有commit流程

```shell
# 1. 删除 .git 文件夹（删除所有历史）
rm -rf .git

# 2. 重新初始化仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建第一个 commit
git commit -m "Initial commit"

# 5. 连接到远端并强制推送
git remote add origin <远端地址>
git branch -M main
git push -f origin main
```

---

## 常见问题

### Q1: 提交时报错 "gitleaks 未安装"

**解决方案**：按照 [步骤 1](#%E6%AD%A5%E9%AA%A4-1-%E5%AE%89%E8%A3%85-gitleaks) 安装 gitleaks。

```bash
# macOS
brew install gitleaks

# 验证
gitleaks version

```

### Q2: 误报（False Positive）怎么处理？

**解决方案**：在 `.gitleaks.toml` 中添加白名单。

```toml
# 方法 1: 排除特定路径
[[allowlists]]
paths = ['''path/to/file\.js$''']

# 方法 2: 排除特定模式
[[allowlists]]
regexes = ['''MOCK_API_KEY_.*''']

# 方法 3: 在代码中添加注释（行级）
# gitleaks:allow
API_KEY = "this-is-not-a-real-key"

```

### Q3: 如何跳过一次检查？

**不推荐**，但紧急情况可以使用：

```bash
# 跳过所有 hooks
git commit --no-verify -m "emergency fix"

# 简写
git commit -n -m "emergency fix"

```
> ⚠️ **警告**：使用 `--no-verify` 会跳过所有 pre-commit hooks，请谨慎使用！

### Q4: clone 后 hooks 不生效

**解决方案**：确保 `package.json` 中有 `prepare` 脚本：

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}

```

然后重新运行：

```bash
pnpm install
# 或
npm install

```

### Q5: 如何扫描已有的 Git 历史？

```bash
# 扫描整个历史
gitleaks detect --source . --verbose

# 生成 JSON 报告
gitleaks detect --source . --report-path gitleaks-report.json --report-format json

```

如果发现历史中有敏感信息，需要使用 [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) 或 `git filter-branch` 清理。

## 📚 参考链

*   [Gitleaks 官方文档](https://github.com/gitleaks/gitleaks)
    
*   [Gitleaks 规则列表](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml)
    
*   [Husky 官方文档](https://typicode.github.io/husky/)
    
*   [Gitleaks GitHub Action](https://github.com/gitleaks/gitleaks-action)
    

---