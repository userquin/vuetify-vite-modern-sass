<template>
  <div>
    <v-app>
      <v-main>
        <VRow
          no-gutters
          justify="center"
          align="center"
          class="fill-height pa-0 ma-0"
        >
          <VCol cols="10" md="6" sm="8">
            <VRow justify="center" align="center">
              <VCol cols="12" md="6" sm="10">
                <div>
                  <h1 class="text-h4 font-weight-medium">Welcome back</h1>
                  <p class="text-body-1 text-medium-emphasis mt-2">
                    Don't have an account?
                    <RouterLink class="font-weight-medium text-primary"
                     to="#">Sign up</RouterLink
                    >
                  </p>
                </div>
                <VForm :disabled="loading" @submit.prevent="submit" class="mt-10">
                  <FormLabel for="email">Email</FormLabel>
                  <VTextField v-model="email" id="email" type="email" />
                  <label
                    class="font-weight-medium mt-2 d-block mb-1 text-body-2"
                    for="password"
                  >Password</label
                  >
                  <VTextField
                    v-model="password"
                    @click:append-inner="
                      passwordType == 'password'
                        ? (passwordType = 'text')
                        : (passwordType = 'password')
                    "
                    :append-inner-icon="
                      passwordType == 'password'
                        ? 'fluent:eye-24-regular'
                        : 'fluent:eye-off-24-regular'
                    "
                    id="password"
                    :type="passwordType"
                  />
                  <p class="text-medium-emphasis text-body-2 mt-3">
                    <RouterLink
                      class="text-primary font-weight-medium" to="#"
                    >
                      Forgot password?
                    </RouterLink>
                  </p>
                  <div class="mt-10">
                    <VBtn
                      :loading="loading"
                      type="submit"
                      flat
                      class="gradient primary font-weight-bold text-body-2"
                      block
                      min-height="45"
                    >Sign In</VBtn
                    >
                  </div>
                </VForm>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="12" md="6" class="hidden-sm-and-down">
            <div class="bg rounded-lg"></div>
          </VCol>
        </VRow>
      </v-main>
    </v-app>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormLabel from "@/components/FormLabel.vue";

const email = ref('');
const password = ref('');
const passwordType = ref('password');
const loading = ref(false);

const submit = async () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2500);
};
</script>
