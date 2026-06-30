# Git 分支管理规范

这份文档说明本仓库的分支怎么创建、怎么命名、合并到哪里、什么时候删除。目标是让没用过 Git 的同学也能照着流程走，避免仓库里出现大量没人维护的分支。

## 先理解几个概念

- **分支**：可以理解为一条独立的代码线。你在自己的分支上开发，不会直接影响线上代码。
- **长期分支**：长期存在的固定分支，例如 `main`、`dev`、`test`。有些旧仓库会把 `main` 叫作 `master`，本文后续统一使用 `main`。
- **工作分支**：为某个需求、修复或重构临时创建的分支，用完就删。
- **PR**：Pull Request，用来申请把一个分支的代码合并到另一个分支。

本仓库的核心规则：

1. 工作分支必须从 `main` 创建。
2. 工作分支按顺序合并到 `dev`、`test`、`main`。
3. 工作分支上线后，也就是合入 `main` 后，立即删除。

## 长期分支

只有下面这些分支可以长期存在。

| 分支 | 作用 | 规则 |
|:---|:---|:---|
| `main` | 生产主干，代表线上代码 | 禁止直接推送，只能通过 PR 合入 |
| `dev` | 联调环境，多个工作分支先在这里汇合 | 禁止直接推送，只能通过 PR 合入 |
| `test` | 测试环境，用于提测验证 | 禁止直接推送，只能通过 PR 合入 |

不在这个表里的分支，都视为工作分支。工作分支必须遵守命名、合并和清理规则。

## 工作分支命名

格式：

```text
<前缀>/<英文短描述>
```

要求：

- 全小写。
- 使用短横线连接单词，例如 `coupon-bulk-import`。
- 描述尽量简短，能说明用途即可。
- 不写中文、拼音、人名、日期。

允许使用的前缀：

| 前缀 | 用途 | 示例 |
|:---|:---|:---|
| `feat/` | 新功能、普通 bug、依赖升级、文档、版本迭代 | `feat/coupon-bulk-import`、`feat/v14.4` |
| `hotfix/` | 线上紧急修复 | `hotfix/order-refund` |
| `refactor/` | 不改变业务行为的重构 | `refactor/repo-domain-split` |

说明：

- 大多数日常工作都走 `feat/`。
- `hotfix/` 只表示线上紧急，流程不缩短。
- 不需要再细分 `bugfix/`、`docs/`、`chore/` 等前缀，避免分支类型过多。

## 分支完整流程

所有工作分支都走同一套三段式流程。

```text
main 创建工作分支
  -> PR 到 dev   联调
  -> PR 到 test  提测
  -> PR 到 main 上线
  -> 删除工作分支
```

注意：同一个工作分支会发 3 次 PR，分别合到 `dev`、`test`、`main`。分支要一直保留到合入 `main` 后再删除。

## 日常开发步骤

### 1. 从 main 创建工作分支

先更新本地 `main`，再创建自己的工作分支。

```bash
git checkout main
git pull origin main
git checkout -b feat/coupon-bulk-import
```

如果是线上紧急修复：

```bash
git checkout main
git pull origin main
git checkout -b hotfix/order-refund
```

### 2. 开发并提交代码

```bash
git add .
git commit -m "feat: add coupon bulk import"
```

提交信息要说明这次提交做了什么，不要只写 `update`、`fix`、`change`。

### 3. 推送工作分支

```bash
git push -u origin feat/coupon-bulk-import
```

### 4. 第一次 PR：合并到 dev

目标分支选择 `dev`。

用途：让代码进入联调环境。

```text
feat/coupon-bulk-import -> dev
```

这一步合并后，不要删除工作分支。

### 5. 第二次 PR：合并到 test

联调通过后，继续用同一个工作分支发 PR，目标分支选择 `test`。

用途：让测试环境验证。

```text
feat/coupon-bulk-import -> test
```

这一步合并后，也不要删除工作分支。

### 6. 第三次 PR：合并到 main

测试通过并确认上线时，再用同一个工作分支发 PR，目标分支选择 `main`。

用途：把代码合入生产主干。

```text
feat/coupon-bulk-import -> main
```

这一步合并后，工作分支生命周期结束，需要删除源分支。

```bash
git push origin --delete feat/coupon-bulk-import
```

也可以在 GitHub PR 页面点击 `Delete branch`。

## hotfix 也不能跳过流程

`hotfix/*` 用来表示线上紧急修复，但它仍然要按顺序合并到：

```text
dev -> test -> main
```

原因很简单：越紧急的修复越需要验证。直接跳过 `dev` 或 `test`，容易引入二次故障。

## 禁止的分支名

不要创建下面这些分支：

```text
sth-lyh
quick-fix
v14.4
feat/zhangsan-tier-04-21
feat/dev-merge
feat/v14.2-vip-tier-2
```

原因：

- 没有前缀，看不出用途。
- 使用人名、日期，会让分支名变成个人记录。
- `merge` 类分支是合并工件，应该用 PR 解决。
- 数字后缀分支容易越拆越多，导致分支爆炸。

正确写法：

```text
feat/coupon-bulk-import
feat/v14.4
hotfix/order-refund
refactor/repo-domain-split
```

## 强制规则

| 规则 | 原因 |
|:---|:---|
| 工作分支必须从 `main` 创建 | 保证起点干净，不带入 `dev` 或 `test` 里的未上线代码 |
| PR 必须按 `dev -> test -> main` 顺序推进 | 保证联调、提测、上线三个阶段清楚 |
| 合入 `main` 后立即删除工作分支 | 防止旧分支堆积 |
| 长期分支禁止直接推送 | 所有改动都要经过 PR |
| 长期分支禁止 force-push | 防止改写历史、丢失别人的提交 |

## PR 检查清单

发 PR 前确认：

- [ ] 分支是从 `main` 创建的。
- [ ] 分支名符合 `<前缀>/<英文短描述>`。
- [ ] 当前 PR 目标分支正确，没有跳过阶段。
- [ ] PR 描述写清楚做了什么、为什么做。
- [ ] 如果这是合入 `main` 的 PR，合并后要删除源分支。

## 每月维护

仓库维护人每月检查一次远程分支：

- 删除已经合入 `main` 但仍然存在的工作分支。
- 检查超过 90 天没有提交、也没有开放 PR 的分支。
- 对可疑分支先联系作者确认；无人认领的，按废弃分支清理。

常用命令：

```bash
git fetch --prune origin
git branch -r --merged origin/main
```

## 总结

记住这条主线就够了：

```text
从 main 切工作分支 -> 合 dev -> 合 test -> 合 main -> 删除工作分支
```

只要分支命名清楚、合并路径固定、上线后及时删除，仓库就不会因为历史工作分支越积越多而失控。
