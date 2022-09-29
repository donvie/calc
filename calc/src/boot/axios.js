import Vue from 'vue'
import axios from 'axios'

import { stringify } from 'qs'

axios.interceptors.request.use(
  (config) => {
    if (config.method === 'post') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      config.data = stringify(config.data)
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

Vue.prototype.$axios = axios
