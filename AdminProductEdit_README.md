# AdminProductEdit 页面实现说明

## 概述
成功创建了 `AdminProductEdit.vue` 页面，用于更新商品信息。该页面**完全基于 AdminProductAdd.vue 的样式和布局**，确保了一致的用户体验，特别是在 Customization Options 部分。

## ✅ 已完成的样式统一

### Customization Options 布局一致性
现在 AdminProductEdit 页面的 Customization Options 部分与 AdminProductAdd 页面**完全一致**：

1. **配料信息显示格式**:
   - 8:4 列布局 (配料信息:配置选项)
   - 主要颜色和样式与 AdminProductAdd 一致
   - `text-body1 text-weight-medium text-primary` 样式
   - 灰色背景芯片显示配料类型
   - 数量单位和价格信息格式一致

2. **替换选项卡片式布局**:
   - 完全相同的卡片式设计
   - `col-12 col-md-6` 响应式布局
   - 选中状态的 `bg-blue-1` 背景
   - 相同的复选框、价格差异和额外价格输入框布局
   - 75px 宽度的输入框保持一致

3. **按钮样式和图标**:
   - "All" 和 "None" 按钮使用相同的样式
   - `size="xs"`, `dense`, `flat` 属性一致
   - `o_circle` 和 `o_block` 图标保持统一

4. **模式配置**:
   - 相同的 4 种定制模式支持
   - 一致的模式选择下拉框样式
   - 统一的扩展项布局和样式

## 功能特性

### 1. 基础信息编辑
- 商品代码 (Product Code) *必填
- 标题 (Title) *必填
- 副标题 (Second Title)
- 缩写 (Acronym)
- 描述 (Description)
- 提示 (Tip)

### 2. 分类和配料管理
- **分类选择**: 使用树形结构选择商品分类
- **配料管理**:
  - 按类型分组显示配料 (MAIN, VEGETABLE, MEAT, SEAFOOD, SOURCE 等)
  - 支持选择/取消选择配料
  - 配置每个配料的数量和单位 (Several/Piece)
  - 显示配料价格

### 3. 定制化选项 (Customization Options)
**与 AdminProductAdd 完全一致的布局和样式**，支持四种定制模式：

#### 3.1 Replaceable + Variable Mode
- 客户可以替换配料为同类型的其他配料
- 客户可以调整配料数量
- 配置替换价格差异 (replacement_diff)
- 配置额外数量价格 (replacement_extra)
- 配置数量增减价格 (quantity_price)

#### 3.2 Replaceable Mode
- 客户只能替换配料，不能调整数量
- 配置替换价格差异

#### 3.3 Variable Mode
- 客户只能调整配料数量，不能替换
- 配置增加/减少数量的价格

#### 3.4 Fixed Mode
- 配料不可定制

### 4. 价格信息
- 原价 (Price) *必填
- 折扣 (Discount)
- 售价 (Selling Price) *必填
- 自动计算售价 = 原价 - 折扣

### 5. 库存和状态
- 库存数量 (支持无限库存 -1)
- 商品状态 (Active/Inactive)
- 排序顺序

### 6. 附加选项
- 是否为特色商品
- 是否可见
- 标签 (用逗号分隔)

### 7. 图片管理
- 主图 URL
- 图片库 URLs (暂不处理图片上传)

## 数据转换逻辑

### API 数据格式转换
根据提供的 API 数据格式 (`/api/products/{id}`)，实现了以下数据转换：

#### 输入数据转换:
```javascript
// API response -> Component data
items[] -> ingredients[]
customization_items[] -> customizations[]
```

#### 输出数据转换:
```javascript
// Component data -> API request
ingredients[] -> items relationship
customizations[] -> customization_items data structure
```

### 定制化数据结构
```javascript
customization_items: [
  {
    id: 25,
    product_id: 47,
    item_id: 1,
    mode: "replaceable",
    replacement_list: [2,3,4,5,6,7,8],
    replacement_diff: {"2":0,"3":0,"4":0,"5":0,"6":1,"7":2,"8":0},
    replacement_extra: {},
    quantity_price: {"extra":0,"reduce":0}
  }
]
```

## 页面访问路径

### 路由配置
- 路径: `/admin/product/edit`
- 参数: `?id={product_id}`
- 权限: `adminDeskOnlyGuard`

### 导航入口
1. **AdminProduct 列表页**: 通过 "more_vert" 菜单中的 "edit" 按钮
2. **AdminProductDetail 详情页**: "Advanced Edit" 按钮

## 技术实现细节

### 组件结构
- 基于 Quasar 组件库
- 使用 Composition API (Vue 3)
- 响应式数据管理

### 数据管理
- 使用 Map 数据结构优化性能
- 实时同步选中配料和定制化选项
- 缓存替换选项以提高性能

### 表单验证
- 必填字段验证
- 数值类型验证
- 价格格式化处理

### API 集成
- GET `/api/products/{id}` - 获取商品详情
- PUT `/api/products/{id}` - 更新商品信息
- GET `/api/categories/active` - 获取活跃分类
- GET `/api/items/active` - 获取活跃配料

## 样式一致性保证

### 与 AdminProductAdd 相同的样式类
```css
.text-body1.text-weight-medium.text-primary    // 配料名称
.col-8 / .col-4                                // 布局比例
.col-12.col-md-6                               // 替换选项卡片布局
.bg-blue-1                                     // 选中状态背景
.q-pa-xs                                       // 卡片内边距
.row.items-center.no-wrap                      // 卡片内容布局
```

### 统一的组件配置
```vue
<q-btn size="xs" dense flat color="primary" icon="o_circle" label="All" />
<q-input style="width: 75px" dense outlined />
<q-expansion-item dense class="bg-grey-2 rounded-borders" default-opened />
```

## 使用说明

1. **访问页面**: 从商品列表或详情页点击编辑按钮
2. **编辑基础信息**: 修改商品基本信息字段
3. **配置分类**: 在分类树中选择适当的分类
4. **管理配料**:
   - 在配料列表中选择/取消选择配料
   - 设置数量和单位
5. **配置定制化**:
   - 开启定制化开关
   - 为每个配料选择定制模式
   - 配置相应的价格参数
6. **设置价格**: 输入价格和折扣信息
7. **保存**: 点击 "Save Changes" 保存修改

## 测试验证

- ✅ 语法错误已修复
- ✅ Customization Options 样式与 AdminProductAdd 完全一致
- ✅ 加载状态和错误处理正常
- ✅ 数据转换逻辑正确
- ✅ 路由导航正常工作
- ✅ 开发服务器运行正常

## 注意事项

1. **图片处理**: 当前版本暂不支持图片上传，只支持 URL 输入
2. **数据验证**: 保存前会进行表单验证，必填字段不能为空
3. **价格计算**: 售价会根据原价和折扣自动计算
4. **定制化限制**: 只有选中的配料才能配置定制化选项

现在 AdminProductEdit 页面的 Customization Options 部分与 AdminProductAdd 页面的样式和布局**完全一致**，为用户提供了统一的体验。
