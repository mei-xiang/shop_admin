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
              <span>您好,admin</span>
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

          开启router后，index相当于router-link中的to属性值，用来指定导航的路径
        -->
        <el-aside width="200px">
          <el-menu
            @open="handleOpen"
            @close="handleClose"
            :unique-opened="true"
            default-active="/home/users"
            background-color="#333744"
            text-color="#fff"
            active-text-color="rgb(64, 158, 255)"
            :router="true"
          >
            <el-submenu :index="item.path" v-for="item in listMenu" :key="item.id">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item :index="/home/+sub.path" v-for="sub in item.children" :key="sub.id">
                <i class="el-icon-menu"></i>
                <span>{{sub.authName}}</span>
              </el-menu-item>

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
  data() {
    return {
      listMenu: []
    };
  },
  created() {
    this.getCurrentUserMenu();
  },
  methods: {
    async getCurrentUserMenu() {
      const res = await this.$http.get("menus");
      console.log(res);
      const { data, meta } = res.data;
      if (meta.status === 200) {
        this.listMenu = data;
      }
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    // 点击退出按钮，弹出对话框，发送请求删除token并返回登录页
    logout() {
      // 1 弹出确认对话框
      // 2 用户点击确认
      //  2.1 跳回登录页面
      //  2.2 清除token

      this.$confirm("您是否确认退出?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        // 点击确认按钮
        .then(() => {
          // 清除token
          localStorage.removeItem("token");
          // 跳回登录页面
          this.$router.push("/login");
        });

      // // 点击取消按钮
      // .catch(() => {
      //   this.$message({
      //     type: 'info',
      //     message: '已取消删除'
      //   })
      // })
    }
  }
};
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  min-width: 1024px;
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

.el-menu{
  border: none;
}
</style>
