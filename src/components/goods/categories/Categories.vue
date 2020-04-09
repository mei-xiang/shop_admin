<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 添加按钮 -->
    <el-button type="primary" style="margin-bottom: 15px;" @click="showAddCateDialog">添加分类</el-button>

    <!-- 表格 -->
    <tree-table
      :data="listData"
      :columns="columns"
      :show-index="true"
      index-text="#"
      border
      show-row-hover
      :expand-type="false"
      :selection-type="false"
    >
      <!-- 在表格中插入列内容，需要使用自定义插槽 -->
      <template slot="valid" slot-scope="scope">
        <i
          v-if="scope.row.cat_deleted === false"
          class="el-icon-circle-check"
          style="color:rgb(32, 178, 170)"
        ></i>
        <i v-else class="el-icon-circle-close" style="color: red"></i>
      </template>
      <template slot="order" slot-scope="scope">
        <el-button type="primary" size="mini" v-if="scope.row.cat_level === 0">一级</el-button>
        <el-button type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-button>
        <el-button type="warning" size="mini" v-else>三级</el-button>
      </template>
      <template slot="set" slot-scope="scope">
        <el-button type="primary" size="small" @click="showEditCateDialog(scope.row)">编辑</el-button>
        <el-button type="danger" size="small" @click="delCategories(scope.row.cat_id)">删除</el-button>
      </template>
    </tree-table>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCategoriesDialog" @close="clearAddCateDialog">
      <el-form :model="addCategoriesForm" :rules="rules" ref="addCategoriesForm">
        <el-form-item label="分类名称" :label-width="formLabelWidth" prop="cat_name">
          <el-input v-model="addCategoriesForm.cat_name" autocomplete="off"></el-input>
        </el-form-item>
        <!--
          v-model  选中的值（是个数组，存储多个值）
          options  数据（有分级的）
          props    配置选项内容（是个对象）
          @change  节点内容变化时触发
          clear    清空选项内容

          props: {
            expandTrigger: click/hover  次级菜单的展开方式
            value:   指定选项的值
            label:   指定选项的标签名
            children: 指定选项的子选项名（数据分节点）
            checkStrictly: 父子节点取消选中关联
          }
        -->
        <el-form-item label="父级分类" :label-width="formLabelWidth">
          <el-cascader
            v-model="parentVal"
            :options="firstAndTwoCateList"
            :props="props"
            @change="handleChange"
            :clearable="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCategoriesDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCategories">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialog" @close="clearEditCateDialog">
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateForm">
        <el-form-item label="分类名称" :label-width="formLabelWidth" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分页组件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pagenum"
      :page-sizes="[2, 5, 10, 20]"
      :page-size.sync="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 添加分类数据
      addCategoriesForm: {
        // 分类名称
        cat_name: '',
        // 分类层级（1，2，3级）根据级联选择框的change事件的参数数组长度判断
        cat_level: 0,
        // 父级分类（默认为0）
        // 父级分类没有选，则表示自己本身就是父级分类，cat_pid为0
        // 当父级分类选择了,根据级联选择框的@change监听事件,根据参数数组的长度判断cat_pid的值
        cat_pid: 0
      },
      // 控制添加分类对话框显示隐藏
      addCategoriesDialog: false,
      formLabelWidth: '80px',
      // 表单校验
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        cat_level: [
          { required: true, message: '请选择父级分类', trigger: 'blur' }
        ]
      },
      // 当前页
      pagenum: 1,
      // 每页的条数
      pagesize: 5,
      // 总页数
      total: 1,
      // 列表数据
      listData: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'valid'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'set'
        }
      ],
      // 一级二级分类数据
      firstAndTwoCateList: [],
      props: {
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        // 选项对象的值
        value: 'cat_id',
        // 选项对象的标签名
        label: 'cat_name',
        //
        children: 'children',
        checkStrictly: true
      },
      // 父级分类的值
      parentVal: [],
      // 编辑对话框数据
      editCateForm: {
        cat_name: '',
        id: -1
      },
      editCateDialog: false,
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCategoriesData()
  },
  methods: {
    // 获取所有一级二级分类
    async getAllFirstAndTwoCate () {
      const res = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      console.log(res)
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.firstAndTwoCateList = data
      }
    },
    // 获取列表数据
    async getCategoriesData () {
      const res = await this.$http.get('categories', {
        params: {
          type: 3,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.listData = data.result
        this.total = data.total
      }
    },
    // 显示对话框
    showAddCateDialog () {
      this.addCategoriesDialog = true
      this.getAllFirstAndTwoCate()
    },

    handleSizeChange (val) {
      this.pagesize = val
      this.pagenum = 1
      this.getCategoriesData()
    },
    handleCurrentChange (val) {
      this.pagenum = val
      this.getCategoriesData()
    },
    // 删除分类数据
    async delCategories (id) {
      try {
        await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await this.$http.delete(`categories/${id}`)
        if (res.data.meta.status === 200) {
          this.getCategoriesData()
          this.$message({
            tyep: 'success',
            message: res.data.meta.msg
          })
        }
      } catch (error) {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    // 选中节点发生变化时
    handleChange (val) {
      // 可以通过节点变化时触发的这个change事件,参数存储的节点数组设置分类id
      // 也可以通过v-model进行设置
      // 根据选中节点的长度设置分类层级
      if (val.length === 0) {
        // 父分类id
        this.addCategoriesForm.cat_pid = 0
        // 当前层级
        this.addCategoriesForm.cat_level = 0
      }
      if (val.length === 1) {
        // 父分类id
        this.addCategoriesForm.cat_pid = val[0]
        // 当前层级
        this.addCategoriesForm.cat_level = 1
      }
      if (val.length === 2) {
        this.addCategoriesForm.cat_pid = val[1]
        this.addCategoriesForm.cat_level = 2
      }
    },
    // 添加分类
    addCategories () {
      this.$refs.addCategoriesForm.validate(valid => {
        if (!valid) return false
        console.log(this.addCategoriesForm)
        this.$http.post('categories', this.addCategoriesForm).then(res => {})
        // 关闭对话框
        this.addCategoriesDialog = false
        // 重新渲染
        this.getCategoriesData()
      })
    },
    // 清空添加对话框
    clearAddCateDialog () {},
    // 显示编辑对话框
    showEditCateDialog (row) {
      this.editCateDialog = true
      this.editCateForm.cat_name = row.cat_name
      this.editCateForm.id = row.cat_id
    },
    // 清空编辑对话框
    clearEditCateDialog () {
      this.$refs.editCateForm.resetFields()
    },
    // 编辑分类
    async editCate () {
      const res = await this.$http.put(`categories/${this.editCateForm.id}`, {
        cat_name: this.editCateForm.cat_name
      })
      console.log(res)
      if (res.data.meta.status === 200) {
        this.editCateDialog = false
        this.getCategoriesData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-select {
  width: 100%;
}
.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
