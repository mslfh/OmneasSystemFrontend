<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import Messages from "./Messages.vue";
import Profile from "./Profile.vue";
import CustomerHistoryTimeline from "src/components/tools/CustomerHistoryTimeline.vue";
import { api } from "boot/axios";
import {
  getCurrentUser,
  getUserRole,
  canAccessAllMenus,
  canOnlyAccessSchedule,
} from "../utils/auth";

const APP_TITLE = import.meta.env.VITE_APP_TITLE;
const showingNavigationDropdown = ref(false);
const leftDrawerOpen = ref(false);
const zoomDrawer = ref(false);
const $q = useQuasar();

// User role management
const currentUser = ref(null);
const userRole = ref("");

// Get current user info from localStorage
onMounted(() => {
  currentUser.value = getCurrentUser();
  console.log("Current User:", currentUser.value);
  userRole.value = getUserRole();
  console.log("User Role:", userRole.value);
  console.log("Is Admin or Desk:", canAccessAllMenus());
  console.log("Is Staff Only:", canOnlyAccessSchedule());
});

// Computed properties for role-based visibility
const isAdminOrDesk = computed(() => canAccessAllMenus());
const isStaffOnly = computed(() => canOnlyAccessSchedule());

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const zoomLeftDrawer = () => {
  zoomDrawer.value = !zoomDrawer.value;
};

