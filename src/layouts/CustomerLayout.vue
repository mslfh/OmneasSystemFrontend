<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white text-grey-8 shadow-2" height-hint="64">
      <q-toolbar class="q-px-md">
        <!-- 返回按钮 (仅在非首页显示) -->
        <q-btn
          v-if="$route.path !== '/'"
          flat
          round
          icon="arrow_back"
          color="grey-7"
          size="md"
          @click="goBack"
        />

        <q-toolbar-title class="text-weight-bold text-h6 text-deep-orange">
          <q-icon name="restaurant" size="sm" class="q-mr-sm" />
          <!-- OmnEats -->
        </q-toolbar-title>

        <q-space />

        <!-- 进度指示器 -->
        <div class="row items-center q-gutter-xs q-mr-md" v-if="showProgress">
          <div
            v-for="(step, index) in progressSteps"
            :key="index"
            class="progress-dot"
            :class="{ 'active': index <= currentStepIndex, 'completed': index < currentStepIndex }"
          >
            <q-icon
              v-if="index < currentStepIndex"
              name="check"
              size="14px"
              color="white"
            />
          </div>
        </div>

        <!-- 用户菜单 -->
        <q-btn v-if="false" round flat icon="account_circle" size="md" color="grey-7">
          <q-menu anchor="bottom right" self="top right" class="shadow-4">
            <q-list style="min-width: 180px" class="q-py-sm">
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="history" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Order History</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Profile</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Settings</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-1  q-mt-md">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "CustomerLayout",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const progressSteps = [
      { name: 'Order', path: '/' },
      { name: 'Confirm', path: '/confirm' },
      { name: 'Payment', path: '/checkout' },
      { name: 'Complete', path: '/confirmation' }
    ];

    const currentStepIndex = computed(() => {
      const currentPath = route.path;
      const stepIndex = progressSteps.findIndex(step => step.path === currentPath);
      return stepIndex >= 0 ? stepIndex : 0;
    });

    const showProgress = computed(() => {
      const progressPaths = ['/', '/confirm', '/checkout', '/confirmation'];
      return progressPaths.includes(route.path);
    });

    function goBack() {
      router.go(-1);
    }

    function goToProfile() {
      router.push('/profile');
    }

    return {
      progressSteps,
      currentStepIndex,
      showProgress,
      goBack,
      goToProfile
    };
  },
});
</script>

<style scoped>

/* 进度指示器样式 */
.progress-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.progress-dot.active {
  background-color: #FF5722;
  color: white;
}

.progress-dot.completed {
  background-color: #4CAF50;
  color: white;
}

.progress-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 2px;
  background-color: #e0e0e0;
  transition: background-color 0.3s ease;
}

.progress-dot.completed:not(:last-child)::after {
  background-color: #4CAF50;
}

/* 菜单项悬停效果 */
.q-item {
  border-radius: 8px;
  margin: 2px 8px;
  transition: background-color 0.2s ease;
}

.q-item:hover {
  background-color: #f5f5f5;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .progress-dot {
    width: 16px;
    height: 16px;
  }

  .progress-dot:not(:last-child)::after {
    width: 6px;
    right: -9px;
  }
}
</style>
