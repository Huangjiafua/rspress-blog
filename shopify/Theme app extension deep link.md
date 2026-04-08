# Theme app extension deep link

## 背景

根据 Shopify 的北极星（Polaris）UX 规范和官方文档，推荐在 app 的引导、配置和激活流程中使用 deep linking（深链），而不是仅仅让商家手动打开主题编辑器。

## 简介

### App Block 和 App Embed Block

我们先来了解下什么是 App Block 和 App Embed Block。

| **特性** | **应用区块（App Block）** | **应用嵌入区块（App Embed Block）** |
| --- | --- | --- |
| 主要作用 | 让应用以“区块”形式出现在具体页面内容区域。 | 让应用以“嵌入”方式出现在主题的全局区域（不依赖具体内容区块）。 |
| 典型场景 | 评论区块、倒计时区块、推荐商品区块、添加到购物车按钮等。 | 全站弹窗、全站追踪脚本（Analytics）、全站功能按钮、聊天气泡等。 |
| 商家添加/配置方式 | 商家在主题编辑器的\*\*“区块”区域\*\*进行添加、拖拽、排序。 | 商家在主题编辑器的 “应用嵌入”区域 (App embeds)\*\* 通过开关激活或关闭。 |
| 位置特性 | 插入到页面内容流中，可以被商家多次添加到同一页面的不同位置。 | 注入到全局区域（如 `head` 或 `body` 底部），通常只能添加一次，不出现在具体内容区块中。 |
| 主题兼容性 | 仅支持 Online Store 2.0 主题（支持 JSON 模板的主题）。 | 支持所有 Shopify 主题（包括 Online Store 2.0 和 vintage 主题）。 |
| 深层链接目标 | `addAppBlockId` 到特定的模板/部分/部分组。 | `activateAppEmbedId` 到 `target=app-embeds` 进行激活。 |
| 总结 | 插入到页面内容流，可多次添加、拖拽排序，适合内容型功能 | App Embed Block：全局激活/关闭，不出现在内容区，适合全站型功能 |

## Deep linking 深度链接

深层链接是 Shopify 为主题应用扩展（Theme App Extensions）提供的一项关键功能，旨在极大简化应用安装后的配置流程。通过构造特定的 URL，应用可以直接引导商家进入 Shopify 主题编辑器，并自动完成应用区块（App Block）的添加或应用嵌入区块（App Embed Block）的激活操作。

:::
Deep linking 分为两种类型：

主题应用扩展类型：即激活应用块和应用嵌入块，帮助商家自动添加块到内容流中；

扩展集合：使用于 Checkout UI extension 和 Customer UI extension：统一分组和管理多个扩展。
:::

### Deep linking 构造

深层链接是一种特殊的重定向 URL，该 URL 包含指向主题编辑器的路径，并附带一系列查询参数，这些参数指令 Shopify 自动执行以下操作之一：

*   添加特定的应用区块（App block）到主题的某个位置。
    
*   激活特定的应用嵌入区块。
    

#### 根据 Shopify 域名确定 URL 格式

1.  根据 Shopify 域名格式，深层链接的结构存在两种不同的版本：
    

*   格式 1: <myshopifyDomain>.myshopify.com 域名**（推荐：兼容性好）**
    
    *   这是每个店铺的专属 myshopify 域名，传统的后台和主题编辑器都是用这个域名;
        
    *   这种格式兼容所有 API、老版后台和主题编辑器的 deep link;
        
    *   适合在 API、自动化脚本、第三方工具等场景下使用。
        

*   格式 2: admin.shopify.com 域名（常用于跳转到主题编辑器的 Checkout 或 Customer UI extension 的部分）
    
    *   这是 Shopify 新版后台（Admin）统一入口，所有商家和开发者都可以通过 admin.shopify.com 访问自己的店铺后台；
        
    *   这种格式通常用于 Shopify 官方后台导航和新版的嵌入式 app 跳转；
        
    *   `需要用户已登录` Shopify 后台，并且有访问该店铺的权限。
        

1.  根据扩展的不同类型，深度链接上略有不同，这也就是前面为什么要先共识一下应用块和应用嵌入块的原因。链接的不同主要体现关键参数：`activateAppEmbedId` 和 `addAppBlockId` 上：
    

*   应用块：`https://{myshopDomain}/admin/themes/{current | themeId}/editor?template={template}&addAppBlockId={api_key}/{handle}&target={target_value}`
    
*   应用嵌入块：`https://{myshopDomain}/admin/themes/{current | themeId}/editor?target=app-embeds&activateAppEmbedId={api_key}/{handle}`
    

:::
target 参数要在 handle 之后
:::

#### 应用块深度链接

基本结构：`https://<myshopifyDomain>/admin/themes/{current | themeId}/editor?template={template}&addAppBlockId={api_key}/{handle}&target={target_value}`

##### 查询参数

| 参数名 | 作用 | 详情 |
| --- | --- | --- |
| template | 目标模板 | 指定要添加区块的 JSON 模板（如 `product`、`index`）；也可是自定义模板；如果未设置，默认为 `index.json`。 |
| addAppBlockId | 区块标识符 | 必需；格式为 `{api_key}/{handle}`；将应用块添加到 target 中。 |
| api\_key | 应用的 Client ID | 对应于您应用 `app.toml` 文件中的 `client_id`。 |
| handle | 区块 Liquid 文件名 | 位于 `theme-app-extension/blocks/` 目录下的文件名（不包含 `.liquid` 扩展名）。 |
| target | 添加位置 | 必需； 指定应用区块将插入到模板的哪个部分。 |

*   template 值补充说明：
    

