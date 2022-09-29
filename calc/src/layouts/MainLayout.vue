<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered v-if="$route.path !== '/login' && $route.path !== '/register'">
      <q-toolbar>
        <q-tabs shrink stretch>
          <q-route-tab
            label="暖气片"
            to="/"
            exact
          />
          <q-route-tab
            label="卫浴"
            to="/basket"
            exact
          />
          <q-route-tab
            label="购买"
            to="/buy"
            exact
          />
        </q-tabs>

        <q-space />

        <div>{{this.$q.localStorage.getItem('user').username}}</div>
        <q-avatar class="q-ml-sm">
          <q-icon name="account_circle" size="36px" />
          <!-- <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg"> -->
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item @click="logOut()" clickable v-close-popup>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',
  data () {
    return {
    }
  },
  methods: {
    logOut () {
      this.$q.loading.show()
      this.$axios({
        method: 'post',
        url: '/api/v1/logout',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Bearer ${this.$q.localStorage.getItem('user').api_token}`
        },
        data: {
          api_token: this.$q.localStorage.getItem('user').api_token
        }
      }).then((response) => {
        this.$q.localStorage.remove('user')
        this.$q.localStorage.remove('listBasket')
        this.$q.localStorage.remove('listsPart')
        this.$q.localStorage.remove('categoryPart')
        this.$q.localStorage.remove('categoryBasket')
        this.$router.push('/login')
        this.$q.loading.hide()
      }).catch(error => {
        this.$q.loading.hide()
        console.log('error', error)
      })
    }
  }
}
</script>
