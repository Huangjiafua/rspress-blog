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
- `*int` 指向 int 的指针类型
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
