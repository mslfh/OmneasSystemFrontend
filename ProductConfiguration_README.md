# 产品配置页面 (Product Configuration)

## 概述
`AdminProductProfile.vue` 已改造为产品配置管理页面，支持产品配置的新增、编辑、删除和查看功能。

## 功能特性

### 数据结构
基于后台数据库表结构：
- `name`: 配置名称 (必填)
- `description`: 配置描述 (可选)
- `status`: 状态 (`active` 或 `inactive`)
- `settings`: JSON格式的配置设置，目前支持税率设置

### 主要功能

1. **配置列表展示**
   - 展示所有产品配置
   - 支持按名称、描述、状态搜索
   - 支持按状态、税率等条件筛选
   - 分页显示

2. **新增配置**
   - 点击"Add Configuration"按钮
   - 填写配置名称、描述、状态
   - 设置税率 (0-100%)
   - 数据验证后保存

3. **编辑配置**
   - 点击表格中的编辑按钮
   - 修改配置信息
   - 更新税率设置

4. **删除配置**
   - 点击删除按钮
   - 确认后删除配置

### Settings 字段处理

目前 `settings` 字段主要处理税率配置：
```json
{
  "tax_rate": 15.5
}
```

### API 端点
- GET `/api/product-configurations` - 获取配置列表
- POST `/api/product-configurations` - 创建新配置
- PUT `/api/product-configurations/{id}` - 更新配置
- DELETE `/api/product-configurations/{id}` - 删除配置

### 界面组件

#### 表格列
- **Name**: 配置名称
- **Description**: 配置描述
- **Status**: 状态 (带颜色标识)
- **Tax Rate**: 税率 (从settings中解析)
- **Actions**: 操作按钮 (编辑/删除)

#### 搜索和筛选
- 支持按名称、描述、状态搜索
- 快速筛选：活跃状态、非活跃状态、有税率配置

#### 配置对话框
- 配置名称输入 (必填)
- 配置描述输入 (可选)
- 状态选择 (active/inactive)
- 税率设置 (0-100%, 支持小数)

## 技术实现

### 核心方法
- `getTaxRate()`: 从settings JSON中解析税率
- `editConfiguration()`: 编辑配置，解析现有settings
- `onSubmit()`: 保存配置，将tax_rate包装为JSON存储

### 数据验证
- 配置名称不能为空
- 税率范围 0-100%
- 状态必须选择

### 错误处理
- API请求失败提示
- 数据验证失败提示
- 删除确认对话框

## 使用说明

1. **添加新配置**
   - 点击页面左上角的"Add Configuration"
   - 填写必要信息
   - 设置税率
   - 点击保存

2. **编辑配置**
   - 在表格中找到要编辑的配置
   - 点击编辑按钮
   - 修改信息后保存

3. **删除配置**
   - 点击删除按钮
   - 在确认对话框中确认删除

4. **搜索配置**
   - 使用顶部搜索框
   - 选择搜索字段 (名称/描述/状态)
   - 或使用快速筛选选项

## 扩展说明

目前settings字段仅支持税率配置，后续可以扩展支持：
- 折扣设置
- 运费设置
- 其他业务配置

扩展时只需要在配置对话框中添加相应的输入字段，并在`onSubmit`方法中更新settings JSON结构。
