<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table :data="rightsTableData" border stripe style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-show="scope.row.level==='0'">一级</el-tag>
            <el-tag v-show="scope.row.level==='1'" type="success">二级</el-tag>
            <el-tag v-show="scope.row.level==='2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data(){
    return{
      rightsTableData:[]
    }
  },
  created(){
    this.getRightsList()
  },
  methods:{
    async getRightsList(){
      const {data:res} = await this.$http.get(`rights/list`)
      console.log(res);
      if(res.meta.status!==200){
        this.$message.error("获取权限列表失败")
      }else{
        this.rightsTableData=res.data
        // this.$message.success("获取权限列表成功")
      }
    }
  }
}
</script>

<style>

</style>