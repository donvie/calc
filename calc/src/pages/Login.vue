<template>
  <q-page class="flex flex-center q-pa-xl">
    <div class="row q-col-gutter-xs">
      <div class="col-12 text-center">
        <h5>点击登录</h5>
      </div>
      <div class="col-12">
        <q-input ref="username" v-model="username" label="账号" :rules="[ val => val && val.length > 0 || '账号 can not be empty!']" />
      </div>
      <div class="col-12">
        <q-input ref="password" v-model="password" label="密码"  :type="isPwd ? 'password' : 'text'" :rules="[ val => val && val.length > 0 || '密码 can not be empty!']">
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
      <div class="col-12 q-mt-md">
        <q-btn :loading="loading" label="登录" @click="login()" unelevated color="primary" class="full-width" />
      </div>
      <div class="col-12 text-center q-mt-sm">
        还没有账号？<router-link to="/register">点击注册</router-link>
      </div>
    </div>
  </q-page>
</template>

<script>

export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
      loading: false,
      isPwd: true
    }
  },
  methods: {
    login () {
      this.$refs.username.validate()
      this.$refs.password.validate()

      if (this.$refs.username.hasError || this.$refs.password.hasError) {
        this.formHasError = true
      } else {
        this.loading = true
        this.$axios({
          method: 'post',
          url: '/api/v1/login',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: 'Bearer {token}'
          },
          data: {
            username: this.username,
            password: this.password
          }
        }).then((response) => {
          this.$q.localStorage.set('user', response.data)
          this.$router.push('/')
          this.loading = false
          this.$q.notify({
            icon: 'done',
            message: 'You have successfully logged in.',
            color: 'positive'
          })
        }).catch(error => {
          this.loading = false
          console.log('error', error)
          this.$q.notify({
            icon: 'close',
            message: 'Error!',
            color: 'negative'
          })
        })
      }
    }
  }
}
</script>
