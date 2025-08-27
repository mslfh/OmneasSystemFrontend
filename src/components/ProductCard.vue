<template>
  <q-card class="product-card shadow-2 rounded-borders-lg overflow-hidden">
    <!-- 产品图片 -->
    <div class="relative-position">
      <q-img
        :src="product.image"
        style="height: 200px"
        fit="cover"
        class="product-image"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-grey-3">
            <q-icon name="restaurant" size="3rem" color="grey-6" />
          </div>
        </template>
      </q-img>

      <!-- 热销标签 -->
      <q-badge
        v-if="isPopular"
        color="red"
        class="absolute-top-left q-ma-sm"
        label="Popular"
      />

      <!-- 已点标签 -->
      <q-badge
        v-if="isOrdered"
        color="green"
        class="absolute-top-left q-ma-sm"
        label="Ordered"
      />

      <!-- 历史订购标签 -->
      <q-badge
        v-if="product.isHistorical"
        color="purple"
        class="absolute-top-left q-ma-sm"
        label="Previously Ordered"
      />

      <!-- 订购次数标签（仅对历史餐品显示） -->
      <q-badge
        v-if="product.orderCount && product.orderCount > 1"
        color="orange"
        class="absolute-top-right q-ma-sm q-mt-xl"
        :label="`${product.orderCount}x ordered`"
        size="sm"
      />

      <!-- 评分 -->
      <div class="absolute-top-right q-ma-sm">
        <q-chip color="white" text-color="black" dense size="sm">
          <q-icon name="star" color="amber" size="xs" class="q-mr-xs" />
          {{ product.rating }}
        </q-chip>
      </div>
    </div>

    <!-- 产品信息 -->
    <q-card-section class="q-pa-md">
      <div class="text-h6 text-weight-medium q-mb-xs ellipsis">
        {{ product.title }}
      </div>
      <div class="text-body2 text-grey-6 q-mb-sm ellipsis-2-lines">
        {{ product.description }}
      </div>

      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6 text-weight-bold text-deep-orange">
          ${{ product.price.toFixed(2) }}
        </div>
        <q-chip
          color="orange-1"
          text-color="orange-8"
          size="sm"
          dense
          icon="schedule"
        >
          {{ product.cookTime }}
        </q-chip>
      </div>

      <!-- 历史餐品额外信息 -->
      <div v-if="product.isHistorical" class="text-caption text-purple-8 q-mb-sm">
        <div v-if="product.lastOrdered">
          Last ordered: {{ formatLastOrdered(product.lastOrdered) }}
        </div>
        <div v-if="product.totalSpent">
          Total spent: ${{ product.totalSpent.toFixed(2) }}
        </div>
      </div>
    </q-card-section>

    <!-- 操作按钮 -->
    <q-card-actions class="q-pa-md q-pt-none">
      <div v-if="currentQuantity === 0" class="full-width">
        <q-btn
          color="deep-orange"
          label="Add to Cart"
          icon="add_shopping_cart"
          class="full-width"
          @click="addToCart"
        />
      </div>

      <div v-else class="row items-center justify-between full-width">
        <q-btn
          round
          dense
          color="grey-6"
          icon="remove"
          @click="removeFromCart"
        />
        <div class="text-h6 text-weight-bold q-mx-md">
          {{ currentQuantity }}
        </div>
        <q-btn
          round
          dense
          color="deep-orange"
          icon="add"
          @click="addToCart"
        />
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isOrdered: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['add-to-cart', 'remove-from-cart'])

// 计算当前数量（这里需要从父组件的购物车数据中获取）
const currentQuantity = computed(() => {
  return props.product.quantity || 0
})

// 方法
function addToCart() {
  emit('add-to-cart', props.product)
}

function removeFromCart() {
  emit('remove-from-cart', props.product)
}

function formatLastOrdered(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.rounded-borders-lg {
  border-radius: 12px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}

.text-deep-orange {
  color: #FF5722 !important;
}

/* 按钮动画 */
.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: scale(1.05);
}

/* 标签动画 */
.q-badge {
  animation: fadeInDown 0.5s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
