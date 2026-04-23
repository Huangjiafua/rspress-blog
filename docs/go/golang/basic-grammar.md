# 基础语法

## 学习资料
> Golang: <https://go.dev/doc />

> Learn X in Y minutes：<https://learnxinyminutes.com/zh-cn/go/>

> Golang 中文文档: <https://golang.xiniushu.com/>

## 重点难点

### 1. 指针
Go 支持指针。它的核心价值是：在函数内修改外部变量，或避免大对象重复拷贝。

#### 1.1 基本语法
- `&x`：获取变量 `x` 的地址（得到指针）。
- `*p`：解引用指针 `p`（读/写该地址上的值）。
- `*int`：表示指向 `int` 的指针类型。
- `var p *int`：声明一个指向 `int` 的指针变量。

#### 1.2 经典示例（来自 Go by Example）
```go
package main

import "fmt"

func zeroval(ival int) {
	ival = 0
}

func zeroptr(iptr *int) {
	*iptr = 0
}

func main() {
	i := 1
	fmt.Println("initial:", i) // 1

	zeroval(i)
	fmt.Println("zeroval:", i) // 1（值传递，不影响外部）

	zeroptr(&i)
	fmt.Println("zeroptr:", i) // 0（通过地址修改外部变量）

	fmt.Println("pointer:", &i) // 输出 i 的地址
}
```

#### 1.3 知识总结
1. Go 参数传递永远是值传递。  
传普通变量时，复制的是“值”；传指针时，复制的是“地址值”。

2. 传指针不等于引用传递。  
本质仍是值传递，只是这个值恰好是地址。

3. 需要修改调用方数据时，用指针最直接。  
如：函数要改变结构体字段、计数器、状态位等。

4. 指针并非总是更高效。  
小对象直接拷贝可能更简单；是否使用指针应结合可读性和性能测试决定。

#### 1.4 疑惑解答
1. Go 是引用传递吗？  
不是。Go 是值传递语言。

2. `*` 到底有几种含义？  
在类型里（`*int`）表示“指针类型”；在表达式里（`*p`）表示“解引用”。

3. 为什么会 `nil pointer dereference`？  
因为指针是 `nil` 却被解引用。解引用前先判空。

4. 字面量可以直接取地址吗？  
一般不可以直接对普通字面量取地址，应先赋给变量再取地址。

5. Go 指针和 C 指针有什么关键差别？  
Go 不支持指针算术运算，减少了越界和内存破坏风险。

6. 什么场景不建议优先用指针？  
数据很小、无需修改外部状态、代码可读性优先时，可先用值类型。

### 2. JSON
Go 主要通过标准库 `encoding/json` 处理 JSON，核心是序列化（Marshal）和反序列化（Unmarshal）。

#### 2.1 核心知识点
1. `json.Marshal(v)`：Go 值 -> JSON（`[]byte`）。
2. `json.Unmarshal(data, &v)`：JSON -> Go 值（第二个参数必须是指针）。
3. 结构体字段默认按字段名参与编解码，通常使用 tag 指定 JSON 字段名：``Name string `json:"name"` ``。
4. 只有导出字段（首字母大写）才能被 `encoding/json` 访问。
5. `omitempty`：零值字段在序列化时省略。

#### 2.2 常用示例
```go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name  string `json:"name"`
	Age   int    `json:"age"`
	Email string `json:"email,omitempty"`
}

func main() {
	// Go -> JSON
	u := User{Name: "Tom", Age: 20}
	b, err := json.Marshal(u)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(b)) // {"name":"Tom","age":20}

	// JSON -> Go
	raw := []byte(`{"name":"Jerry","age":18,"email":"jerry@test.com"}`)
	var v User
	if err := json.Unmarshal(raw, &v); err != nil {
		panic(err)
	}
	fmt.Printf("%+v\n", v) // {Name:Jerry Age:18 Email:jerry@test.com}
}
```

#### 2.3 知识总结
1. 反序列化必须传指针，否则无法写回结果。
2. 字段映射靠 tag，团队协作中建议统一显式写 `json:"..."`。
3. 对外 API 结构体推荐使用 `omitempty` 控制无意义字段输出。
4. 未知字段默认会被忽略；如果需要严格校验，可使用 `Decoder` 并开启 `DisallowUnknownFields`。

