<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-xl items-center">
      <div class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3">
        <q-select
          @filter="filterFn"
          use-chips
          behavior="menu"
          outlined
          dense
          v-model="category"
          :options="categories"
          label="获取背篓分类数据"
          option-value="id"
          option-label="item_name"
        />
      </div>
      <div class="col-auto">
        <q-btn label="确定" :loading="loading" :disable="category === null" @click="getLists()" unelevated color="primary" />
      </div>
    </div>

    <q-markup-table dense bordered separator="vertical" flat v-if="list">
      <thead>
        <tr>
          <th class="text-center" v-for="(field, itemFieldsIndex) in itemFields" :key="itemFieldsIndex">
            {{field.value}}
            <!-- {{field.key}} -->
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(value, itemValueIndex) in itemValue" :key="itemValueIndex">
          <td class="text-center" v-for="(val, valueIndex) in value.filter(val => val.key !== 'row')" :key="valueIndex">
            {{calculateItemValue(value, itemValueIndex, val, valueIndex)}}
            <!-- <pre>{{val}}</pre> -->
            <!-- {{itemValueIndex}} -->
            <span v-if="valueIndex === 0">
              <!-- {{val.filter}} -->
              <q-input style="min-width: 50px; max-height: 30px" :value="val.filter" disable dense />
            </span>
            <span v-else>
              <!-- {{math.evaluate(val.formula)}} -->
              <!-- {{val.value = math.evaluate(val.formula)}} -->
              <!-- {{isNumber(val.filter)}} -->
              <q-input style="min-width: 50px; max-height: 30px" :disable="!isNumber(val.filter)" @input="$forceUpdate()" :min="0" v-model.number="val.value" type="number" dense />
            </span>
            <!-- {{math.evaluate(val.formula)}} -->
            <!-- <q-input @input="$forceUpdate()" :min="0" v-model.number="val.value" type="number" dense /> -->
            <!-- <pre>{{val}}</pre> -->
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <div class="fixed-center" v-if="list === null"><h6><q-icon name="warning" size="36px" color="grey" class="q-mr-sm" />No data preview</h6></div>
  </q-page>
</template>

<script>

import { create, all } from 'mathjs'
const math = create(all)

export default {
  name: 'Basket',
  data () {
    return {
      math,
      category: null,
      categories: [],
      list: null,
      loading: false,
      num: 0
    }
  },
  mounted () {
    if (this.$q.localStorage.has('listBasket')) {
      this.list = this.$q.localStorage.getItem('listBasket')
    }
    if (this.$q.localStorage.has('categoryBasket')) {
      this.category = this.$q.localStorage.getItem('categoryBasket')
    }
  },
  computed: {
    itemFields () {
      return this.list.item_fields.split('|').map(value => {
        const splitValue = value.split('=')
        return {
          key: splitValue[0].replace(/\s+/g, ' ').trim(),
          value: splitValue[1].replace(/\s+/g, ' ').trim()
        }
      })
    },
    itemValue () {
      return this.list.item_value.split('|').map(value => {
        const splitValue = value.split(',')
        return splitValue.map(element => {
          const splitVal = element.split('=')
          // console.log(splitVal)
          return {
            key: splitVal[0].replace(/\s+/g, ' ').trim(),
            // value: splitVal[0] === 'length' || splitVal[0] === 'meter_weight' ? splitVal[1] : 0,
            value: splitVal[1] === '' ? '0' : splitVal[1].replace(/\s+/g, ' ').trim(),
            filter: splitVal[1] === '' ? '0' : splitVal[1].replace(/\s+/g, ' ').trim(),
            formula: splitVal[1] === '' ? '0' : splitVal[1].replace(/\s+/g, ' ').trim()
          }
        })
      })
    }
  },
  methods: {
    isNumber (n) {
      return /^-?[\d.]+(?:e-?\d+)?$/.test(n)
    },
    isLetter (str) {
      return str.length === 1 && str.match(/[a-z]/i)
    },
    calculateItemValue (value, itemValueIndex, val, valueIndex) {
      let strFilter = ''
      let dataFilter = val.filter

      value.forEach(v => {
        strFilter = ''
        strFilter += dataFilter.replace(v.key, (data) => {
          return v.value
        })

        dataFilter = strFilter
      })

      this.$set(val, 'formula', strFilter)

      if (val.key !== 'item' && this.isNumber(val.filter) === false) {
        this.$set(val, 'value', math.evaluate(strFilter))
      }

      if (val.key === 'money') {
        if (val.formula.includes('-') === true) {
          const split = val.formula.split('-')
          // console.log('splitt', parseInt(split[0]), parseInt(split[1]))
          // console.log('splitt', parseInt(split[0] - 1), parseInt(split[1] - 1))
          const items = this.itemValue.slice(parseInt(split[0] - 1), parseInt(split[1]))
          // console.log(items.map(item => item[7]))
          const valTotal = items.map(item => item[7]).reduce((prev, cur) => { return prev + parseFloat(cur.value) }, 0)
          // console.log(parseFloat(valTotal))
          // console.log('valTotal', valTotal)
          this.$set(val, 'value', parseFloat(valTotal))
        }
      }
    },
    filterFn (val, update, abort) {
      if (this.categories.length !== 0) {
        update()
        return
      }

      this.$axios({
        method: 'post',
        url: '/api/v1/beilou/category',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Bearer ${this.$q.localStorage.getItem('user').api_token}`
        }
      }).then((response) => {
        update(() => {
          // console.log('category', response)
          this.categories = response.data
        })
      }).catch(error => {
        update()
        console.log('error', error)
      })
    },
    getLists () {
      this.loading = true
      this.$axios({
        method: 'post',
        url: '/api/v1/beilou/lists',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Bearer ${this.$q.localStorage.getItem('user').api_token}`
        },
        data: {
          id: this.category.id
        }
      }).then((response) => {
        this.list = response.data
        this.$q.localStorage.set('listBasket', response.data)
        this.$q.localStorage.set('categoryBasket', this.category)
        this.loading = false
      }).catch(error => {
        console.log('error', error)
      })
    }
  }
}
</script>
