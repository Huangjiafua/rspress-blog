# MySQL 函数（单行函数与聚合函数）

## 函数分类总览

MySQL 常用函数分两类：

1. 单行函数：对每一行分别处理，返回多个结果。
2. 聚合函数：对多行做统计，返回单个结果（或每组一个结果）。

## 单行函数

### 1) 数值函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| `ABS(x)` | 绝对值 | `SELECT ABS(-10);` |
| `ROUND(x, d)` | 四舍五入，保留 d 位 | `SELECT ROUND(3.1415, 2);` |
| `CEIL(x)` | 向上取整 | `SELECT CEIL(1.1);` |
| `FLOOR(x)` | 向下取整 | `SELECT FLOOR(1.9);` |
| `RAND()` | 0~1 随机数 | `SELECT RAND();` |

### 2) 字符串函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| `CONCAT(s1, s2...)` | 拼接字符串 | `SELECT CONCAT('ID:', '101');` |
| `LOWER(str)` / `UPPER(str)` | 大小写转换 | `SELECT UPPER('mysql');` |
| `TRIM(str)` | 去除首尾空格 | `SELECT TRIM(' abc ');` |
| `SUBSTRING(s, start, len)` | 子串截取 | `SELECT SUBSTRING('Hello', 1, 2);` |
| `REPLACE(s, from, to)` | 字符替换 | `SELECT REPLACE('abc', 'a', 'z');` |
| `LPAD(s, len, pad)` | 左侧补齐 | `SELECT LPAD('5', 3, '0');` |
| `CHAR_LENGTH(str)` | 字符长度 | `SELECT CHAR_LENGTH('你好');` |

### 3) 日期时间函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| `NOW()` | 当前日期时间 | `SELECT NOW();` |
| `CURDATE()` | 当前日期 | `SELECT CURDATE();` |
| `YEAR(date)` / `MONTH(date)` | 提取年月 | `SELECT MONTH('2026-05-20');` |
| `DATE_ADD(date, INTERVAL n unit)` | 日期加减 | `SELECT DATE_ADD(NOW(), INTERVAL 1 DAY);` |
| `DATEDIFF(d1, d2)` | 日期差（天） | `SELECT DATEDIFF('2026-01-10', '2026-01-07');` |
| `DATE_FORMAT(date, fmt)` | 格式化日期 | `SELECT DATE_FORMAT(NOW(), '%Y/%m/%d');` |
| `STR_TO_DATE(str, fmt)` | 字符串转日期 | `SELECT STR_TO_DATE('01-01-2026', '%m-%d-%Y');` |

### 4) 类型转换函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| `CAST(value AS type)` | 通用类型转换 | `SELECT CAST('123' AS SIGNED);` |
| `CONVERT(value, type)` | 类型转换（含字符集场景） | `SELECT CONVERT('123', SIGNED);` |

### 5) 流程控制函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| `IF(val, t, f)` | 条件判断（真/假） | `SELECT IF(score >= 60, '及格', '不及格');` |
| `IFNULL(v1, v2)` | 空值兜底 | `SELECT IFNULL(nickname, '匿名');` |
| `CASE ... END` | 多分支判断 | `SELECT CASE WHEN score >= 90 THEN 'A' ELSE 'B' END;` |

## 聚合函数

聚合函数用于纵向统计，通常配合 `GROUP BY` 使用。

| 函数 | 功能 | 示例 |
| --- | --- | --- |
| `COUNT(*)` / `COUNT(col)` | 计数 | `SELECT COUNT(*) FROM emp;` |
| `SUM(col)` | 求和 | `SELECT SUM(salary) FROM emp;` |
| `AVG(col)` | 平均值 | `SELECT AVG(age) FROM students;` |
| `MAX(col)` | 最大值 | `SELECT MAX(score) FROM exam;` |
| `MIN(col)` | 最小值 | `SELECT MIN(created_at) FROM orders;` |

## 常见组合示例

```sql
-- 统计各部门人数与平均工资
SELECT
  dept_id,
  COUNT(*) AS emp_count,
  AVG(salary) AS avg_salary
FROM emp
GROUP BY dept_id;
```

```sql
-- 处理空值并展示格式化时间
SELECT
  IFNULL(nickname, '匿名用户') AS show_name,
  DATE_FORMAT(created_at, '%Y-%m-%d') AS created_date
FROM users;
```

## 复习要点

1. 单行函数是“横向逐行处理”，聚合函数是“纵向多行统计”。
2. `COUNT(*)` 与 `COUNT(col)` 的空值处理不同。
3. 业务 SQL 中建议同时掌握 `CASE`、`IFNULL`、`DATE_FORMAT` 这三类高频函数。