#### 2.4 疑惑解答
1. 为什么我反序列化后字段是空值？  
常见原因是字段未导出（小写开头）或 tag 名称不匹配。

2. `map[string]any` 和结构体怎么选？  
结构固定时优先结构体（类型安全、可维护）；结构动态时再用 `map[string]any`。

3. 时间字段怎么处理？  
默认按 RFC3339 字符串处理（如 `2026-04-23T10:00:00Z`），必要时可自定义类型实现编解码。

4. 数字精度会丢吗？  
当 JSON 进 `interface{}` 时数字默认按 `float64` 解析；需要精确控制时用具体类型或 `Decoder.UseNumber()`。

### 3. 协程（Goroutine）
Goroutine 是 Go 的轻量级并发执行单元，通过 `go` 关键字启动。

#### 3.1 核心知识点
1. `go f()` 会并发执行函数 `f`，不会阻塞当前流程。
2. 主协程（`main`）结束时，其他协程也会一起结束。
3. 并发不等于并行：并发是“交替推进”，并行是“同时执行”。
4. 多个协程共享内存时要注意竞态问题（可用通道或锁协调）。

#### 3.2 常用示例
```go
package main

import (
	"fmt"
	"time"
)

func worker(name string) {
	for i := 1; i <= 3; i++ {
		fmt.Println(name, i)
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	go worker("goroutine")
	worker("main")
	time.Sleep(500 * time.Millisecond) // 等待 goroutine 执行完成
}
```

#### 3.3 知识总结
1. 启动协程成本低，适合大量并发任务。
2. 主函数退出会导致所有协程退出，要有“等待机制”（如 `WaitGroup` / 通道）。
3. 协程之间通信优先使用通道，少用共享变量硬同步。

#### 3.4 疑惑解答
1. 为什么有时看不到 goroutine 输出？  
因为 `main` 太快结束了，goroutine 还没来得及运行。

2. `go` 后面的函数参数何时求值？  
在启动 goroutine 的那一刻就会求值并复制参数。

3. 协程越多越好吗？  
不是。过多协程会带来调度和内存开销，应按任务规模控制。

4. 如何等待一批 goroutine 完成？  
实践中常用 `sync.WaitGroup`。

### 4. 通道（Channel）
Channel 是 goroutine 之间传递数据和同步时序的核心机制。

#### 4.1 核心知识点
1. `ch := make(chan int)`：创建无缓冲通道。
2. 发送：`ch <- v`；接收：`v := <-ch`。
3. 无缓冲通道：发送和接收必须同时就绪，天然同步。
4. 有缓冲通道：`make(chan int, n)`，容量未满可先发，空时不可收。
5. 关闭通道：`close(ch)`，通常由发送方关闭。

#### 4.2 常用示例
```go
package main

import "fmt"

func main() {
	ch := make(chan string)

	go func() {
		ch <- "hello"
	}()

	msg := <-ch
	fmt.Println(msg) // hello
}
```

#### 4.3 遍历与关闭示例
```go
package main

import "fmt"

func main() {
	ch := make(chan int, 3)
	ch <- 1
	ch <- 2
	ch <- 3
	close(ch)

	for v := range ch {
		fmt.Println(v)
	}
}
```

#### 4.4 知识总结
1. 通道不仅传数据，也传“时序信号”。
2. “不要通过共享内存来通信；要通过通信来共享内存”是 Go 并发设计的核心思想。
3. 关闭通道是为了告诉接收方“不会再有新数据”。
4. 向已关闭通道发送会 panic；从已关闭通道接收会继续取剩余值，取空后得到零值。

#### 4.5 疑惑解答
1. 什么情况下会死锁（deadlock）？  
常见是所有 goroutine 都在等待通道发送/接收，没人能继续推进。

2. 谁来关闭通道？  
一般是发送方关闭，不是接收方。

3. 如何判断通道是否已关闭？  
使用双返回接收：`v, ok := <-ch`，`ok == false` 表示通道已关闭且无剩余数据。

