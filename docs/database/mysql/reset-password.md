# MySQL 忘记密码后重置密码

当忘记 MySQL 的 `root` 密码时，可以临时让 MySQL 跳过权限表启动，登录后重置密码，再恢复正常启动方式。

本文整理 Windows + PowerShell 和 WSL2 Ubuntu 两种常见开发环境的处理方式。

## Windows PowerShell 环境

### 操作前确认

重置密码前先确认 3 件事：

| 项目 | 说明 |
| --- | --- |
| 管理员权限 | PowerShell 需要以“管理员身份运行” |
| MySQL 服务名 | 常见为 `MySQL80`、`MySQL57`、`mysql` |
| 新密码 | 建议使用强密码，避免继续使用简单密码 |

查看本机 MySQL 服务名：

```powershell
Get-Service | Where-Object { $_.Name -like "*mysql*" }
```

如果输出中看到 `MySQL80`，后续命令中的服务名就使用 `MySQL80`。

### 1. 停止 MySQL 服务

```powershell
Stop-Service -Name MySQL80
```

如果服务名不是 `MySQL80`，替换成你实际查到的服务名。

也可以用下面的命令确认服务已经停止：

```powershell
Get-Service -Name MySQL80
```

状态显示为 `Stopped` 即可继续。

### 2. 跳过权限表启动 MySQL

进入 MySQL 安装目录的 `bin` 目录。路径按实际安装位置调整：

```powershell
Set-Location "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

使用跳过权限表的方式启动 MySQL：

```powershell
.\mysqld.exe --console --skip-grant-tables --shared-memory
```

这个 PowerShell 窗口会被 MySQL 进程占用，保持它不要关闭。

参数说明：

| 参数 | 作用 |
| --- | --- |
| `--console` | 将启动日志输出到当前 PowerShell，方便查看错误原因 |
| `--skip-grant-tables` | 启动时不加载权限表，允许无密码登录 |
| `--shared-memory` | 启用 Windows shared memory 连接方式，方便本机客户端登录 |

不要在这里使用 `--skip-networking`。在 Windows 上它会禁用 TCP/IP，如果同时没有启用 named pipe 或 shared memory，MySQL 可能因为没有可用连接方式而直接退出。

### 3. 新开一个 PowerShell 登录 MySQL

重新打开一个管理员 PowerShell 窗口，进入 MySQL 的 `bin` 目录：

```powershell
Set-Location "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

无密码登录：

```powershell
.\mysql.exe --protocol=memory -u root
```

进入 MySQL 后，先刷新权限表：

```sql
FLUSH PRIVILEGES;
```

### 4. 修改 root 密码

MySQL 8.0 推荐使用 `ALTER USER`：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewStrongPassword_123!';
```

如果你的 `root` 账号主机不是 `localhost`，先查看账号：

```sql
SELECT user, host FROM mysql.user WHERE user = 'root';
```

然后按实际的 `host` 修改，例如：

```sql
ALTER USER 'root'@'%' IDENTIFIED BY 'NewStrongPassword_123!';
```

修改完成后再次刷新权限：

```sql
FLUSH PRIVILEGES;
```

退出 MySQL：

```sql
EXIT;
```

### 5. 关闭临时 MySQL 进程

回到第 2 步那个被 `mysqld.exe` 占用的 PowerShell 窗口，按 `Ctrl + C` 停止临时进程。

如果无法停止，可以在新的管理员 PowerShell 中查找并结束进程：

```powershell
Get-Process mysqld
Stop-Process -Name mysqld -Force
```

### 6. 正常启动 MySQL 服务

```powershell
Start-Service -Name MySQL80
```

确认服务状态：

```powershell
Get-Service -Name MySQL80
```

状态显示为 `Running` 后，用新密码测试登录：

```powershell
.\mysql.exe -u root -p
```

输入新密码后能进入 MySQL，就说明重置成功。

## WSL2 Ubuntu 环境

WSL2 Ubuntu 中 MySQL 通常通过 `service mysql` 管理；如果你的 WSL2 已启用 systemd，也可以使用 `systemctl`。

### 1. 停止 MySQL

优先使用兼容性更好的 `service`：

```bash
sudo service mysql stop
```

如果你的 WSL2 已启用 systemd，也可以使用：

```bash
sudo systemctl stop mysql
```

确认进程已经停止：

```bash
ps aux | grep mysqld
```

如果还能看到 `mysqld` 主进程，先确认没有业务连接，再停止残留进程。

### 2. 准备 socket 目录

Ubuntu 上 MySQL 需要使用 `/var/run/mysqld` 保存 socket 文件。目录不存在或权限不对时，临时启动可能失败。

```bash
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
```

### 3. 跳过权限表启动 MySQL

使用 `mysqld_safe` 临时启动：

```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

