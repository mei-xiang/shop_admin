<template>
  <div class="loginForm">
    <!-- 
      model 表单数据对象
      rules 表单校验规则
      ref   表单对象
      label-width lable的宽度

      prop  校验字段
    -->
    <el-row type="flex" class="row-bg" justify="center" align="middle">
      <el-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4" class="login-content">
        <el-form
          :model="loginForm"
          :rules="rules"
          ref="loginForm"
          label-width="100px"
          class="form"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm" class="left">登录</el-button>
            <el-button @click="resetForm" class="right">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 6,
            message: "用户名长度在 3 到 6 个字符",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 6, message: "密码在 3 到 6 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    login() {
      axios
        .post("http://localhost:8888/api/private/v1/login", this.loginForm)
        .then(res => {
          // 登陆成功将返回的token存储起来，便于登录拦截判断
          const { data, meta } = res.data;
          if (meta.status === 200) {
            // 跳到主页（使用编程式导航）
            localStorage.setItem("token", data.token);
            this.$router.push("/home/users");
          } else {
            this.$message({
              message: meta.msg,
              type: "error"
            });
          }
          console.log(res);
        })
        .catch((error) => console.log(error)); //捕获异常
    },
    submitForm() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return false;
        // 验证完成，发送请求
        this.login();
      });
    },
    resetForm() {
      this.$refs.loginForm.resetFields();
    }
  }
};
</script>

<style scoped>
.loginForm,
.row-bg {
  height: 100%;
}
.loginForm {
  background-color: #2d434c;
}
.login-content {
  min-width: 320px;
  padding: 20px 35px;
  background-color: #fff;
  border-radius: 10px;
}
.left {
  float: left;
}
.right {
  float: right;
}
</style>