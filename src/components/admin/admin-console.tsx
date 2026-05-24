"use client";

import {
  App,
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
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  const { message } = App.useApp();
  const router = useRouter();
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
    router.push("/admin/login");
    router.refresh();
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
    { key: "products", icon: <ShoppingOutlined />, label: "商品 CRUD" },
    { key: "categories", icon: <AppstoreOutlined />, label: "分类 CRUD" },
    { key: "filters", icon: <FilterOutlined />, label: "过滤条件" },
    { key: "customers", icon: <UserOutlined />, label: "前台用户" },
    { key: "admins", icon: <TeamOutlined />, label: "后台账号" },
    { key: "settings", icon: <SettingOutlined />, label: "店铺配置" },
  ];

  const settingsInitial = useMemo(() => data.store.settings, [data.store.settings]);

  return (
    <App>
      <Layout className="min-h-[calc(100vh-81px)] bg-transparent">
        <Layout.Sider breakpoint="lg" collapsedWidth="0" className="bg-white" theme="light" width={250}>
          <div className="border-b border-slate-200 px-5 py-5">
            <Typography.Title level={4} style={{ marginBottom: 4 }}>后台管理</Typography.Title>
            <Typography.Text type="secondary">{admin.displayName} ({admin.username})</Typography.Text>
            <div className="mt-4"><Button onClick={logout}>退出后台</Button></div>
          </div>
          <Menu items={menuItems} onClick={(event) => setActiveKey(event.key as ModuleKey)} selectedKeys={[activeKey]} style={{ borderInlineEnd: 0, paddingTop: 12 }} />
        </Layout.Sider>
        <Layout.Content className="p-4 sm:p-6 lg:p-8">
          {activeKey === "products" ? (
            <CardSection title="商品 CRUD" extra={<Button type="primary" onClick={() => { setEditingProductId(null); productForm.resetFields(); setProductModalOpen(true); }}>新增商品</Button>}><Table columns={productColumns} dataSource={data.store.products} rowKey="id" scroll={{ x: 1000 }} /></CardSection>
          ) : null}
          {activeKey === "categories" ? (
            <CardSection title="分类 CRUD" extra={<Button type="primary" onClick={() => { setEditingCategoryId(null); categoryForm.resetFields(); setCategoryModalOpen(true); }}>新增分类</Button>}><Table columns={categoryColumns} dataSource={data.store.categories} rowKey="id" scroll={{ x: 800 }} /></CardSection>
          ) : null}
          {activeKey === "filters" ? (
            <CardSection title="过滤条件 CRUD" extra={<Button type="primary" onClick={() => { setEditingFilterId(null); filterForm.resetFields(); filterForm.setFieldValue("options", []); setFilterModalOpen(true); }}>新增过滤组</Button>}><Table columns={filterColumns} dataSource={data.store.filterGroups} rowKey="id" scroll={{ x: 800 }} /></CardSection>
          ) : null}
          {activeKey === "customers" ? (
            <CardSection title="前台会员列表"><Table columns={customerColumns} dataSource={data.customers} rowKey="id" scroll={{ x: 800 }} /></CardSection>
          ) : null}
          {activeKey === "admins" ? (
            <CardSection title="后台账号管理" extra={<Button type="primary" onClick={() => { adminForm.resetFields(); setAdminModalOpen(true); }}>新增管理员</Button>}><Table columns={adminColumns} dataSource={data.admins} rowKey="id" scroll={{ x: 800 }} /></CardSection>
          ) : null}
          {activeKey === "settings" ? (
            <CardSection title="店铺配置">
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

          <Modal destroyOnHidden footer={null} onCancel={() => setCategoryModalOpen(false)} open={categoryModalOpen} title={editingCategoryId ? "编辑分类" : "新增分类"}>
            <Form form={categoryForm} layout="vertical" onFinish={submitCategory}>
              <Form.Item label="分类名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Slug" name="slug"><Input /></Form.Item>
              <Form.Item label="描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
              <Form.Item initialValue={1} label="排序" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
              <Button htmlType="submit" type="primary">保存分类</Button>
            </Form>
          </Modal>

          <Modal destroyOnHidden footer={null} onCancel={() => setFilterModalOpen(false)} open={filterModalOpen} title={editingFilterId ? "编辑过滤组" : "新增过滤组"} width={760}>
            <Form form={filterForm} layout="vertical" onFinish={submitFilter}>
              <Form.Item label="过滤组名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Slug" name="slug"><Input /></Form.Item>
              <Form.Item label="描述" name="description"><Input.TextArea rows={2} /></Form.Item>
              <Form.Item initialValue={1} label="排序" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><Typography.Text strong>过滤选项</Typography.Text><Button onClick={() => add({ isActive: true, sortOrder: fields.length + 1 })}>新增选项</Button></div>
                    {fields.map((field, index) => (
                      <Card key={field.key} size="small" title={`选项 ${index + 1}`} extra={<Button danger type="link" onClick={() => remove(field.name)}>删除</Button>}>
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
              <div className="mt-4"><Button htmlType="submit" type="primary">保存过滤组</Button></div>
            </Form>
          </Modal>

          <Modal destroyOnHidden footer={null} onCancel={() => setProductModalOpen(false)} open={productModalOpen} title={editingProductId ? "编辑商品" : "新增商品"} width={860}>
            <Form form={productForm} layout="vertical" onFinish={submitProduct}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <Button htmlType="submit" type="primary">保存商品</Button>
            </Form>
          </Modal>

          <Modal destroyOnHidden footer={null} onCancel={() => setAdminModalOpen(false)} open={adminModalOpen} title="管理员账号">
            <Form form={adminForm} layout="vertical" onFinish={submitAdmin}>
              <Form.Item hidden name="id"><Input /></Form.Item>
              <Form.Item label="账号" name="username" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="显示名" name="displayName" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="邮箱" name="email"><Input /></Form.Item>
              <Form.Item label="密码（编辑时留空表示不改）" name="password"><Input.Password /></Form.Item>
              <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
              <Button htmlType="submit" type="primary">保存管理员</Button>
            </Form>
          </Modal>
        </Layout.Content>
      </Layout>
    </App>
  );
}

function CardSection({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title>
        {extra}
      </div>
      {children}
    </div>
  );
}