// Get user initials for avatar display
function getUserInitials() {
  if (!currentUser.value) return "?";

  const name = currentUser.value.name;
  if (!name) return "?";

  // If name has spaces, get first letter of first and last name
  const nameParts = name.trim().split(" ");
  if (nameParts.length > 1) {
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  }

  // Otherwise just get first letter
  return name.charAt(0).toUpperCase();
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="bg-white absolute-top shadow_custom q-mx-lg q-mt-md q-py-xs"
      style="right: 8px; border-radius: 6px"
    >
      <q-toolbar class="no-shadow">
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          icon="menu"
          aria-label="Menu"
          color="grey"
        />
        <q-input
          borderless
          :dense="$q.screen.lt.sm"
          debounce="300"
          clearable
          v-model="searchField"
          :placeholder="
            $q.screen.gt.sm && isAdminOrDesk
              ? 'Search customer by  phone, name or email.'
              : 'Search'
          "
          style="width: 100%; padding-left: 20px"
          @update:model-value="onSearch"
        >
          <template v-slot:before>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-menu v-if="false">
          <q-list>
            <q-item v-for="user in foundUsers" :key="user.id">
              <q-item-section>
                <q-item-label>{{ user.name }}</q-item-label>
                <q-item-label caption>{{ user.phone }}</q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
                <q-item-label caption>
                  <q-btn
                    flat
                    size="sm"
                    color="primary"
                    label="view history"
                    @click="viewHistory(user)"
                  />
                  <q-btn
                    flat
                    size="sm"
                    color="primary"
                    label="Add Appointment "
                    @click="addAppointment(user)"
                  />
                  <!-- <q-btn
                    flat
                    size="sm"
                    color="primary"
                    label="View Profile"
                    @click="viewProfile(user)"
                  /> -->
                </q-item-label>
              </q-item-section>
              <!-- <q-item-section side>
                <q-btn
                  flat
                  size="sm"
                  color="primary"
                  label="view history"
                  @click="viewHistory(user)"
                />
              </q-item-section> -->
            </q-item>
          </q-list>
        </q-menu>
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            round
            dense
            flat
            color="grey-8"
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="
              () => {
                zoomDrawer = true;
                $q.fullscreen.toggle();
              }
            "
            v-if="$q.screen.gt.sm"
          >
          </q-btn>
          <q-btn
            v-if="false"
            round
            dense
            flat
            color="grey-8"
            icon="notifications"
          >
            <q-badge color="red" text-color="white" floating> 5 </q-badge>
            <q-menu>
              <q-list style="min-width: 100px">
                <messages></messages>
                <q-card class="text-center no-shadow no-border">
                  <q-btn
                    label="View All"
                    style="max-width: 120px !important"
                    flat
                    dense
                    class="text-indigo-8"
                  ></q-btn>
                </q-card>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn round dense flat>
            <q-avatar size="26px" color="primary" text-color="white">
              {{ getUserInitials() }}
              <q-tooltip>
                {{ currentUser?.name || "Unknown User" }} ({{
                  userRole || "No Role"
                }})
              </q-tooltip>
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 200px">
                <profile></profile>
                <q-card class="text-center no-shadow no-border"> </q-card>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="zoomDrawer ? 70 : 250"
      bordered
      class="bg-white text-grey-7 items-center"
    >
      <q-scroll-area
        q-scroll-area
        style="
          height: calc(100% - 80px);
          padding: 10px;
          margin-top: 80px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list>
          <!-- Dashboard - Only for Admin and Desk -->
          <q-item
            v-if="isAdminOrDesk"
            to="/admin/dashboard"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Product - Only for Admin and Desk -->
          <q-item
            to="/admin/product"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="bookmark" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Product</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Product Information - Only for Admin and Desk -->
          <q-expansion-item icon="inbox" label="Product Info">
            <q-list class="q-pl-lg">
              <q-item
                to="/admin/category"
                active-class="q-item-no-link-highlighting"
              >
                <q-item-section avatar>
                  <q-icon name="o_category" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Category</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                to="/admin/item"
                active-class="q-item-no-link-highlighting"
              >
                <q-item-section avatar>
                  <q-icon name="o_description" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Item</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                to="/admin/attribute"
                active-class="q-item-no-link-highlighting"
              >
                <q-item-section avatar>
                  <q-icon name="o_data_object" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Attribute</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- Invoice - Only for Admin and Desk -->
          <q-item to="/admin/order" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="payments" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Order</q-item-label>
            </q-item-section>
          </q-item>

          <!-- History - Only for Admin and Desk -->
          <q-item
            v-if="false"
            to="/admin/history"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="schedule" />
            </q-item-section>
            <q-item-section>
              <q-item-label>History</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Schedule - Visible for all roles -->
          <q-item
            to="/admin/schedule"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="calendar_month" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Schedule</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Staff - Only for Admin and Desk -->
          <q-item
            v-if="isAdminOrDesk"
            to="/admin/staff"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="storefront" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Staff</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Services - Only for Admin and Desk -->
          <q-expansion-item v-if="false" icon="pages" label="Services">
            <q-list class="q-pl-lg">
              <q-item
                to="/admin/package"
                active-class="q-item-no-link-highlighting"
              >
                <q-item-section avatar>
                  <q-icon name="view_list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Package</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                to="/admin/service"
                active-class="q-item-no-link-highlighting"
              >
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Service</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- Voucher - Only for Admin and Desk -->
          <q-item
            v-if="false"
            to="/admin/voucher"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="redeem" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Voucher</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Setting - Only for Admin and Desk -->
          <q-item
            to="/admin/setting"
            active-class="q-item-no-link-highlighting"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Setting</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div class="absolute-top" style="height: 100px; padding-left: 10px">
        <div class="absolute-bottom bg-transparent">
          <q-toolbar
            class="bg-white text-grey-8 drawer-toolbar"
            :class="{ 'drawer-mini': zoomDrawer }"
          >
            <q-avatar
              size="40px"
              style="background-color: #f5f5f5"
              @click="zoomLeftDrawer"
              class="drawer-logo"
            >
              <img src="../assets/sidebar-dashboard.png" alt="Logo" />
            </q-avatar>
            <q-toolbar-title
              v-show="!zoomDrawer"
              class="text-weight-medium text-grey-8"
              style="
                font-size: 1.3rem;
                letter-spacing: -1px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ APP_TITLE }}
            </q-toolbar-title>
          </q-toolbar>
        </div>
      </div>

      <div
        class="q-mini-drawer-hide absolute"
        style="top: 30px; right: -17px"
        v-if="!zoomDrawer"
      >
        <q-btn
          round
          flat
          dense
          icon="chevron_left"
          aria-label="Close"
          @click="zoomLeftDrawer"
          style="
            background-color: rgb(105, 108, 255);
            color: white;
            border: 6px solid rgb(242, 242, 247);
          "
        ></q-btn>
      </div>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <q-page class="q-pa-md q-mt-sm">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="css">
.shadow_custom {
  box-shadow: 0 3px 8px #303c491f !important;
}
.drawer-toolbar {
  display: flex;
  align-items: center;
  height: 100px;
  padding: 0 8px;
}
.drawer-logo {
  margin: 0 auto;
  transition: margin 0.2s;
}
.drawer-mini .drawer-logo {
  margin-left: auto;
  margin-right: auto;
}
.drawer-mini .drawer-title {
  display: none !important;
}
</style>
