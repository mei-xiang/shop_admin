<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--
      el-table 表格组件
        data 用来给表格组件提供数据
        stripe 添加改属性后，启用隔行变色效果

      el-table-column 表格中的每一列
        label 每一列的标题名称
        width 每一列的宽度
        prop 表示数据中的属性名（字段名称）
    -->
    <el-table :data="userList" stripe style="width: 100%">
      <el-table-column  label="#" width="40"></el-table-column>
      <el-table-column prop="username" label="姓名" ></el-table-column>
      <el-table-column prop="email" label="邮箱" ></el-table-column>
      <el-table-column prop="mobile" label="电话" ></el-table-column>
      <el-table-column prop="role_name" label="角色" ></el-table-column>
      <el-table-column prop="mg_state" label="状态" ></el-table-column>
      <el-table-column prop="name" label="操作" ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  created() {
    this.getDatas();
  },
  data() {
    return {
      userList: []
    };
  },
  methods: {
    getDatas() {
      // 接口要求获取数据必须在响应头中设置 Authorization 为token的值
      axios
        .get("http://localhost:8888/api/private/v1/users", {
          params: {
            pagenum: 1,
            pagesize: 3
          },
          // 设置响应头
          headers: {
            Authorization: localStorage.getItem("token")
          }
        })
        .then(res => {
          console.log(res);
          const { data, meta } = res.data;
          if (meta.status === 200) {
            this.userList = data.users;
          }
        });
    }
  }
};
</script>

<style scoped>
</style>