<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!-- 表格区域 -->
      <tree-table 
        :data="cateList" 
        :columns="columnsData" 
        :expand-type="false" 
        :selection-type="false"
        :show-index="true"
        index-text="#"
        border>
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen;" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red;" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="closeAddDialog">
      <el-form :model="addCateRuleForm" :rules="addCateRules" ref="addCateRuleFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateRuleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children',checkStrictly:true}"
            @change="handleChange"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeEditDialog">
      <el-form :model="editForm" :rules="editFormRules" ref="editRuleFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
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
export default {
  data(){
    return{
      //查询条件
      queryInfo:{
        type:3,
        //当前页码值
        pagenum:1,
        //每页显示多少条数据
        pagesize:5
      },
      //分类数据列表
      cateList:[],
      //总数据条数
      total:0,
      // 为table指定列的定义
      columnsData:[
        {label:'分类名称',prop:'cat_name'},
        {label:'是否有效',type:'template',template:'isOK'},
        {label:'排序',type:'template',template:'order'},
        {label:'操作',type:'template',template:'opt'},
      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible:false,
      //添加分类的内容
      addCateRuleForm:{
        cat_pid:0,
        cat_name:'',
        cat_level:0
      },
      //添加分类的验证规则
      addCateRules:{
        cat_name:[
          {required:true,message:'请输入正确的分类名称',trigger:'blur'}
        ]
      },
      // 选中的父级分类的ID数组
      selectedKeys:[],
      //父级分类列表
      parentCateList:[],
      // 控制修改分类对话框的显示与隐藏
      editDialogVisible:false,
      editForm:{
        cat_name:'',
        cat_id:0
      },
      //验证规则
      editFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      }
    }
  },
  created(){
    this.getCateDataList()
  },
  methods:{
    //获取分类数据列表
    async getCateDataList(){
      const {data:res}=await this.$http.get(`categories`,{params:this.queryInfo})
      // console.log("获取到了",res);
      if(res.meta.status!==200){
        this.$message.error("获取分类数据列表失败")
      }else{
        this.cateList=res.data.result
        this.total=res.data.total
      }
    },
    //展示添加分类对话框
    showAddCateDialog(){
      this.addCateDialogVisible=true
      this.getParentCateList()
    },
    //关闭添加分类对话框时重置表单内容
    closeAddDialog(){
      this.$refs.addCateRuleFormRef.resetFields()
      // 重置级联选择器
      this.selectedKeys=[]
      this.addCateRuleForm.cat_pid=0
      this.addCateRuleForm.cat_level=0
    },
    //当添加分离的级联选择器被选中时被触发
    handleChange(){
      // console.log("选中了",this.selectedKeys);
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if(this.selectedKeys.length>0){
        // 父级分类的ID
        this.addCateRuleForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
        // 为当前分类的等级赋值
        this.addCateRuleForm.cat_level=this.selectedKeys.length
        return
      }else{
        // 父级分类的ID
        this.addCateRuleForm.cat_pid=0
        // 为当前分类的等级赋值
        this.addCateRuleForm.cat_level=0
      }
    },
    //获取父级分类数据
    async getParentCateList(){
      const {data:res}=await this.$http.get(`categories`,{params:{type:2}})
      // console.log("父级分类",res);
      if(res.meta.status!==200){
        this.$message.error("获取父级分类失败")
      }else{
        this.parentCateList=res.data
      }
    },
    // 每页多少条数据
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getCateDataList()
    },
    //当前第几页
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getCateDataList()
    },
    //确认添加分类
    confirmAddCate(){
      this.$refs.addCateRuleFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res}=await this.$http.post(`categories`,this.addCateRuleForm)
        // console.log("确认添加",res);
        if(res.meta.status!==201){
          this.$message.error("添加分类失败")
        }else{
          this.$message.success("添加分类成功")
          this.getCateDataList()
          this.addCateDialogVisible=false
        }
      })
    },
    //展示编辑对话框
    async showEditDialog(id){
      this.editDialogVisible=true
      const {data:res}=await this.$http.get(`categories/${id}`)
      // console.log("编辑",res);
      if(res.meta.status!==200){
        this.$message.error("获取分类失败")
      }else{
        this.editForm=res.data
      }
    },
    // 关闭对话框时重置表单内容
    closeEditDialog(){
      this.$refs.editRuleFormRef.resetFields()
    },
    //确认编辑
    confirmEdit(){
      this.$refs.editRuleFormRef.validate(async valid=>{
        if(!valid) return this.$message.error('请填写完整分类信息');
        const {data:res}=await this.$http.put(`categories/${this.editForm.cat_id}`,{cat_name:this.editForm.cat_name})
        // console.log("确认",res);
        if(res.meta.status!==200){
          this.$message.error("更新分类名称失败")
        }else{
          this.getCateDataList()
          this.editDialogVisible=false
          this.$message.success("更新分类名称信息成功")
        }
      })
    },
    //删除分类
    async deleteCate(id){
      const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult!=='confirm'){
            this.$message({
              type: 'info',
              message: '已取消删除'
            }); 
        }else{
          const {data:res}=await this.$http.delete(`categories/${id}`)
          console.log("删除",res);
          if(res.meta.status!==200){
            return this.$message.error("删除失败")
          }else{
            this.getCateDataList()
            return this.$message.success("删除成功")
          }
        }
    }
  }
}
</script>

<style lang="less" scoped>
.el-button{
  margin-bottom: 15px;
}
.el-cascader{
  width: 100%;
}
</style>