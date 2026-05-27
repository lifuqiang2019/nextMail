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
  ShoppingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import type {
  AdminProfile,
  Category,
  FilterGroup,
  Product,
  StoreData,
} from "@/types/store";

type AdminDashboardData = {
  store: StoreData;
  customers: Array<{ id: string; name: string; email: string; isActive: boolean; createdAt: string }>;
  admins: Array<{ id: string; username: string; displayName: string; email?: string | null; isActive: boolean; createdAt: string }>;
};

type ModuleKey = "categories" | "filters" | "products" | "admins";

type ProductFormValues = Product & { sizesInput?: string };
type FilterGroupFormValues = FilterGroup;
type ProductImageUploadResponse = {
  fileName: string;
  url: string;
  size: string;
  contentType: string;
  createdAt: string;
};

export function AdminConsole({ admin, initialData }: { admin: AdminProfile; initialData: AdminDashboardData }) {
  const [activeKey, setActiveKey] = useState<ModuleKey>("products");
  const [data, setData] = useState(initialData);
  const [categoryForm] = Form.useForm<Category>();
  const [filterForm] = Form.useForm<FilterGroupFormValues>();
  const [productForm] = Form.useForm<ProductFormValues>();
  const [adminForm] = Form.useForm();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement | null>(null);
  const productImageUrl = Form.useWatch("imageUrl", productForm);

  const refreshData = async () => {
    const response = await fetch("/api/admin/bootstrap", { cache: "no-store" });
    const nextData = await response.json();
    setData(nextData);
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
      message.error(payload.message || "保存筛选器组失败");
      return;
    }
    message.success(editingFilterId ? "筛选器组已更新" : "筛选器组已创建");
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
      message.error(payload.message || "删除筛选器组失败");
      return;
    }
    message.success("筛选器组已删除");
    await refreshData();
  };

  const submitProduct = async (values: ProductFormValues) => {
    const currentImageUrl = productForm.getFieldValue("imageUrl") || productImageUrl || values.imageUrl || "";
    const payload = {
      ...values,
      imageUrl: currentImageUrl,
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

  const uploadProductImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setProductImageUploading(true);
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await response.json()) as Partial<ProductImageUploadResponse> & { message?: string };

      if (!response.ok || !json.url) {
        message.error(json.message || "上传图片失败");
        return;
      }

      productForm.setFieldValue("imageUrl", String(json.url).trim());
      message.success("图片已上传");
    } catch {
      message.error("上传图片失败");
    } finally {
      setProductImageUploading(false);
    }
  };

  const handleProductImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files || []);
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      message.error("请选择图片文件");
      return;
    }

    await uploadProductImage(file);
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
    { title: "标识", dataIndex: "slug", render: (value) => value || "-" },
    { title: "描述", dataIndex: "description" },
    { title: "排序", dataIndex: "sortOrder" },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "禁用"}</Tag> },
    {
      title: "操作",
      render: (_, record) => (
        <Space wrap>
          <Button
            type="link"
            onClick={() => {
              setEditingCategoryId(record.id);
              setCategoryModalOpen(true);
              deferFormAction(() => categoryForm.setFieldsValue(record));
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除此分类吗？" onConfirm={() => removeCategory(record.id)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filterColumns: ColumnsType<FilterGroup> = [
    { title: "筛选器组", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    { title: "选项数量", render: (_, record) => record.options.length },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "禁用"}</Tag> },
    {
      title: "操作",
      render: (_, record) => (
        <Space wrap>
          <Button
            type="link"
            onClick={() => {
              setEditingFilterId(record.id);
              setFilterModalOpen(true);
              deferFormAction(() => filterForm.setFieldsValue(record));
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除此筛选器组吗？" onConfirm={() => removeFilter(record.id)}>
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
    { title: "价格", dataIndex: "price" },
    { title: "库存", dataIndex: "inventory" },
    {
      title: "筛选器",
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
        <Space wrap>
          <Button
            type="link"
            onClick={() => {
              setEditingProductId(record.id);
              setProductModalOpen(true);
              deferFormAction(() => productForm.setFieldsValue({ ...record, sizesInput: record.sizes.join(",") }));
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除此商品吗？" onConfirm={() => removeProduct(record.id)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const adminColumns: ColumnsType<(typeof data.admins)[number]> = [
    { title: "用户名", dataIndex: "username" },
    { title: "显示名称", dataIndex: "displayName" },
    { title: "邮箱", dataIndex: "email", render: (value) => value || "-" },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "禁用"}</Tag> },
    {
      title: "操作",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setAdminModalOpen(true);
            deferFormAction(() => adminForm.setFieldsValue(record));
          }}
        >
          编辑管理员
        </Button>
      ),
    },
  ];

  const menuItems = [
    { key: "products", icon: <ShoppingOutlined />, label: "商品" },
    { key: "categories", icon: <AppstoreOutlined />, label: "分类" },
    { key: "filters", icon: <FilterOutlined />, label: "筛选器" },
    { key: "admins", icon: <TeamOutlined />, label: "管理员" },
  ];
  const moduleTitles: Record<ModuleKey, string> = {
    products: "商品",
    categories: "分类",
    filters: "筛选器",
    admins: "管理员",
  };
  const moduleDescriptions: Record<ModuleKey, string> = {
    products: `共 ${data.store.products.length} 个商品。您可以在此创建、编辑和删除商品。`,
    categories: `共 ${data.store.categories.length} 个分类。在此管理分类详情和启用状态。`,
    filters: `共 ${data.store.filterGroups.length} 个筛选器组。在此维护选项和排序。`,
    admins: `共 ${data.admins.length} 个管理员账号。在此管理登录详情和启用状态。`,
  };
  const tableScrollY = "calc(100dvh - 255px)";
  const tableScroll = { x: "max-content" as const, y: tableScrollY };
  const deferFormAction = (callback: () => void) => {
    window.requestAnimationFrame(callback);
  };

  return (
    <Layout style={{ minHeight: "100dvh", background: "#f5f7fa" }}>
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        width={240}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          padding: "20px 12px",
        }}
      >
        <div style={{ display: "flex", minHeight: "100dvh", flexDirection: "column", gap: 16 }}>
          <div style={{ borderBottom: "1px solid #f0f0f0", padding: "4px 12px 12px" }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              管理控制台
            </Typography.Title>
            <Typography.Text type="secondary">NextMail 管理后台</Typography.Text>
          </div>

          <Menu
            mode="inline"
            items={menuItems}
            onClick={(event) => setActiveKey(event.key as ModuleKey)}
            selectedKeys={[activeKey]}
            style={{ flex: 1, borderInlineEnd: 0 }}
          />

          <Card size="small">
            <Space orientation="vertical" size={4} style={{ display: "flex" }}>
              <Typography.Text strong>{admin.displayName}</Typography.Text>
              <Typography.Text type="secondary">{admin.username}</Typography.Text>
              <Button block onClick={logout}>
                退出登录
              </Button>
            </Space>
          </Card>
        </div>
      </Layout.Sider>

      <Layout.Content style={{ minWidth: 0, padding: "16px 0 24px" }}>
        <div style={{ width: "100%" }}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {moduleTitles[activeKey]}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ margin: "8px 0 0" }}>
              {moduleDescriptions[activeKey]}
            </Typography.Paragraph>
          </div>

          {activeKey === "products" ? (
            <CardSection
              title={moduleTitles.products}
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingProductId(null);
                    setProductModalOpen(true);
                    deferFormAction(() => productForm.resetFields());
                  }}
                >
                  添加商品
                </Button>
              }
            >
              <Table
                columns={productColumns}
                dataSource={data.store.products}
                pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                rowKey="id"
                scroll={tableScroll}
                size="middle"
              />
            </CardSection>
          ) : null}

          {activeKey === "categories" ? (
            <CardSection
              title={moduleTitles.categories}
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryModalOpen(true);
                    deferFormAction(() => categoryForm.resetFields());
                  }}
                >
                  添加分类
                </Button>
              }
            >
              <Table
                columns={categoryColumns}
                dataSource={data.store.categories}
                pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                rowKey="id"
                scroll={tableScroll}
                size="middle"
              />
            </CardSection>
          ) : null}

          {activeKey === "filters" ? (
            <CardSection
              title={moduleTitles.filters}
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingFilterId(null);
                    setFilterModalOpen(true);
                    deferFormAction(() => {
                      filterForm.resetFields();
                      filterForm.setFieldValue("options", []);
                    });
                  }}
                >
                  添加筛选器组
                </Button>
              }
            >
              <Table
                columns={filterColumns}
                dataSource={data.store.filterGroups}
                pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                rowKey="id"
                scroll={tableScroll}
                size="middle"
              />
            </CardSection>
          ) : null}

          {activeKey === "admins" ? (
            <CardSection
              title={moduleTitles.admins}
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    setAdminModalOpen(true);
                    deferFormAction(() => adminForm.resetFields());
                  }}
                >
                  添加管理员
                </Button>
              }
            >
              <Table
                columns={adminColumns}
                dataSource={data.admins}
                pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                rowKey="id"
                scroll={tableScroll}
                size="middle"
              />
            </CardSection>
          ) : null}
        </div>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setCategoryModalOpen(false)} open={categoryModalOpen} title={editingCategoryId ? "编辑分类" : "添加分类"}>
          <Form form={categoryForm} layout="vertical" onFinish={submitCategory}>
            <Form.Item label="分类名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="标识" name="slug"><Input /></Form.Item>
            <Form.Item label="描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
            <Form.Item initialValue={1} label="排序" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">保存分类</Button>
            </div>
          </Form>
        </Modal>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setFilterModalOpen(false)} open={filterModalOpen} title={editingFilterId ? "编辑筛选器组" : "添加筛选器组"} width={760}>
          <Form form={filterForm} layout="vertical" onFinish={submitFilter}>
            <Form.Item label="筛选器组名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="标识" name="slug"><Input /></Form.Item>
            <Form.Item label="描述" name="description"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item initialValue={1} label="排序" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                    <Typography.Text strong>筛选选项</Typography.Text>
                    <Button onClick={() => add({ isActive: true, sortOrder: fields.length + 1 })}>添加选项</Button>
                  </div>
                  <Space orientation="vertical" size={16} style={{ display: "flex" }}>
                    {fields.map((field, index) => (
                      <Card key={field.key} size="small" title={`选项 ${index + 1}`} extra={<Button danger type="link" onClick={() => remove(field.name)}>删除</Button>}>
                        <Form.Item hidden name={[field.name, "id"]}><Input /></Form.Item>
                        <Form.Item label="标签" name={[field.name, "label"]} rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item label="值" name={[field.name, "value"]} rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item label="排序" name={[field.name, "sortOrder"]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                        <Form.Item initialValue={true} label="启用" name={[field.name, "isActive"]} valuePropName="checked"><Switch /></Form.Item>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}
            </Form.List>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">保存筛选器组</Button>
            </div>
          </Form>
        </Modal>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setProductModalOpen(false)} open={productModalOpen} title={editingProductId ? "编辑商品" : "添加商品"} width={860}>
          <Form form={productForm} layout="vertical" onFinish={submitProduct}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item label="商品名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="品牌" name="brand" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="标识" name="slug"><Input /></Form.Item>
              <Form.Item label="SKU" name="sku"><Input /></Form.Item>
              <Form.Item label="分类" name="categoryId" rules={[{ required: true }]}><Select options={data.store.categories.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item>
              <Form.Item label="徽章" name="badge"><Input /></Form.Item>
              <Form.Item label="价格" name="price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item label="原价" name="originalPrice"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item label="库存" name="inventory" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item label="配色" name="colorway"><Input /></Form.Item>
              <Form.Item
                label="封面图片"
                required
                validateStatus={productImageUrl ? undefined : "error"}
                help={productImageUrl ? undefined : "请上传封面图片"}
              >
                <Space direction="vertical" size={12} style={{ display: "flex", width: "100%" }}>
                  <Form.Item name="imageUrl" noStyle rules={[{ required: true, message: "请上传封面图片" }]}>
                    <Input type="hidden" />
                  </Form.Item>
                  <input
                    ref={productImageInputRef}
                    accept="image/*"
                    hidden
                    onChange={handleProductImageChange}
                    type="file"
                  />
                  <Space wrap>
                    <Button
                      loading={productImageUploading}
                      onClick={() => productImageInputRef.current?.click()}
                    >
                      上传图片
                    </Button>
                    <Button
                      disabled={!productImageUrl || productImageUploading}
                      onClick={() => productForm.setFieldValue("imageUrl", "")}
                    >
                      清除
                    </Button>
                  </Space>
                  <Input placeholder="上传的图片链接将显示在这里" readOnly value={productImageUrl} />
                  {productImageUrl ? (
                    <div
                      style={{
                        border: "1px solid #f0f0f0",
                        borderRadius: 12,
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      <img
                        alt="商品封面预览"
                        src={productImageUrl}
                        style={{ aspectRatio: "16 / 10", display: "block", objectFit: "cover", width: "100%" }}
                      />
                    </div>
                  ) : null}
                </Space>
              </Form.Item>
              <Form.Item label="状态" initialValue="ACTIVE" name="status"><Select options={[{ label: "上架", value: "ACTIVE" }, { label: "草稿", value: "DRAFT" }]} /></Form.Item>
            </div>
            <Form.Item label="尺码（用逗号分隔）" name="sizesInput"><Input placeholder="39,40,41,42" /></Form.Item>
            <Form.Item label="筛选器绑定" name="filterOptionIds"><Select mode="multiple" options={flatFilterOptions} placeholder="选择适用于此商品的筛选器" /></Form.Item>
            <Form.Item initialValue={false} label="推荐商品" name="featured" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item label="描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">保存商品</Button>
            </div>
          </Form>
        </Modal>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setAdminModalOpen(false)} open={adminModalOpen} title="管理员">
          <Form form={adminForm} layout="vertical" onFinish={submitAdmin}>
            <Form.Item hidden name="id"><Input /></Form.Item>
            <Form.Item label="用户名" name="username" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="显示名称" name="displayName" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="邮箱" name="email"><Input /></Form.Item>
            <Form.Item label="密码（编辑时留空表示保持不变）" name="password"><Input.Password /></Form.Item>
            <Form.Item initialValue={true} label="启用" name="isActive" valuePropName="checked"><Switch /></Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">保存管理员</Button>
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
    <Card
      extra={extra}
      style={{ borderRadius: 16, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
      styles={{ body: { paddingTop: 0 } }}
      title={
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {description ? (
            <Typography.Paragraph type="secondary" style={{ margin: "4px 0 0" }}>
              {description}
            </Typography.Paragraph>
          ) : null}
        </div>
      }
    >
      {children}
    </Card>
  );
}
