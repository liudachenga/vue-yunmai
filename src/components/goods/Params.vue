<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert center show-icon title="注意: 只允许为第三级分类设置相关参数" type="warning"></el-alert>
      <el-row class="haha">
        <el-col class="addGoods">
          <span>选择商品分类:</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="checkedValue"
            :options="goodsCate"
            :props="cascaderProps"
            @change="cateHandleChange"
            clearable
          ></el-cascader>
          <!-- tab栏切换 -->
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button
                class="addmo"
                :disabled="isDisable"
                type="primary"
                size="mini"
                @click="addDandG"
              >添加参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="manyList" border="">
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      closable
                      :disable-transitions="false"
                      v-for="(item,index) in scope.row.attr_vals"
                      :key="index"
                      @close="handleClose(index,scope.row)"
                    >{{item}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      v-focus
                      @keyup.enter.native="handleInputConfirm((scope.row))"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <!-- 修改按钮 -->
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      @click="edit(scope.row)"
                      size="mini"
                    >编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      @click="del(scope.row)"
                      size="mini"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
              <el-button
                class="addmo"
                :disabled="isDisable"
                type="primary"
                size="mini"
                @click="addDandG"
              >添加属性</el-button>
              <!-- 静态参数表格 -->
              <el-table :data="onlyList" border="">
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      closable
                      :disable-transitions="false"
                      v-for="(item,index) in scope.row.attr_vals"
                      :key="index"
                      @close="handleClose(index,scope.row)"
                    >{{item}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      v-focus
                      @keyup.enter.native="handleInputConfirm((scope.row))"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <!-- 修改按钮 -->
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      @click="edit(scope.row)"
                      size="mini"
                    >编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      @click="del(scope.row)"
                      size="mini"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <!-- 添加的对话框 -->
      <el-dialog
        :title="'添加'+changeName"
        :visible.sync="dialogVisible"
        width="30%"
        @close="closeAddForm"
      >
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
          <el-form-item :label="changeName" prop="name">
            <el-input v-model="addForm.name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addArguments">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑的对话框 -->
      <el-dialog
        :title="'编辑'+changeName"
        :visible.sync="editDialog"
        width="30%"
        @close="closeEditForm"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
          <el-form-item :label="changeName" prop="editName">
            <el-input v-model="editForm.editName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">取 消</el-button>
          <el-button type="primary" @click="commitEdit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// 导入lodash包
import _ from "lodash";
export default {
  data() {
    return {
      // 商品分类数据列表
      goodsCate: [],
      // 级联选择器的配置选项
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //级联选择器选中的分类的id数组
      checkedValue: [],
      // 默认被选中的tab标签
      activeName: "many",
      // 动态和静态参数的列表
      manyList: [],
      onlyList: [],
      // 添加动态参数/静态属性对话框的状态
      dialogVisible: false,
      // 添加动态参数/静态属性表单绑定的值
      addForm: {
        name: ""
      },
      // 添加动态参数/静态属性表单的验证规则
      addFormRules: {
        name: [
          { required: true, message: "请输入要添加的名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "名称在3到10个字符",
            trigger: "blur"
          }
        ]
      },
      // 编辑动态参数/静态属性表单的验证规则
      editFormRules: {
        editName: [
          { required: true, message: "请输入要编辑的名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "名称在3到10个字符",
            trigger: "blur"
          }
        ]
      },
      // 编辑对话框的状态
      editDialog: false,
      // 提交编辑和删除需要用到的
      attrId: "",
      // 编辑后的名称
      editForm: {
        editName: ""
      },
      // 添加tag标签 input框的状态
      inputVisible: false,
      // 新添加的tag标签的内容
      inputValue: ""
    };
  },
  created() {
    // 获取商品分类数据列表
    this.getGoodsCate();
  },
  methods: {
    async getGoodsCate() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.goodsCate = res.data;
      console.log(this.goodsCate);
    },
    // 级联选择器发生变化时
    cateHandleChange() {
      // 发送请求获取参数列表
      this.getList();
    },
    // tab被选中时触发
    handleTabClick() {
      // 发送请求获取参数列表
      this.getList();
    },
    // 发送请求获取参数列表
    async getList() {
      if (this.checkedValue.length < 3) {
        this.checkedValue = [];
        this.manyList = [];
        this.onlyList = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      // 判断是动态还是静态的数据 赋值给不同的列表
      if (this.activeName === "many") {
        this.manyList = res.data;
      } else {
        this.onlyList = res.data;
      }
      console.log(this.manyList);
      console.log(this.onlyList);
    },
    // 点击按钮添加动态参数/静态属性
    addDandG() {
      this.dialogVisible = true;
    },
    // 关闭添加动态参数/静态属性对话框
    closeAddForm() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击添加动态参数/静态属性对话框的确定按钮
    addArguments() {
      this.$refs.addFormRef.validate(async err => {
        if (!err) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败");
        }
        this.$message.success("添加成功");
        // 发送请求获取参数列表
        this.getList();

        // 关闭对话框
        this.dialogVisible = false;
      });
    },
    // 关闭编辑对话框
    closeEditForm() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击编辑
    async edit(row) {
      console.log(row);
      // 提交编辑和删除需要用到的
      this.attrId = row.attr_id;
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        { params: { attr_sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("查询参数失败");
      }
      console.log(res);
      this.editForm.editName = res.data.attr_name;
      this.editDialog = true;
    },
    // 点击确认编辑
    async commitEdit() {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.attrId}`,
        {
          attr_name: this.editForm.editName,
          attr_sel: this.activeName
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("编辑失败");
      }
      this.$message.success("编辑成功");
      // 发送请求获取参数列表
      this.getList();
      this.editDialog = false;
    },
    // 点击删除选项
    async del(row) {
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${row.attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      // 发送请求获取参数列表
      this.getList();
    },
    // 点击按钮添加tag标签
    showInput(row) {
      row.inputVisible = true;
    },
    // tag标签input框失去焦点或者enter时
    async handleInputConfirm(row) {
      this.inputVisible = false;
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue);
      row.inputValue = "";
      row.inputVisible = false;
      // 发送请求添加tag标签
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("添加标签失败");
      }
      this.$message.success("添加标签成功");
      row.inputValue = "";
      row.inputVisible = false;
    },
    // 删除tag标签(和修改tag标签差不多只是把选中要是删除的tag从数组中移除了)
    async handleClose(i, row) {
      const result = await this.$confirm(
        "此操作将永久删除该标签, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      console.log(result);
      if (result !== "confirm") return;
      row.attr_vals.splice(i, 1);
      // 发送请求删除tag标签
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除标签失败");
      }
      this.$message.success("删除标签成功");
    }
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function(el) {
        el.children[0].focus();
      }
    }
  },
  computed: {
    // 通过这个计算属性来控制按钮的禁用状态
    isDisable() {
      if (this.checkedValue.length !== 3) {
        return true;
      }
      return false;
    },
    // 获取出分类id
    cateId() {
      if (this.checkedValue.length === 3) {
        return this.checkedValue[2];
      }
      return null;
    },
    // 根据many和only的不同 展示不同的文字
    changeName() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.haha {
  margin: 10px 0;
}
.addGoods span {
  margin-right: 10px;
}
.addmo {
  margin-bottom: 15px;
}
.input-new-tag {
  width: 100px;
}
</style>
