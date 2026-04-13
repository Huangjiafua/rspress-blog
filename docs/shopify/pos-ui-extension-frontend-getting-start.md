# POS UI Extension Frontend Getting Start

# 简介

## POS UI Extension

[++POS UI Extension++](https://shopify.dev/docs/api/pos-ui-extensions/2025-01) 可被用于构建 Shopify POS 应用的用户界面和功能，提供本机应用程序固有的性能和可访问性，允许开发者扩展 Shopify POS 系统的用户界面。

## 优劣分析

_**优势（Strengths）**_

**灵活性**：提供多种扩展点（Extension Target）

**统一性**：使用 React 技术栈，降低学习成本

**功能丰富**：提供完整的组件库和 API 支持

**UI 一致性：**使用 POS UI 组件，确保扩展的界面与 POS 系统保持一致

**兼容性**：IOS 和 Android

_**劣势（Weaknesses）**_

**灵活性：**不支持使用传统的 HTML 元素，仅支持官方提供的 UI 组件

## Target

[++Target++](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/extension-targets-overview) 定义了 POS UI Extension 在 Shopify POS 应用中的具体显示位置。它帮助开发者准确定位扩展组的展示区域。当添加 Target 时，需要在 shopify.extension.toml 中配置 Target 的文件路径，如以下示例：

```toml
[[extensions.targeting]]
module = "./src/Tile.tsx" # 对应的 target 文件
target = "pos.home.tile.render"

[[extensions.targeting]]
module = "./src/Modal.tsx"
target = "pos.home.modal.render"
```

1.  **Smart Grid** 是 POS 应用主界面的网格化的 Tile (磁贴) 布局方式
    
    >  [pos.home.modal.render](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/targets/smart-grid/pos-home-tile-render)
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/3441f87e-6046-4737-971b-033f6508ab3d.png)
    
2.  **Product details**
    

> [pos.product-details.block.render](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/targets/product-details/pos-product-details-block-render)

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/6f4a3bb1-fb49-40dc-9d4b-fd2ffe5e23b4.png)

## API

Shopify POS UI Extensions 提供了一系列的 [++API++](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/apis)，使开发者能够获取和管理 Target 的状态，从而更高效地构建与 POS 系统深度集成的功能，确保扩展应用能够无缝融入 Shopify POS 的零售体验。

:::
useApi Hook 的返回值：在官方文档中并未详细列出 useApi 返回的具体字段和方法，需要我们自行打印查看。

API 使用条件：不同的 API 在 POS UI Extensions 中有其特定的使用场景（Target）。开发者在实现功能时，需要参考官方 API 文档，确保所选择的 API 与目标扩展场景（Target）相匹配。
:::

这里对较为重要的几个 API 进行代码演示：

> [Session API](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/apis/session-api)：全局 Target 均可调用的 API，可用于获取会话令牌，以实现鉴权，有效期 1 分钟

```tsx
const SmartGridModal = () => {
  // const { session: {currentSession, getSessionToken }} = useApi();

  const { session: {currentSession, getSessionToken }} =
    useApi<'pos.home.modal.render'>();
  
  return <>...</>
}

export default reactExtension('pos.home.modal.render', () => (
  <SmartGridModal />
));

// jwt 解析结果
{
  "iss": "https://loloyal-checkout.myshopify.com/admin",
  "dest": "https://loloyal-checkout.myshopify.com",
  "aud": "439617d93d452f065b8cd6122493ccc3",
  "sub": "90467008680",
  "exp": 1739782290,
  "nbf": 1739782230,
  "iat": 1739782230,
  "jti": "354762fc-e3b5-409e-8616-18e236db68c1",
  "sid": "71561728-8b4e-4ccf-a598-2e105e673d57",
  "sig": "627196a4ef469148eaae95ce8945290997bb0ae4b940f613c7b4f71a0ffcbdc2"
}
```

> [Navigation API](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/apis/navigation-api): 支持在同一个 Target 中进行 Screen 切换

```tsx
const SmartGridModal = () => {
  const api = useApi<'pos.home.modal.render'>();

  return (
    <Navigator>
      <Screen name="ScreenOne" title="Screen One Title">
        <Button
          title="Navigate to Screen Two"
          onPress={() => api.navigation.navigate('ScreenTwo')}
        />
      </Screen>
      
      <Screen name="ScreenTwo" title="Screen Two Title">
        <Button
          title="Navigate to Screen One"
          onPress={() => api.navigation.navigate('ScreenOne')}
        />
      </Screen>
    </Navigator>
  );
};

export default reactExtension('pos.home.modal.render', () => (
  <SmartGridModal />
));

```

> [Cart API](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/apis/cart-api)：使 UI 扩展能够管理和与 POS 购物车内容交互，并支持订阅购物车信息更新

