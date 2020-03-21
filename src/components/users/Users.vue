<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row>
      <el-col :span="8">
        <div style="margin-top: 15px;">
          <el-input placeholder="请输入搜索内容" v-model="search" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="serachUser"></el-button>
          </el-input>
        </div>
      </el-col>
      <el-col :span="4" class="addUser">
        <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 
        el-table：
        data   为表单数据
        border 条纹码表格
        el-table-column：
        prop   数据中的属性名（字段名称）
        lable  每一列的标题名称
        width  每一列的宽度
    -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column label="#" width="50">
        <!-- 要想在表格中插入内容，必须使用自定义模板 作用域插槽slot-scope的值是一个对象 可以获取$index column row的值-->
        <template slot-scope="scope">
          {{
          scope.$index + 1 + (currentPage - 1) * pageSize
          }}
        </template>
      </el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column prop="mg_state" label="状态">
        <!-- 表格中要想插入内容，需要自定义列模板，用template等任意标签包裹 通过作用域插槽slot-scope 可以获取$index,column,row的值 {{scope.$index}}--{{scope.row}}--{{scope.column}}
        -->
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#dcdfe6"
            @change="changeUserState(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditUserDialog(scope.row)"
          ></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delUser(scope.row.id)"></el-button>
          <el-button
            type="warning"
            icon="el-icon-s-tools"
            size="mini"
            @click="showAssignRoleDialog(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <!-- current-page 和 page-size 可以添加.sync 进行数据同步（子组件改变父组件数据，修改props数据） -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[2, 5, 10, 15]"
      :page-size.sync="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" @close="closeUserDialog">
      <el-form :model="addUserForm" :rules="rules" ref="addUserForm">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="addUserForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="addUserForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="addUserForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="addUserForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改信息对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editUserDialog" @close="closeEditDialog">
      <el-form :model="editUserForm" ref="editUserForm" :rules="rules">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="editUserForm.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="editUserForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="editUserForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="assignRoleDialog">
      <p>
        <span>当前的用户：</span>
        <span>{{ curUser.username }}</span>
      </p>
      <p>
        <span>当前的角色：</span>
        <span>{{ curUser.rolename }}</span>
      </p>
      <div style="margin-top: 15px;">
        <span>分配新角色：</span>
        <el-select v-model="newRole" slot="prepend" placeholder="请选择">
          <el-option
            :label="item.roleName"
            :value="item.id"
            v-for="item in rolesList"
            :key="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="assignRole()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newRole: '',
      rolesList: [],
      // 搜索内容
      search: '',
      // 列表数据
      tableData: [],
      // 当前页
      currentPage: 1,
      // 每页显示多少条
      pageSize: 2,
      // 总数
      total: 1,
      addUserDialog: false,
      assignRoleDialog: false,
      curUser: {
        id: -1,
        username: '',
        rolename: ''
      },
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      formLabelWidth: '80px',
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 6,
            message: '用户名长度在 3 到 6 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 3,
            max: 6,
            message: '密码长度在 3 到 6 个字符',
            trigger: 'blur'
          }
        ],
        email: [{ required: true, message: '请添加邮箱地址', trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
      },
      editUserDialog: false,
      editUserForm: {
        id: -1,
        username: '',
        email: '',
        mobile: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 6,
            message: '用户名长度在 3 到 6 个字符',
            trigger: 'blur'
          }
        ],
        email: [{ required: true, message: '请添加邮箱地址', trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getListData()
    this.getAllRoles()
  },
  methods: {
    // 获取所有角色
    async getAllRoles() {
      const res = await this.$http.get('/roles')
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.rolesList = data
      }
    },
    getListData(page = 1) {
      // 已经将axios对象添加到Vue实例中了，不用每次使用都要导axios模块
      // 已经设置了请求的公共路径 axios.defaults.baseURL = '公共路径部分'
      // 已经设置了请求和响应拦截器 axios.interceptors.request.use() axios.interceptors.response.use() 在每次请求前都会走请求拦截器，将请求头设置在这里。在每次响应后都会走响应拦截器，根据返回的status为401无效状态码，返回登录页router.push('/login)并删除token
      this.$http('/users', {
        params: {
          // 当前页
          pagenum: this.currentPage,
          // 每页展示多少条数据
          pagesize: this.pageSize,
          query: this.search || ''
        }
      }).then(res => {
        const { data, meta } = res.data
        if (meta.status === 200) {
          this.tableData = data.users
          this.total = data.total
          this.currentPage = data.pagenum
        }
        // status===401 token无效已在响应拦截器完成
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getListData()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getListData()
    },

    // 用户列表搜索
    serachUser() {
      // if(this.search === '') return false
      this.currentPage = 1
      this.getListData()
    },

    // 添加用户对话框显示/隐藏
    showAddUserDialog() {
      this.addUserDialog = true
    },

    // 添加用户
    addUser() {
      this.$refs.addUserForm.validate(valid => {
        if (!valid) return false
        // console.log("校验成功");
        this.$http.post('/users', this.addUserForm).then(res => {
          // 清空表单
          this.$refs.addUserForm.resetFields()
          // 关闭对话框
          this.addUserDialog = false
          // 列表数据重新渲染
          this.currentPage = 1
          this.getListData()
        })
      })
    },

    // 关闭添加用户对话框
    closeUserDialog() {
      // 清空表单元素
      this.$refs.addUserForm.resetFields()
    },

    // 修改状态
    changeUserState(scope) {
      const { id, mg_state } = scope
      this.$http.put(`/users/${id}/state/${mg_state}`).then(res => {
        console.log(res)
        const { meta } = res.data
        if (meta.status === 200) {
          this.$message({
            type: 'success',
            message: meta.msg
          })
        } else {
          this.$message({
            message: meta.msg,
            type: 'error'
          })
        }
      })
    },

    // 删除用户数据
    delUser(id) {
      this.$confirm('是否删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // this.$message({
          //   type: "success",
          //   message: "删除成功!"
          // });
          this.$http.delete(`/users/${id}`).then(res => {
            // 删除成功
            if (res.data.meta.status === 200) {
              this.$message({
                type: 'success',
                message: res.data.meta.msg
              })
              // 重新渲染
              // this.currentPage = 1;
              this.getListData()
            }
          })
        })
        .catch(() => {
          // this.$message({
          //   type: "info",
          //   message: "已取消删除"
          // });
        })
    },

    // 显示编辑用户信息对话框
    showEditUserDialog(scope) {
      console.log(scope)
      // 将从表格自定义模板列通过slot-scope将数据传送过来
      for (const key in this.editUserForm) {
        this.editUserForm[key] = scope[key]
      }
      this.editUserDialog = true
    },

    // 关闭编辑用户对话框
    closeEditDialog() {
      // 只要关闭了对话框就会触发
      this.$refs.editUserForm.resetFields()
    },

    // 点击修改按钮，进行校验，发送请求，关闭对话框，重新渲染
    editUser() {
      this.$refs.editUserForm.validate(valid => {
        if (!valid) return false
        // 校验完成
        const { id, username, email, mobile } = this.editUserForm
        this.$http
          .put(`/users/${id}`, {
            email,
            mobile
          })
          .then(res => {
            const { data, meta } = res.data
            if (meta.status === 200) {
              // 关闭对话框
              this.editUserDialog = false
              // 重新渲染
              this.getListData()
            }
          })
      })
    },

    // 显示分配角色对话框
    showAssignRoleDialog(curUser) {
      this.assignRoleDialog = true
      this.curUser.username = curUser.username
      this.curUser.rolename = curUser.role_name
      this.curUser.id = curUser.id
    },

    // 修改角色
    async assignRole() {
      if (!this.newRole) return false
      const res = await this.$http.put(`/users/${this.curUser.id}/role`, {
        rid: this.newRole
      })
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.assignRoleDialog = false
        this.newRole = ''
        // const item = this.tableData.find(item => item.id === this.curUser.id);
        // item.role_name = this.newRole;
        this.getListData()
      }
    }
  }
}
</script>

<style scoped>
.el-select .el-input {
  width: 130px;
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
.addUser {
  line-height: 67px;
  margin-left: 20px;
}
.el-pagination {
  margin-top: 20px;
}
</style>
