<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div id="main" style="width: 750px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 导入 echarts
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // options需要合并的数据
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  async mounted(){
    // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById("main"));
      // 绘制图表
      const {data:res}=await this.$http.get(`reports/type/1`)
      console.log(res);
      if(res.meta.status!==200){
        return this.$message.error("获取折线图失败！")
      }else{
        const result=_.merge(res.data,this.options)
        myChart.setOption(result);
      }
  },
  methods: { },
}
</script>

<style>
</style>