<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 用户添加与搜索区域 -->
            <el-row :gutter="10" class="userSearch">
                <el-col :span="8">
                    <el-input
                        placeholder="请输入内容"
                        class="input-with-select"
                        v-model="ordersInfo.query"
                        clearable
                        @change="getOrderList"
                    >
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="ordersList" style="width: 100%" border="">
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column prop="order_number" label="订单编号" width="380"></el-table-column>
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column label="是否付款">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === 1">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column label="下单时间" width="180">
                    <template
                        slot-scope="scope"
                    >{{ scope.row.create_time | format('yyyy-MM-dd hh:mm:ss')}}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="showAdress"
                            circle
                        ></el-button>
                        <el-button
                            type="success"
                            icon="el-icon-location"
                            size="mini"
                            @click="showLogistics"
                            circle
                        ></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="ordersInfo.pagenum"
                :page-sizes="[5, 10,15]"
                :page-size="ordersInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>
        <!-- 修改地址对话框区域 -->
        <el-dialog title="修改地址" :visible.sync="dialogVisible" width="40%" @close="closeDialog">
            <el-form
                ref="adressFormRef"
                :rules="adressFormRules"
                :model="adressForm"
                label-width="100px"
            >
                <el-form-item label="省市区/县" prop="adress1">
                    <el-cascader
                        v-model="adressForm.adress1"
                        :options="city"
                        :props="{ expandTrigger: 'hover' }"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="adress2">
                    <el-input v-model="adressForm.adress2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="logisticsDialog" width="40%">
            <el-timeline>
                <el-timeline-item
                    v-for="(activity, index) in logisticsInfo"
                    :key="index"
                    :timestamp="activity.ftime"
                >{{activity.context}}</el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import city from "./citydata.js";
export default {
  data() {
    return {
      // 获取订单列表的请求参数
      ordersInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      // 订单列表
      ordersList: [],
      // 总页码
      total: 0,
      // 修改地址对话框的状态
      dialogVisible: false,
      // 表单绑定的数据
      adressForm: {
        adress1: [],
        adress2: ""
      },
      // 表单验证规则
      adressFormRules: {
        adress1: [
          { required: true, message: "请输入省市区/县", trigger: "blur" }
        ],
        adress2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      // 引入省市区县地址
      city: city,
      // 物流信息对话框的状态
      logisticsDialog: false,
      // 物流进度信息
      logisticsInfo: []
    };
  },
  created() {
    // 获取订单列表
    this.getOrderList();
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.ordersInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }
      // 订单列表
      this.ordersList = res.data.goods;
      // 总页码
      this.total = res.data.total;
      console.log(this.ordersList);
    },
    // 每页显示条数发生变化
    handleSizeChange(newSize) {
      this.ordersInfo.pagesize = newSize;
      // 获取订单列表
      this.getOrderList();
    },
    // 页码发生变化
    handleCurrentChange(newPage) {
      this.ordersInfo.pagenum = newPage;
      // 获取订单列表
      this.getOrderList();
    },
    // 点击修改地址按钮
    showAdress() {
      this.dialogVisible = true;
    },
    // 关闭修改地址对话框
    closeDialog() {
      // 重置表单
      this.$refs.adressFormRef.resetFields();
    },
    // 点击物流按钮
    async showLogistics() {
      // 获取物流进度信息
      const { data: res } = await this.$http.get("/kuaidi/804909574412544580");
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流进度失败");
      }
      this.logisticsInfo = res.data;
      console.log(this.logisticsInfo);
      // 显示物流信息对话框
      this.logisticsDialog = true;
    }
  }
};
</script>



<style lang="less" scoped>
.userSearch {
  margin-bottom: 10px;
}
.el-cascader {
  width: 100%;
}
</style>



