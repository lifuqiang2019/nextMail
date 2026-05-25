"use client";

import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  FilterOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type {
  AdminProfile,
  Category,
  FilterGroup,
  Product,
  StoreData,
  StoreSettings,
} from "@/types/store";

type AdminDashboardData = {
  store: StoreData;
  customers: Array<{ id: string; name: string; email: string; isActive: boolean; createdAt: string }>;
  admins: Array<{ id: string; username: string; displayName: string; email?: string | null; isActive: boolean; createdAt: string }>;
};

type ModuleKey = "settings" | "categories" | "filters" | "products" | "customers" | "admins";

type ProductFormValues = Product & { sizesInput?: string };
type FilterGroupFormValues = FilterGroup;

export function AdminConsole({ admin, initialData }: { admin: AdminProfile; initialData: AdminDashboardData }) {
  const [activeKey, setActiveKey] = useState<ModuleKey>("products");
  const [data, setData] = useState(initialData);
  const [categoryForm] = Form.useForm<Category>();
  const [filterForm] = Form.useForm<FilterGroupFormValues>();
  const [productForm] = Form.useForm<ProductFormValues>();
  const [adminForm] = Form.useForm();
  const [settingsForm] = Form.useForm<StoreSettings>();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const refreshData = async () => {
    const response = await fetch("/api/admin/bootstrap", { cache: "no-store" });
    const nextData = await response.json();
    setData(nextData);
    settingsForm.setFieldsValue(nextData.store.settings);
  };

  const saveSettings = async (values: StoreSettings) => {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) {
      message.error(payload.message || "保存店铺配置失败");
      return;
    }
    message.success("店铺配置已保存");
    await refreshData();
  };

  const submitCategory = async (values: Category) => {
    const response = await fetch("/api/admin/categories", {
      method: editingCategoryId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCategoryId ? { ...values, id: editingCategoryId } : values),
    });
    const payload = await response.json();
    if (!response.ok) {
      message.error(payload.message || "保存分类失败");
      return;
    }
    message.success(editingCategoryId ? "分类已更新" : "分类已创建");
    setCategoryModalOpen(false);
    setEditingCategoryId(null);
    categoryForm.resetFields();
    await refreshData();
  };

  const removeCategory = async (id: string) => {
    const response = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json();
    if (!response.ok) {
      message.error(payload.message || "删除分类失败");
      return;
    }
    message.success("分类已删除");
    await refreshData();
  };

  const submitFilter = async (values: FilterGroupFormValues) => {
    const response = await fetch("/api/admin/filters", {
      method: editingFilterId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingFilterId ? { ...values, id: editingFilterId } : values),
    });
    const payload = await response.json();
    if (!response.ok) {
      message.error(payload.message || "保存过滤条件失败");
      return;
    }
    message.success(editingFilterId ? "过滤条件已更新" : "过滤条件已创建");
    setFilterModalOpen(false);
    setEditingFilterId(null);
    filterForm.resetFields();
    await refreshData();
  };

  const removeFilter = async (id: string) => {
    const response = await fetch("/api/admin/filters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json();
    if (!response.ok) {
      message.error(payload.message || "删除过滤条件失败");
      return;
    }
    message.success("过滤条件已删除");
    await refreshData();
  };

  const submitProduct = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      sizes: (values.sizesInput || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const response = await fetch("/api/admin/products", {
      method: editingProductId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProductId ? { ...payload, id: editingProductId } : payload),
    });
    const json = await response.json();
    if (!response.ok) {
      message.error(json.message || "保存商品失败");
      return;
    }
    message.success(editingProductId ? "商品已更新" : "商品已创建");
    setProductModalOpen(false);
    setEditingProductId(null);
    productForm.resetFields();
    await refreshData();
  };

  const removeProduct = async (id: string) => {
    const response = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await response.json();
    if (!response.ok) {
      message.error(json.message || "删除商品失败");
      return;
    }
    message.success("商品已删除");
    await refreshData();
  };

  const submitAdmin = async (values: {
    username: string;
    displayName: string;
    email?: string;
    password?: string;
    id?: string;
    isActive?: boolean;
  }) => {
    const response = await fetch("/api/admin/admin-users", {
      method: values.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await response.json();
    if (!response.ok) {
      message.error(json.message || "保存管理员失败");
      return;
    }
    message.success(values.id ? "管理员已更新" : "管理员已创建");
    setAdminModalOpen(false);
    adminForm.resetFields();
    await refreshData();
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  const flatFilterOptions = useMemo(
    () =>
      data.store.filterGroups.flatMap((group) =>
        group.options.map((option) => ({
          label: `${group.name} / ${option.label}`,
          value: option.id,
        })),
      ),
    [data.store.filterGroups],
  );

  const categoryColumns: ColumnsType<Category> = [
    { title: "分类名称", dataIndex: "name" },
    { title: "Slug", dataIndex: "slug", render: (value) => value || "-" },
    { title: "描述", dataIndex: "description" },
    { title: "排序", dataIndex: "sortOrder" },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "停用"}</Tag> },
    {
      title: "操作",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => { setEditingCategoryId(record.id); categoryForm.setFieldsValue(record); setCategoryModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确认删除该分类？" onConfirm={() => removeCategory(record.id)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filterColumns: ColumnsType<FilterGroup> = [
    { title: "过滤组", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    { title: "选项数量", render: (_, record) => record.options.length },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "停用"}</Tag> },
    {
      title: "操作",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => { setEditingFilterId(record.id); filterForm.setFieldsValue(record); setFilterModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确认删除该过滤组？" onConfirm={() => removeFilter(record.id)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const productColumns: ColumnsType<Product> = [
    { title: "商品", dataIndex: "name" },
    { title: "品牌", dataIndex: "brand" },
    { title: "分类", dataIndex: "categoryId", render: (value) => data.store.categories.find((item) => item.id === value)?.name || value },
    { title: "售价", dataIndex: "price" },
    { title: "库存", dataIndex: "inventory" },
    {
      title: "过滤条件",
      render: (_, record) => (
        <Space wrap>
          {record.filterOptionIds.map((optionId) => {
            const option = data.store.filterGroups.flatMap((group) => group.options).find((item) => item.id === optionId);
            return option ? <Tag key={optionId}>{option.label}</Tag> : null;
          })}
        </Space>
      ),
    },
    {
      title: "操作",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => { setEditingProductId(record.id); productForm.setFieldsValue({ ...record, sizesInput: record.sizes.join(",") }); setProductModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确认删除该商品？" onConfirm={() => removeProduct(record.id)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const customerColumns: ColumnsType<(typeof data.customers)[number]> = [
    { title: "昵称", dataIndex: "name" },
    { title: "邮箱", dataIndex: "email" },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "正常" : "停用"}</Tag> },
    { title: "注册时间", dataIndex: "createdAt", render: (value) => new Date(value).toLocaleString() },
  ];

  const adminColumns: ColumnsType<(typeof data.admins)[number]> = [
    { title: "账号", dataIndex: "username" },
    { title: "显示名", dataIndex: "displayName" },
    { title: "邮箱", dataIndex: "email", render: (value) => value || "-" },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "停用"}</Tag> },
    { title: "操作", render: (_, record) => <Button type="link" onClick={() => { adminForm.setFieldsValue(record); setAdminModalOpen(true); }}>编辑账号</Button> },
  ];

  const menuItems = [
    { key: "products", icon: <ShoppingOutlined />, label: "商品管理" },
    { key: "categories", icon: <AppstoreOutlined />, label: "分类管理" },
    { key: "filters", icon: <FilterOutlined />, label: "过滤条件" },
    { key: "customers", icon: <UserOutlined />, label: "会员用户" },
    { key: "admins", icon: <TeamOutlined />, label: "后台账号" },
    { key: "settings", icon: <SettingOutlined />, label: "店铺配置" },
  ];

  const settingsInitial = useMemo(() => data.store.settings, [data.store.settings]);
  const moduleMeta: Record<ModuleKey, { title: string; description: string; detail: string }> = {
    products: {
      title: "商品管理",
      description: "集中维护商品信息、库存、价格和过滤条件，后台改完前台会直接同步展示。",
      detail: `共 ${data.store.products.length} 个商品，其中 ${data.store.products.filter((item) => item.status === "ACTIVE").length} 个处于上架状态。`,
    },
    categories: {
      title: "分类管理",
      description: "调整分类名称、排序和启用状态，影响首页筛选和后台商品归类。",
      detail: `当前共有 ${data.store.categories.length} 个分类，已启用 ${data.store.categories.filter((item) => item.isActive).length} 个。`,
    },
    filters: {
      title: "过滤组管理",
      description: "维护颜色、尺码等筛选维度，商品列表和筛选逻辑会依赖这里的配置。",
      detail: `共有 ${data.store.filterGroups.length} 个过滤组，合计 ${data.store.filterGroups.reduce((sum, group) => sum + group.options.length, 0)} 个选项。`,
    },
    customers: {
      title: "前台会员",
      description: "查看前台注册用户和状态，便于核对账号开通情况。",
      detail: `目前共有 ${data.customers.length} 位会员，其中 ${data.customers.filter((item) => item.isActive).length} 位为正常状态。`,
    },
    admins: {
      title: "后台账号",
      description: "管理后台可登录账号，控制运营人员的访问权限和启用状态。",
      detail: `当前已有 ${data.admins.length} 个后台账号，启用中 ${data.admins.filter((item) => item.isActive).length} 个。`,
    },
    settings: {
      title: "店铺配置",
      description: "统一维护商城展示文案、联系方式和下单说明，减少到处改文案的成本。",
      detail: `当前店铺名称为「${data.store.settings.storeName}」，首页和下单页都会读取这里的配置。`,
    },
  };

  const dashboardStats = useMemo(
    () => [
      {
        label: "商品总数",
        value: data.store.products.length,
        helper: `${data.store.products.filter((item) => item.status === "ACTIVE").length} 个上架中`,
        icon: <ShoppingOutlined />,
        tone: "bg-sky-50 text-sky-600",
      },
      {
        label: "分类 / 过滤",
        value: `${data.store.categories.length} / ${data.store.filterGroups.length}`,
        helper: `${data.store.filterGroups.reduce((sum, group) => sum + group.options.length, 0)} 个筛选项`,
        icon: <AppstoreOutlined />,
        tone: "bg-violet-50 text-violet-600",
      },
      {
        label: "会员数量",
        value: data.customers.length,
        helper: `${data.customers.filter((item) => item.isActive).length} 个正常账号`,
        icon: <UserOutlined />,
        tone: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "后台账号",
        value: data.admins.length,
        helper: `${data.admins.filter((item) => item.isActive).length} 个启用中`,
        icon: <TeamOutlined />,
        tone: "bg-amber-50 text-amber-600",
      },
    ],
    [data],
  );

  const currentModule = moduleMeta[activeKey];
  const currentMenuItem = menuItems.find((item) => item.key === activeKey);

  return (
    <Layout className="tm-admin-shell min-h-screen bg-[#f8fafc]">
        <Layout.Sider
          breakpoint="lg"
          collapsedWidth="0"
          className="!bg-transparent p-3"
          theme="light"
          width={288}
        >
          <div className="tm-admin-sidebar flex h-full flex-col overflow-hidden rounded-[30px] px-4 py-5 shadow-sm">
            <div className="border-b border-slate-200 px-2 pb-5">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium tracking-[0.2em] text-slate-500">
                NEXTMAIL ADMIN
              </div>
              <Typography.Title level={3} style={{ margin: "16px 0 6px", color: "#0f172a" }}>
                后台管理台
              </Typography.Title>
              <Typography.Paragraph style={{ margin: 0, color: "#64748b" }}>
                商品、筛选、用户和店铺配置都集中在这里维护。
              </Typography.Paragraph>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">当前登录</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{admin.displayName}</div>
              <div className="text-sm text-slate-500">{admin.username}</div>
              <Button className="mt-4 h-11 w-full rounded-full border-slate-200 bg-white text-slate-600 shadow-none hover:!border-slate-300 hover:!bg-slate-50 hover:!text-slate-900" onClick={logout}>
                退出后台
              </Button>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto">
              <div className="px-2 pb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">功能导航</div>
              <Menu
                className="tm-admin-menu"
                items={menuItems}
                onClick={(event) => setActiveKey(event.key as ModuleKey)}
                selectedKeys={[activeKey]}
                theme="light"
                style={{ borderInlineEnd: 0, background: "transparent" }}
              />
            </div>

            <div className="mt-4 rounded-[22px] border border-orange-100 bg-orange-50/50 px-4 py-4 text-sm">
              <div className="font-medium text-orange-900">当前聚焦</div>
              <div className="mt-1 leading-6 text-orange-800/80">{currentModule.detail}</div>
            </div>
          </div>
        </Layout.Sider>
        <Layout.Content className="min-w-0 p-4 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-[1560px] space-y-5">
            <div className="tm-admin-hero grid gap-4 overflow-hidden rounded-[32px] border border-slate-200 px-5 py-5 shadow-sm sm:px-6 sm:py-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-sm font-medium text-orange-700 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    {currentMenuItem?.icon}
                  </span>
                  {currentMenuItem?.label}
                </div>
                <div className="space-y-3">
                  <Typography.Title level={2} style={{ margin: 0, color: "#0f172a" }}>
                    {currentModule.title}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: 0, color: "#475569", fontSize: 16, maxWidth: 820 }}>
                    {currentModule.description}
                  </Typography.Paragraph>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600">
                    店铺名称: <span className="font-semibold text-slate-900">{data.store.settings.storeName}</span>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600">
                    当前管理员: <span className="font-semibold text-slate-900">{admin.displayName}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-500">当前状态</div>
                  <div className="mt-3 text-lg font-semibold leading-8 text-slate-950">{currentModule.detail}</div>
                  <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    数据已同步到当前模块
                  </div>
                </div>
                <div className="rounded-[26px] border border-orange-100 bg-orange-50 p-5">
                  <div className="text-sm font-medium text-orange-800/80">运营提醒</div>
                  <div className="mt-3 text-lg font-semibold leading-8 text-orange-950">
                    修改配置后，前台页面会直接读取最新数据，适合做日常运营维护。
                  </div>
                  <div className="mt-4 text-sm text-orange-800/80">建议优先维护商品、分类和筛选项的一致性。</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((item) => (
                <div
                  key={item.label}
                  className="tm-admin-stat-card rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg ${item.tone}`}>
                      {item.icon}
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      实时概览
                    </div>
                  </div>
                  <div className="mt-6 text-sm font-medium text-slate-500">{item.label}</div>
                  <div className="mt-2 text-[32px] font-semibold leading-none text-slate-950">
                    {item.value}
                  </div>
                  <div className="mt-3 text-sm text-slate-500">{item.helper}</div>
                </div>
              ))}
            </div>

            {activeKey === "products" ? (
              <CardSection
                title="商品管理"
                description="商品列表支持直接编辑价格、库存、分类和过滤条件，适合日常运营快速维护。"
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      setEditingProductId(null);
                      productForm.resetFields();
                      setProductModalOpen(true);
                    }}
                  >
                    新增商品
                  </Button>
                }
              >
                <Table
                  className="tm-admin-data-table"
                  columns={productColumns}
                  dataSource={data.store.products}
                  pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                />
              </CardSection>
            ) : null}
            {activeKey === "categories" ? (
              <CardSection
                title="分类管理"
                description="分类会同步影响前台导航和商品归类，建议按展示顺序维护。"
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      setEditingCategoryId(null);
                      categoryForm.resetFields();
                      setCategoryModalOpen(true);
                    }}
                  >
                    新增分类
                  </Button>
                }
              >
                <Table
                  className="tm-admin-data-table"
                  columns={categoryColumns}
                  dataSource={data.store.categories}
                  pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                  rowKey="id"
                  scroll={{ x: 800 }}
                />
              </CardSection>
            ) : null}
            {activeKey === "filters" ? (
              <CardSection
                title="过滤条件"
                description="过滤组选项会参与前台筛选和商品绑定，适合集中配置颜色、尺码等维度。"
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      setEditingFilterId(null);
                      filterForm.resetFields();
                      filterForm.setFieldValue("options", []);
                      setFilterModalOpen(true);
                    }}
                  >
                    新增过滤组
                  </Button>
                }
              >
                <Table
                  className="tm-admin-data-table"
                  columns={filterColumns}
                  dataSource={data.store.filterGroups}
                  pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                  rowKey="id"
                  scroll={{ x: 800 }}
                />
              </CardSection>
            ) : null}
            {activeKey === "customers" ? (
              <CardSection
                title="前台会员列表"
                description="这里展示前台注册会员信息，方便核对账号状态和注册时间。"
              >
                <Table
                  className="tm-admin-data-table"
                  columns={customerColumns}
                  dataSource={data.customers}
                  pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                  rowKey="id"
                  scroll={{ x: 800 }}
                />
              </CardSection>
            ) : null}
            {activeKey === "admins" ? (
              <CardSection
                title="后台账号管理"
                description="后台账号用于运营和维护店铺内容，建议保持最小化授权。"
                extra={
                  <Button
                    type="primary"
                    onClick={() => {
                      adminForm.resetFields();
                      setAdminModalOpen(true);
                    }}
                  >
                    新增管理员
                  </Button>
                }
              >
                <Table
                  className="tm-admin-data-table"
                  columns={adminColumns}
                  dataSource={data.admins}
                  pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                  rowKey="id"
                  scroll={{ x: 800 }}
                />
              </CardSection>
            ) : null}
            {activeKey === "settings" ? (
              <CardSection
                title="店铺配置"
                description="配置会直接影响首页展示、下单说明和联系方式，适合统一维护。"
              >
                <Form initialValues={settingsInitial} form={settingsForm} layout="vertical" onFinish={saveSettings}>
                  <Form.Item label="店铺名称" name="storeName" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item label="首页标题" name="heroTitle" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item label="首页副标题" name="heroSubtitle" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
                  <Form.Item label="公告文案" name="heroNotice"><Input.TextArea rows={3} /></Form.Item>
                  <Form.Item label="联系电话" name="supportPhone"><Input /></Form.Item>
                  <Form.Item label="联系邮箱" name="supportEmail"><Input /></Form.Item>
                  <Form.Item label="购买说明（下单页显示）" name="purchaseGuide"><Input.TextArea rows={4} /></Form.Item>
                  <Form.Item label="统一订单链接（所有人可见）" name="orderLink"><Input /></Form.Item>
                  <Button htmlType="submit" type="primary">保存配置</Button>
                </Form>
              </CardSection>
            ) : null}
          </div>

          <Modal centered destroyOnHidden footer={null} onCancel={() => setCategoryModalOpen(false)} open={categoryModalOpen} rootClassName="tm-admin-modal" title={editingCategoryId ? "编辑分类" : "新增分类"}>
            <Form className="tm-admin-modal__form" form={categoryForm} layout="vertical" onFinish={submitCategory}>
              <Form.Item label="分类名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Slug" name="slug"><Input /></Form.Item>
              <Form.Item label="描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
              <Form.Item initialValue={1} label="排序" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
              <div className="tm-admin-modal__actions">
                <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">保存分类</Button>
              </div>
            </Form>
          </Modal>

          <Modal centered destroyOnHidden footer={null} onCancel={() => setFilterModalOpen(false)} open={filterModalOpen} rootClassName="tm-admin-modal" title={editingFilterId ? "编辑过滤组" : "新增过滤组"} width={760}>
            <Form className="tm-admin-modal__form" form={filterForm} layout="vertical" onFinish={submitFilter}>
              <Form.Item label="过滤组名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Slug" name="slug"><Input /></Form.Item>
              <Form.Item label="描述" name="description"><Input.TextArea rows={2} /></Form.Item>
              <Form.Item initialValue={1} label="排序" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <div className="tm-admin-modal__section space-y-4">
                    <div className="tm-admin-modal__section-head">
                      <Typography.Text strong>过滤选项</Typography.Text>
                      <Button onClick={() => add({ isActive: true, sortOrder: fields.length + 1 })}>新增选项</Button>
                    </div>
                    {fields.map((field, index) => (
                      <Card className="tm-admin-modal__option-card" key={field.key} size="small" title={`选项 ${index + 1}`} extra={<Button danger type="link" onClick={() => remove(field.name)}>删除</Button>}>
                        <Form.Item hidden name={[field.name, "id"]}><Input /></Form.Item>
                        <Form.Item label="显示文案" name={[field.name, "label"]} rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item label="值" name={[field.name, "value"]} rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item label="排序" name={[field.name, "sortOrder"]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                        <Form.Item initialValue={true} label="启用" name={[field.name, "isActive"]} valuePropName="checked"><Switch /></Form.Item>
                      </Card>
                    ))}
                  </div>
                )}
              </Form.List>
              <div className="tm-admin-modal__actions">
                <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">保存过滤组</Button>
              </div>
            </Form>
          </Modal>

          <Modal centered destroyOnHidden footer={null} onCancel={() => setProductModalOpen(false)} open={productModalOpen} rootClassName="tm-admin-modal" title={editingProductId ? "编辑商品" : "新增商品"} width={860}>
            <Form className="tm-admin-modal__form" form={productForm} layout="vertical" onFinish={submitProduct}>
              <div className="tm-admin-modal__grid grid grid-cols-1 gap-4 md:grid-cols-2">
                <Form.Item label="商品名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item label="品牌" name="brand" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item label="Slug" name="slug"><Input /></Form.Item>
                <Form.Item label="SKU" name="sku"><Input /></Form.Item>
                <Form.Item label="所属分类" name="categoryId" rules={[{ required: true }]}><Select options={data.store.categories.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item>
                <Form.Item label="标签" name="badge"><Input /></Form.Item>
                <Form.Item label="售价" name="price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                <Form.Item label="划线价" name="originalPrice"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                <Form.Item label="库存" name="inventory" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                <Form.Item label="配色" name="colorway"><Input /></Form.Item>
                <Form.Item label="封面图 URL" name="imageUrl" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item label="状态" initialValue="ACTIVE" name="status"><Select options={[{ label: "ACTIVE", value: "ACTIVE" }, { label: "DRAFT", value: "DRAFT" }]} /></Form.Item>
              </div>
              <Form.Item label="尺码，逗号分隔" name="sizesInput"><Input placeholder="39,40,41,42" /></Form.Item>
              <Form.Item label="过滤条件绑定" name="filterOptionIds"><Select mode="multiple" options={flatFilterOptions} placeholder="选择该商品所属的过滤条件" /></Form.Item>
              <Form.Item initialValue={false} label="推荐商品" name="featured" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item label="描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
              <div className="tm-admin-modal__actions">
                <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">保存商品</Button>
              </div>
            </Form>
          </Modal>

          <Modal centered destroyOnHidden footer={null} onCancel={() => setAdminModalOpen(false)} open={adminModalOpen} rootClassName="tm-admin-modal" title="管理员账号">
            <Form className="tm-admin-modal__form" form={adminForm} layout="vertical" onFinish={submitAdmin}>
              <Form.Item hidden name="id"><Input /></Form.Item>
              <Form.Item label="账号" name="username" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="显示名" name="displayName" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="邮箱" name="email"><Input /></Form.Item>
              <Form.Item label="密码（编辑时留空表示不改）" name="password"><Input.Password /></Form.Item>
              <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
              <div className="tm-admin-modal__actions">
                <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">保存管理员</Button>
              </div>
            </Form>
          </Modal>
        </Layout.Content>
      </Layout>
  );
}

function CardSection({
  title,
  description,
  extra,
  children,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="tm-admin-data-card overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <Typography.Title level={3} style={{ margin: 0, color: "#0f172a" }}>{title}</Typography.Title>
          {description ? (
            <Typography.Paragraph style={{ margin: 0, color: "#64748b" }}>
              {description}
            </Typography.Paragraph>
          ) : null}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}
