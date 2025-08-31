<template>
  <q-card class="product-card shadow-2 rounded-borders-lg overflow-hidden">
    <!-- 产品图片 -->
    <div class="relative-position">
      <q-img
        :src="product.image"
        :style="{ height: $q.screen.lt.sm ? '120px' : '140px' }"
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
        v-if="product.isPopular"
        color="red"
        :class="['absolute-top-left', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Popular"
      />

      <!-- 已点标签 -->
      <q-badge
        v-if="isOrdered"
        color="green"
        :class="['absolute-top-left', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Ordered"
      />

      <!-- 历史订购标签 -->
      <q-badge
        v-if="product.isHistorical"
        color="purple"
        :class="['absolute-top-left', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Previously Ordered"
      />

      <!-- 库存状态 -->
      <q-badge
        v-if="product.stock <= 5 && product.stock > 0"
        color="orange"
        :class="['absolute-top-right', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        :label="`Only ${product.stock} left`"
        size="sm"
      />
      <q-badge
        v-else-if="product.stock === 0"
        color="negative"
        :class="['absolute-top-right', $q.screen.lt.sm ? 'q-ma-xs' : 'q-ma-sm']"
        label="Out of Stock"
        size="sm"
      />

      <!-- <div class="absolute-top-right q-ma-sm">
        <q-chip outline color="amber" text-color="black"  dense size="sm">
          <q-icon name="star" color="amber" size="xs" class="q-mr-xs" />
          {{ product.rating }}
        </q-chip>
      </div> -->
    </div>

    <!-- 产品信息 -->
    <q-card-section :class="['q-pb-none', $q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md']">
      <div class="row items-center q-mb-xs">
        <div :class="['text-weight-medium ellipsis', $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6']">{{ product.title }}</div>
        <q-chip
          outline
          v-if="product.code"
          color="orange-5"
          size="sm"
          dense
          :class="[$q.screen.lt.sm ? 'q-ml-xs' : 'q-ml-sm']"
        >
          {{ product.code }}
        </q-chip>
      </div>
      <div :class="['q-mb-sm ellipsis-2-lines', $q.screen.lt.sm ? 'text-caption' : 'text-body2 text-grey-6']">
        {{ product.description }}
      </div>

      <div v-if="product.tags && product.tags.length > 0" class="q-mb-sm">
        <q-chip
          v-for="tag in product.tags"
          :key="tag"
          color="grey-2"
          text-color="grey-7"
          size="sm"
          dense
          class="q-mr-xs q-mb-xs q-screen-lt-sm:q-mr-xs q-screen-lt-sm:q-mb-xs"
        >
          {{ tag }}
        </q-chip>
      </div>

      <div class="row items-center justify-between">
        <div :class="['text-weight-bold text-deep-orange', $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6']">
          <div v-if="product.originalPrice && product.originalPrice !== product.price" :class="['row items-center', $q.screen.lt.sm ? 'q-gutter-xs' : 'q-gutter-xs']">
            <span :class="['text-grey-6', $q.screen.lt.sm ? 'text-caption' : 'text-body2']" style="text-decoration: line-through;">
              ${{ product.originalPrice.toFixed(2) }}
            </span>
            <span :class="['text-weight-bold text-deep-orange', $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6']">
              ${{ product.price.toFixed(2) }}
            </span>
          </div>
          <div v-else :class="['text-weight-bold text-deep-orange', $q.screen.lt.sm ? 'text-subtitle1' : 'text-h6']">
            ${{ product.price.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 历史餐品额外信息 -->
      <div v-if="product.isHistorical" :class="['text-purple-8 q-mb-sm', $q.screen.lt.sm ? 'text-body2' : 'text-caption']">
        <div v-if="product.lastOrdered">
          Last ordered: {{ formatLastOrdered(product.lastOrdered) }}
        </div>
        <div v-if="product.totalSpent">
          Total spent: ${{ product.totalSpent.toFixed(2) }}
        </div>
      </div>
    </q-card-section>

    <!-- 操作按钮 -->
    <q-card-actions :class="['q-pt-none', $q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md']">
      <div v-if="currentQuantity === 0" class="full-width">
        <q-btn
          color="deep-orange"
          label="Add to Cart"
          icon="add_shopping_cart"
          :class="['full-width', $q.screen.lt.sm ? 'text-caption' : '']"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click="addToCart"
        />
      </div>

      <div v-else class="row items-center justify-between full-width">
        <q-btn
          round
          dense
          color="grey-6"
          icon="remove"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click="removeFromCart"
        />
        <div :class="['text-weight-bold', $q.screen.lt.sm ? 'text-subtitle1 q-mx-sm' : 'text-h6 q-mx-md']">
          {{ currentQuantity }}
        </div>
        <q-btn
          round
          dense
          color="deep-orange"
          icon="add"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
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