:::
踩坑指南：由于 Shopify 官方文档中没有提供如何在 Smart Grid 的 Target 中获取顾客信息的 API，查阅开发者论坛，可通过订阅购物车信息更新的方式获取用户信息：[Extracting customer id from POS modal render extension](https://community.shopify.com/c/retail-and-point-of-sale/extracting-customer-id-from-pos-modal-render-extension/m-p/2094463)
:::
```tsx
const Modal = () => {
  const api = useApi()

  api.cart.subscribable.subscribe(cart => {console.log(cart.customer)})
}

export default reactExtension('pos.home.modal.render', () => <Modal />);
```

## Component

Shopify 官方提供了一套完整的 [++UI 组件库++](https://shopify.dev/docs/api/pos-ui-extensions/2025-01/components)，用于构建与 Shopify POS 系统无缝集成的扩展应用，确保了扩展应用在视觉和交互上与原生 POS 界面保持一致，从而提供一致且流畅的用户体验。

# 启动

## 环境准备

1.  window/mac + Shopify POS App (mobie)
    
2.  Shopify cli 3.x
    
3.  在 Shopify POS 中嵌入 APP (B 端应用)
    

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/cc365890-228e-470b-8ce3-cee6588fc7ce.png)

## 项目搭建

1.  创建 POS 扩展模板
    
    ```powershell
    # shopify app generate extension
    npm shopify app generate extension #pnpm shopify app generate extension
    
    ```
    
2.  链接到对应的 App
    
3.  POS UI 模板配置
    

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/988c1e47-0ae4-4258-a9c1-5af5c1fa3c59.png)

## 本地调试

1.  安装依赖
    
    ```powershell
    npm i # pnpm i
    ```
    
2.  在开发店铺运行本地扩展
    
    ```powershell
    # shopify app dev
    npm shopify app dev # pnpm shopify app dev
    
    # 登录开发者账号
    # 关联开发店铺进行调试
    ```
    
3.  使用移动设备浏览器打开链接，将会启动 POS 应用，并进入开发模式；
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4j6OJM1Pwe7Rq3p8/img/749cbd48-9e22-4b7e-905c-3c6e288ea50b.png)
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/4j6OJM1Pwe7Rq3p8/img/80613012-791c-48fb-bc48-5daef5644374.png)
    
    :::
    踩坑指南：执行 npm shopify app dev 命令时，会出现报错：
    
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
    
4.  POS 应用添加 POS UI 扩展，可进行预览；当更新代码时，会自动重新想渲染 Smart grid
    
    ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/336a5223-6d9d-496d-8efb-42b7e95a972c.png)
    
5.  如何在浏览器中查看和调试由控制台打印输出的信息
    

:::
这里以 Mac & IOS 为例
:::

1.  IOS 启用 Web 检查器：设置 → Safari → 高级 → 打开"Web 检查器"
    
2.  Mac: Safari → 设置 → 高级 → 勾选 "在菜单栏中显示 '开发'" 菜单”
    
3.  将移动设备与 Mac 连接，点击菜单栏的开发，选择用户下的 extension.shopifycdn.com — load.html
    

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/18795d4a-7675-4a91-9dee-4e4ab8ad1474.png)

# 实践

:::
功能描述（静态页面）

首页展示 Tile，点击后弹起 Modal 弹窗

Modal 弹窗展示顾客信息、优惠券模板列表

点击优惠券模板，将其应用到购物车，并返回 POS 应用首页

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/ea54a4ee-e2ee-4873-8615-dbb433e98610.png)                                 ![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/ABmOoZ8V4DD2qawZ/img/7bf88463-1900-41c7-bbf7-1a7636f96b34.png)
:::

1.  配置 shopify.extension.toml 文件，注册 Target: `pos.home.tile.render`和 `pos.home.modal.render`
    
    ```toml
    [[extensions.targeting]]
    module = "./src/HomeTile.tsx"
    target = "pos.home.tile.render"
    
    [[extensions.targeting]]
    module = "./src/HomeModal.tsx"
    target = "pos.home.modal.render"
    ```
    
2.  Tile.tsx: Target`pos.home.tile.render`
    
    ```tsx
    import React from 'react';
    
    import { Tile, reactExtension, useApi } from '@shopify/ui-extensions-react/point-of-sale';
    
    const TileComponent = () => {
      const api = useApi<'pos.home.tile.render'>();
    
      return (
        <Tile
          title="Loloyal"
          subtitle="No customer added"
          onPress={() => {
            api.action.presentModal()
          }}
          enabled
        />
      )
    }
    
    export default reactExtension('pos.home.tile.render', () => {
      return <TileComponent />
    })
    
    ```
    
3.  Modal: Target `pos.home.modal.render`
    

