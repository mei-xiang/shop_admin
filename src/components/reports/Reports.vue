<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 2. 准备结构 -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 引包
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      },
      newOptions: {}
    }
  },
  created() {
    // this.getReportsData()
  },
  async mounted() {
    // 3. 初始化
    var myChart = echarts.init(document.getElementById('main'))
    // 4. 准备配置项和数据
    const res = await this.$http.get('reports/type/1')
    const { data, meta } = res.data
    console.log(res)
    if (meta.status === 200) {
      // 1.这是jq的两个对象合并
      // this.newOptions = $.extend(this.options,data)

      // 2.这是原生的方法  Object(target, sources1, sources2...)
      // var obj = Object.assign(this.options, data)

      // 3.这是ES6提供的扩展运算符
      // const obj = {...this.options, ...data}

      // 注意： 第2，3中方法出现了同样的属性会覆盖，而不是追加

      // 4.这是lodash提供的工具函数
      const obj = _.merge(this.options, data)
      // console.log(obj)
      myChart.setOption(obj)
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
</style>