4. `nil` 通道有什么特点？  
对 `nil` 通道发送和接收都会永久阻塞，常用于 `select` 中动态屏蔽分支。

#### 4.6 通道与协程结合案例（生产者-消费者）
下面案例里，2 个生产者 goroutine 把任务结果写入同一个通道，主协程统一消费：

```go
package main

import (
	"fmt"
	"sync"
)

func producer(id int, jobs []int, out chan<- string, wg *sync.WaitGroup) {
	defer wg.Done()
	for _, job := range jobs {
		out <- fmt.Sprintf("producer-%d finished job-%d", id, job)
	}
}

func main() {
	results := make(chan string, 8)

	var wg sync.WaitGroup
	wg.Add(2)

	go producer(1, []int{1, 2, 3}, results, &wg)
	go producer(2, []int{4, 5, 6}, results, &wg)

	// 单独起一个协程等待所有生产者结束后关闭通道
	go func() {
		wg.Wait()
		close(results)
	}()

	// 主协程作为消费者，直到通道关闭
	for msg := range results {
		fmt.Println(msg)
	}
}
```

案例要点：
1. `chan<- string` 表示只写通道，限制 producer 只能发送，接口更清晰。
2. 使用 `WaitGroup` 统计生产者完成时机，再统一 `close(results)`。
3. 消费端使用 `for range` 持续读取，通道关闭后自然退出循环。
4. “发送方关闭通道”在该模式下最安全，避免重复关闭导致 panic。

### 5. URL 解析
Go by Example 这节展示了如何把一个完整 URL 逐段拆开解析。

#### 5.1 核心知识点（对应示例）
1. `url.Parse(raw)`：把字符串解析成 `*url.URL`。
2. 可直接读取：`Scheme`、`User`、`Host`、`Path`、`Fragment`、`RawQuery`。
3. 用户信息在 `User` 中，可通过 `Username()` 和 `Password()` 取值。
4. 主机和端口可用 `net.SplitHostPort(u.Host)` 拆分。
5. 查询参数可用 `url.ParseQuery(u.RawQuery)` 解析成 map 结构。

#### 5.2 对应示例（URL Parsing）
```go
package main

import (
	"fmt"
	"net"
	"net/url"
)

func main() {
	s := "postgres://user:pass@host.com:5432/path?k=v#f"

	u, err := url.Parse(s)
	if err != nil {
		panic(err)
	}

	fmt.Println(u.Scheme) // postgres
	fmt.Println(u.User)   // user:pass
	fmt.Println(u.User.Username())

	p, _ := u.User.Password()
	fmt.Println(p) // pass

	fmt.Println(u.Host) // host.com:5432
	host, port, _ := net.SplitHostPort(u.Host)
	fmt.Println(host) // host.com
	fmt.Println(port) // 5432

	fmt.Println(u.Path)     // /path
	fmt.Println(u.Fragment) // f
	fmt.Println(u.RawQuery) // k=v

	m, _ := url.ParseQuery(u.RawQuery)
	fmt.Println(m)       // map[k:[v]]
	fmt.Println(m["k"][0]) // v
}
```

#### 5.3 知识总结
1. URL 解析建议统一走 `net/url`，避免手写 split 出错。
2. `User`、`Host`、`RawQuery` 都是结构化入口，后续处理更安全。
3. `url.ParseQuery` 返回 `map[string][]string`，天生支持重复参数。
4. 端口拆分推荐 `net.SplitHostPort`，比手动切字符串可靠。

#### 5.4 疑惑解答
1. 为什么 `Password()` 是两个返回值？  
第二个布尔值表示密码是否存在，避免把“空密码”和“没写密码”混淆。

2. 为什么查询参数是 `[]string`？  
因为同一个 key 可以出现多次（如 `k=1&k=2`）。

3. `u.Host` 和 `host` 有什么区别？  
`u.Host` 可能包含端口（如 `host.com:5432`）；`host` 是拆分后的纯主机名。

4. `url.ParseQuery` 和 `u.Query()` 有何区别？  
两者都能解析查询参数；Go by Example 这里演示的是对 `RawQuery` 显式解析。