```tsx
import type { BadgeVariant } from '@shopify/ui-extensions-react/point-of-sale';
import { Badge, Banner, Box, Button, Icon, Image, Navigator, reactExtension, Screen, ScrollView, Section, Stack, Text, useApi, useCartSubscription } from '@shopify/ui-extensions-react/point-of-sale';
import React, { useEffect, useState } from 'react';
const Modal = () => {
  const api = useApi()
  const [token, setToken] = useState('')
  const [customerData, setCustomerData] = useState({
    name: 'Ann',
    status: 1,
    points: 1000,
    birthday_date: 'Oct 25, 1980'
  })
  api.cart.subscribable.subscribe(cart => {console.log(cart.customer)})

  const couponsData = [
    {
      type: 'FixedAmount',
      discountValue: '10',
      pointsRequired: 10,
    },
    {
      type: 'Percentage',
      discountValue: '0.01',
      pointsRequired: 20,
    }
  ]

  const getCouponActionText = (couponType: string, amount: string) => {
    switch (couponType) {
      case 'FixedAmount':
        return `Add $${amount} discount`
      case 'Percentage':
        return `${Number(amount) * 100}% discount`
      default:
        return ''
    }
  }

  useEffect(() => {
    getCustomerDetails()
  }, [])

  const getCustomerDetails = async () => {
    const tokenResult = await getToken()
    if (!tokenResult) return
    setToken(tokenResult)
  }

  const setCartDiscount = () => {
    api.cart.applyCartDiscount('Percentage', '10% percentage', '')
  }

  async function getToken() {
    if (!api) return
    return api.session.getSessionToken()
  }


  const userSection = (
    <Section>
      <Box padding='300'>
        <Stack direction='block' gap='400'>
          <Stack gap='300' alignItems='center' alignContent='stretch'>
            <Box>
              <Text variant="captionRegularTall">{customerData.name}</Text>
            </Box>
          </Stack>
          <Stack alignItems='center' alignContent='stretch' gap='200'>
            <Icon name="staff" size='major' />
            <Text variant='captionRegular' color="TextSubdued">Richmond Huang</Text>
          </Stack>
          <Stack alignItems='center' gap='200'>
            <Icon name="star" size='major' />
            <Text variant='captionRegular' color="TextSubdued">Points balance: {customerData.points}</Text>
          </Stack>
          <Box>
            <Stack alignItems='center' alignContent='space-between' gap='200'>
              <Stack alignItems='center' gap='200'>
                <Icon name="clock" size='major' />
                <Text variant='captionRegular' color="TextSubdued">Birthday: {customerData.birthday_date}</Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Section>
  )

  const couponSection = (
    <Section>
      <Box padding='300'>
        <Stack direction='block' alignContent='stretch' gap='400'>
          {couponsData.map((item, index) => {
            return (
              <Stack direction='block' alignContent='stretch' gap='100' key={index}>
                <Box paddingBlockEnd='200'><Text variant='captionMedium' color="TextSubdued">-{`${item.pointsRequired} ${item.pointsRequired > 1 ? 'points' : 'point'}`}</Text></Box>
                <Button type='basic' title={getCouponActionText(item.type, item.discountValue)} onPress={setCartDiscount}></Button>
              </Stack>
            )
          })}
        </Stack>
      </Box>
    </Section>
  )

  if (!customerData) return null


  return (
    <Navigator>

      <Screen name="LoyaltyProgram" title="Loloyal: Loyalty Program">
        <ScrollView>
          <Box paddingBlockEnd='400'>
            <Banner hideAction={true} visible={true} title='A discount has already been applied to the cart. Remove it to apply a new one.' variant='alert' />
          </Box>
          {userSection}
          <Box paddingBlockStart='400' paddingBlockEnd='300'>
            <Text variant='headingSmall'>Redeem and apply reward</Text>
          </Box>
          {couponSection}
        </ScrollView>
      </Screen>
    </Navigator>
  )
}

export default reactExtension('pos.home.modal.render', () => <Modal />);

```

:::
踩坑指南（Version: 2025.01, Date: 2025-02-21）：**组件状态污染**

**按钮状态污染案例：**在两个互斥条件渲染的按钮（A启用、B禁用）中，A按钮在B按钮渲染后再渲染时，A按钮错误地继承了B按钮的禁用状态。

**渲染效果：**  

```tsx
const Modal = () => {
  const [tabSelected, setTabSelected] = useState<Segment>('1')

  return (
    <>
      <SegmentedControl
        segments={[
          {
            id: 'template',
            label: languageData.redeemRewards,
            disabled: false,
          },
          {
            id: 'coupon',
            label: languageData.availableDiscount,
            disabled: false,
          },
        ]}
        selected={tabSelected}
        onSelect={(id) => setTabSelected(id as Segment)}
      />

        {
            tabSelected === 'template' ? <Button title='Enable' /> : <Button title='Disabled' isDisabled={true} /> 
        }
    </>
  )
}

export default reactExtension('pos.home.modal.render', () => <Modal />);
```

[请至钉钉文档查看附件《demo.mp4》](https://alidocs.dingtalk.com/i/nodes/m9bN7RYPWdzQj10rTq565pmgJZd1wyK0?doc_type=wiki_doc&iframeQuery=anchorId%3DX02m7eajx9zv6hv6fh9luj)

**解决方案**：①为组件提供一个唯一的 key（推荐）；②为产生 UI 冲突的组件相同的属性设置不同的值进行覆盖。
:::