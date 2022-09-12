<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 警告区域 -->
       <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <!-- 选择框区域 -->
      <div class="select-opt">
        <span class="typeGoods">选择商品分类：</span>
        <el-cascader
          v-model="selectedCateKeys"
          :options="cateList"
          :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children'}"
          @change="handleChange">
        </el-cascader>
      </div>
      <!-- 选中选中框的内容显示区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible=true">添加参数</el-button>
          <!-- 动态参数数据表格 -->
          <el-table :data="manyData" border style="width: 100%" stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)">{{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible=true">添加属性</el-button>
          <!-- 静态属性数据表格 -->
          <el-table :data="onlyData" border style="width: 100%" stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)">{{item}}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button type="danger" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="closeParamsDialog">
      <el-form :model="addParamsForm" :rules="addParamsRules" ref="addParamsRuleFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="closeEditParamsDialog">
      <el-form :model="editParamsForm" :rules="editParamsRules" ref="editParamsRuleFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return{
      //所有分类列表数据
      cateList:[],
      // 级联选择框双向绑定到的数组
      selectedCateKeys:[],
      activeName:'many',
      // 动态参数数据
      manyData:[],
      // 静态属性数据
      onlyData:[],
      // 控制添加参数对话框的显示与隐藏
      addParamsDialogVisible:false,
      //添加参数的双向绑定的输入框内容
      addParamsForm:{
        attr_name:''
      },
      //添加参数表单验证规则
      addParamsRules:{
        attr_name:[
          {required:true,message:'请输入正确的参数名称',trigger:'blur'}
        ]
      },
      // 控制修改参数对话框的显示与隐藏
      editParamsDialogVisible:false,
      //修改参数的双向绑定的输入框内容
      editParamsForm:{
        attr_name:''
      },
      //修改参数表单验证规则
      editParamsRules:{
        attr_name:[
          {required:true,message:'请输入正确的参数名称',trigger:'blur'}
        ]
      },
      //控制标签输入框的显示与隐藏
      inputVisible:false,
      // 标签输入框输入的值
      inputValue:''
    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    // 获取所有商品分类列表
    async getCateList(){
      const {data:res}=await this.$http.get("categories")
      if(res.meta.status!==200){
        this.$message.error("获取分类列表失败")
      }else{
        this.cateList=res.data
        console.log("分类",this.cateList);
      }
    },
    //选择框被选中触发的事件
    handleChange(){
      this.getParamsData()
    },
    async getParamsData(){
      if(this.selectedCateKeys.length!==3){
        this.selectedCateKeys=[]
        this.manyData=[]
        this.onlyData=[]
        return
      }else{
        // console.log("11",this.selectedCateKeys);
      }
      // 根据所选分类的ID，和当前所处的面板，获取对应的参数
      const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
        if(res.meta.status!==200){
          this.$message.error("获取分类参数列表失败")
        }else{
          console.log("参数",res);
          res.data.forEach(item=>{
            item.attr_vals= item.attr_vals ? item.attr_vals.split(' '):[]
            // console.log("分割后",res);
            // 控制文本框的显示与隐藏
            item.inputVisible=false
            // 文本框中输入的值
            item.inputValue=''
          })
          if(this.activeName=='many'){
            this.manyData=res.data
          }else{
            this.onlyData=res.data
          }
        }
    },
    handleClick(tab, event) {
      console.log(this.activeName);
      this.getParamsData()
    },
    // 关闭添加对话框时重置表单内容
    closeParamsDialog(){
      this.$refs.addParamsRuleFormRef.resetFields()
    },
    //点击确定按钮添加参数
    async addParams(){
      const {data:res}=await this.$http.post(`categories/${this.cateId}/attributes`,
      {
        attr_name:this.addParamsForm.attr_name,
        attr_sel:this.activeName
      })
      console.log("添加",res);
      if(res.meta.status!==201){
        this.$message.error("添加参数失败")
      }else{
        this.$message.success("添加参数成功！")
        this.addParamsDialogVisible=false
        this.getParamsData()
      }
    },
    // 关闭修改对话框时重置表单内容
    closeEditParamsDialog(){
      this.$refs.editParamsRuleFormRef.resetFields()
    },
    //展示修改对话框
    async showEditDialog(attr_id){
      this.editParamsDialogVisible=true
      const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
      {params:{attr_sel:this.activeName}})
      console.log("展示",res);
      if(res.meta.status!==200){
        this.$message.error("获取参数失败")
      }else{
        this.editParamsForm=res.data
      }
    },
    //确认修改内容
    confirmEdit(){
      this.$refs.editParamsRuleFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
        {attr_name:this.editParamsForm.attr_name,attr_sel:this.activeName})
        console.log("确认",res);
        if(res.meta.status!==200){
          this.$message.error("更改参数失败")
        }else{
          this.editParamsDialogVisible=false
          this.getParamsData()
          this.$message.success("更改参数成功！")
        }
      })
    },
    //删除参数
    async deleteParams(attr_id){
      const confirmResult =await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
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
          const {data:res}=await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
          if(res.meta.status!==200){
            this.$message.error("删除失败")
          }else{
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getParamsData()
          }
        }
    },
    //标签保存事件
    async saveAttrVals(row){
      const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
      {
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
        }
      )
      console.log("保存",res);
    },
    //添加标签时，点击按钮则显示输入框
    showInput(row){
      row.inputVisible=true;
      //光标聚焦输入框
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInputRef.$refs.input.focus();
      });
    },
    //回车、文本框失去焦点时触发的事件
    handleInputConfirm(row){
      if(row.inputValue.trim().length===0){
        row.inputValue=''
        row.inputVisible=false
        return
      }else{
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue=''
        row.inputVisible=false
        //需要发起请求，保存这次操作
        this.saveAttrVals(row)
      }
    },
    //删除参数对应对选项
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
  computed:{
    isBtnDisabled(){
      if(this.selectedCateKeys.length!==3){
        return true
      }else{
        return false
      }
    },
    // 当前选中的三级分类的ID
    cateId(){
      if(this.selectedCateKeys.length===3){
        return this.selectedCateKeys[2]
      }else{
        return null
      }
    },
    // 添加参数对话框的标题
    titleText(){
      if(this.activeName=='many'){
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.select-opt{
  margin-top: 15px;
  .typeGoods{
    font-size: 18px;
  }
}
.el-tag{
  margin: 0 10px;
}
.el-input{
  width: 150px;
}
.el-button{
  margin-left: 10px;
}
</style>