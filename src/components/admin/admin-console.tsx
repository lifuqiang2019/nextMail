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
import { useMemo, useState } from "react";

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

  const menuItems = [
    { key: "products", icon: <ShoppingOutlined />, label: "Products" },
    { key: "categories", icon: <AppstoreOutlined />, label: "Categories" },
    { key: "filters", icon: <FilterOutlined />, label: "Filters" },
    { key: "admins", icon: <TeamOutlined />, label: "Admin Users" },
  ];
  const moduleTitles: Record<ModuleKey, string> = {
    products: "Products",
    categories: "Categories",
    filters: "Filters",
    admins: "Admin Users",
  };
  const moduleDescriptions: Record<ModuleKey, string> = {
    products: `${data.store.products.length} products in total. You can create, edit, and delete them here.`,
    categories: `${data.store.categories.length} categories in total. Manage category details and active states here.`,
    filters: `${data.store.filterGroups.length} filter groups in total. Maintain options and sorting here.`,
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
        </div>

        <Modal
          centered
          destroyOnHidden
          footer={null}
          onCancel={() => setCategoryModalOpen(false)}
          open={categoryModalOpen}
          rootClassName="tm-admin-modal"
          title={editingCategoryId ? "Edit Category" : "Add Category"}
        >
          <Form
            className="tm-admin-modal__form"
            form={categoryForm}
            layout="vertical"
            onFinish={submitCategory}
          >
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item label="Category Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="Enter category name" />
              </Form.Item>
              <Form.Item label="Slug" name="slug">
                <Input placeholder="category-slug" />
              </Form.Item>
            </div>
            <Form.Item label="Description" name="description" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Describe the category" rows={3} />
            </Form.Item>
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item initialValue={1} label="Sort Order" name="sortOrder">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item initialValue={true} label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
            <div className="tm-admin-modal__actions">
              <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">
                Save Category
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          centered
          destroyOnHidden
          footer={null}
          onCancel={() => setFilterModalOpen(false)}
          open={filterModalOpen}
          rootClassName="tm-admin-modal"
          title={editingFilterId ? "Edit Filter Group" : "Add Filter Group"}
          width={760}
        >
          <Form
            className="tm-admin-modal__form"
            form={filterForm}
            layout="vertical"
            onFinish={submitFilter}
          >
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item label="Filter Group Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Size, Color" />
              </Form.Item>
              <Form.Item label="Slug" name="slug">
                <Input placeholder="filter-slug" />
              </Form.Item>
            </div>
            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Group description" rows={2} />
            </Form.Item>
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item initialValue={1} label="Sort Order" name="sortOrder">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item initialValue={true} label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>

            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div className="tm-admin-modal__section">
                  <div className="tm-admin-modal__section-head">
                    <Typography.Text strong>Filter Options</Typography.Text>
                    <Button
                      onClick={() => add({ isActive: true, sortOrder: fields.length + 1 })}
                      size="small"
                      type="dashed"
                    >
                      Add Option
                    </Button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {fields.map((field, index) => (
                      <Card
                        className="tm-admin-modal__option-card"
                        extra={
                          <Button danger size="small" type="link" onClick={() => remove(field.name)}>
                            Delete
                          </Button>
                        }
                        key={field.key}
                        size="small"
                        title={`Option ${index + 1}`}
                      >
                        <Form.Item hidden name={[field.name, "id"]}>
                          <Input />
                        </Form.Item>
                        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                          <Form.Item label="Label" name={[field.name, "label"]} rules={[{ required: true }]}>
                            <Input placeholder="e.g. Red, 42" />
                          </Form.Item>
                          <Form.Item label="Value" name={[field.name, "value"]} rules={[{ required: true }]}>
                            <Input placeholder="e.g. red, 42" />
                          </Form.Item>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                          <Form.Item label="Sort Order" name={[field.name, "sortOrder"]}>
                            <InputNumber min={0} />
                          </Form.Item>
                          <Form.Item
                            initialValue={true}
                            label="Active"
                            name={[field.name, "isActive"]}
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                    {fields.length === 0 && (
                      <div className="py-8 text-center text-gray-400">
                        No options added yet. Click &quot;Add Option&quot; to begin.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Form.List>

            <div className="tm-admin-modal__actions">
              <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">
                Save Filter Group
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          centered
          destroyOnHidden
          footer={null}
          onCancel={() => setProductModalOpen(false)}
          open={productModalOpen}
          rootClassName="tm-admin-modal"
          title={editingProductId ? "Edit Product" : "Add Product"}
          width={860}
        >
          <Form
            className="tm-admin-modal__form"
            form={productForm}
            layout="vertical"
            onFinish={submitProduct}
          >
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="Enter product name" />
              </Form.Item>
              <Form.Item label="Brand" name="brand" rules={[{ required: true }]}>
                <Input placeholder="e.g. Nike, Adidas" />
              </Form.Item>
              <Form.Item label="Slug" name="slug">
                <Input placeholder="product-slug" />
              </Form.Item>
              <Form.Item label="SKU" name="sku">
                <Input placeholder="Unique SKU" />
              </Form.Item>
              <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}>
                <Select
                  options={data.store.categories.map((item) => ({ label: item.name, value: item.id }))}
                  placeholder="Select category"
                />
              </Form.Item>
              <Form.Item label="Badge" name="badge">
                <Input placeholder="e.g. New Arrival, Sale" />
              </Form.Item>
              <Form.Item label="Price" name="price" rules={[{ required: true }]}>
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label="Original Price" name="originalPrice">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label="Inventory" name="inventory" rules={[{ required: true }]}>
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label="Colorway" name="colorway">
                <Input placeholder="e.g. White/Black" />
              </Form.Item>
              <Form.Item label="Cover Image URL" name="imageUrl" rules={[{ required: true }]}>
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
              <Form.Item initialValue="ACTIVE" label="Status" name="status">
                <Select
                  options={[
                    { label: "ACTIVE", value: "ACTIVE" },
                    { label: "DRAFT", value: "DRAFT" },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item label="Sizes (comma separated)" name="sizesInput">
                <Input placeholder="39,40,41,42" />
              </Form.Item>
              <Form.Item initialValue={false} label="Featured Product" name="featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
            <Form.Item label="Filter Bindings" name="filterOptionIds">
              <Select
                mode="multiple"
                options={flatFilterOptions}
                placeholder="Select the filters that apply to this product"
              />
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Enter product description" rows={4} />
            </Form.Item>
            <div className="tm-admin-modal__actions">
              <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">
                Save Product
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          centered
          destroyOnHidden
          footer={null}
          onCancel={() => setAdminModalOpen(false)}
          open={adminModalOpen}
          rootClassName="tm-admin-modal"
          title="Admin User"
        >
          <Form
            className="tm-admin-modal__form"
            form={adminForm}
            layout="vertical"
            onFinish={submitAdmin}
          >
            <Form.Item hidden name="id">
              <Input />
            </Form.Item>
            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                <Input placeholder="Enter username" />
              </Form.Item>
              <Form.Item label="Display Name" name="displayName" rules={[{ required: true }]}>
                <Input placeholder="Enter display name" />
              </Form.Item>
            </div>
            <Form.Item label="Email" name="email">
              <Input placeholder="admin@example.com" />
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password placeholder="Leave blank to keep unchanged" />
            </Form.Item>
            <Form.Item initialValue={true} label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
            <div className="tm-admin-modal__actions">
              <Button className="tm-admin-modal__submit" htmlType="submit" type="primary">
                Save Admin User
              </Button>
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
