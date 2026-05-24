# NextMail Mall

一个基于 Next.js App Router 的前后台一体化商城示例项目，当前已经包含邮箱密码登录注册、商品首页、购物车、下单流程、订单列表和后台商品配置。项目支持两种数据模式：

- 已配置 `DATABASE_URL` 时：使用 MySQL + Prisma
- 未配置 `DATABASE_URL` 时：店铺和商品配置继续回退到本地 `data/store.json`

## 当前能力

- 商城首页：顶部网站标题、分类筛选导航、商品列表
- 用户体系：支持邮箱 + 密码注册、登录、退出
- 购物车：支持加入商品、数量修改、购物车侧边栏和结算页
- 下单流程：登录后可填写收货信息并创建订单
- 订单中心：支持查看当前登录用户自己的订单列表
- 后台管理：支持编辑店铺信息、分类和商品，并同步前台展示
- 数据层：支持 MySQL + Prisma，同时兼容未配置数据库时的 JSON 回退
- 数据访问层：通过 `src/lib/database.ts` 统一收口认证、会话和订单相关数据库访问
- 接口：提供 `/api/store`、`/api/admin/store`、`/api/auth/*`、`/api/orders`

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9
- Prisma
- MySQL

## 目录说明

```text
src/
  app/
    page.tsx              前台首页
    cart/page.tsx         结算页
    login/page.tsx        登录注册页
    orders/page.tsx       我的订单页
    admin/page.tsx        后台页
    api/store/route.ts    前台店铺数据接口
    api/admin/store/route.ts 后台读写接口
    api/auth/*            登录注册和会话接口
    api/orders/route.ts   下单接口
  components/
    shop/                 前台商城组件
    cart/                 购物车状态和侧边栏
    admin/                后台配置面板
    providers/            购物车与登录态 Provider
  lib/
    database.ts           数据访问层与运行模式判断
    store.ts              店铺数据读写与数据库回退
    auth.ts               登录态与密码处理
    prisma.ts             Prisma Client
prisma/
  schema.prisma           MySQL 数据模型
data/
  store.json              数据库未配置时的回退数据
```

## 环境变量

复制项目根目录下的 `.env.example` 为 `.env.local`，至少填写：

```bash
DATABASE_URL="mysql://root:password@127.0.0.1:3306/nextmail"
AUTH_SECRET="replace-with-a-long-random-string"
```

如果暂时只想体验前台和后台配置，也可以只配置：

```bash
AUTH_SECRET="replace-with-a-long-random-string"
```

此时首页、后台配置和购物车仍可使用，店铺数据会回退到 `data/store.json`；注册、登录和下单接口会提示需要数据库。

## 本地启动

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

启动后访问：

- 前台首页：`http://localhost:3000`
- 登录页：`http://localhost:3000/login`
- 后台页：`http://localhost:3000/admin`
- 结算页：`http://localhost:3000/cart`
- 订单页：`http://localhost:3000/orders`

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run db:generate
npm run db:push
npm run db:seed
```

## 数据说明

- 已配置 MySQL 时，店铺配置、商品、用户和订单会走数据库
- 未配置 MySQL 时，店铺配置和商品仍会读写 `data/store.json`
- 登录注册和下单功能依赖 MySQL，未配置时接口会返回明确提示
- `npm run db:seed` 会把 `data/store.json` 中的默认店铺、分类和商品同步到数据库
- 购物车数据保存在浏览器 `localStorage`
- 购物车会在页面加载时根据最新商品数据自动同步，避免超出库存或引用已下架商品
- 下单成功后会自动扣减库存，并在订单中心展示快照数据
- 站点标题、首页分类筛选和商品列表都由后台配置驱动，保存后前台会读取最新配置

## 后续可扩展方向

- 接入支付流程和订单状态流转
- 增加商品图片、搜索、排序和分页
- 为后台增加表单校验、图片上传和权限控制
- 增加后台订单管理和用户管理
