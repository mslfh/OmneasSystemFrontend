<template>

  <q-layout view="hHh lpR fFf">
    <q-header class="bg-grey-1 text-grey-8" elevated  :inset-shadow="!$q.screen.gt.sm">
      <q-toolbar class="GNL__toolbar">

        <q-toolbar-title shrink class="row items-center no-wrap">
          <img width="100px" height="40px" src="../assets/logo.png" />
        </q-toolbar-title>

        <q-space />
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            v-if="$q.screen.gt.sm"
            round
            dense
            flat
            color="text-grey-7"
            icon="apps"
          >
            <q-tooltip>Google Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="grey-8" icon="notifications">
            <q-badge color="deep-orange-5" text-color="white" floating> 2 </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>

          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
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

    <q-page-container>
          <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { fasGlobeAmericas, fasFlask } from "@quasar/extras/fontawesome-v5";
import { defineComponent } from "vue";
import { ref } from "vue";
import { useQuasar } from "quasar";
import Profile from "./Profile.vue";

const links1 = [
  { icon: "move_to_inbox", text: "Inbox" },
  { icon: "star", text: "Stared" },
  { icon: "send", text: "Sent" },
  { icon: "error", text: "Spam" },
];
const links2 = [
  { icon: "flag", text: "Updates", color: "text-orange" },
  { icon: "group", text: "Social", color: "text-red" },
  { icon: "label", text: "Promos", color: "text-indigo-8" },
  { icon: "forum", text: "Forums", color: "text-teal" },
];

export default defineComponent({
  name: "CustomerLayout",
  components: {
    Profile,
  },
  setup() {
    const $q = useQuasar();

    // $q.screen.setSizes({ sm: 300, md: 500, lg: 1000, xl: 2000 })

    const leftDrawerOpen = ref(false);
    const miniState = ref(false);

    return {
      slide: ref(1),
      autoplay: ref(true),
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      miniState,
      toogleMiniState() {
        miniState.value = !miniState.value;
      },
      search: "",
      showAdvanced: ref(false),
      showDateOptions: ref(false),
      exactPhrase: "",
      hasWords: "",
      excludeWords: "",
      byWebsite: "",
      byDate: "Any time",
      links1,
      links2,
      mail_data: [
        {
          name: "Pratik Patel",
          avatar: "https://avatars2.githubusercontent.com/u/34883558?s=400&v=4",
          date: "March 12, 2019",
        },
        {
          name: "Pratik Patel",
          avatar: "https://avatars2.githubusercontent.com/u/34883558?s=400&v=4",
          date: "March 22, 2019",
        },
        {
          name: "Pratik Patel",
          avatar: "https://avatars2.githubusercontent.com/u/34883558?s=400&v=4",
          date: "March 12, 2019",
        },
        {
          name: "Winfield Stapforth",
          avatar: "https://cdn.quasar.dev/img/avatar6.jpg",
          date: "March 22, 2019",
        },
        {
          name: "Jeff Galbraith",
          avatar: "https://cdn.quasar.dev/team/jeff_galbraith.jpg",
          date: "March 12, 2019",
        },
        {
          name: "Jeff Galbraith",
          avatar: "https://cdn.quasar.dev/team/jeff_galbraith.jpg",
          date: "March 22, 2019",
        },
        {
          name: "Razvan Stoenescu",
          avatar: "https://cdn.quasar.dev/team/razvan_stoenescu.jpeg",
          date: "March 12, 2019",
        },
        {
          name: "Razvan Stoenescu",
          avatar: "https://cdn.quasar.dev/team/razvan_stoenescu.jpeg",
          date: "March 22, 2019",
        },
        {
          name: "John Doe",
          avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
          date: "March 12, 2019",
        },
        {
          name: "Pratik Patel",
          avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
          date: "March 22, 2019",
        },
      ],
    };
  },
  mounted() {
    this.mail_data = this.mail_data.map(function (item) {
      item["msg"] =
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti\n" +
        "              commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste\n" +
        "              eveniet doloribus ullam aliquid.";
      return item;
    });
  },
});
</script>

<style>
.GNL__toolbar {
  height: 64px;
}

.GNL__toolbar-input {
  width: 55%;
}

.GNL__drawer-item {
  line-height: 24px;
  border-radius: 0 24px 24px 0;
  margin-right: 12px;
}

.GNL__drawer-item .q-item__section--avatar .q-icon {
  color: #5f6368;
}

.GNL__drawer-item .q-item__label {
  color: #3c4043;
  letter-spacing: 0.01785714em;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
}

.GNL__drawer-footer-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.75rem;
}

.GNL__drawer-footer-link:hover {
  color: #000;
}
</style>
