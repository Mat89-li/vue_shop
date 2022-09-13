<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never">
      <!-- 搜索区域 -->
      <div class="search-btn">
        <el-input placeholder="通过发货地址搜索" v-model="queryInfo.consignee_addr" clearable @clear="getOrderList">
          <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
        </el-input>
      </div>
      <!-- 订单列表数据 -->
      <el-table :data="orderTableData" border stripe style="width: 100%">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="发货地址">
          <template slot-scope="scope">
            <div v-if="scope.row.consignee_addr!==''">{{scope.row.consignee_addr}}</div>
            <div v-else style="color:#9a9da2;">暂无发货地址</div>
          </template>
        </el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="200"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="is_send" label="是否发货">
          <template slot-scope="scope">
            {{scope.row.is_send}}
          </template>
        </el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间" width="161">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdit"></el-button>
          <el-button type="success" icon="el-icon-location-outline" size="mini" @click="showKuaiDi"></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeEditDialog">
      <el-form :model="editRuleForm" :rules="editRules" ref="editRuleFormRef" label-width="90px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editRuleForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editRuleForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="物流进度"
      :visible.sync="kuaiDiDialogVisible"
      width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data(){
    return{
      orderTableData:[],
      queryInfo:{
        // 查询对象,发货地址
        consignee_addr:"",
        // consignee_addr:"梧州",
        // 当前页码
        pagenum:1,
        // 每页显示条数
        pagesize:10
      },
      // 总页码数
      total:0,
      //控制修改地址对话框的显示与隐藏
      editDialogVisible:false,
      editRuleForm:{
        address1:[],
        address2:''
      },
      editRules:{
        address1:[{required:true,message:'请选择地址',trigger:'blur'}],
        address2:[{required:true,message:'请输入详细地址',trigger:'blur'}]
      },
      //级联选择器
      cityData:cityData,
      kuaiDiDialogVisible:false,
      activities: [
        {
          time: "2018-05-10 09:39:00",
          ftime: "2018-05-10 09:39:00",
          context: "已签收,感谢使用顺丰,期待再次为您服务",
          location: ""
        },
        {
          time: "2018-05-10 08:23:00",
          ftime: "2018-05-10 08:23:00",
          context: "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          location: ""
        },
        {
          time: "2018-05-10 07:32:00",
          ftime: "2018-05-10 07:32:00",
          context: "快件到达 [北京海淀育新小区营业点]",
          location: ""
        },
        {
          time: "2018-05-10 02:03:00",
          ftime: "2018-05-10 02:03:00",
          context: "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          location: ""
        },
        {
          time: "2018-05-09 23:05:00",
          ftime: "2018-05-09 23:05:00",
          context: "快件到达 [北京顺义集散中心]",
          location: ""
        },
        {
          time: "2018-05-09 21:21:00",
          ftime: "2018-05-09 21:21:00",
          context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          location: ""
        },
        {
          time: "2018-05-09 13:07:00",
          ftime: "2018-05-09 13:07:00",
          context: "顺丰速运 已收取快件",
          location: ""
        },
        {
          time: "2018-05-09 12:25:03",
          ftime: "2018-05-09 12:25:03",
          context: "卖家发货",
          location: ""
        },
        {
          time: "2018-05-09 12:22:24",
          ftime: "2018-05-09 12:22:24",
          context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          location: ""
        },
        {
          time: "2018-05-08 21:36:04",
          ftime: "2018-05-08 21:36:04",
          context: "商品已经下单",
          location: ""
        }
      ]
    }
  },
  created(){
    this.getOrderList()
  },
  methods:{
    async getOrderList(){
      const {data:res}=await this.$http.get(`orders`,{params:this.queryInfo})
      console.log("订单",res);
      if(res.meta.status!==200){
        this.$message.error("获取订单列表失败")
      }else{
        this.orderTableData=res.data.goods
        this.total=res.data.total
      }
    },
    // 控制每条多少页数
    handleSizeChange(newSize){
      // console.log("newsize",newSize);
      this.queryInfo.pagesize=newSize
      this.getOrderList()
    },
    // 当前第几页
    handleCurrentChange(newPage){
      // console.log("newpage",newPage);
      this.queryInfo.pagenum=newPage
      this.getOrderList()
    },
    showEdit(){
      this.editDialogVisible=true
    },
    closeEditDialog(){
      this.$refs.editRuleFormRef.resetFields()
    },
    showKuaiDi(){
      this.kuaiDiDialogVisible=true
      // const {data:res}=await this.$http.get(`/kuaidi/1106975712662`)
      // console.log("物流单号",res);
      // if(res.meta.status!==200){
      //   this.$message.error("获取物流进度失败")
      // }else{
      //   this.activities=res.data
      //   this.$message.success("获取物流进度成功")
      // }
    }
  }
}
</script>

<style lang="less" scoped>
.search-btn{
  width: 370px;
}
.el-cascader{
  width: 100%;
}
</style>