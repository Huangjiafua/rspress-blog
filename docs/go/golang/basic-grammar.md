# 基础语法（高效回顾版）

> 目标：用于快速回顾重点与难点，不追求覆盖每个细枝末节。

## 程序骨架

Go 程序的最小结构通常是：

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, Go")
}
```

记忆点：

- 入口函数是 `main.main`
- 导入包使用 `import`
- 可执行程序一般使用 `package main`

## 变量与基础类型

常见声明方式：

```go
var a int = 10
b := 20 // 语法糖
```

常见类型速记：

- 整型：`int`、`int64`、`uint`
- 浮点：`float32`、`float64`
- 布尔：`bool`
- 字符串：`string`
- 字符相关：`byte`、`rune`

## 复合类型

- `array`：定长数组，长度是类型的一部分
- `slice`：动态视图，开发中最常用
- `map`：键值对集合
- `make`：初始化 `slice/map/channel`

```go
arr := [3]int{1, 2, 3}
s := []int{1, 2}
s = append(s, 3)
m := map[string]int{"go": 1}
```

## 函数

Go 函数常见能力：

- 多参数
- 多返回值（非常常见）
- 可变参数
- 匿名函数和闭包

```go
func divmod(a, b int) (int, int) {
	return a / b, a % b
}
```

## 流程控制

Go 的流程控制关键点：

- `if` 支持先执行短语句
- `switch` 默认自动 `break`
- 只有 `for`，没有 `while`
- `range` 可遍历 `slice/map/string/channel`

```go
for i, v := range []int{10, 20, 30} {
	fmt.Println(i, v)
}
```

## 内存与指针

- 通过 `&` 取地址，`*` 解引用
- 支持指针，但不支持指针运算
- 有垃圾回收（GC）

```go
x := 10
p := &x
*p = 20
```

## defer（延迟执行）

- `defer` 在函数返回前执行
- 多个 `defer` 按后进先出（LIFO）执行
- 常用于关闭文件、关闭网络连接、释放锁

```go
defer fmt.Println("last")
defer fmt.Println("first")
// 输出顺序：first -> last
```

## 结构体与接口

- `struct` 组织数据
- 方法通过接收器绑定到类型
- `interface` 为行为抽象，采用隐式实现

```go
type Speaker interface {
	Speak() string
}
```

## 错误处理

Go 不使用异常作为常规错误控制，常见风格是显式判断：

```go
if err != nil {
	return err
}
```

另一个高频模式是 `value, ok`：

```go
v, ok := m["key"]
```

## 并发核心

- `goroutine`：轻量并发执行单元
- `channel`：并发通信
- `select`：同时等待多个 channel

```go
ch := make(chan int)
go func() { ch <- 1 }()
v := <-ch
fmt.Println(v)
```

## Web 入门

标准库 `net/http` 即可快速搭建服务：

- 实现 `ServeHTTP` 或直接用 `http.HandleFunc`
- `http.ListenAndServe` 启动服务
- `http.Get` 发起请求

```go
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("hello"))
})
_ = http.ListenAndServe(":8080", nil)
```

## 重点难点（附案例）

### 1. `slice` vs `array`

难点：`array` 是值类型且长度属于类型；`slice` 更像引用视图，传递成本低、可扩容。

案例：

```go
package main

import "fmt"

func changeArray(a [3]int) {
	a[0] = 99 // 只改副本
}

func changeSlice(s []int) {
	s[0] = 99 // 改到底层数据
}

func main() {
	a := [3]int{1, 2, 3}
	s := []int{1, 2, 3}

	changeArray(a)
	changeSlice(s)

	fmt.Println("array:", a) // [1 2 3]
	fmt.Println("slice:", s) // [99 2 3]
}
```

### 2. `make` vs `new`

难点：`new(T)` 返回 `*T`（零值指针）；`make` 只给 `slice/map/channel`，返回可直接使用的值。

案例：

```go
package main

import "fmt"

func main() {
	p := new(int) // *int，指向零值 0
	*p = 7
	fmt.Println(*p)

	m := make(map[string]int) // 可直接写入
	m["go"] = 1
	fmt.Println(m["go"])

	// var m2 map[string]int
	// m2["x"] = 1 // panic: assignment to entry in nil map
}
```

### 3. 接口的隐式实现

难点：Go 没有 `implements` 关键字，只要方法集匹配即实现接口。

案例：

```go
package main

import "fmt"

type Runner interface {
	Run() string
}

type Dog struct{}

func (Dog) Run() string { return "dog running" }

func start(r Runner) {
	fmt.Println(r.Run())
}

func main() {
	d := Dog{}
	start(d) // Dog 自动满足 Runner
}
```

### 4. `defer` 执行时机与顺序

难点：`defer` 在函数结束时触发，且是栈结构（后注册先执行）。

案例：

```go
package main

import "fmt"

func main() {
	defer fmt.Println("A")
	defer fmt.Println("B")
	defer fmt.Println("C")
	fmt.Println("body")
}
// 输出：
// body
// C
// B
// A
```

### 5. `select` 多路复用

难点：`select` 监听多个 channel，谁先就绪处理谁；都没就绪会阻塞（除非有 `default`）。

案例：

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(100 * time.Millisecond)
		ch1 <- "from ch1"
	}()

	go func() {
		time.Sleep(200 * time.Millisecond)
		ch2 <- "from ch2"
	}()

	select {
	case msg := <-ch1:
		fmt.Println(msg)
	case msg := <-ch2:
		fmt.Println(msg)
	}
}
```

### 6. 闭包捕获变量（常见坑）

难点：闭包捕获的是变量本身，不是每次循环时的值副本。

案例（错误与修正）：

```go
package main

import "fmt"

func main() {
	fns := []func(){}

	// 错误写法：闭包共享同一个 i
	for i := 0; i < 3; i++ {
		fns = append(fns, func() { fmt.Println("bad:", i) })
	}
	for _, fn := range fns {
		fn()
	}

	// 正确写法：创建局部副本
	fns = []func(){}
	for i := 0; i < 3; i++ {
		j := i
		fns = append(fns, func() { fmt.Println("good:", j) })
	}
	for _, fn := range fns {
		fn()
	}
}
```

