<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示 -->
      <el-alert title="消息提示的文案" type="info" show-icon center :closable="false"></el-alert>

      <!-- 步骤条 -->
      <!-- 
        active  设置当前激活的步骤 index
        finish-status 设置步骤结束的状态
      -->
      <!-- 步骤书需要与标签页进行关联,使用标签页的v-model属性关联步骤数组件的当前激活步骤active -->
      <el-steps :active="activeName-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 标签页 -->
      <!-- 
          v-model   绑定值,选中选项卡的name
          tab-click事件  切换标签页触发
          tab-position   选项卡的位置
          tab-click  切换标签页时触发
          before-leave 切换标签之前的钩子(新的name,旧的name)
      -->
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeName"
          @tab-click="handleClick"
          tab-position="left"
          :before-leave="beforeLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择框 -->
              <!-- 
                  v-model 选中的数据,是个数组
                  options 数据,是个数组
                  poops   配置项{label:   value:  children: }
                  @change 监听选中数据的变化
              -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="categoriesList"
                :props="props"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="(item) in manyParamsList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="val" v-for="(val,index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyParamsList"
              :key="item.attr_id"
            >
              <!-- 多个勾选框绑定到同一个数组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val" v-for="(val,index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片 -->
            <!-- 
                action  请求地址
                headers 请求头
                on-preview 点击上传文件列表的钩子
                on-remove  文件列表移除的钩子
                on-success 文件上传成功的钩子
            -->
            <el-upload
              class="upload-demo"
              action="http://localhost:8888/api/private/v1/upload"
              :headers="setHeaders"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="success"
              list-type="picture"
              :on-change="change"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="提示" :visible.sync="picDialog" width="50%">
      <img :src="imgURL" class="preview" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeName: 0,
      // 添加商品表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 商品表单校验规则
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品类别', trigger: 'blur' }
        ]
      },
      // 分类数据
      categoriesList: [],
      // 级联框配置
      props: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数
      manyParamsList: [],
      // 静态参数
      onlyParamsList: [],
      setHeaders: {
        Authorization: window.localStorage.getItem('token')
      },
      // 控制图片对话框的显示隐藏
      picDialog: false,
      imgURL: ''
    }
  },
  created() {
    this.getCategories()
  },
  computed: {
    categoriesId() {
      // if(this.addForm.goods_cat.length==3){
      //   return this.addForm.goods_cat[2]
      // }
      // return null
      return this.addForm.goods_cat.length === 0
        ? 1
        : this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    }
  },
  methods: {
    // 获取分类数据
    async getCategories() {
      const res = await this.$http.get('categories')
      const { data, meta } = res.data
      if (meta.status === 200) {
        this.categoriesList = data
      }
    },
    handleClick() {},
    // 级联框内容变化时触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换标签页之前的钩子函数
    beforeLeave(activeName, oldActiveName) {
      // 切换标签时遇到了return false 阻止切换
      // console.log(activeName, oldActiveName)
      if (oldActiveName == 0 && this.addForm.goods_cat.length !== 3) {
        this.$message({
          type: 'error',
          message: '请选择商品分类'
        })
        return false
      }
    },
    // 切换标签页触发
    async handleClick() {
      if (this.activeName == 1) {
        // 获取动态参数
        const res = await this.$http.get(
          `categories/${this.categoriesId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        const { data, meta } = res.data
        data.forEach(item => {
          item.attr_vals = item.attr_vals.split(' ')
        })
        if (meta.status == 200) {
          this.manyParamsList = data
        }
      }
      // 切换到商品属性,获取数据
      if (this.activeName == 2) {
        const res = await this.$http.get(
          `categories/${this.categoriesId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        const { data, meta } = res.data
        data.forEach(item => {
          item.attr_vals = item.attr_vals.split(' ')
        })
        if (meta.status == 200) {
          this.onlyParamsList = data
        }
      }
    },
    // 上传文件成功的钩子
    success(res, file, fileList) {
      // 将图片存储在表单信息中
      // console.log(res, file, fileList)
      this.addForm.pics.push({
        pic: res.data.tmp_path
      })
    },
    // 图片预览
    handlePreview(file) {
      // this.imgURL = file.response.data.url
      this.imgURL = file.url
      this.picDialog = true
    },
    change(file, fileList) {
    },

    // 移除图片
    handleRemove(file) {
      // 将点击的数据从表单中移除
      const index = this.addForm.pics.findIndex(
        item => item.pic == file.response.data.tmp_path
      )
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm)
    },
    // 添加商品
    async addGood(){
      // 上传文件attr_cat要是一个字符串,直接修改会导致v-model关联的参数数据列表渲染出问题,cloneDeep()深拷贝
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      this.manyParamsList.forEach(item=>{
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join('')
        })
      })
      this.onlyParamsList.forEach(item=>{
        form.attrs.push({
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        })
      })
      const res = await this.$http.post('goods',form)
      if(res.data.meta.status===201){
        this.$router.push('/home/goods')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin: 20px 0;
}
.el-steps {
  margin: 15px 0;
  padding: 0 80px;
}
.el-checkbox {
  margin: 0 0 0 3px !important;
}
.preview {
  width: 100%;
}
.quill-editor{
  margin-bottom: 20px;
}
</style>