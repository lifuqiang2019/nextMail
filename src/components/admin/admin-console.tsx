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
  UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import { formatDateTime } from "@/lib/format";
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

type ModuleKey = "categories" | "filters" | "products" | "customers" | "admins";

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
      message.error(payload.message || "Failed to save category");
      return;
    }
    message.success(editingCategoryId ? "Category updated" : "Category created");
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
      message.error(payload.message || "Failed to delete category");
      return;
    }
    message.success("Category deleted");
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
      message.error(payload.message || "Failed to save filter group");
      return;
    }
    message.success(editingFilterId ? "Filter group updated" : "Filter group created");
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
      message.error(payload.message || "Failed to delete filter group");
      return;
    }
    message.success("Filter group deleted");
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
      message.error(json.message || "Failed to save product");
      return;
    }
    message.success(editingProductId ? "Product updated" : "Product created");
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
      message.error(json.message || "Failed to delete product");
      return;
    }
    message.success("Product deleted");
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
        message.error(json.message || "Failed to upload image");
        return;
      }

      productForm.setFieldValue("imageUrl", String(json.url).trim());
      message.success("Image uploaded");
    } catch {
      message.error("Failed to upload image");
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
      message.error("Please select an image file");
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
      message.error(json.message || "Failed to save admin user");
      return;
    }
    message.success(values.id ? "Admin user updated" : "Admin user created");
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
    { title: "Category Name", dataIndex: "name" },
    { title: "Slug", dataIndex: "slug", render: (value) => value || "-" },
    { title: "Description", dataIndex: "description" },
    { title: "Sort Order", dataIndex: "sortOrder" },
    { title: "Status", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Active" : "Inactive"}</Tag> },
    {
      title: "Actions",
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
            Edit
          </Button>
          <Popconfirm title="Delete this category?" onConfirm={() => removeCategory(record.id)}>
            <Button danger type="link">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filterColumns: ColumnsType<FilterGroup> = [
    { title: "Filter Group", dataIndex: "name" },
    { title: "Description", dataIndex: "description" },
    { title: "Option Count", render: (_, record) => record.options.length },
    { title: "Status", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Active" : "Inactive"}</Tag> },
    {
      title: "Actions",
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
            Edit
          </Button>
          <Popconfirm title="Delete this filter group?" onConfirm={() => removeFilter(record.id)}>
            <Button danger type="link">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const productColumns: ColumnsType<Product> = [
    { title: "Product", dataIndex: "name" },
    { title: "Brand", dataIndex: "brand" },
    { title: "Category", dataIndex: "categoryId", render: (value) => data.store.categories.find((item) => item.id === value)?.name || value },
    { title: "Price", dataIndex: "price" },
    { title: "Inventory", dataIndex: "inventory" },
    {
      title: "Filters",
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
      title: "Actions",
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
            Edit
          </Button>
          <Popconfirm title="Delete this product?" onConfirm={() => removeProduct(record.id)}>
            <Button danger type="link">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const adminColumns: ColumnsType<(typeof data.admins)[number]> = [
    { title: "Username", dataIndex: "username" },
    { title: "Display Name", dataIndex: "displayName" },
    { title: "Email", dataIndex: "email", render: (value) => value || "-" },
    { title: "Status", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Active" : "Inactive"}</Tag> },
    {
      title: "Actions",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setAdminModalOpen(true);
            deferFormAction(() => adminForm.setFieldsValue(record));
          }}
        >
          Edit Admin
        </Button>
      ),
    },
  ];

  const customerColumns: ColumnsType<(typeof data.customers)[number]> = [
    { title: "用户名", dataIndex: "name" },
    { title: "邮箱", dataIndex: "email" },
    { title: "状态", dataIndex: "isActive", render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "停用"}</Tag> },
    { title: "注册时间", dataIndex: "createdAt", render: (value) => formatDateTime(value, "zh-CN") },
  ];

  const menuItems = [
    { key: "products", icon: <ShoppingOutlined />, label: "Products" },
    { key: "categories", icon: <AppstoreOutlined />, label: "Categories" },
    { key: "filters", icon: <FilterOutlined />, label: "Filters" },
    { key: "customers", icon: <UserOutlined />, label: "用户管理" },
    { key: "admins", icon: <TeamOutlined />, label: "Admin Users" },
  ];
  const moduleTitles: Record<ModuleKey, string> = {
    products: "Products",
    categories: "Categories",
    filters: "Filters",
    customers: "客户列表",
    admins: "Admin Users",
  };
  const moduleDescriptions: Record<ModuleKey, string> = {
    products: `${data.store.products.length} products in total. You can create, edit, and delete them here.`,
    categories: `${data.store.categories.length} categories in total. Manage category details and active states here.`,
    filters: `${data.store.filterGroups.length} filter groups in total. Maintain options and sorting here.`,
    customers: `当前共有 ${data.customers.length} 个注册用户，可在此查看客户账号列表。`,
    admins: `${data.admins.length} admin accounts in total. Manage login details and active states here.`,
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
              Admin Console
            </Typography.Title>
            <Typography.Text type="secondary">NextMail Admin</Typography.Text>
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
                Sign Out
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
                  Add Product
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
                  Add Category
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
                  Add Filter Group
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
                  Add Admin User
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

          {activeKey === "customers" ? (
            <CardSection title={moduleTitles.customers}>
              <Table
                columns={customerColumns}
                dataSource={data.customers}
                pagination={{ hideOnSinglePage: true, showSizeChanger: false }}
                rowKey="id"
                scroll={tableScroll}
                size="middle"
              />
            </CardSection>
          ) : null}
        </div>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setCategoryModalOpen(false)} open={categoryModalOpen} title={editingCategoryId ? "Edit Category" : "Add Category"}>
          <Form form={categoryForm} layout="vertical" onFinish={submitCategory}>
            <Form.Item label="Category Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Slug" name="slug"><Input /></Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
            <Form.Item initialValue={1} label="Sort Order" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item initialValue={true} label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">Save Category</Button>
            </div>
          </Form>
        </Modal>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setFilterModalOpen(false)} open={filterModalOpen} title={editingFilterId ? "Edit Filter Group" : "Add Filter Group"} width={760}>
          <Form form={filterForm} layout="vertical" onFinish={submitFilter}>
            <Form.Item label="Filter Group Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Slug" name="slug"><Input /></Form.Item>
            <Form.Item label="Description" name="description"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item initialValue={1} label="Sort Order" name="sortOrder"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
            <Form.Item initialValue={true} label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                    <Typography.Text strong>Filter Options</Typography.Text>
                    <Button onClick={() => add({ isActive: true, sortOrder: fields.length + 1 })}>Add Option</Button>
                  </div>
                  <Space orientation="vertical" size={16} style={{ display: "flex" }}>
                    {fields.map((field, index) => (
                      <Card key={field.key} size="small" title={`Option ${index + 1}`} extra={<Button danger type="link" onClick={() => remove(field.name)}>Delete</Button>}>
                        <Form.Item hidden name={[field.name, "id"]}><Input /></Form.Item>
                        <Form.Item label="Label" name={[field.name, "label"]} rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item label="Value" name={[field.name, "value"]} rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item label="Sort Order" name={[field.name, "sortOrder"]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
                        <Form.Item initialValue={true} label="Active" name={[field.name, "isActive"]} valuePropName="checked"><Switch /></Form.Item>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}
            </Form.List>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">Save Filter Group</Button>
            </div>
          </Form>
        </Modal>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setProductModalOpen(false)} open={productModalOpen} title={editingProductId ? "Edit Product" : "Add Product"} width={860}>
          <Form form={productForm} layout="vertical" onFinish={submitProduct}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item label="Product Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Brand" name="brand" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Slug" name="slug"><Input /></Form.Item>
              <Form.Item label="SKU" name="sku"><Input /></Form.Item>
              <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}><Select options={data.store.categories.map((item) => ({ label: item.name, value: item.id }))} /></Form.Item>
              <Form.Item label="Badge" name="badge"><Input /></Form.Item>
              <Form.Item label="Price" name="price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item label="Original Price" name="originalPrice"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item label="Inventory" name="inventory" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
              <Form.Item label="Colorway" name="colorway"><Input /></Form.Item>
              <Form.Item
                label="Cover Image"
                required
                validateStatus={productImageUrl ? undefined : "error"}
                help={productImageUrl ? undefined : "Please upload a cover image"}
              >
                <Space direction="vertical" size={12} style={{ display: "flex", width: "100%" }}>
                  <Form.Item name="imageUrl" noStyle rules={[{ required: true, message: "Please upload a cover image" }]}>
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
                      Upload Image
                    </Button>
                    <Button
                      disabled={!productImageUrl || productImageUploading}
                      onClick={() => productForm.setFieldValue("imageUrl", "")}
                    >
                      Clear
                    </Button>
                  </Space>
                  <Input placeholder="Uploaded image URL will appear here" readOnly value={productImageUrl} />
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
                        alt="Product cover preview"
                        src={productImageUrl}
                        style={{ aspectRatio: "16 / 10", display: "block", objectFit: "cover", width: "100%" }}
                      />
                    </div>
                  ) : null}
                </Space>
              </Form.Item>
              <Form.Item label="Status" initialValue="ACTIVE" name="status"><Select options={[{ label: "ACTIVE", value: "ACTIVE" }, { label: "DRAFT", value: "DRAFT" }]} /></Form.Item>
            </div>
            <Form.Item label="Sizes (comma separated)" name="sizesInput"><Input placeholder="39,40,41,42" /></Form.Item>
            <Form.Item label="Filter Bindings" name="filterOptionIds"><Select mode="multiple" options={flatFilterOptions} placeholder="Select the filters that apply to this product" /></Form.Item>
            <Form.Item initialValue={false} label="Featured Product" name="featured" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">Save Product</Button>
            </div>
          </Form>
        </Modal>

        <Modal centered destroyOnHidden footer={null} onCancel={() => setAdminModalOpen(false)} open={adminModalOpen} title="Admin User">
          <Form form={adminForm} layout="vertical" onFinish={submitAdmin}>
            <Form.Item hidden name="id"><Input /></Form.Item>
            <Form.Item label="Username" name="username" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Display Name" name="displayName" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Email" name="email"><Input /></Form.Item>
            <Form.Item label="Password (leave blank when editing to keep unchanged)" name="password"><Input.Password /></Form.Item>
            <Form.Item initialValue={true} label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <Button htmlType="submit" type="primary">Save Admin User</Button>
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