参数说明：

| 参数 | 作用 |
| --- | --- |
| `--skip-grant-tables` | 启动时不加载权限表，允许无密码登录 |
| `--skip-networking` | 禁用 TCP/IP，只保留本机 socket 连接，降低风险 |
| `&` | 放到后台运行，当前终端可以继续输入命令 |

等待几秒后确认 MySQL 已启动：

```bash
mysqladmin ping
```

看到 `mysqld is alive` 后继续。

### 4. 无密码登录 MySQL

```bash
mysql -u root
```

如果提示权限问题，可以加 `sudo`：

```bash
sudo mysql -u root
```

进入 MySQL 后，先刷新权限表：

```sql
FLUSH PRIVILEGES;
```

### 5. 修改 root 密码

先查看 `root` 账号的 `host` 和认证插件：

```sql
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
```

MySQL 8.0 可以直接修改密码：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewStrongPassword_123!';
```

如果你的 `root` 使用的是 `auth_socket`，并且希望以后通过密码登录，可以显式改为密码认证插件：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'NewStrongPassword_123!';
```

修改完成后刷新权限并退出：

```sql
FLUSH PRIVILEGES;
EXIT;
```

### 6. 关闭临时进程并恢复服务

结束临时启动的 MySQL：

```bash
sudo mysqladmin shutdown
```

如果无法关闭，可以查找进程后再处理：

```bash
ps aux | grep mysqld
```

重新启动 MySQL 服务：

```bash
sudo service mysql start
```

如果使用 systemd：

```bash
sudo systemctl start mysql
```

测试新密码：

```bash
mysql -u root -p
```

能输入新密码进入 MySQL，就说明重置成功。

## 常见问题

### WSL2 中 systemctl 不可用

部分 WSL2 Ubuntu 默认没有启用 systemd，会出现 `System has not been booted with systemd` 之类的提示。

这种情况下使用 `service` 命令即可：

```bash
sudo service mysql stop
sudo service mysql start
```

### mysqld_safe 启动失败

先检查 socket 目录和权限：

```bash
ls -ld /var/run/mysqld
```

如果目录不存在或属主不是 `mysql`，重新执行：

```bash
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
```

### mysqladmin ping 连接不上

先等待几秒再试。如果仍然失败，查看 MySQL 错误日志：

```bash
sudo tail -n 100 /var/log/mysql/error.log
```

常见原因是已有 MySQL 进程未停止、socket 目录权限不对、数据目录损坏或配置文件路径错误。

### 找不到 mysqld.exe 或 mysql.exe

说明当前目录不是 MySQL 的 `bin` 目录。可以先搜索安装位置：

```powershell
Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter mysqld.exe
```

找到后进入对应的 `bin` 目录再执行命令。

### Stop-Service 提示服务不存在

说明服务名写错了。重新查看服务名：

```powershell
Get-Service | Where-Object { $_.Name -like "*mysql*" }
```

把命令中的 `MySQL80` 替换成实际服务名。

### ALTER USER 报错

先确认当前 MySQL 版本和 `root` 账号的 `host`：

```sql
SELECT VERSION();
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
```

如果是较老版本 MySQL，可以尝试：

```sql
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('NewStrongPassword_123!');
FLUSH PRIVILEGES;
```

MySQL 8.0 不支持 `PASSWORD()` 函数，优先使用 `ALTER USER`。

## 安全建议

1. 重置完成后一定要关闭临时 `mysqld.exe` 进程，并通过 Windows 服务正常启动 MySQL。
2. 不要在共享文档、聊天记录或脚本中明文保存真实密码。
3. 生产环境操作前先确认是否有备份、是否会影响业务连接。
4. 如果 MySQL 暴露在公网，重置后建议检查用户权限和远程登录配置。
