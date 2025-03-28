<template>
  <q-page class="q-pa-sm q-ma-md" >
    <!-- notice -->
    <!-- <q-card class="q-mb-md">
      <q-card-header>
        <div
          style="height: 10px; border-radius: 5px 5px 0px 0px"
          class="bg-red-3"
        ></div>
      </q-card-header>
      <q-card-section>
        <div class="text-h8">Before booking, please read.</div>
      </q-card-section>
    </q-card> -->
    <div class="row q-col-gutter-sm">
      <!-- steper -->
      <div class="col-lg-7 col-md-7 col-sm-12 col-xs-12">
        <q-stepper
          v-model="step"
          header-nav
          ref="stepper"
          color="primary"
          class="no-shadow"
          bordered
          animated
          :contracted="$q.screen.lt.md"
        >
          <!-- Select a service -->
          <q-step
            :name="1"
            title="Select Service"
            icon="shopping_cart"
            :done="step > 1"
            :header-nav="step > 1"
          >
            <!-- service List -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="q-pa-sm">
                <div
                  class="text-subtitle1 text-weight-bold q-mt-sm q-mb-xs text-blue-9"
                >
                  1. INITIAL APPOINTMENT - Premium Remedial | Relaxation
                  Massage.
                </div>
                <div class="text-caption text-grey">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-none">
                <q-btn
                  color="grey"
                  round
                  flat
                  dense
                  :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  @click="expanded = !expanded"
                />
              </q-card-actions>

              <q-slide-transition>
                <div v-show="expanded">
                  <q-list bordered>
                    <q-expansion-item
                      label="* The Original | 60minutes"
                      expand-icon="add"
                      expanded-icon="keyboard_arrow_up"
                      header-class="text-primary text-subtitle1 text-weight-medium"
                    >
                      <q-card>
                        <q-card-section class="q-pt-none q-pb-none">
                          <div
                            class="text-subtitle2 text-weight-regular text-grey-7"
                          >
                            Premium Remedial | Relaxation Massage Please note:
                            This Therapist is NOT a Pregnancy Massage trained
                            Therapist.
                          </div>
                          <div align="right">
                            <q-span
                              class="text-subtitle1 text-weight-bold text-grey-8"
                            >
                              $80.00
                            </q-span>
                          </div>
                        </q-card-section>
                        <q-card-actions align="right" class="q-pa-none">
                          <q-btn
                            color="primary"
                            flat
                            dense
                            icon="arrow_forward"
                            label="Book Now"
                            @click="
                              () => {
                                done1 = true;
                                step = 2;
                              }
                            "
                          />
                        </q-card-actions>
                      </q-card>
                    </q-expansion-item>
                    <q-separator />
                    <q-expansion-item
                      label="* The Original | 70minutes"
                      expand-icon="add"
                      expanded-icon="keyboard_arrow_up"
                      header-class="text-primary text-subtitle1 text-weight-medium"
                    >
                      <q-card>
                        <q-card-section class="q-pt-none q-pb-none">
                          <div
                            class="text-subtitle2 text-weight-regular text-grey-7"
                          >
                            Premium Remedial | Relaxation Massage Please note:
                            This Therapist is NOT a Pregnancy Massage trained
                            Therapist.
                          </div>
                          <div align="right">
                            <q-span
                              class="text-subtitle1 text-weight-bold text-grey-8"
                            >
                              $80.00
                            </q-span>
                          </div>
                        </q-card-section>
                        <q-card-actions align="right" class="q-pa-none">
                          <q-btn
                            color="primary"
                            flat
                            dense
                            icon="arrow_forward"
                            label="Book Now"
                            @click="
                              () => {
                                done1 = true;
                                step = 2;
                              }
                            "
                          />
                        </q-card-actions>
                      </q-card>
                    </q-expansion-item>
                  </q-list>
                </div>
              </q-slide-transition>
            </q-card>
            <q-card flat bordered class="q-mb-md">
              <q-card-section class="q-pa-sm">
                <div
                  class="text-subtitle1 text-weight-bold q-mt-sm q-mb-xs text-blue-9"
                >
                  2. INITIAL APPOINTMENT - Premium Remedial | Relaxation
                  Massage.
                </div>
                <div class="text-caption text-grey">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-none">
                <q-btn
                  color="grey"
                  round
                  flat
                  dense
                  :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  @click="expanded = !expanded"
                />
              </q-card-actions>

              <q-slide-transition>
                <div v-show="expanded">
                  <q-list bordered>
                    <q-expansion-item
                      label="* The Original | 60minutes"
                      expand-icon="add"
                      expanded-icon="keyboard_arrow_up"
                      header-class="text-primary text-subtitle1 text-weight-medium"
                    >
                      <q-card>
                        <q-card-section class="q-pt-none q-pb-none">
                          <div
                            class="text-subtitle2 text-weight-regular text-grey-7"
                          >
                            Premium Remedial | Relaxation Massage Please note:
                            This Therapist is NOT a Pregnancy Massage trained
                            Therapist.
                          </div>
                          <div align="right">
                            <q-span
                              class="text-subtitle1 text-weight-bold text-grey-8"
                            >
                              $80.00
                            </q-span>
                          </div>
                        </q-card-section>
                        <q-card-actions align="right" class="q-pa-none">
                          <q-btn
                            color="primary"
                            flat
                            dense
                            icon="arrow_forward"
                            label="Book Now"
                            @click="() => {done1 = true;step = 2;}"
                          />
                        </q-card-actions>
                      </q-card>
                    </q-expansion-item>
                    <q-separator />
                  </q-list>
                </div>
              </q-slide-transition>
            </q-card>
          </q-step>
          <!-- Select a Time & Practitioner -->
          <q-step
            :name="2"
            title="Select Time & Practitioner"
            icon="date_range"
            :done="step > 2"
            :header-nav="step > 2"
          >
            <div class="row">
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="card_detail.name"
                    label="Name on Card*"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.card_number"
                    label="Card Number *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    autogrow
                    outlined
                    v-model="address_detail.expiry_date"
                    class="full-width"
                    label="Expiry Date *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    autogrow
                    outlined
                    v-model="address_detail.cvv"
                    class="full-width"
                    label="CVV *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-checkbox
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.checkbox"
                    label="Remember credit card details for next time"
                  />
                </q-item>
              </div>
            </div>

            <q-stepper-navigation>
              <q-btn
                rounded
                @click="
                  () => {
                    done2 = true;
                    step = 3;
                  }
                "
                class="float-right q-mr-md q-mb-md"
                color="blue"
                label="Next"
              />
              <q-btn
                flat
                @click="step = 1"
                color="primary"
                rounded
                label="Back"
                class="q-mr-sm float-right"
              />
            </q-stepper-navigation>
          </q-step>
          <!-- Client Details -->
          <q-step
            :name="3"
            title="Client details"
            icon="edit_note"
            :done="step > 3"
            :header-nav="step > 3"
          >
            <div class="row">
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.first_name"
                    label="First Name *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.last_name"
                    label="Last Name *"
                  />
                </q-item>
              </div>
              <div class="col-12">
                <q-item>
                  <q-input
                    dense
                    autogrow
                    outlined
                    v-model="address_detail.address_line_1"
                    class="full-width"
                    label="Address line 1 *"
                  />
                </q-item>
              </div>
              <div class="col-12">
                <q-item>
                  <q-input
                    dense
                    autogrow
                    outlined
                    v-model="address_detail.address_line_2"
                    class="full-width"
                    label="Address line 2 *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.city"
                    label="City *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.state"
                    label="State"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.zip_code"
                    label="Zip Code"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-input
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.country"
                    label="Country *"
                  />
                </q-item>
              </div>
              <div class="col-6">
                <q-item>
                  <q-checkbox
                    dense
                    outlined
                    class="full-width"
                    v-model="address_detail.checkbox"
                    label="Use this address for payment details"
                  />
                </q-item>
              </div>
            </div>

            <q-stepper-navigation>
              <q-btn
                rounded
                @click="
                  () => {
                    done3 = true;
                    step = 4;
                  }
                "
                class="float-right q-mr-md q-mb-md"
                color="blue"
                label="Next"
              />
              <q-btn
                flat
                @click="step = 2"
                color="primary"
                rounded
                label="Back"
                class="q-mr-sm float-right"
              />
            </q-stepper-navigation>
          </q-step>
          <!-- Order Confirm -->
          <q-step
            :name="4"
            title="Review your order"
            icon="receipt"
            :header-nav="step > 4"
          >
            <div class="row">
              <div class="col-12">
                <q-item-label header class="text-h6"
                  >Order summary</q-item-label
                >
                <q-item class="full-width">
                  <q-item-section>
                    <q-item-label lines="1">Product 1</q-item-label>
                    <q-item-label caption>Caption</q-item-label>
                  </q-item-section>
                  <q-item-section side> $10.99 </q-item-section>
                </q-item>
                <q-separator></q-separator>
                <q-item class="full-width">
                  <q-item-section>
                    <q-item-label lines="1">Product 2</q-item-label>
                    <q-item-label caption>Caption Product 2</q-item-label>
                  </q-item-section>
                  <q-item-section side> $19.99 </q-item-section>
                </q-item>
                <q-separator></q-separator>
                <q-item class="full-width">
                  <q-item-section>
                    <q-item-label lines="1">Product 3</q-item-label>
                    <q-item-label caption>Caption Product 3</q-item-label>
                  </q-item-section>
                  <q-item-section side> $78.99 </q-item-section>
                </q-item>
                <q-separator></q-separator>
                <q-item class="full-width">
                  <q-item-section>
                    <q-item-label lines="1">Product 4</q-item-label>
                    <q-item-label caption>Caption Product 4</q-item-label>
                  </q-item-section>
                  <q-item-section side> $178.99 </q-item-section>
                </q-item>
                <q-separator></q-separator>

                <q-item class="full-width">
                  <q-item-section>
                    <q-item-label lines="1">Shipping</q-item-label>
                  </q-item-section>
                  <q-item-section side> Free </q-item-section>
                </q-item>
                <q-separator></q-separator>
                <q-item class="full-width" style="border-top: 3px dotted blue">
                  <q-item-section>
                    <q-item-label lines="1">Total</q-item-label>
                  </q-item-section>
                  <q-item-section side> $288.96 </q-item-section>
                </q-item>
              </div>
            </div>

            <q-card class="rounded-borders">
              <q-card-section horizontal>
                <q-card-section class="col-5 q-pt-xs">
                  <div class="text-h6 text-center">Shipping</div>
                  <div class="text-subtitle1">Pratik Patel</div>
                  <div class="text-subtitle2">4841 Johnston Locks</div>
                </q-card-section>
                <q-card-section class="col-7 q-pt-xs">
                  <div class="text-h6 text-center">Payment details</div>
                  <div class="text-subtitle1 q-mb-xs">Card type - Visa</div>
                  <div class="text-subtitle1 q-mb-xs">
                    Card holder - P***ik Patel
                  </div>
                  <div class="text-subtitle1 q-mb-xs">
                    Card Number - xxxx-xxxx-xxxx-1234
                  </div>
                  <div class="text-subtitle1 q-mb-xs">
                    Expiry date - 04/2012
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card>

            <q-stepper-navigation>
              <q-btn
                rounded
                @click="done4 = true"
                class="float-right q-mr-md q-mb-md"
                color="blue"
                label="Place Order"
              />
              <q-btn
                flat
                @click="step = 3"
                color="primary"
                rounded
                label="Back"
                class="q-mr-sm float-right"
              />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </div>

      <!--summary -->
      <div hidden="true" class="col-lg-5 col-md-5 col-sm-12 col-xs-12">
        <q-card class="bg-grey-2 no-shadow" bordered>
          <q-card-section class="text-center text-h6 text-black">
            <q-icon name="shopping_cart" class="q-mr-sm" />
            Order Summary
          </q-card-section>
          <q-card-section horizontal>
            <q-card-section class="col-5 flex flex-center">
              <q-img
                height="80px"
                class="rounded-borders"
                src="https://cdn.quasar.dev/img/parallax2.jpg"
              />
            </q-card-section>
            <q-card-section class="">
              <div class="text-subtitle2 q-mt-sm">Product 1</div>
              <div class="text-subtitle2 q-mb-xs">$10.99</div>
            </q-card-section>
          </q-card-section>
          <q-separator />
          <q-card-section horizontal class="q-pa-none">
            <q-card-section class="col-5 flex flex-center">
              <q-img
                height="80px"
                class="rounded-borders"
                src="https://cdn.quasar.dev/img/parallax2.jpg"
              />
            </q-card-section>
            <q-card-section class="">
              <div class="text-subtitle2 q-mt-md">Product 2</div>
              <div class="text-subtitle2 q-mb-xs">$19.99</div>
            </q-card-section>
          </q-card-section>
          <q-separator />

          <q-separator></q-separator>
          <q-card-section class="row">
            <div class="col-12 text-h6 full-width">
              <div class="float-right q-mr-md">
                Total : <span class="text-blue">$288.96</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
  <q-page-sticky
    v-if="$q.screen.lt.sm"
    position="bottom-right"
    :offset="[10, 20]"
  >
    <q-btn round icon="checklist" direction="up" color="purple-4"> </q-btn>
  </q-page-sticky>
</template>

<script setup>
import { ref } from "vue";
import { useProductStore } from "../stores/ProductStore";

const productStore = useProductStore();
const selectedProduct = productStore.selectedProduct;
console.log(selectedProduct);

const step = ref(1);
const address_detail = ref({});
const card_detail = ref({});
const expanded = ref(false);
</script>

<style scoped></style>
