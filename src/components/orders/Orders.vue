<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="ordersForm.query"
            class="input-with-select"
            clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="queryOrders"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="ordersList" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_id" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" v-if="scope.row.order_pay==='0'">未付款</el-button>
            <el-button type="success" size="mini" v-else>已付款</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time|formatTime}}</template>
        </el-table-column>
        <el-table-column prop="address" label="操作" width="200">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini" @click="editAdress">编辑</el-button>
            <el-button
              icon="el-icon-position"
              type="success"
              size="mini"
              @click="showProgressDialog"
            >物流</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="ordersForm.pagenum"
      :page-sizes="[10, 15, 20, 30]"
      :page-size.sync="ordersForm.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 修改地址对话框 -->
    <el-dialog title="收货地址" :visible.sync="editAdressDialog" @close="clear">
      <el-form :model="editAdressform" :rules="editAddressRules" ref="ruleForm">
        <el-form-item label="省市区/县" :label-width="formLabelWidth" prop="address1">
          <el-cascader
            v-model="editAdressform.address1"
            :options="options"
            @change="handleChange"
            :props="porps"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" :label-width="formLabelWidth" prop="address2">
          <el-input v-model="editAdressform.address2" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAdressDialog = false">取 消</el-button>
        <el-button type="primary" @click="addAdress">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 物流信息对话框 -->
    <el-dialog title="查看物流进度" :visible.sync="dialogFormVisible">
      <div slot="footer" class="dialog-footer">
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(item, index) in infoList"
            :key="index"
            :timestamp="item.time"
          >{{item.context}}</el-timeline-item>
        </el-timeline>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './cityData'
export default {
  data() {
    return {
      ordersList: [],
      ordersForm: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editAdressDialog: false,
      editAdressform: {
        address1: '',
        address2: ''
      },
      formLabelWidth: '100px',
      editAddressRules: {
        address1: [{ required: true, message: '请选择省市', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入地址', trigger: 'blur' }]
      },
      options: cityData,
      porps: {
        label: 'n',
        value: 'n',
        children: 's'
      },
      dialogFormVisible: false,
      infoList: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context:
            '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context:
            '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  created() {
    this.getOrdersData()
    // 获取省市区数据

    // 获取物流信息
    this.getInfo()
  },
  methods: {
    async getOrdersData() {
      const res = await this.$http.get('orders', {
        params: this.ordersForm
      })
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.ordersList = data.goods
        this.total = data.total
      }
    },
    handleSizeChange(newSize) {
      this.ordersForm.pagesize = newSize
      this.getOrdersData()
    },
    handleCurrentChange(page) {
      this.ordersForm.pagenum = page
      this.getOrdersData()
    },
    queryOrders() {
      this.ordersForm.pagenum = 1
      this.getOrdersData()
    },
    getProvince() {},
    editAdress() {
      this.editAdressDialog = true
    },
    addAdress() {
      this.$refs.ruleForm.validate(validate => {
        if (!validate) return false
        // 校验完成
        this.editAdressDialog = false
        this.getOrdersData()
      })
    },
    // 级联框内容变化触发
    handleChange() {},
    clear() {
      this.$refs.ruleForm.resetFields()
    },
    async showProgressDialog() {
      this.dialogFormVisible = true
      // const res = await this.$http.get(`/kuaidi/1106975712662`)
      // console.log(res)
      // if (res.data.meta.status === 200) {
      //   this.infoList = res.data.data
      // }
    },
    getInfo() {}
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-table {
  margin: 15px 0;
}
.el-timeline {
  text-align: left;
}
</style>