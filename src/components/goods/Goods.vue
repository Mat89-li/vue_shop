<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never">
      <!-- 搜索与添加用户功能 -->
      <div class="searchAdd">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
          <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
        </el-input>
        <el-button type="primary" @click="showAddDialog">添加商品</el-button>
      </div>

      <!-- 商品列表数据 -->
      <el-table :data="goodsTableData" border stripe style="width: 100%">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80"></el-table-column>
        <el-table-column label="创建时间" width="161">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditGoods(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加商品对话框 -->
    <el-dialog
      title="添加商品"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="closeAddDialog">
      <el-form :model="addRuleForm" :rules="addRules" ref="addRuleFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addRuleForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="addRuleForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="addRuleForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="addRuleForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat">
          <el-cascader
            v-model="addRuleForm.goods_cat"
            :options="cateOptions"
            :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children'}"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑商品对话框 -->
    <el-dialog
      title="修改商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeEditDialog">
      <el-form :model="editRuleForm" :rules="editRules" ref="editRuleFormRef" label-width="80px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editRuleForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editRuleForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editRuleForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
//官方推荐将lodash导入为_
import _ from 'lodash'
export default {
  data(){
    return{
      queryInfo:{
        query:"",
        // 当前页码
        pagenum:1,
        // 每页显示条数
        pagesize:10
      },
      goodsTableData:[],
      // 总页码数
      total:0,
      //控制编辑商品对话框显示与隐藏
      editDialogVisible:false,
      //编辑表单内容
      editRuleForm:{
        goods_name:'',
        goods_id:0,
        goods_price:0,
        goods_number:0,
        goods_weight:0
      },
      // 验证规则
      editRules:{
        goods_name:[
          {required:true,message:'请输入正确的商品名称',trigger:'blur'}
        ],
        goods_price:[
          {required:true,message:'请输入商品价格',trigger:'blur'}
        ],
        goods_weight:[
          {required:true,message:'请输入商品重量',trigger:'blur'}
        ]
      },
      //控制添加商品对话框显示与隐藏
      addDialogVisible:false,
      //添加表单内容
      addRuleForm:{
        goods_name:'',
        goods_id:0,
        goods_price:0,
        goods_number:0,
        goods_weight:0,
        goods_cat:''
      },
      //添加商品的验证规则
      addRules:{
        goods_name:[
          {required:true,message:'请输入正确的商品名称',trigger:'blur'}
        ],
        goods_price:[
          {required:true,message:'请输入商品价格',trigger:'blur'}
        ],
        goods_number:[
          {required:true,message:'请输入商品数量',trigger:'blur'}
        ],
        goods_weight:[
          {required:true,message:'请输入商品重量',trigger:'blur'}
        ],
        goods_cat:[
          {required:true,message:'请选择商品分类',trigger:'blur'}
        ]
      },
      selectKeys:[],
      cateOptions:[]
    }
  },
  created(){
    this.getGoodsList()
  },
  methods:{
    async getGoodsList(){
      const {data:res}=await this.$http.get(`goods`,{params:this.queryInfo})
      console.log(res);
      if(res.meta.status!==200){
        this.$message.error("获取商品列表失败！")
      }else{
        this.goodsTableData=res.data.goods
        this.total=res.data.total
      }
    },
    // 控制每条多少页数
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getGoodsList()
    },
    // 当前第几页
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getGoodsList()
    },
    //展示编辑商品对话框
    async showEditGoods(id){
      this.editDialogVisible=true
      const {data:res}=await this.$http.get(`goods/${id}`)
      console.log("编辑",res);
      if(res.meta.status!==200){
        this.$message.error("获取商品失败")
      }else{
        this.editRuleForm=res.data
      }
    },
    //关闭对话框后，重置表单内容
    closeEditDialog(){
      this.$refs.editRuleFormRef.resetFields()
    },
    // 确认修改
    confirmEdit(){
      this.$refs.editRuleFormRef.validate(async valid=>{
        if(!valid) return this.$message.error("请填写完整信息")
        const {data:res}=await this.$http.put(`goods/${this.editRuleForm.goods_id}`,this.editRuleForm)
        console.log("确认修改",res);
        if(res.meta.status!==200){
          this.$message.error("修改失败")
        }else{
          this.editDialogVisible=false
          this.getGoodsList()
          this.$message.success("修改成功")
        }
      })
    },
    //删除商品
    async deleteGoods(id){
      const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      // console.log(confirmResult);
      if(confirmResult!=='confirm'){
        this.$message.info("已取消删除")
      }else{
        const {data:res}=await this.$http.delete(`goods/${id}`)
        console.log("删除",res);
        if(res.meta.status!==200){
          this.$http.error("删除失败")
        }else{
          this.getGoodsList()
          this.$message.success("删除成功")
        }
      }
    },
    //关闭对话框后，重置表单内容
    closeAddDialog(){
      this.$refs.addRuleFormRef.resetFields()
    },
    //展示添加商品对话框
    showAddDialog(){
      this.addDialogVisible=true
      this.getCateList()
    },
    //确认添加
    confirmAdd(){
      this.$refs.addRuleFormRef.validate(async valid=>{
        if(!valid) return this.$message.error("请填写完整信息")
        //将addRuleForm进行深拷贝，避免goods_cat数组转换字符串之后导致级联选择器报错
        const form = _.cloneDeep(this.addRuleForm);
        console.log("深拷贝",form);
        //将goods_cat从数组转换为"1,2,3"字符串形式
        form.goods_cat=form.goods_cat.join(',');
        const {data:res}=await this.$http.post(`goods`,form)
        console.log("确认添加",res);
        if(res.meta.status!==201){
          this.$message.error("添加商品失败")
        }else{
          this.addDialogVisible=false
          this.getGoodsList()
          this.$message.success("添加商品成功")
        }
      })
      
    },
    //获取商品分类
    async getCateList(){
      const {data:res}=await this.$http.get(`categories`)
      console.log("获取商品分类",res);
      if(res.meta.status!==200){
        this.$message.error("获取商品分类失败")
      }else{
        this.cateOptions=res.data
      }
    },
    handleChange(value){
      console.log("value",value);
      if(this.addRuleForm.goods_cat.length!==3){
        this.addRuleForm.goods_cat=[]
      }
    }
  }
}
</script>

<style lang="less" scoped>
.searchAdd{
  display: flex;
  width: 450px;
  .el-input{
    margin-right: 15px;
  }
}
.el-cascader{
  width: 100%;
}
</style>