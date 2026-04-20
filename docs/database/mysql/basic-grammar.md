# MySQL 基础语法（DDL/DML/DQL/DCL/TCL）

## SQL 语言分类

### DDL: 数据定义语言

用于定义或修改数据库对象（库、表、列）。

| 操作 | 核心语法 | 示例 |
| --- | --- | --- |
| CREATE | `CREATE TABLE 表名 (列名 数据类型);` | `CREATE TABLE users (id INT, name VARCHAR(50));` |
| ALTER | `ALTER TABLE 表名 ADD/MODIFY 列名...;` | `ALTER TABLE users ADD age INT;` |
| DROP | `DROP TABLE 表名;` | `DROP TABLE users;` |
| TRUNCATE | `TRUNCATE TABLE 表名;` | `TRUNCATE TABLE users;` |

### DML: 数据操作语言

用于对数据行进行增删改。

| 操作 | 核心语法 | 示例 | 说明 |
| --- | --- | --- | --- |
| INSERT | `INSERT INTO 表名 (列1, 列2) VALUES (值1, 值2);` | `INSERT INTO student (id, name) VALUES (1, '张三');` | 添加数据 |
| UPDATE | `UPDATE 表名 SET 列=值 WHERE 条件;` | `UPDATE student SET name='李四' WHERE id=1;` | 修改数据 |
| DELETE | `DELETE FROM 表名 WHERE 条件;` | `DELETE FROM student WHERE id=1;` | 删除数据 |

### DQL: 数据查询语言

用于检索和分析数据。

| 操作 | 核心语法 | 示例 |
| --- | --- | --- |
| 基础查询 | `SELECT 列1, 列2 FROM 表名;` | `SELECT name, age FROM student;` |
| 条件查询 | `SELECT * FROM 表名 WHERE 条件;` | `SELECT * FROM student WHERE age > 18;` |
| 排序查询 | `SELECT * FROM 表名 ORDER BY 列 [ASC|DESC];` | `SELECT * FROM student ORDER BY age DESC;` |
| 聚合统计 | `SELECT 聚合函数(列) FROM 表名;` | `SELECT COUNT(*) FROM student;` |
| 分组查询 | `SELECT 列 FROM 表名 GROUP BY 列;` | `SELECT sex, COUNT(*) FROM student GROUP BY sex;` |
| 分页查询 | `SELECT * FROM 表名 LIMIT 起始, 数量;` | `SELECT * FROM student LIMIT 0, 10;` |

常见执行顺序（便于理解 SQL 思维）：

1. `FROM`
2. `WHERE`
3. `SELECT`
4. `ORDER BY`

### DCL: 数据控制语言

用于账号和权限管理。

| 操作 | 核心语法 | 示例 |
| --- | --- | --- |
| 创建用户 | `CREATE USER '用户名'@'主机' IDENTIFIED BY '密码';` | `CREATE USER 'work_user'@'%' IDENTIFIED BY '123456';` |
| 授权 | `GRANT 权限 ON 数据库.表 TO '用户'@'主机';` | `GRANT SELECT, INSERT ON school.* TO 'work_user'@'%';` |
| 撤权 | `REVOKE 权限 ON 数据库.表 FROM '用户'@'主机';` | `REVOKE INSERT ON school.* FROM 'work_user'@'%';` |
| 删除用户 | `DROP USER '用户名'@'主机';` | `DROP USER 'work_user'@'%';` |

### TCL: 事务控制语言

用于事务开启、提交、回滚等控制。

| 操作 | 核心语法 | 示例 |
| --- | --- | --- |
| 开启事务 | `START TRANSACTION;` 或 `BEGIN;` | `START TRANSACTION;` |
| 提交事务 | `COMMIT;` | `COMMIT;` |
| 回滚事务 | `ROLLBACK;` | `ROLLBACK;` |
| 设置保存点 | `SAVEPOINT 点名;` | `SAVEPOINT sp1;` |
| 回滚到保存点 | `ROLLBACK TO SAVEPOINT 点名;` | `ROLLBACK TO SAVEPOINT sp1;` |
| 自动提交设置 | `SET autocommit = 0|1;` | `SET autocommit = 0;` |

## 约束

| 约束名称 | 关键字 | 核心作用 | 要点 |
| --- | --- | --- | --- |
| 主键约束 | `PRIMARY KEY` | 唯一标识每一行 | 不能为 `NULL`，一张表只能有一个主键 |
| 唯一约束 | `UNIQUE` | 保证值唯一 | 可为 `NULL`，一张表可有多个 |
| 非空约束 | `NOT NULL` | 该列不能为空 | 只限制“为空”，不限制“重复” |
| 默认约束 | `DEFAULT` | 没传值时自动填充 | 常用于状态、时间等默认值 |
| 外键约束 | `FOREIGN KEY` | 维持关联一致性 | 值必须存在于被关联主键中 |
| 检查约束 | `CHECK` | 自定义值范围规则 | 如 `age > 0` |

## 常见数据类型

### 数值类型

#### 整数型

| 类型 | 存储字节 | 典型用途 |
| --- | --- | --- |
| `TINYINT` | 1 字节 | 状态位、枚举型小范围值 |
| `INT` | 4 字节 | 常规 ID、数量 |
| `BIGINT` | 8 字节 | 大规模 ID（如雪花 ID） |

#### 小数型

| 类型 | 特点 | 场景建议 |
| --- | --- | --- |
| `FLOAT` | 近似值，可能有精度损失 | 科学计算、传感器数据 |
| `DOUBLE` | 近似值，精度高于 FLOAT | 需要更高精度的计算数据 |
| `DECIMAL` | 精确值，不丢精度 | 金额、财务数据 |

### 字符串类型

| 类型 | 特点 | 场景建议 |
| --- | --- | --- |
| `CHAR(n)` | 定长 | 身份证号、手机号等定长字段 |
| `VARCHAR(n)` | 变长 | 用户名、地址、描述等 |
| `TEXT` | 长文本（约 64KB） | 评论、正文 |
| `LONGTEXT` | 超长文本（可到 GB 级） | 大文本内容 |

### 日期时间类型

| 类型 | 格式 | 特点 |
| --- | --- | --- |
| `DATE` | `YYYY-MM-DD` | 仅日期 |
| `DATETIME` | `YYYY-MM-DD HH:MM:SS` | 范围大，不受时区自动转换影响 |
| `TIMESTAMP` | `YYYY-MM-DD HH:MM:SS` | 受时区影响，常用于创建/更新时间 |

### 其它类型

| 类型 | 关键字 | 特点 | 场景建议 |
| --- | --- | --- | --- |
| 枚举 | `ENUM` | 单选，节省空间 | 性别、状态、固定分类 |
| 集合 | `SET` | 多选，位运算友好 | 标签、权限位 |
| 文档 | `JSON` | 结构灵活，支持路径查询 | 配置、动态属性 |
| 二进制 | `BLOB` | 存字节流，不做字符集处理 | 小文件、证书 |
| 位类型 | `BIT` | 高压缩的布尔/掩码场景 | 状态开关、标记位 |

## 实操建议

1. 建表优先明确主键、唯一约束和索引需求。
2. 涉及金额统一使用 `DECIMAL`。
3. 涉及多表写操作时，优先放入事务中处理。
