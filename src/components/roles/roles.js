import { valid } from "semver"

export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 添加角色
      rolesAddForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色对话框
      rolesForm: {
        id: '-1',
        roleName: '',
        roleDesc: ''
      },
      formLabelWidth: '120px',
      // 添加角色对话框校验规则
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      // 编辑角色对话框校验规则
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      // 添加对话框的显示
      rolesAddDialog: false,
      // 编辑对话框的显示
      rolesEditDialog: false,
      // 分配权限对话框的显示
      rightsAssignDialog: false,

      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 当前角色id
      curRoleId: -1
    }
  },

  created() {
    // 一进入页面获取角色列表数据
    this.getRolesList();
    // 获取树形权限数据
    this.getAllRightsData();
  },

  methods: {
    // 获取树形权限数据
    async getAllRightsData() {
      const res = await this.$http.get('/rights/tree');
      if (res.data.meta.status === 200) {
        this.treeData = res.data.data;
      }
    },

    // 获取角色数据
    async getRolesList() {
      const res = await this.$http.get('/roles')
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.rolesList = data
      }
    },

    // 添加角色
    showRolesAddDialog() {
      this.rolesAddDialog = true
    },

    // 添加角色校验提交
    rolesAdd() {
      this.$refs.rolesAddForm.validate(async (valid) => {
        if (!valid) return false;
        const res = await this.$http.post(`/roles`, this.rolesAddForm)
        if (res.data.meta.status === 201) {
          // 关闭对话框
          this.rolesAddDialog = false;
          // 重新渲染角色列表
          this.getRolesList();
          // 清空表单
          this.$refs.rolesAddForm.resetFields();
        }
      })
    },

    // 关闭添加角色对话框触发的事件
    closeRolesAdddialog() {
      this.$refs.rolesAddForm.resetFields();
    },

    // 点击编辑按钮，显示编辑对话框
    showRolesEditDialog(rolesData) {
      // console.log(rolesData)
      // 显示对话框
      this.rolesEditDialog = true
      // 根据当前角色的赋值给表单
      for (const key in this.rolesForm) {
        this.rolesForm[key] = rolesData[key]
      }
    },

    // 修改角色
    rolesEdit() {
      this.$refs.rolesForm.validate(async (valid) => {
        if (!valid) return false;
        const { id, roleName, roleDesc } = this.rolesForm;
        // 检验完成
        const res = await this.$http.put(`/roles/${id}`, {
          roleName,
          roleDesc
        })
        console.log(res)
        const { data, meta } = res.data
        if (meta.status === 200) {
          // 关闭对话框
          this.rolesEditDialog = false;
          // 重新渲染
          // this.getRolesList()
          // 或者直接修改里面的数据，不用重新发请求渲染
          const rolesItem = this.rolesList.find((item, index) => item.id === id)
          rolesItem.roleName = data.roleName;
          rolesItem.roleDesc = data.roleDesc;
        }
      })
    },

    // 删除角色
    roleDel(rolesId) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`/roles/${rolesId}`);
        if (res.data.meta.status === 200) {
          this.$message({
            type: 'success',
            message: res.data.meta.msg
          })
          // 重新渲染
          this.getRolesList()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    // 根据角色id和权限id,删除指定权限 
    async delRoles(roleId, rightId) {
      // console.log(roleId, rightId)
      const res = await this.$http.delete(`/roles/${roleId}/rights/${rightId}`);
      if (res.data.meta.status === 200) {
        // 重新渲染数据
        // this.getRolesList()
        const item = this.rolesList.find(item => item.id === roleId);
        item.children = res.data.data;
      }
    },

    // 显示分配权限对话框
    shownRightDialog(curRoleId, rolesData) {
      // 设置当前角色id
      this.curRoleId = curRoleId;
      this.rightsAssignDialog = true;
      // 根据当前角色获取拥有的权限，将拥有的权限进行勾选
      // 获取所有的节点id，通过setCheckedKeys方法(参数1是个数组，参数2boolean)进行选中
      const rightsList = [];
      rolesData.forEach(level1 => {
        level1.children.forEach(level2 => {
          level2.children.forEach(level3 => {
            rightsList.push(level3.id);
          })
        })
      })
      // vue中DOM的更新是异步的
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(rightsList);
      })
    },

    // 分配权限
    async rightsAssign() {
      // 获取所有全选中的节点key
      const arr1 = this.$refs.tree.getCheckedKeys();
      // 获取所有半选中的节点key
      const arr2 = this.$refs.tree.getHalfCheckedKeys();
      const allChenkedArr = [...arr1, ...arr2];
      console.log(allChenkedArr)

      // 根据选中的权限，发请求进行修改
      const res = await this.$http.post(`/roles/${this.curRoleId}/rights`,{
        rids: allChenkedArr.join(',')
      });
      if (res.data.meta.status === 200) {
        // 关闭对话框
        this.rightsAssignDialog = false;
        // 重新渲染
        this.getRolesList();
      }
    }


  }
}