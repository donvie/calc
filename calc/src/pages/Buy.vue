<template>
  <q-page class="q-pa-xl">
    <div class="row q-col-gutter-md" v-if="buy">
      <div class="col-xs-12 col-sm-6 col-md-6">
        {{buy.content}}
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 text-center">
        <q-img
          class="q-mb-md"
          alt="Quasar logo"
          :src="buy.qrcode"
        />

        <br>
        QQ：{{buy.qq}}<br>
        微信: {{buy.wechat}} <br>
        电话: {{buy.telphone}} <br>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      buy: null
    }
  },
  mounted () {
    this.$axios({
      method: 'post',
      url: '/api/v1/user/buy',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Bearer ${this.$q.localStorage.getItem('user').api_token}`
      }
    }).then((response) => {
      console.log(response)
      this.buy = response.data
    }).catch(error => {
      console.log(error)
    })
  }
}
</script>
