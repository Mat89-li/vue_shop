<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="never">
      <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="rolesTableData" border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vccenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限与三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2===0?'':'bdtop','vccenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="13">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="deleteRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoles(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteEditRolesById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRights()">分配权限</el-button>
          </template>
          
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="closeAddRolesDialog">
      <el-form 
        :model="addRolesRuleForm" 
        :rules="addRolesRules" 
        ref="addRolesRuleFormRef" 
        label-width="80px">
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="addRolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required>
          <el-input v-model="addRolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRolesDialogVisible"
      width="50%"
      @close="closeEditRolesDialog">
      <el-form 
        :model="editRolesRuleForm" 
        :rules="editRolesRules" 
        ref="editRolesRuleFormRef" 
        label-width="80px">
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="editRolesRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required>
          <el-input v-model="editRolesRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="closeRightsDialog">
      <el-tree
        :data="treeRightsList"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="treeProps">
      </el-tree>
      <span slot="footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSetRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return{
      rolesTableData:[],
      // 是否展开添加角色对话框
      addRolesDialogVisible:false,
      // 是否展开修改角色对话框
      editRolesDialogVisible:false,
      // 是否展开分配权限对话框
      setRightsDialogVisible:false,
      // 所有权限数据列表
      treeRightsList:[],
      // 树形控件的属性绑定对象
      treeProps:{
        children: 'children',
        label: 'authName'
      },
      // 添加角色的具体信息
      addRolesRuleForm:{
        roleName:'',
        roleDesc:''
      },
      // 修改角色的具体信息
      editRolesRuleForm:{
        roleId:'',
        roleName:'',
        roleDesc:''
      },
      // 添加角色验证规则
      addRolesRules:{
        roleName:[
          {required:true,message:'请输入角色名称',trigger:'blur'}
        ],
        roleDesc:[
          {required:true,message:'请输入角色描述',trigger:'blur'}
        ]
      },
      // 修改角色验证规则
      editRolesRules:{
        roleName:[
          {required:true,message:'请输入角色名称',trigger:'blur'}
        ],
        roleDesc:[
          {required:true,message:'请输入角色描述',trigger:'blur'}
        ]
      },
    }
  },
  created(){
    this.getRolesList()
  },
  methods:{
    async getRolesList(){
      const {data:res}=await this.$http.get("roles")
      console.log("角色列表",res);
      if(res.meta.status!==200){
        this.$message.error("获取角色列表失败")
      }else{
        this.rolesTableData=res.data
        // this.$message.success("获取角色列表成功")
      }
    },
    // 操作添加角色
    addRoles(){
      this.$refs.addRolesRuleFormRef.validate(async valid=>{
        // console.log("addRolesRuleFormRef",valid);
        if(!valid){
          this.$message.error("请填写完整角色信息")
          this.addRolesDialogVisible=true
        }else{
          const {data:res}=await this.$http.post('roles',this.addRolesRuleForm)
          if(res.meta.status!==201){
            this.$message.error("添加角色失败")
          }else{
            this.$message.success("添加角色成功")
            this.getRolesList()
            this.addRolesDialogVisible=false
          }
        }
      })
    },
    // 关闭添加角色对话框时重置对话框内容
    closeAddRolesDialog(){
      this.$refs.addRolesRuleFormRef.resetFields()
      // this.$refs.editRolesRuleFormRef.resetFields()
    },
    // 关闭修改角色对话框时重置对话框内容
    closeEditRolesDialog(){
      // this.$refs.addRolesRuleFormRef.resetFields()
      this.$refs.editRolesRuleFormRef.resetFields()
    },
    // 通过id展示编辑角色对话框内容
    async showEditRoles(id){
      const {data:res}=await this.$http.get(`roles/${id}`)
      // console.log("编辑",res);
      if(res.meta.status!==200){
        return
      }else{
        this.editRolesRuleForm=res.data
      }
      this.editRolesDialogVisible=true
    },
    // 修改角色
    async editRoles(){
      this.$refs.editRolesRuleFormRef.validate(async valid=>{
        if(!valid){
          this.$message.error("请输入正确的格式")
        }else{
          const {data:res}=await this.$http.put(`roles/${this.editRolesRuleForm.roleId}`,{roleName:this.editRolesRuleForm.roleName,
          roleDesc:this.editRolesRuleForm.roleDesc})
          if(res.meta.status!==200){
            this.$message.error("修改角色失败")
          }else{
            this.$message.success("修改角色成功")
            this.editRolesDialogVisible=false
            this.getRolesList()
          }
        }
      })
    },
    // 通过id删除角色
    async deleteEditRolesById(id){
      const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if(confirmResult!=='confirm'){
          this.$message({
            type: 'info',
            message: '已取消删除'
          }); 
        }else{
          const {data:res}=await this.$http.delete(`roles/${id}`)
          // console.log("res",res);
          if(res.meta.status!==200){
            this.$message.error("删除角色失败！")
          }else{
            this.$message.success("删除角色成功！")
            this.getRolesList()
          }
        }
    },
    // 删除角色指定权限
    async deleteRightById(role,rightId){
      const confirmDelete=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmDelete!=='confirm'){
          this.$message({
            type: 'info',
            message: '已取消删除'
          }); 
        }else{
          const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          console.log("删除指定权限",res);
          if(res.meta.status!==200){
            this.$message.error("删除角色失败！")
          }else{
            role.children=res.data
          }
        }
    },
    // 展示分配角色权限
    async showSetRights(){
      const {data:res}=await this.$http.get(`rights/tree`)
      console.log("分配权限",res);
      if(res.meta.status!==200){
        this.$message.error("展示分配权限失败")
      }else{
        this.treeRightsList=res.data
        this.setRightsDialogVisible=true
      }
    },
    closeRightsDialog(){},
    confirmSetRights(){}
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vccenter{
  display: flex;
  align-items: center;
}
</style>