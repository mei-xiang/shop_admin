<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="query"
            class="input-with-select"
            clearable
            @clear="clearInput"
          >
            <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="jumpAddGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodsList" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | formatTime}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">修改</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delGoods(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pagenum"
        :page-sizes="[5, 10, 15 , 20]"
        :page-size.sync="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goodsList: [],
      // 查询条件
      query: '',
      // 当前页
      pagenum: 1,
      // 每页条数
      pagesize: 5,
      total: 0
    }
  },
  created() {
    this.getGoodsData()
  },
  methods: {
    async getGoodsData() {
      const res = await this.$http.get('goods', {
        params: {
          query: this.query || '',
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      console.log(res)
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.goodsList = data.goods
        this.total = data.total
      }
    },
    handleSizeChange(val) {
      this.pagesize = val
      this.pagenum = 1
      this.getGoodsData()
    },
    handleCurrentChange(page) {
      this.pagenum = page
      this.getGoodsData()
    },
    searchGoods() {
      this.pagenum = 1
      this.getGoodsData()
    },
    clearInput() {
      this.pagenum = 1
      this.getGoodsData()
    },
    async delGoods(goods_id){
      const res = await this.$http.delete(`goods/${goods_id}`)
      if(res.data.meta.status===200){
        this.getGoodsData()
      }
    },
    // 点击添加商品按钮,跳转添加商品组件
    jumpAddGoods(){
      this.$router.push('/home/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-table{
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>