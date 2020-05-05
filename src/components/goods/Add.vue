<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert center show-icon title="添加商品信息" type="info"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="active-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab面板 (后面要提交表单所以用from包裹了)-->
      <el-form
        ref="addFormRef"
        :rules="addFormRules"
        :model="addForm"
        label-position="top"
        label-width="80px"
      >
        <el-tabs
          tab-position="left"
          v-model="active"
          :before-leave="beforeTabChange"
          @tab-click="tabChange"
        >
          <el-tab-pane name="0" label="基本信息">
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
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateGoodsList"
                :props="cascaderProps"
                @change="cateHandleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="1" label="商品参数">
            <el-form-item v-for="item in paramList" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox
                  v-for="(item1,i) in item.attr_vals"
                  :key="i"
                  :label="item1"
                  border=""
                  @change="checkboxChange1"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="2" label="商品属性">
            <el-form-item v-for="item in staticList" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="3" label="商品图片">
            <el-upload
              action="http://118.190.160.53:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane name="4" label="商品内容">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"/>
            <el-button type="primary" class="addShop" @click="addShop">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 预览图片的对话框 -->
      <el-dialog title="预览" :visible.sync="dialogVisible" width="30%">
        <el-image :src="previewPath"></el-image>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //级联选择器选中的分类的id数组
        goods_cat: [],
        // 上传图片的临时路径
        pics: [],
        // 描述
        goods_introduce: "",
        // 参数列表(动态和静态)
        attrs: []
      },
      // 表单校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 商品分类列表
      cateGoodsList: [],
      // 级联选择器的配置选项
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 动态参数列表
      paramList: [],
      // 静态参数列表
      staticList: [],
      // 给上传图片添加请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 预览图片的路径
      previewPath: "",
      // dialog对话框显示的装填
      dialogVisible: false
    };
  },
  created() {
    // 获取商品分类信息
    this.getCateGoodsList();
  },
  methods: {
    // 获取商品分类信息
    async getCateGoodsList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.cateGoodsList = res.data;
      console.log(244);
      console.log(this.cateGoodsList);
    },
    //级联选择框发生变化
    cateHandleChange() {
      if (this.addForm.goods_cat.length < 3) {
        this.addForm.goods_cat = [];
      }

      console.log(this.addForm.goods_cat);
    },
    // 点击tab面板的切换之前触发的函数
    beforeTabChange(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length < 3 && oldActiveName === "0") {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // 点击tab面板的时候触发的函数
    async tabChange() {
      // 发送请求获取动态参数列表
      if (this.active === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.paramList = res.data;
      }
      // 发送请求获取静态参数列表
      if (this.active === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        this.staticList = res.data;
      }
    },
    // 动态参数列表的复选框发生变化时触发
    checkboxChange1(e) {
      console.log(this.paramList);
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      console.log(this.previewPath);
      // dialog对话框显示
      this.dialogVisible = true;
    },
    // 处理图片移除效果
    handleRemove(file, fileList) {
      const id = this.addForm.pics.findIndex(item => {
        return item.pic === file.response.data.tmp_path;
      });
      this.addForm.pics.splice(id, 1);
      console.log("移除");
      console.log(this.addForm.pics);
    },
    // 图片上传成功
    handleSuccess(response, file, fileList) {
      // 图片的临时路径
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm.pics);
    },
    // 点击添加商品按钮
    addShop() {
      this.$refs.addFormRef.validate(async err => {
        console.log(err);
        if (!err) {
          return this.$message.error("请填写必要的表单项");
        }
        const aaa = _.cloneDeep(this.addForm); // aaa 是深拷贝的新数组
        aaa.goods_cat = aaa.goods_cat.join(",");
        // 处理动态参数
        this.paramList.forEach(item => {
          const newInfo = {
            attr_id: item.cat_id,
            attr_value: item.attr_vals.join(' ')
          };
          aaa.attrs.push(newInfo);
        });
        // 处理静态参数
        this.staticList.forEach(item => {
          const newInfo = {
            attr_id: item.cat_id,
            attr_value: item.attr_vals
          };
          aaa.attrs.push(newInfo);
        });
       // 发送请求添加商品
        const { data: res } = await this.$http.post('goods',aaa);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败");
        }
        this.$message.success("添加商品成功");
        console.log('差不多啦');
        console.log(res);
        this.$router.push('/goods')
      });
    }
  },
  computed: {
    //选中商品分类数组的最后一个id
    cateId: function() {
      return this.addForm.goods_cat[2];
    }
  }
};
</script>


<style lang="less" scoped>
.el-steps {
  margin: 20px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important ;
}
.el-image {
  width: 100%;
}
.addShop {
  margin-top: 10px;
}
</style>
