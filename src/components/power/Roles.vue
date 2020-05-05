<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleslist" style="width: 100%" border="" stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0 ? 'bdtop': '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级列表 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级列表 -->
              <el-col :span="19">
                <!-- 渲染二级 -->
                <el-row
                  :class="[i2===0 ? '': 'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级 -->
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      type="warning"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <!-- 权限分配 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 展示分配权限表单的对话框 -->
    <el-dialog title="分配权限" :visible.sync="dialogVisible" width="30%" @close="handleClose">
      <el-tree
        :data="rightslist"
        :props="treeProps"
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef"
        show-checkbox
        default-expand-all
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    return {
      // 角色数据列表
      roleslist: [],
      // 分配权限对话框的显示与隐藏
      dialogVisible: false,
      // 所有权限数据列表
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中的节点id数组值
      defKeys: [],
      // 当前即将分配权限的角色它的id
      roleId: ""
    };
  },
  created() {
    //  获取角色数据列表
    this.getRolesList();
  },
  methods: {
    //  获取角色数据列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色数据失败");
      }
      this.roleslist = res.data;
      console.log(this.roleslist);
    },
    // 点击tag标签的x号时触发
    async removeRightById(role, rightId) {
      const configResult = await this.$confirm(
        "确定要删除该权限吗?",
        "确认信息",
        {
          distinguishCancelAndClose: true,
          confirmButtonText: "确定",
          cancelButtonText: "放弃修改"
        }
      ).catch(err => err);
      console.log(configResult);
      if (configResult !== "confirm") {
        return this.$message.info("取消删除");
      }
      // 发送请求删除权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      this.$message.success("删除权限成功");
      //  获取角色数据列表
      console.log(2233);
      //  重新赋值实现局部刷新
      role.children = res.data;
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限列表
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取所有权限列表失败");
      }
      this.rightslist = res.data;
      console.log(this.rightslist);
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.dialogVisible = true;
    },
    // 通过递归的形式,获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前的node里面不包含children属性,则是三级节点 将id push到数组里
      if (node.children === undefined) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    // 关闭分配权限对话框触发
    handleClose() {
      // 清空默认选中的节点id数组值
      this.defKeys = [];
    },
    // 点击确定按钮 为角色分配权限
    async allotRight() {
      // 获取所有的被选中的节点和半选中的节点的key
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      // 发送请求 分配权限
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败");
      }
      this.$message.success("分配权限成功");
      this.dialogVisible = false;
      //  获取角色数据列表
      this.getRolesList();
    }
  }
};
</script>


<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>

