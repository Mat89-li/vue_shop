<template>
<div>
  <!-- 面包屑区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片区域 -->
  <el-card shadow="never">
    <!-- 搜索与添加用户功能 -->
    <div class="searchAdd">
      <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
      </el-input>
      <el-button type="primary" @click="addUserDialog=true">添加用户</el-button>
    </div>
    <!-- 用户列表区域 -->
    <el-table :data="userData" border stripe>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            @change="userStateChange(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <!-- {{scope.row}} -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUserDialog(scope.row.id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>

  <!-- 添加用户对话框 -->
  <el-dialog
    title="添加用户"
    :visible.sync="addUserDialog"
    width="50%"
    @close="addDialogClosed()">
    <!-- 添加用户的具体信息 -->
    <el-form :model="addUserRuleForm" :rules="addUserRules" ref="addUserRuleFormRef" label-width="70px">
      <el-form-item label="用户名" prop="username" required>
        <el-input v-model="addUserRuleForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" required>
        <el-input v-model="addUserRuleForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email" required>
        <el-input v-model="addUserRuleForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile" required>
        <el-input v-model="addUserRuleForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addUserDialog = false">取 消</el-button>
      <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
  </el-dialog>

  <!-- 修改用户对话框 -->
  <el-dialog
    title="修改用户"
    :visible.sync="editUserDialogVisible"
    width="50%"
    @close="editDialogClosed()">
    <el-form 
      :model="editUserRuleForm" 
      :rules="editUserRules" 
      ref="editUserRuleFormRef" 
      label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="editUserRuleForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email" required>
        <el-input v-model="editUserRuleForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile" required>
        <el-input v-model="editUserRuleForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="editUserDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUserInfo()">确 定</el-button>
    </span>
  </el-dialog>

  <!-- 分配角色对话框 -->
  <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%"
    @close="closeSetRoleDialog()">
    <div>
      <p>当前用户:{{userInfo.username}}</p> 
      <p>当前的角色:{{userInfo.role_name}}</p> 
      <p>分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
    </div>
    <span slot="footer">
      <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmRole()">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail=(rule,value,cb)=>{
      // 验证邮箱的正则表达式
      const regEmail=/^\w+@\w+(\.\w+)+$/
      if(regEmail.test(value)){
        // 合法的邮箱
        return cb();
      }
      //返回一个错误提示
      cb(new Error('请输入合法的邮箱'));
    }
    //验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/  //  \d等同于[0-9]
      if (regMobile.test(value)) {
        return cb()
      }
      //返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      userData: [],
      searchNews:'',
      // 总页数
      total:0,
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      // 需要被分配角色的用户信息
      userInfo:{},
      // 已选中分配角色id值
      selectedRoleId:'',
      // 添加用户对话框
      addUserDialog:false,
      // 修改用户对话框
      editUserDialogVisible:false,
      // 分配角色对话框
      setRoleDialogVisible:false,
      // 角色列表
      roleList:[],
      // 添加用户的具体信息
      addUserRuleForm:{
        username:"",
        password:"",
        email:"",
        mobile:""
      },
      // 修改用户的具体信息
      editUserRuleForm:{},
      // 添加用户的验证规则
      addUserRules:{
        // 验证用户名是否合法
        username:[
          {required:true,message:'请输入用户名！',trigger:'blur'},
          { min: 3, max: 5, message: '长度在 3 到 5 个字符之间', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password:[
          {required:true,message:'请输入密码！',trigger:'blur'},
          { min: 6, max: 8, message: '长度在 6 到 8 个字符之间', trigger: 'blur' }
        ],
        // 验证邮箱是否合法
        email:[
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: 'blur'}
        ],
        // 验证手机号码是否合法
        mobile:[
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 修改用户的验证规则
      editUserRules:{
        // 验证邮箱是否合法
        email:[
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: 'blur'}
        ],
        // 验证手机号码是否合法
        mobile:[
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: 'blur'}
        ]
      }
    };
  },
  created(){
    this.getUserList()
  },
  methods:{
    async getUserList(){
      const {data:res}=await this.$http.get("users",{params: this.queryInfo})
      console.log("获取用户",res);
      if(res.meta.status!==200){
        this.$message.error("获取管理员列表失败");
      }else{
        this.userData=res.data.users
        this.total=res.data.total
      }
    },
    // pageSize 改变时会触发
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize;
      this.getUserList()
      // console.log("size",newSize);
    },
    // 上下页 改变时会触发
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage;
      this.getUserList()
      // console.log("page",newPage);
    },
    // 修改用户状态
    async userStateChange(userInfo){
      // console.log(userInfo);
     const {data:res}=await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
    //  console.log(res);
     if(res.meta.status!==200){
      this.userInfo.mg_state=!this.userInfo.mg_state
      this.$message.error("更新用户状态失败")
     }else{
      this.$message.success("更新用户状态成功！")
     }
    },
    // 添加用户
    addUser(){
      this.$refs.addUserRuleFormRef.validate( async valid =>{
        // console.log("valid",valid);
        if(!valid) return this.$message.error("请填写完整用户信息");
        const {data:res}=await this.$http.post("users",this.addUserRuleForm)
        // console.log("添加用户",res);
        if(res.meta.status!==201){
          this.$message.error("添加用户失败！")
        }else{
          this.$message.success("成功添加用户！")
          this.addUserDialog=false
          this.getUserList()
        }
      })
    },
    // 关闭添加用户对话框后，重置表单内容
    addDialogClosed(){
      this.$refs.addUserRuleFormRef.resetFields()
    },
    // 通过id删除用户
    async deleteUserById(id){
      const confirmDelete =await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // console.log("删除",confirmDelete);
        if(confirmDelete!=='confirm'){
          return this.$message.info('已取消删除');     
        }else{
          const {data:res} =await this.$http.delete(`users/${id}`)
          if(res.meta.status!==200){
            return this.$message.error("删除用户失败！")
          }else{
            console.log("删除成功",res);
            this.$message.success('删除成功!');
            this.getUserList()
          }
        }
    },
    // 展示编辑用户的对话框
    async showUserDialog(id){
      const {data:res} = await this.$http.get(`users/${id}`)
      // console.log(res);
      if(res.meta.status!==200){
        return this.$message.error('查询用户信息失败！');
      }else{
        this.editUserRuleForm=res.data
        this.editUserDialogVisible=true
      }
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed(){
      this.$refs.editUserRuleFormRef.resetFields();
    },
    // 编辑用户信息
    editUserInfo(){
      this.$refs.editUserRuleFormRef.validate(async valid=>{
        // console.log(valid);
        if (!valid) return this.$message.error('请填写完整用户信息');
        // 发起修改用户信息的数据请求
        const { data: res }=await this.$http.put('users/'+this.editUserRuleForm.id,{
          email:this.editUserRuleForm.email,
          mobile:this.editUserRuleForm.mobile
        })
        // 判断如果修改失败，就做提示
        if(res.meta.status!==200){
          return this.$message.error('更新用户信息失败！');
        }else{
          // 关闭对话框
          this.editUserDialogVisible=false;
          // 刷新数据列表
          this.getUserList();
          // 提示修改成功
          this.$message.success('更新用户信息成功！');
        }
      })
    },
    // 展示分配角色对话框
    async setRole(row){
      // console.log(row);
      this.userInfo=row
      const {data:res} =await this.$http.get("roles")
      console.log(res);
      if(res.meta.status!==200){
        this.$message.error("获取角色列表失败")
      }else{
        this.roleList=res.data
        this.setRoleDialogVisible=true
      }
    },
    // 提交分配角色
    async confirmRole(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色！')
      }else{
        const {data:res} =await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
        console.log(res);
        if(res.meta.status!==200){
          this.$message.error("更新角色失败")
        }else{
          this.$message.success("更新角色成功")
          this.getUserList()
          this.setRoleDialogVisible=false
        }
      }
    },
    // 分配角色对话框关闭事件
    closeSetRoleDialog(){
      this.selectedRoleId=''
      this.userInfo={}
    }
  }
};
</script>

<style lang="less" scoped>
.searchAdd{
  display: flex;
  width: 450px;
  .el-input{
    margin-right: 15px;
  }
}

</style>