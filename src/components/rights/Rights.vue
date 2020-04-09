<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-table ref="singleTable" :data="rightsList" style="width: 100%">
      <el-table-column width="50" label="#">
        <!-- 自定义模板列 通过slot-scope可以获取 row column $index -->
        <template slot-scope="scope">{{scope.$index+1}}</template>
      </el-table-column>
      <el-table-column property="authName" label="权限名称"></el-table-column>
      <el-table-column property="path" label="路径"></el-table-column>
      <el-table-column label="等级">
        <template slot-scope="scope">
          <el-button type="primary" plain v-if="scope.row.level==='0'" size="small">一级</el-button>
          <el-button type="success" plain v-else-if="scope.row.level==='1'" size="small">二级</el-button>
          <el-button type="warning" plain v-else size="small">三级</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },

  created () {
    this.getRightsData()
  },

  methods: {
    // 获取权限列表数据
    async getRightsData () {
      const res = await this.$http.get('/rights/list')
      console.log(res)
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.rightsList = data
      }
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
</style>
