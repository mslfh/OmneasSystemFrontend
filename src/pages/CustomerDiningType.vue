<template>
  <q-page class="bg-grey-1">
    <!-- 统一的页面容器 -->
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- 页面标题 -->
        <div class="text-h4 text-weight-bold text-grey-7 q-mb-lg text-center">
          Choose Dining Type
        </div>

        <!-- 就餐方式选择 -->
        <q-card class="q-mb-md shadow-2 rounded-borders-lg">
          <q-card-section class="text-center q-pa-lg">
            <div class="text-h5 text-weight-bold q-mb-md text-grey-8">
              How would you like to dine?
            </div>
            <div class="text-body2 text-grey-6 q-mb-lg">
              Choose your dining preference
            </div>

            <div class="row q-gutter-md justify-center">
              <q-card
                flat
                bordered
                class="col-5 cursor-pointer hover-lift dining-option"
                @click="selectDiningType('takeaway')"
              >
                <q-card-section class="text-center q-pa-lg">
                  <q-icon name="shopping_bag" size="3rem" color="deep-orange" class="q-mb-sm" />
                  <div class="text-h6 text-weight-medium">Take Away</div>
                  <div class="text-caption text-grey-6">Order for pickup</div>
                </q-card-section>
              </q-card>

              <q-card
                flat
                bordered
                class="col-5 cursor-pointer hover-lift dining-option"
                @click="selectDiningType('dinein')"
              >
                <q-card-section class="text-center q-pa-lg">
                  <q-icon name="restaurant" size="3rem" color="deep-orange" class="q-mb-sm" />
                  <div class="text-h6 text-weight-medium">Dine In</div>
                  <div class="text-caption text-grey-6">Eat at restaurant</div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>

        <!-- 额外的信息卡片 -->
        <q-card flat bordered class="bg-orange-1 q-mb-md">
          <q-card-section>
            <div class="text-body2 text-grey-7">
              <q-icon name="info" color="deep-orange" class="q-mr-sm" />
              You can change your dining preference later if needed.
            </div>
          </q-card-section>
        </q-card>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// 方法
function selectDiningType(type) {
  // 将选择的就餐方式保存到sessionStorage或传递给下一页
  sessionStorage.setItem('selectedDiningType', type)

  // 跳转到点餐页面
  router.push('/order')
}
</script>

<style scoped>
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.dining-option:hover {
  border-color: #FF5722;
}

.rounded-borders-lg {
  border-radius: 12px;
}

/* 自定义深橙色调色板 */
.bg-deep-orange {
  background-color: #FF5722 !important;
}

.text-deep-orange {
  color: #FF5722 !important;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .dining-option {
    min-height: 120px;
  }
}

/* 添加一些动画效果 */
.dining-option {
  transition: all 0.3s ease;
}

.dining-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 87, 34, 0.2);
}

.q-card {
  transition: all 0.3s ease;
}
</style>
