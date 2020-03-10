<template>
  <div class="home">
    <el-container>
      <el-header>
        <el-row type="flex" class="row-bg" justify="space-between">
          <el-col :span="6">
            <div class="grid-content bg-purple"></div>
          </el-col>
          <el-col :span="6">
            <p class="grid-content bg-purple-light">电商后台管理系统</p>
          </el-col>
          <el-col :span="6">
            <div class="grid-content bg-purple user">
              <span>您好,超级管理员</span>
              <a href="javascript:;" class="logout" @click="logout">退出</a>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <!-- 
          default-active 默认高亮的元素，值为index的值
          router值为true 表示激活导航
          index的值      为路由路径
         -->
        <el-aside width="200px">
          <el-menu
            default-active="/home/users"
            @open="handleOpen"
            @close="handleClose"
            background-color="#333744"
            text-color="#fff"
            active-text-color="rgb(64, 158, 255)"
            :router="true"
          >
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/home/users">用户列表</el-menu-item>
            </el-submenu>
            <el-submenu index="2">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>权限管理</span>
              </template>
              <el-menu-item index="2-1">权限列表</el-menu-item>
            </el-submenu>
            <el-submenu index="3">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>商品管理</span>
              </template>
              <el-menu-item index="3-1">商品列表</el-menu-item>
            </el-submenu>
            <el-submenu index="4">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>订单管理</span>
              </template>
              <el-menu-item index="4-1">订单列表</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <!-- 用来展出嵌套路由的出口 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    // 点击退出按钮，弹出对话框，发送请求删除token并返回登录页
    logout() {
      this.$confirm("您是否退出当前账号, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 删除token
          localStorage.removeItem("token");
          this.$router.push("/login");
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  text-align: center;
  line-height: 60px;
  padding: 0;
}
.el-header p {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
}
.el-header .logout {
  text-decoration: none;
  color: orange;
  padding-left: 8px;
}
.el-aside {
  background-color: rgb(51, 55, 68);
  color: #333;
  height: 100%;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}

.el-container {
  height: 100%;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
</style>