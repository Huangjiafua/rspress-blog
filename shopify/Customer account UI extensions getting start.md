# Customer account UI extensions getting start

# 简介

[Customer account UI extensions](https://shopify.dev/docs/api/customer-account-ui-extensions/latest/components)(2025-10) 客户帐户 UI 扩展允许应用开发人员构建自定义功能，商家可以在客户帐户的订单索引 、 订单状态和配置文件页面上的定义点安装这些功能、以及创建新页面。

客户帐户 UI 扩展是一种安全可靠的方法，可以在不损害客户数据安全性的情况下自定义客户帐户页面的外观和功能，这也就意味着无法直接使用浏览器提供的 api，如果需要使用，可参考 [Web pixels](https://shopify.dev/docs/apps/build/marketing-analytics/build-web-pixels)。

## Extension target

### Target 是什么

[Target](https://shopify.dev/docs/api/customer-account-ui-extensions/latest/extension-targets-overview) 表示客户帐户 UI 扩展的显示位置，可在配置文件 shopify.extension.toml 中配置扩展的显示位置，module 配置 组件函数，将在指定位置运行时被调用。

```toml
api_version = "unstable"

[[extensions]]
name = "My customer account ui extension"
handle = "customer-account-ui"
type = "ui_extension"

[[extensions.targeting]]
target = "customer-account.order-status.block.render"
module = "./Extension.jsx"

```

### Target 分类

Target 大致根据与某个核心功能紧密结合程度划分为[静态扩展目标](https://shopify.dev/docs/api/customer-account-ui-extensions/latest/extension-targets-overview#block-extension-targets)、[块扩展目标](https://shopify.dev/docs/api/customer-account-ui-extensions/latest/extension-targets-overview#block-extension-targets)、[整页扩展目标](https://shopify.dev/docs/api/customer-account-ui-extensions/2025-07/targets/full-page/customer-account-order-page-render)和[操作菜单扩展目标](https://shopify.dev/docs/api/customer-account-ui-extensions/2025-07/targets/order-action-menu/customer-account-order-action-menu-item-render)。

*   静态扩展目标
    
    *   显示位置：通常只有一个显示位置，大多数核心客户帐户功能之前或之后呈现；
        
    *   渲染条件：与相应核心功能的渲染状态绑定，当未呈现核心客户帐户功能时，静态扩展目标也不会呈现出来。
        
*   块扩展目标
    
    *   显示位置：独立于核心功能，通常在核心客户帐户功能之间呈现，始终支持多个展示位置；
        
    *   渲染条件：无论存在客户帐户的其他元素，都始终呈现块扩展。
        
*   整页扩展目标
    
    *   显示位置：允许你创建一个完整的新页面，客户可以在账户内访问；
        
    *   渲染条件：一个扩展只能有一个 full-page target，不能和其他 target 共存。
        
*   操作菜单扩展目标
    
    *   允许你在订单操作菜单中添加自定义菜单项或弹窗；
        
    *   渲染条件：
        

:::
①整页扩展目标不能与同一扩展中的任何其它 Target 共存，即整页扩展目标需要独占一个扩展，并且只能添加 1 个。若需要添加多个整页扩展，则需要创建多个不同的整页扩展。

②整页扩展支持两个显示位置：`customer-account.order.page.render` 和 `customer-account.page.render`
:::

### Target 支持

1.  Customer account UI extensions 支持在客户帐户的以下页面中使用 extension targets：
    

*   Order index 订单索引页
    
*   Order status 订单状态页
    
*   Profile 个人简介页
    
*   New pages 新页面：应用可以使用整页扩展创建新页面，以支持不适合本机页面的用例
    

targets [显示位置](https://shopify.dev/docs/apps/build/customer-accounts)如下：

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/78450e8b-3681-4512-90c1-446ba5a8b73e.png)

1.  定义扩展目前的默认为止引用
    

当您使用扩展定位时，商家可以将 UI 扩展放置在页面上任何受支持的展示位置中。要向商家推荐特定展示位置，请使用 TOML 文件中的 [\[\[extensions.targeting.default\_placement\]\]](https://shopify.dev/docs/apps/build/app-extensions/configure-app-extensions#customer-account-ui-extensions) 属性定义默认展示位置。了解如何[配置默认展示位置](https://shopify.dev/docs/apps/build/app-extensions/configure-app-extensions#customer-account-ui-extensions) 。

*   Order index  订单索引
    
    *   Block extension target: [`customer-account.order-index.block.render`](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/targets/order-index/customer-account-order-index-block-render)
        
    *   区块扩展目标： [`customer-account.order-index.block.render`](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/targets/order-index/customer-account-order-index-block-render)
        
    *   Placement references: `PAGE_TITLE`, `ORDER_INDEX`  
        放置参考：`PAGE_TITLE`、`ORDER_INDEX`
        
*   Order status  订单状态
    
    *   Block extension target: [`customer-account.order-status.block.render`](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/targets/order-status/customer-account-order-status-block-render)
        
    *   区块扩展目标： [`customer-account.order-status.block.render`](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/targets/order-status/customer-account-order-status-block-render)
        
    *   Placement references: `PAGE_TITLE`, `ORDER_STATUS1`, `ORDER_STATUS2`, `ORDER_STATUS3`, `ORDER_SUMMARY1`, `ORDER_SUMMARY2`, `ORDER_SUMMARY3`  
        放置参考：`PAGE_TITLE`、`ORDER_STATUS1`、`ORDER_STATUS2`、`ORDER_STATUS3`、`ORDER_SUMMARY1`、`ORDER_SUMMARY2 ORDER_SUMMARY3`
        
*   Profile  轮廓
    
    *   Block extension target: [`customer-account.profile.block.render`](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/targets/profile-\(default\)/customer-account-profile-block-render)
        
    *   区块扩展目标： [`customer-account.profile.block.render`](https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/targets/profile-\(default\)/customer-account-profile-block-render)
        
    *   Placement references: `PAGE_TITLE`, `PROFILE1`, `PROFILE2`  
        放置参考：`PAGE_TITLE`、`PROFILE1`、`PROFILE2`
        

## API

Customer account UI extensions 提供了一系列的 [++API++](https://shopify.dev/docs/api/customer-account-ui-extensions/2025-07/apis)，使开发者能够获取和管理 Target 的状态，从而更高效地构建扩展。

API 大致分为 Order status API 和 Uncategorized API。

Order status API：![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/3c24133f-8fa3-478a-b556-d0ba2479aa8a.png)

Uncategorized API：

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/b0663f93-e96d-4f1c-a1fb-329ad17f585c.png)

## UI 组件

Shopify 官方提供了一套完整的 UI 组件库，用于无缝构建 Customer account 扩展应用，保证了 UI 与交互的一致性。除了 Customer account 专属[组件](https://shopify.dev/docs/api/customer-account-ui-extensions/2025-07/components)外，还可以使用[结账组件](https://shopify.dev/docs/api/checkout-ui-extensions/components)，大大提高了界面的个性化构建。

> [警告] 注意: 这里的组件依赖：@shopify/ui-extensions & @shopify/ui-extensions-react 均以 2025.7.1 版本为准

# 启动

## 环境准备

1.  Shopify cli 3.x
    
2.  Brower
    

## 技术栈选择（2025/10/15）

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| 方案一：<br>*   @shopify/ui-extensions<br>    <br>*   react@2025.7.1<br>    <br>*   react + ts + alien-signals | *   兼容其它扩展的旧版组件<br>    <br>*   与其它扩展技术栈一 | *   不符合 shopify 当前推荐的技术栈<br>    <br>*   按照 shopify 以往的迭代习惯，**有可能会强制迁移至方案二，但从总体评估下来，从 React 迁移到 preact 的工作量比较可观** |
| 方案二：<br>*   @shopify/ui-extensions-react@2025.7.1<br>    <br>*    preact ts <br>    <br>*   @preact/signals | *   符合 shopify 当前推荐的技术栈 | *   shopify 最新版本对构建产物的 js 文件大小限制为 63 kb<br>    <br>*   当前来看不支持 ts，需要关注 shopify 的更新 |

## 项目搭建

1.  创建扩展
    
    ```powershell
    shopify app generate extension --name 应用名称
    ```
    
2.  选择扩展模板
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/cf39bca7-4fac-4e40-9a35-e934ce8b5049.png)
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/44c40822-fada-4a45-8461-bc31d469d286.png)
    
3.  运行调试
    

```powershell
shpoify app dev
```

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/2608bd13-1669-4579-a57b-485d112c81c2.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/0e95be30-f376-4405-9d6a-75e1918cf1d0.png)

:::
踩坑指南：执行 npm shopify app dev 命令时，如果出现报错：

![8809f35fdf4f1f34df870a4ac5876452.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/4d412393-72c5-4315-82c2-38644f04d857.png)

**原因**：执行 xdg-open 会在终端打开一个可视化窗口，而 linux 终端中没有可视窗口可使用，导致命令报错，中断了后续命令的执行

**处理**: 自定义一个 xdg-open 命令覆盖掉原本的命令，避免指令报错

```markdown
mkdir ~/tmp-bin && export PATH=$PATH:/home/开发机的名字/tmp-bin/xdg-open && echo '#!/bin/sh' > ~/tmp-bin/xdg-open
```

进入项目中

```tsx
chmod +x ~/tmp-bin/xdg-open
```

温馨提示：如果执行上述命令后还是不行，则先将 tmp-bin 文件夹删除，重启终端
:::

4.  主题编辑器添加扩展
    

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/92ff7406-0f90-4532-b35a-b25c3c45893e.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/6daa5227-b7e2-4780-9b1e-fefb70dab539.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/d310b146-0d5c-47a7-b21d-52dbcc614eb2.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/51feb926-7683-4303-9cd6-3c1b3fe69350.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/93b397a5-edf9-4add-9bc9-8ccc5f691d83.png)

# 实践

## 内联扩展

:::
一、功能描述（静态页面）

在 Order status（订单状态）页中插入一个扩展，显示顾客当前的积分数。

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/7dc299cb-a5a5-45b8-befc-f79b01a38899.png)

在 Order index（订单索引）页中插入一个扩展，显示顾客当前的几分数。

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/89ad4e00-ad65-4986-8b97-8b2bc82dae61.png)
:::

