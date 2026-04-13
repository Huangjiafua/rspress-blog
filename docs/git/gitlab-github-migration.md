# gitlab-github迁移仓库

# 添加新的远程仓库并推送所有远程分支到 GitHub

## 查看当前远程仓库

```bash
git remote -v
```

## 添加 GitHub 作为新的远程仓库

```bash
git remote add github git@github.com:<用户名>/<仓库名>.git
```

## 获取原仓库所有分支

```bash
git fetch origin
```

## 查看所有远程分支

```bash
git branch -r | grep 'origin/'
```

## 推送所有分支到 GitHub

```bash
# 推送所有分支
git push github --all

# 推送所有标签
git push github --tags

```

## 推送单个分支

```bash
# 推送指定分支（包含所有 commit 历史）
git push github <分支名>

# 例如
git push github dev
git push github main

```

### 如果本地没有该分支

```bash
# 先从 origin 创建本地分支
git checkout -b <分支名> origin/<分支名>

# 再推送到 GitHub
git push github <分支名>
```
---

## 添加远程仓库地址

```bash
# 更改 github 远程地址
git remote set-url github git@github.com:<新用户名>/<新仓库名>.git

# 更改 origin 远程地址
git remote set-url origin <新地址>

# 删除远程仓库
git remote remove <远程名>

# 重命名远程仓库
git remote rename <旧名> <新名>

```

## 更改默认源

### 方法一：重命名远程仓库（推荐）

```shell
# 1. 把当前 origin 改名为 gitlab
git remote rename origin gitlab

# 2. 把 github 改名为 origin
git remote rename github origin

# 3. 验证
git remote -v
```

#### 方法二：直接替换origin地址

```shell
# 直接把 origin 的地址改为 GitHub
git remote set-url origin git@github.com:channelwill/cw5-fe-app.git

# 删除多余的 github 远程
git remote remove github

# 验证
git remote -v
```

以上操作改了最好重新拉一下分支，因为源可能是之前的源

## 注意事项

1.  **SSH 密钥**：确保 SSH 密钥已添加到 GitHub
    
    ```bash
    ssh -T git@github.com
    ```
    
2.  **大文件**：如果仓库有大文件，可能需要使用 Git LFS
    
3.  **私有仓库**：在 GitHub 创建仓库时选择 "Private"
    
4.  **默认推送**：`git push` 默认包含完整的 commit 历史，无需额外参数