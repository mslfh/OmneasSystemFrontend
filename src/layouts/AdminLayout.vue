<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import Messages from './Messages.vue'
import Profile from './Profile.vue'
import EssentialLink from 'components/EssentialLink.vue'

const APP_TITLE = import.meta.env.VITE_APP_TITLE
const showingNavigationDropdown = ref(false)
const leftDrawerOpen = ref(false)
const zoomDrawer = ref(false)
const $q = useQuasar()

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const zoomLeftDrawer = () => {
  zoomDrawer.value = !zoomDrawer.value
}
</script>

<style>
/* FONT AWESOME GENERIC BEAT */
.fa-beat {
  animation: fa-beat 5s ease infinite;
}

@keyframes fa-beat {
  0% {
    transform: scale(1);
  }

  5% {
    transform: scale(1.25);
  }

  20% {
    transform: scale(1);
  }

  30% {
    transform: scale(1);
  }

  35% {
    transform: scale(1.25);
  }

  50% {
    transform: scale(1);
  }

  55% {
    transform: scale(1.25);
  }

  70% {
    transform: scale(1);
  }
}
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      elevated
      class="bg-white shadow_custom q-mx-lg q-mt-md q-py-sm"
      style="right: 8px; border-radius: 4px"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          icon="menu"
          aria-label="Menu"
          color="grey-8"
        />
        <q-toolbar-title> Quasar App </q-toolbar-title>
        <q-space />
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            round
            dense
            flat
            color="grey-8"
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()"
            v-if="$q.screen.gt.sm"
          >
          </q-btn>

          <q-btn round dense flat color="grey-8" icon="notifications">
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
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
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
      :width="zoomDrawer ? 70 : 290"
      bordered
      class="bg-white text-grey-8 items-center"
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
          <q-item active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/admin/appointment" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="calendar_month" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Appointment</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/admin/schedule" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="calendar_month" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Schedule</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/admin/staff" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Staff</q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item icon="pages" label="Services">
            <q-list class="q-pl-lg">
              <q-item to="/admin/package" active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="view_list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Package</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/admin/service"  active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="add_box" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Service</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
          <q-expansion-item icon="pages" label="Product Items">
            <q-list class="q-pl-lg">
              <q-item active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Category</q-item-label>
                </q-item-section>
              </q-item>
              <q-item active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="inventory_2" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Unit</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item icon="map" label="Maps">
            <q-list class="q-pl-lg">
              <q-item to="/Map" active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="map" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Map</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/MapMarker" active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="location_on" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Map Marker</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/StreetView" active-class="q-item-no-link-highlighting">
                <q-item-section avatar>
                  <q-icon name="streetview" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Street View</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-item to="/Mail" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="email" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Mail</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/directory" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="card_giftcard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Directory</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/TreeTable" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>TreeTable</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Charts" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="insert_chart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Charts</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Footer" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Footer</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/CardHeader" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="card_giftcard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Card Header</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Cards" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="card_giftcard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Cards</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Tables" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="table_chart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Tables</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Contact" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Contact</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Checkout" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="check_circle_outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Checkout</q-item-label>
            </q-item-section>
          </q-item>

          <!--        not completed-->
          <q-item to="/Calendar" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="date_range" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Calendar</q-item-label>
            </q-item-section>
          </q-item>

          <!--        not completed-->
          <!--        <q-item to="/Taskboard" active-class="q-item-no-link-highlighting">-->
          <!--          <q-item-section avatar>-->
          <!--            <q-icon name="done"/>-->
          <!--          </q-item-section>-->
          <!--          <q-item-section>-->
          <!--            <q-item-label>Taskboard</q-item-label>-->
          <!--          </q-item-section>-->
          <!--        </q-item>-->

          <q-item to="/Pagination" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="date_range" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pagination</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/Ecommerce" active-class="q-item-no-link-highlighting">
            <q-item-section avatar>
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Product Catalogues</q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item icon="menu_open" label="Menu Levels">
            <q-item class="q-ml-xl" active-class="q-item-no-link-highlighting">
              <q-item-section>
                <q-item-label>Level 1</q-item-label>
              </q-item-section>
            </q-item>
            <q-expansion-item :header-inset-level="0.85" label="Level 2">
              <q-item
                class="q-ml-xl"
                style="margin-left: 55px !important"
                active-class="q-item-no-link-highlighting"
              >
                <q-item-section>
                  <q-item-label>Level 2.1</q-item-label>
                </q-item-section>
              </q-item>
              <q-expansion-item :header-inset-level="1" label="Level 2.2">
                <q-item
                  style="margin-left: 65px !important"
                  active-class="q-item-no-link-highlighting"
                >
                  <q-item-section>
                    <q-item-label>Level 2.2.1</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  style="margin-left: 65px !important"
                  active-class="q-item-no-link-highlighting"
                >
                  <q-item-section>
                    <q-item-label>Level 2.2.2</q-item-label>
                  </q-item-section>
                </q-item>
              </q-expansion-item>
            </q-expansion-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
      <div class="absolute-top" style="height: 80px; padding-left: 10px">
        <div class="absolute-bottom bg-transparent">
          <q-toolbar class="bg-white text-grey-8">
            <q-avatar
              size="40px"
              class="q-mr-md"
              style="background-color: #f5f5f5"
              @click="zoomLeftDrawer"
            >
              <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" alt="Quasar Logo" />
            </q-avatar>
            <q-toolbar-title
              class="text-weight-medium"
              style="font-size: 1.4rem; letter-spacing: -0.5px"
              > {{APP_TITLE}} </q-toolbar-title
            >
          </q-toolbar>
        </div>
      </div>

      <div class="q-mini-drawer-hide absolute" style="top: 30px; right: -17px" v-if="!zoomDrawer">
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
      <q-page class="q-pa-lg q-mt-md">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
