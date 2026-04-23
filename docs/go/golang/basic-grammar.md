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