1.  配置 shopify.extension.toml 文件，注册 Target: `customer-account.order-status.block.render`和 `customer-account.order-index.block.render`
    
    ```powershell
    # Learn more about configuring your Customer account UI extension:
    # https://shopify.dev/api/customer-account-ui-extensions/unstable/configuration
    
    # The version of APIs your extension will receive. Learn more:
    # https://shopify.dev/docs/api/usage/versioning
    api_version = "2025-07"
    
    [[extensions]]
    name = "Loyalty status"
    handle = "loyalty-order-status"
    type = "ui_extension"
    uid = "f21927b0-bfae-6471-9064-c15a6ea4ec0e6bc2cda9"
    
    # Controls where in Shopify your extension will be injected,
    # and the file that contains your extension’s source code. Learn more:
    # https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/extension-targets-overview
    
    [[extensions.targeting]]
    module = "./src/OrderStatusBlock.tsx"
    target = "customer-account.order-status.block.render"
    
    [[extensions.targeting]]
    module = "./src/OrderIndexBlock.tsx"
    target = "customer-account.order-index.block.render"
    
    [extensions.capabilities]
    # Gives your extension access to directly query Shopify’s storefront API.
    # https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/configuration#api-access
    api_access = true
    
    # Gives your extension access to make external network calls, using the
    # JavaScript `fetch()` API. Learn more:
    # https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/configuration#network-access
    # network_access = true
    
    ```
    
