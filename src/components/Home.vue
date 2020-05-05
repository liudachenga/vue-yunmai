<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>云迈后台管理系统</span>
      </div>
      <el-button @click="loginOut" type="info">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠菜单区域 -->
        <div class="toggle-button" @click="toggleCollapse">| | |</div>
        <!-- 菜单区域 -->
        <el-menu 
        :default-active="activeIndex"
        router 
        unique-opened 
        :collapse ="isCollapse" 
        :collapse-transition="false" 
        background-color="#333744" 
        text-color="#fff" 
        active-text-color="#409eff">
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menulist" :key="item.id" :index="item.id+''">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span slot="title">{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/'+subItem.path"
            @click="saveNavState('/'+subItem.path)">
              <i class="el-icon-menu"></i>
              <span slot="title">{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 主页的路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 一级菜单图标
      iconsObj :{
        125 : 'el-icon-user-solid',
        103 : 'el-icon-s-platform',
        101 : 'el-icon-s-goods',
        102 : 'el-icon-s-order',
        145 : 'el-icon-s-data',
      },
      // 菜单是否折叠状态
      isCollapse : false,
      // 让当前激活菜单高亮的index
      activeIndex : ''
    };
  },
  created() {
    // 获取左侧菜单列表
    this.getMenuList();
    // 页面一启动就获取保存在sessionStorage里的activeIndex
    this.getIndex()
  },
  methods: {
    // 点击退出 清空token跳转到登录页
    loginOut() {
      window.sessionStorage.clear();
      // 跳转到登录页
      this.$router.push("/login");
    },
    // 获取左侧菜单列表
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if(res.meta.status !== 200){
        return this.$message.error('获取菜单列表失败')
      }
      this.menulist = res.data
      // console.log(this.menulist);
      
    },
    // 点击控制按钮的展开与折叠
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    // 点击哪个菜单就将路径当做索引 使菜单点击后高亮
    saveNavState(index){
      // 保存到sessionStorage里
       window.sessionStorage.setItem('activeIndex', index)
       this.activeIndex = index
    },
    // 页面一启动就获取保存在sessionStorage里的activeIndex
     getIndex(){
      const index = window.sessionStorage.getItem('activeIndex')
      this.activeIndex = index
     }
  }
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 18px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
.el-menu{
  border-right: 0 
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  cursor: pointer;
}
</style>