当 App 通过 API `pageCreate`创建出一个页面时，我们将该如何把应用块添加至这个自定义模板中呢？

创建页面的 API 为`pageCreate`，其中一个关键参数 `templateSuffix`，它表示的是被创建的页面的 JSON 文件名的一部份，我们只需要拼接对应的关键字，则可以将其作为 template 的值。例如：

```powershell
template_suffix = 'loyalty-page'

# 深度链接
https://...&template=page.loyalty-page
```

*   target 值补充说明：
    

| target 值 | 目标位置 | 示例 URL 片段 | 备注 |
| --- | --- | --- | --- |
| newAppsSection | 任何 JSON 模板中的 “Apps”新区块区域。 | `target=newAppsSection` | 最推荐的通用位置。 |
| mainSection | 模板中 ID 为 `"main"` 的主要内容部分。 | `target=mainSection` | 适用于产品页等有明确主要内容的部分。 |
| sectionGroup:header/footer/aside | 部分组。 | `target=sectionGroup:header` | 需确保主题包含该部分组。 |
| sectionId:id\_value | 模板中具有特定 ID 的部分。 | `target=sectionId:section--162386...` | ID 必须以 `sectionId:` 为前缀。 |

:::
Shopify 的 target 参数（如 mainSection、newAppsSection、sectionGroup:header 等）只能将应用块（App Block）添加到页面的某个 section 中（比如主 section），而不能精确到某个元素中。
:::

##### 限制

*   深度链接一次只能添加一个应用块。
    

*   深度链接只能指向支持应用块的部分。
    

:::
如何理解 “深度链接只能指向支持应用块的部分”

1️⃣ Shopify 主题分为很多 section（区块）和模板（如 product、collection、index 等），只有那些“支持 app block”的 section 或模板，才能通过 deep link 自动添加你的 App Block。

2️⃣ 例如，Online Store 2.0 的 JSON 模板、main section、header/footer/aside section group 以及支持 block 的自定义 section 才支持 app block deep linking。

3️⃣ 你可以通过 read\_themes scope 的 API 检查目标 section 是否支持 app block，避免跳转到不兼容的位置。
:::

#### 应用嵌入块深度链接

应用嵌入区块主要用于添加全局性的功能或脚本。它们默认处于停用状态，深层链接用于自动激活它们。

基本结构：`https://<myshopifyDomain>/admin/themes/{current | themeId}/editor?template={template}&addAppBlockId={api_key}/{handle}&target={target_value}`。

##### 查询参数

| 参数名 | 作用 | 详情 |
| --- | --- | --- |
| target | 目标区域 | 必需。 必须固定为 `app-embeds`，指示进入应用嵌入面板。 |
| activateAppEmbedId | 区块标识符 | 必需；启用应用嵌入块； 格式为 `{api_key}/{handle}`，与`app.toml` 文件中的 `client_id`相同。 |
| context | 应用被激活的上下文 | 应用被激活的上下文，值为 apps，会帮助商家在编辑器中打开 Apps 区域 |

## 案例实现

**案例 1：在产品详情页的产品的产品信息块中插入应用块。**

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/8K4nyeZ2zPpdonLb/img/d0d9c74c-c3a2-44fc-bf2b-8c4aac427643.png)

```tsx
`https://${myshopifyDomain}/admin/themes/${current | themeId}/editor?template=product&addAppBlockId=${api_key}/${handle}&target=mainSection`
```

**案例 2：Loyalty page: 在 pageCreate 创建的页面中添加应用块**

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/8K4nyeZ2zPpdonLb/img/44aded0c-f605-41cf-8de5-beda181cd7ed.png)

1.  后端实现：`templateSuffix`的值为 “loloyal-page”，创建的 JSON 文件为：`page.loloyal-page.json`
    
    > API `pageCreate` 文档：[https://shopify.dev/docs/api/admin-graphql/latest/mutations/pageCreate?example=creates-a-page&language=nod](https://shopify.dev/docs/api/admin-graphql/latest/mutations/pageCreate?example=creates-a-page&language=node)
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/8K4nyeZ2zPpdonLb/img/72c84945-577f-437a-836d-fdc9df38d072.png)
    
2.  前端实现：`template`的值为 page.loloyal-page
    

```tsx
`https://${myshopifyDomain}/admin/themes/${current | themeId}/editor?template=page.loyalty-page&addAppBlockId=${api_key}/${handle}banner&target=newAppsSection`
```

**案例 3：激活 App 的应用嵌入块，全局加载挂件**

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/8K4nyeZ2zPpdonLb/img/1487cc21-de29-4e77-af8f-2bafd06cb9fd.png)

```tsx
`https://${myshopifyDomain}/admin/themes/${current | themeId}/editor?context=apps&activateAppId=${api_key}/${handle}`
```

## 风险与解决方案

1.  Checkout 和 Customer account 扩展无法通过 Deep linking 默认激活扩展。
    
    1.  降级处理：通过配置参数`context=apps`定位到主题编辑器的 Apps 区域。
        
2.  应用块：Points label 无法默认添加到产品页的价格下方。
    
    1.  降级处理：默认添加到产品页的产品 section 中。
        
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/YdgOk2bEQ9KAZq4B/img/c74064e1-9adc-4713-b131-91fd3bf8509f.png)
    
3.  主题编辑器存在缓存问题：店铺切换主题后，通过 Deep link url 打开主题编辑器，访问的仍旧是旧主题。
    
    1.  方案一：浏览器隐私模式打开；
        
    2.  方案二：使用主题 id 替换 URL 中的 current 字段
        
        1.  后台应用中如何获取主题 id。
            

## 参考文档

Shopify deep linking: [https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration#deep-linking](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration#deep-linking)