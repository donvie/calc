<template>
  <q-page class="flex flex-center q-pa-xl">
    <div class="row q-col-gutter-xs">
      <div class="col-12 text-center">
        <h5>点击注册</h5>
      </div>
      <div class="col-12">
        <q-input ref="username" v-model="username" label="账号" :rules="[ val => val && val.length > 0 || '账号 can not be empty!']" />
      </div>
      <div class="col-12">
        <q-input ref="password" label="密码" v-model="password" :type="isPwd ? 'password' : 'text'" :rules="[ val => val && val.length > 0 || '密码 can not be empty!']">
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-input ref="re_password" label="密码" v-model="re_password" :type="isRePwd ? 'password' : 'text'" :rules="[ val => val && val.length > 0 || '密码 can not be empty!']">
          <template v-slot:append>
            <q-icon
              :name="isRePwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isRePwd = !isRePwd"
            />
          </template>
        </q-input>
      </div>
      <div class="col-12 q-mt-md">
        <q-btn :loading="loading" label="登录" @click="register()" unelevated color="primary" class="full-width" />
      </div>
      <div class="col-12 text-center q-mt-sm">
        已有账号? <router-link to="/login">点击登录</router-link>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      username: '',
      password: '',
      re_password: '',
      loading: false,
      isPwd: true,
      isRePwd: true
    }
  },
  methods: {
    register () {
      this.$refs.username.validate()
      this.$refs.password.validate()
      this.$refs.re_password.validate()

      if (this.$refs.username.hasError || this.$refs.password.hasError || this.$refs.re_password.hasError) {
        this.formHasError = true
      } else {
        this.loading = true
        this.$axios({
          method: 'post',
          url: '/api/v1/reg',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: 'Bearer {token}'
          },
          data: {
            username: this.username,
            password: this.password,
            re_password: this.re_password
          }
        }).then((response) => {
          this.$router.push('/login')
          this.loading = false
          this.$q.notify({
            icon: 'done',
            message: 'You have successfully registered.',
            color: 'positive'
          })
        }).catch(error => {
          this.loading = false
          this.$q.notify({
            icon: 'close',
            message: 'Error!',
            color: 'negative'
          })
          console.log('error', error)
        })
      }
    }
  }
}
</script>