2.  UI 组件
    

①OrderStatusBlock.tsx

```tsx
import {
  reactExtension,
  Text
} from '@shopify/ui-extensions-react/customer-account';

// 1. Choose an extension target
export default reactExtension(
  'customer-account.order-status.block.render',
  () => <Extension />,
);

function Extension() {
  // 2. Render a UI
  return (
      <Text>你好，你当前的积分数为：1000</Text>
  );
}

```

②OrderIndexBlock.tsx

```tsx
import {
  reactExtension,
  Text,
} from '@shopify/ui-extensions-react/customer-account';

export default reactExtension(
  'customer-account.order-index.block.render',
  () => <Extension />,
);

function Extension() {
  return <Text>你好，你当前的积分数为：2000</Text>;
}

```

## 整页扩展

:::
二、功能描述（静态页面）

在账户客户页插入一个全屏扩展。
:::

1.  新建扩展
    
    方式一：通过命令参数，直接创建整页扩展模板（由于 shopify 命令问题存在失败的概率）
    
    ```powershell
    shopify app generate extension --template customer_account_ui --name loyalty-hub
    ```
    
    方式二：通过常规命令创建非整页扩展，手动配置整页扩展
    
    ```powershell
    shopify app generate extension --name loyalty-hub
    ```
    
2.  shopify.extension.toml 文件
    
    ```powershell
    # Learn more about configuring your Customer account UI extension:
    # https://shopify.dev/api/customer-account-ui-extensions/unstable/configuration
    
    # The version of APIs your extension will receive. Learn more:
    # https://shopify.dev/docs/api/usage/versioning
    api_version = "2025-07"
    
    [[extensions]]
    name = "Loyalty hub"
    handle = "loyalty-hub"
    type = "ui_extension"
    uid = "ef5bf05f-8ed5-f37f-c3bd-b32837afeab34432a109"
    
    # Controls where in Shopify your extension will be injected,
    # and the file that contains your extension’s source code. Learn more:
    # https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/extension-targets-overview
    
    [[extensions.targeting]]
    module = "./src/HubBlock.tsx"
    target = "customer-account.page.render"
    
    [extensions.capabilities]
    # Gives your extension access to directly query Shopify’s storefront API.
    # https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/configuration#api-access
    api_access = true
    
    # Gives your extension access to make external network calls, using the
    # JavaScript `fetch()` API. Learn more:
    # https://shopify.dev/docs/api/customer-account-ui-extensions/unstable/configuration#network-access
    # network_access = true
    
    ```
    
3.  UI 组件
    
    ```tsx
    import {
      Banner,
      BlockStack,
      reactExtension,
      TextBlock,
      useApi
    } from "@shopify/ui-extensions-react/customer-account";
    
    export default reactExtension(
      "customer-account.order-status.block.render",
      () => <PromotionBanner />
    );
    
    function PromotionBanner() {
      const { i18n } = useApi();
    
      return (
        <Banner>
          <BlockStack inlineAlignment="center" >
            <TextBlock>
              我是 Customer Hub
            </TextBlock>
          </BlockStack>
        </Banner>
      );
    }
    
    ```
    
4.  添加扩展块
    

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/31496ce5-f670-4605-80ce-4881d95ec233.png)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4EZlweZNrPKdBqxA/img/43d88b2a-cade-474e-b15d-0c975f3046f4.png)