<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/cat.jpg" alt="" class="headPhoto" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左边导航栏 -->
      <el-aside :width="isExpand?'64px':'200px'">
        <div class="expand-button" @click="expandShrink">|||</div>
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#379aff"
          :unique-opened="true"
          :collapse="isExpand"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu :index="item.id+''" v-for="item in leftMenuList" :key="item.id">
            <!-- 一级菜单 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item 
              :index="'/'+childItem.path" 
              v-for="childItem in item.children" 
              :key="childItem.id"
              @click="savePathState('/'+childItem.path)">
                <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span>{{childItem.authName}}</span>
                </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由出口 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return{
      // 左侧菜单列表
      leftMenuList:[],
      // 图标库
      iconObj: {
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isExpand:false,
      // 导航路径激活状态
      activePath:''
    }
  },
  created(){
    this.getLeftMenus()
    this.activePath=window.sessionStorage.getItem("activePath")
  },
  methods: {
    // 退出登录状态
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取左侧菜单导航
    async getLeftMenus(){
      const {data:res}=await this.$http.get("menus")
      // console.log(res);
      if(res.meta.status!==200){
        this.$message.console.error("获取左侧菜单失败！");
      }else{
        // this.$message.success("成功获取左侧菜单！");
        this.leftMenuList=res.data
      }
    },
    // 是否收缩或展开导航栏
    expandShrink(){
      this.isExpand=!this.isExpand;
    },
    // 保存点击的导航路径状态
    savePathState(activePath){
      window.sessionStorage.setItem("activePath",activePath);
      this.activePath=activePath
    }
  },
};
</script>

<style lang="less" scoped>
.headPhoto{
  border-radius: 50%;
  width: 60px;
  height: 60px;
}
.el-container {
  height: 100%;
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #33393c;
    color: #ffffff;
    padding: 0 20px 0 0;
    div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
        font-size: 22px;
      }
    }
  }
  .el-aside {
    background-color: #313743;
    color: #ffffff;
    .expand-button{
      text-align: center;
      background-color: #475163;
      letter-spacing: 4px;
      padding: 3px;
      cursor: pointer;
    }
    .iconfont {
      font-size: 22px;
      margin-right: 9px;
    }
    .el-menu{
      border-right: none;
    }
  }
  .el-main {
    padding-left: 18px;
    background-color: #e9edf1;
    font-size: 28px;
    font-weight: bold;
  }
}
</style>