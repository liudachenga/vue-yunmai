<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 用户添加与搜索区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            @change="getUserList"
            clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" style="width: 100%" border="" stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="switchStatus(scope.row.id,scope.row.mg_state)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="mg_state" label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              @click="showEditDialog(scope.row.id)"
              icon="el-icon-edit"
              size="mini"
              circle
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              @click="removeUserById(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
                circle
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2,5,10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog">
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFromRules"
        ref="addFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="closeEditDialog">
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFromRules"
        ref="editFormRef"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="editUser">修改</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="closeRole">
      <p>当前的用户:{{userInfo.username}}</p>
      <p>当前的角色:{{userInfo.role_name}}</p>
      <p>分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleslist"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        return cb();
      }
      //返回一个错误提示
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      //返回一个错误提示
      cb(new Error("请输入合法的手机号码"));
    };
    return {
      // 获取用户列表的参数对象(发送请求)
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 每页显示的条数
        pagesize: 2
      },
      // 用户数据列表
      userlist: [],
      // 总数据条数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 添加新用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 修改用户的表单数据
      editForm: {},
      // 增加新用户的表单验证规则
      addFromRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3到10个字符",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "密码长度在6到15个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checkEmail,
            message: "邮箱格式不正确，请重新输入",
            trigger: "blur"
          }
        ],
        mobile: [
          { required: true, message: "请输入用手机号", trigger: "blur" },
          {
            validator: checkMobile,
            message: "手机号码格式不正确，请重新输入",
            trigger: "blur"
          }
        ]
      },
      // 修改用户的表单验证规则
      editFromRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checkEmail,
            message: "邮箱格式不正确，请重新输入",
            trigger: "blur"
          }
        ],
        mobile: [
          { required: true, message: "请输入用手机号", trigger: "blur" },
          {
            validator: checkMobile,
            message: "手机号码格式不正确，请重新输入",
            trigger: "blur"
          }
        ]
      },
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      roleslist: [],
      // 已选中角色的id值
      selectedRoleId: ""
    };
  },
  created() {
    // 获取数据列表
    this.getUserList();
  },
  methods: {
    // 获取数据列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败");
      }
      console.log(res);
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(this.userlist);
      //   console.log(this.total);
    },
    // 监听页码值的变化
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      // 重新获取数据列表
      this.getUserList();
    },
    // 监听每页显示条数(page-size)的变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      // 重新获取数据列表
      this.getUserList();
    },
    // 监听状态的改变
    async switchStatus(uId, type) {
      // console.log(id,status);
      // 获取到最新的状态 发送请求更改状态
      const { data: res } = await this.$http.put(`users/${uId}/state/${type}`);
      if (res.meta.status !== 200) {
        type = !type; // 这一步有作用吗?表示怀疑
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
      console.log(res);
    },
    // 当Dialog对话框关闭的时候触发 清空添加新用户表格
    closeAddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    // 当Dialog对话框关闭的时候触发 清空修改用户表格(主要是清空验证规则)
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击添加用户 的确定按钮时触发
    addUser() {
      // 预校验
      this.$refs.addFormRef.validate(async vaild => {
        if (vaild === false) return;
        // 发送请求 添加用户
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("更新用户状态失败");
        }
        this.$message.success("更新用户状态成功");
        console.log(res);
        // 关闭表单
        this.addDialogVisible = false;
        // 重新获取数据列表
        this.getUserList();
      });
    },
    // 点击修改用户按钮
    async showEditDialog(id) {
      // 显示表单
      this.editDialogVisible = true;
      // 根据传过来的id 发送请求获取需要修改的用户信息
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取要修改的用户数据失败");
      }
      this.editForm = res.data;
      console.log(this.editForm);
    },
    //点击修改表单里的修改按钮
    editUser() {
      // 预校验
      this.$refs.editFormRef.validate(async vaild => {
        if (vaild === false) return;
        // 发送请求 添加用户
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          this.editForm
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户失败");
        }
        this.$message.success("修改用户成功");
        console.log(res);
        // 关闭表单
        this.editDialogVisible = false;
        // 重新获取数据列表
        this.getUserList();
      });
    },
    // 点击删除按钮的时候触发
    async removeUserById(id) {
      const a = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      console.log(a);
      if (a === "confirm") {
        const { data: res } = await this.$http.delete("users/" + id);
        if (res.meta.status !== 200) {
          return this.$message.error("删除用户失败");
        }
        this.$message.success("删除用户成功");
        console.log(res);
        // 重新获取数据列表
        this.getUserList();
      }
    },
    // 点击分配角色的按钮触发
    async setRole(userInfo) {
      this.userInfo = userInfo;
      // 在展开对话框之前获取所有角色的列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleslist = res.data;
      console.log(this.roleslist);

      this.setRoleDialogVisible = true;
    },
    // 点击分配角色对话框的确认按钮
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      //发起请求分配角色
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败");
      }
      this.$message.success("更新角色成功");
      console.log(res);
      // 重新获取数据列表
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 关闭对话框
    closeRole() {
      // 清空数据
      this.selectedRoleId = "";
    }
  }
};
</script>


<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
</style>
