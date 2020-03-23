<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
      <span>选择商品分类：</span>
      <!-- 级联选择框 -->
      <!--
        v-model  选择框选中的数据，是个数组
        options  数据
        props    配置每项（每项的内容，每项的标签名）
        change   选中的节点发生变化执行
      -->
      <el-cascader
        v-model="selectedData"
        :options="categoriesList"
        :props="props"
        @change="handleChange"
        :clearable="true"
      ></el-cascader>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="showAddManyDialog">添加参数</el-button>
          <el-table :data="manyParamsData" border style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="delManyTag(scope.row.attr_id,index)"
                >{{item}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="#" width="50">
              <!-- 要想在表格中插入内容，必须使用自定义模板 作用域插槽slot-scope的值是一个对象 可以获取$index column row的值-->
              <template slot-scope="scope">{{scope.$index+1}}</template>
            </el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditManyDialog(scope.row)">
                  <i class="el-icon-edit"></i>修改
                </el-button>
                <el-button type="danger" size="mini" v-on:click="delMany(scope.row)">
                  <i class="el-icon-delete"></i>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态参数" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="showAddOnlyDialog">添加属性</el-button>
          <el-table :data="onlyParamsData" border style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable>{{item}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditOnlyDialog(scope.row)">
                  <i class="el-button-edit"></i>修改
                </el-button>
                <el-button type="danger" size="mini" @click="delOnly(scope.row)">
                  <i class="el-button-delete"></i>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数对话框 -->
    <el-dialog title="添加动态参数" :visible.sync="addManyDialog" @close="celarAddManyForm">
      <el-form :model="addManyForm" :rules="addManyRules" ref="addManyRef">
        <el-form-item label="动态参数" :label-width="formLabelWidth" prop="attr_name">
          <el-input v-model="addManyForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addManyDialog = false">取 消</el-button>
        <el-button type="primary" @click="addMany">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 动态参数编辑对话框 -->
    <el-dialog title="修改动态参数" :visible.sync="editManyDialog" @close="celarEditManyForm">
      <el-form :model="editManyForm" :rules="editManyRules" ref="editManyRef">
        <el-form-item label="动态参数" :label-width="formLabelWidth" prop="attr_name">
          <el-input v-model="editManyForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editManyDialog = false">取 消</el-button>
        <el-button type="primary" @click="editMany">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加静态属性 -->
    <el-dialog title="添加静态属性" :visible.sync="addOnlyDialog" @close="clearAddOnlyForm">
      <el-form :model="addOnlyForm" :rules="addOnlyRules" ref="addOnlyRef">
        <el-form-item label="静态属性" :label-width="formLabelWidth" prop="attr_name">
          <el-input v-model="addOnlyForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addOnlyDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOnly">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 静态属性编辑对话框 -->
    <el-dialog title="修改静态属性" :visible.sync="editOnlyDialog" @close="celarEditOnlyForm">
      <el-form :model="editOnlyForm" :rules="editOnlyRules" ref="editOnlyRef">
        <el-form-item label="静态参数" :label-width="formLabelWidth" prop="attr_name">
          <el-input v-model="editOnlyForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editOnlyDialog = false">取 消</el-button>
        <el-button type="primary" @click="editOnly">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 选择框绑定的值
      selectedData: [],
      // 参数列表数据
      categoriesList: [],
      // 配置项
      props: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 默认激活的选项卡name
      activeName: 'many',
      manyParamsData: [],
      onlyParamsData: [],
      formLabelWidth: '80px',
      // 动态参数对象
      addManyForm: {
        attr_name: ''
      },
      // 控制添加动态参数对话框的显示隐藏
      addManyDialog: false,
      // 添加动态参数校验
      addManyRules: {
        attr_name: [
          { required: true, message: '请添加参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改动态参数显示隐藏
      editManyDialog: false,
      editManyForm: {
        attr_name: '',
        attr_id: -1
      },
      editManyRules: {
        attr_name: [
          { required: true, message: '请添加参数名称', trigger: 'blur' }
        ]
      },
      // 控制添加静态属性对话框
      addOnlyDialog: false,
      addOnlyForm: {
        attr_name: ''
      },
      addOnlyRules: {
        attr_name: [
          { required: true, message: '请添加参数名称', trigger: 'blur' }
        ]
      },
      editOnlyDialog: false,
      editOnlyForm: {
        attr_name: '',
        attr_id: -1
      },
      editOnlyRules: {
        attr_name: [
          { required: true, message: '请添加参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoriesList()
  },
  computed: {
    // 监听级联选择器v-model的值长度是否不为3
    isDisabled() {
      return this.selectedData.length !== 3
    },
    // 监听级联选择器v-model的值的变化（存储分类id，因为在data数据中使用不了this）
    categoriesId() {
      return this.selectedData.length === 0
        ? 1
        : this.selectedData[this.selectedData.length - 1]
    }
  },
  methods: {
    // 获取参数列表数
    async getCategoriesList() {
      const res = await this.$http('categories', {
        type: 3
      })
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.categoriesList = data
      }
    },
    // 级联选择框内容变化
    handleChange(val) {
      this.getParamsList()
      // 如果选择框长度为0，清空数据
      if (this.selectedData.length === 0) {
        this.manyParamsData = []
        this.onlyParamsData = []
      }
    },
    // 面板的切换事件
    handleClick(val) {
      this.getParamsList()
    },
    // 获取参数数据
    async getParamsList() {
      const res = await this.$http(
        `categories/${
          this.selectedData[this.selectedData.length - 1]
        }/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      const { data, meta } = res.data
      if (meta.status === 200) {
        data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        if (this.activeName === 'many') {
          this.manyParamsData = data
        }
        if (this.activeName === 'only') {
          this.onlyParamsData = data
        }
        // console.log(this.manyParamsData)
      }
    },
    // 显示添加动态参数对话框
    showAddManyDialog() {
      this.addManyDialog = true
    },
    // 添加动态参数
    addMany() {
      this.$refs.addManyRef.validate(async valid => {
        if (!valid) return false
        // 校验完成，发生请求
        // console.log(this.selectedData[this.selectedData.length-1])
        const res = await this.$http.post(
          `categories/${
            this.selectedData[this.selectedData.length - 1]
          }/attributes`,
          {
            attr_name: this.addManyForm.attr_name,
            attr_sel: 'many',
            attr_vals: this.selectedData.join(',')
          }
        )
        const { data, meta } = res.data
        if (meta.status === 201) {
          // 关闭对话框
          this.addManyDialog = false
          // 重新渲染
          this.getParamsList()
        }
      })
    },
    // 清空添加动态参数对话框
    celarAddManyForm() {
      this.$refs.addManyRef.resetFields()
    },
    // 删除动态属性分类
    async delMany(row) {
      const res = await this.$http.delete(
        `categories/${row.cat_id}/attributes/${row.attr_id}`
      )
      if (res.data.meta.status === 200) {
        // 重新渲染
        this.getParamsList()
      }
    },
    // 显示动态参数编辑对话框
    showEditManyDialog(row) {
      this.editManyDialog = true
      this.editManyForm.attr_name = row.attr_name
      this.editManyForm.attr_id = row.attr_id
    },
    // 修改动态参数
    editMany() {
      this.$refs.editManyRef.validate(async valid => {
        if (!valid) return false
        const res = await this.$http.put(
          `categories/${this.categoriesId}/attributes/${this.editManyForm.attr_id}`,
          {
            attr_name: this.editManyForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.data.meta.status === 200) {
          this.editManyDialog = false
          this.getParamsList()
        }
      })
    },
    // 清空修改动态参数表单
    celarEditManyForm() {
      this.$refs.editManyRef.resetFields()
    },
    // 控制添加静态属性对话框显示隐藏
    showAddOnlyDialog() {
      this.addOnlyDialog = true
    },
    // 添加属性
    addOnly() {
      this.$refs.addOnlyRef.validate(async valid => {
        if (!valid) return false
        const res = await this.$http.post(
          `categories/${
            this.selectedData[this.selectedData.length - 1]
          }/attributes`,
          {
            attr_name: this.addOnlyForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.data.meta.status === 201) {
          this.addOnlyDialog = false
          this.getParamsList()
        }
      })
    },
    // 清空添加静态属性
    clearAddOnlyForm() {
      this.$refs.addOnlyRef.resetFields()
    },
    // 删除静态属性
    async delOnly(row) {
      try {
        await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await this.$http.delete(
          `categories/${this.categoriesId}/attributes/${row.attr_id}`
        )
        console.log(res)
        if (res.data.meta.status === 200) {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.addOnlyDialog = false
          this.getParamsList()
        }
      } catch (error) {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    // 显示静态属性对话框
    showEditOnlyDialog(row) {
      this.editOnlyDialog = true
      this.editOnlyForm.attr_id = row.attr_id
      this.editOnlyForm.attr_name = row.attr_name
    },
    // 修改静态属性
    async editOnly() {
      const res = await this.$http.put(
        `categories/${this.categoriesId}/attributes/${this.editOnlyForm.attr_id}`,
        {
          attr_name: this.editOnlyForm.attr_name,
          attr_sel: this.activeName
        }
      )
      if (res.data.meta.status === 200) {
        this.editOnlyDialog = false
        this.getParamsList()
      }
    },
    // 清空编辑属性对话框
    celarEditOnlyForm() {
      this.$refs.editOnlyRef.resetFields()
    },
    async delManyTag(attr_id, index) {
      const aaa = this.manyParamsData.find(item => item.attr_id === attr_id)
      aaa.attr_vals.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-cascader {
  margin-top: 15px;
}
.el-tag {
  margin: 6px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.el-table {
  margin-top: 15px;
}
</style>