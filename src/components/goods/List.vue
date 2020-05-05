<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 用户添加与搜索区域 -->
      <el-row :gutter="10" class="userSearch">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            @change="inquireList"
            clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="inquireList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"  @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsList" style="width: 100%" border="">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="480"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{ scope.row.add_time | format('yyyy-MM-dd hh:mm:ss')}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" circle></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delGood(scope.row.goods_id)"
              circle
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>


<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "", // 查询参数
        pagenum: 1, // 当前页码
        pagesize: 5 // 每页显示条数
      },
      // 商品列表数据
      goodsList: [],
      // 总的页码数
      total: 0
    };
  },
  created() {
    // 获取商品列表数据
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据列表失败");
      }
      this.total = res.data.total;
      this.goodsList = res.data.goods;
      console.log(this.goodsList);
    },
    inquireList() {},
    // 每页显示条数发送变化时
    handleSizeChange(size) {
      this.queryInfo.pagesize = size;
      // 获取商品列表数据
      this.getGoodsList();
    },
    // 页码发生变化时
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page;
      // 获取商品列表数据
      this.getGoodsList();
    },
    // 搜索的时候触发的事件
    inquireList() {
      // 获取商品列表数据
      this.getGoodsList();
    },
    // 删除商品
    async delGood(id) {
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
      // 发送请求删除tag标签
      const { data: res } = await this.$http.delete(`goods/${id}`);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败");
      }
      this.$message.success("删除商品成功");
      // 获取商品列表数据
      this.getGoodsList();
    },
    // 点击添加商品 跳转到添加商品页面
    goAddGoods(){
      this.$router.push('goods/add')
    }
  }
};
</script>

<style lang="less" scoped>
.userSearch {
  margin-bottom: 10px;
}
</style>

