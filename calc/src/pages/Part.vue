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
          label="部件类型和型号选择"
          option-value="id"
          :option-label="(item) => item === null ? 'Null value' : item.title + ' '+ item.xinghao"
        />
      </div>
      <div class="col-auto">
        <q-btn :loading="loading" :disable="category === null" @click="getLists()" label="确定" unelevated color="primary" />
      </div>
    </div>

    <div class="tableFixHead"  v-if="lists.length !== 0">
      <q-markup-table bordered separator="vertical" dense flat class="table table-bordered">
        <thead>
          <tr>
            <th :class="values[0].filter(val => val.isformula).map(val => val.key).includes(categoryField.key) ? 'bg-green' : ''" class="text-center" v-for="(categoryField, index) in categoryFields" :key="index">
              <!-- {{categoryField.key}} -->
              {{categoryField.value}}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- <pre>{{values}}</pre> -->
          <tr v-for="(value, valuesIndex) in values" :key="valuesIndex">
            <td style="max-height: 2px;" :class="data.isformula ? 'bg-positive': ''" class="text-center" v-for="(data, valueIndex) in value" :key="valueIndex">
              <!-- <pre>{{data}}</pre> -->
              <span v-if="data.isformula === true">
                {{calculateValue(value, data)}}
                <q-input style="min-width: 50px; max-height: 30px" disable :value="math.evaluate(data.filter).toFixed(2)" dense />
              </span>
              <span v-else>
                <!-- <span v-if="valueIndex === 0 || valueIndex === 1 || valueIndex === 20">
                  {{data.value}}
                  <q-input style="min-width: 50px;" disable :value="data.value" dense />
                </span> -->
                <span v-if="values.map(v => v[valueIndex]).filter(val => !isNumeric(val.value)).length !== 0">
                  {{data.value}}
                </span>
                <span v-else>
                  <q-input style="min-width: 50px; max-height: 30px" @input="$forceUpdate()" :min="0" v-model.number="data.value" type="number" dense />
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
    <div class="fixed-center" v-if="lists.length === 0"><h6><q-icon name="warning" size="36px" color="grey" class="q-mr-sm" />No data preview</h6></div>
  </q-page>
</template>

<script>

import { create, all } from 'mathjs'
const math = create(all)

export default {
  name: 'Part',
  data () {
    return {
      math,
      category: null,
      categories: [],
      lists: [],
      loading: false
    }
  },
  mounted () {
    if (this.$q.localStorage.has('listsPart')) {
      this.lists = this.$q.localStorage.getItem('listsPart')
    }
    if (this.$q.localStorage.has('categoryPart')) {
      this.category = this.$q.localStorage.getItem('categoryPart')
    }
  },
  computed: {
    values () {
      return this.lists.map(data => {
        const values = data.values.split('|').map(value => {
          const splitValue = value.split('=')
          // console.log(splitValue[1].replace(/\s+/g, ' ').trim())
          return {
            key: splitValue[0].replace(/\s+/g, ' ').trim(),
            value: splitValue[0] === 'xinghao' ? splitValue[1].replace(/\s+/g, ' ').trim() : splitValue[1].replace(/\s+/g, ' ').trim()
          }
        })

        const categoryFormula = data.category.formula.split('|').map(formula => {
          const splitFormula = formula.split('=')
          return {
            key: splitFormula[1].replace(/\s+/g, ' ').trim(),
            value: 0,
            filter: splitFormula[0].replace(/\s+/g, ' ').trim(),
            formula: splitFormula[0].replace(/\s+/g, ' ').trim(),
            isformula: true
          }
        })

        const source = values.concat(categoryFormula)

        const order = this.categoryFields.map(categoryField => categoryField.key)
        return this.mapOrder(source, order, 'key')
      })
    },
    categoryFields () {
      return this.lists[0].category.fileds.split('|').map(field => {
        const splitField = field.split('=')
        return {
          key: splitField[0].replace(/\s+/g, ' ').trim(),
          value: splitField[1].replace(/\s+/g, ' ').trim()
        }
      })
    },
    categoryFormula () {
      return this.lists.map(data => { return data.category.formula.split('|') })
    }
  },
  methods: {
    isNumeric (num) {
      return !isNaN(num)
    },
    isLetter (str) {
      return str.length === 1 && str.match(/[a-z]/i)
    },
    calculateValue (value, data) {
      const filterValue = value.filter(v => {
        const indxOf = data.formula.indexOf(v.key)
        const subStr = data.formula.substr(indxOf)
        const lngth = v.key.length
        const isString = data.formula.substr(lngth + indxOf).substring(0, 1)
        return subStr.startsWith(v.key) && (this.isLetter(isString) === null || this.isLetter(isString) === false)
      })

      let strFilter = ''
      let dataFilter = data.formula
      filterValue.forEach((filter, index) => {
        strFilter = ''
        strFilter += dataFilter.replace(filter.key, (data) => {
          return filter.value
        })

        dataFilter = strFilter
      })

      this.$set(data, 'filter', strFilter)
      this.$set(data, 'value', math.evaluate(strFilter).toFixed(2))
    },
    mapOrder (a, order, key) {
      const map = order.reduce((r, v, i) => { r[v] = i; return r }, {})
      return a.sort((a, b) => map[a[key]] - map[b[key]])
    },
    getLists () {
      this.loading = true
      this.$axios({
        method: 'post',
        url: '/api/v1/xinghao/lists',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Bearer ${this.$q.localStorage.getItem('user').api_token}`
        },
        data: {
          category_id: this.category.id
        }
      }).then((response) => {
        console.log('response', response)
        this.lists = response.data
        this.$q.localStorage.set('listsPart', response.data)
        this.$q.localStorage.set('categoryPart', this.category)
        this.loading = false
      }).catch(error => {
        console.log('error', error)
      })
    },
    filterFn (val, update, abort) {
      if (this.categories.length !== 0) {
        update()
        return
      }

      this.$axios({
        method: 'post',
        url: '/api/v1/xinghao/category',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Bearer ${this.$q.localStorage.getItem('user').api_token}`
        }
      }).then((response) => {
        update(() => {
          this.categories = response.data
        })
      }).catch(error => {
        update()
        console.log('error', error)
      })
    }
  }
}
</script>

<style scoped>
.tableFixHead {
  overflow: auto;
  height: auto;
  width: 100%;
}

.tableFixHead table {
  border-collapse: collapse;
  width: 100%;
}

td:first-child, th:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: #f5f5f5;
}

td:nth-child(2), th:nth-child(2)  {
  position: sticky;
  left: 60px;
  z-index: 1;
  background-color: #f5f5f5;
}

.tableFixHead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

th:first-child, th:nth-child(2) {
  z-index: 3;
}
</style>
