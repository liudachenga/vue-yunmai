<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col class="addGoods">
          <el-button type="primary" @click="addGoods">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="goodsList"
        :columns="columns"
        border=""
        show-index
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color:lightgreen"
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
          ></i>
          <i style="color:red" v-else class="el-icon-error"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary">编辑</el-button>
          <el-button size="mini" type="danger">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页功能 -->
      <div>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 添加商品对话框 -->
    <el-dialog title="添加分类" :visible.sync="dialogVisible" width="40%" @close="closeDialog">
      <el-form ref="addGoodsRef" :rules="addGoodsRules" :model="addGoodsForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addGoodsForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="checkedValue"
            :options="parentList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数
      queryInfo: {
        type: 3,
        pagenum: 1, //当前页码值
        pagesize: 5 // 每页显示多少条数据
      },
      // 商品分类列表
      goodsList: [],
      // 总页数
      total: 0,
      // 为tree-table 指定列的定义
      columns: [
        {
          label: "商品分类",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      // 对话框的状态
      dialogVisible: false,
      // 表单绑定数据
      addGoodsForm: {
        // 要添加的分类名称
        cat_name: "",
        // 分类父id
        cat_pid: 0,
        // 分类层级
        cat_level: 0 //0默认是一级分类
      },
      // 表单验证规则
      addGoodsRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "分类长度在3到10个字符",
            trigger: "blur"
          }
        ]
      },
      // 父级分类的数据列表(前两级)
      parentList: [],
      // 级联选择器的配置选项
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true
      },
      //级联选择器选中的父级分类的id数组
      checkedValue: []
    };
  },
  created() {
    // 获取商品分类信息
    this.getGoodsList();
  },
  methods: {
    // 获取商品分类信息
    async getGoodsList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res);

      this.goodsList = res.data.result;
      this.total = res.data.total;
      console.log(this.goodsList);
    },
    // 每页显示数据的条数改变时触发
    handleSizeChange(newpagesize) {
      // 获取商品分类信息
      this.queryInfo.pagesize = newpagesize;
      this.getGoodsList();
    },
    // 当前页码发生改变时触发
    handleCurrentChange(newpagenum) {
      // 获取商品分类信息
      this.queryInfo.pagenum = newpagenum;
      this.getGoodsList();
    },
    // 点击添加商品按钮
    async addGoods() {
      // 展示对话框
      this.dialogVisible = true;
      // 获取父级分类的数据列表(前两级)
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      this.parentList = res.data;
      console.log(this.parentList);
    },
    // 对话框点击x号时触发(点击取消时也触发,对话框关闭触发的事件)
    closeDialog() {
      this.$refs.addGoodsRef.resetFields();
      this.checkedValue = [];
      this.addGoodsForm.cat_pid = 0;
      this.addGoodsForm.cat_level = 0;
    },
    // 级联选择框发生改变时触发
    handleChange() {
      // cat_pid的值
      console.log(this.checkedValue);

      if (this.checkedValue.length !== 0) {
        this.addGoodsForm.cat_pid = this.checkedValue[
          this.checkedValue.length - 1
        ];
        // cat_level的值
        this.addGoodsForm.cat_level = this.checkedValue.length;
      } else {
        this.addGoodsForm.cat_pid = 0;
        this.addGoodsForm.cat_level = 0;
      }
    },
    // 级联选择框确认时触发
    addCate() {
      console.log(this.addGoodsForm);
      // 预验证
      this.$refs.addGoodsRef.validate(async res => {
        if (res) {
          // 添加分类
          const { data: res } = await this.$http.post(
            "categories",
            this.addGoodsForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加分类失败");
          }
          this.$message.success("添加分类成功");
          // 关闭对话框
          this.dialogVisible=false
          // 获取商品分类信息
          this.getGoodsList();
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.addGoods {
  margin-bottom: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
