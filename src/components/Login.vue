<template>
  <div class="login_box">
    <div class="login_form">
        <div class="avatar">
            <img src="../assets/logo.jpg" alt="">
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules">
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              prefix-icon="el-icon-s-custom"
              v-model="loginForm.username">
            </el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              prefix-icon="el-icon-lock"
              v-model="loginForm.password"
              show-password>
            </el-input>
          </el-form-item>
          <!-- 按钮 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="toLogin">登录</el-button>
            <el-button type="info" @click="toReset">重置</el-button>
          </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
      // 表单验证数据对象
      loginForm:{
        username:'admin',
        password:'123456'
      },
      // 表单验证规则
      loginRules:{
        // 验证用户名是否合法
        username:[
          {required:true,message:'请输入用户名！',trigger:'blur'},
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password:[
          {required:true,message:'请输入密码！',trigger:'blur'},
          { min: 6, max: 8, message: '长度在 6 到 8 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    // 登录
    toLogin(){
      this.$refs.loginFormRef.validate(async valid=>{
        // console.log(valid);
        if(!valid) return;
        const {data:res} = await this.$http.post("login",this.loginForm);
        if(res.meta.status!==200) return this.$message.error("登录失败！");
        this.$message.success("登录成功！");
        // console.log(res);
        // 将登录成功之后的  token ,保存到客户端的 sessionStorage 中
        window.sessionStorage.setItem("token",res.data.token);
        this.$router.push('/home')
      })
    },
    // 重置
    toReset(){
      // console.log(this);
      this.$refs.loginFormRef.resetFields();
    }
  }
}
</script>

<style lang="less" scoped>
.login_box{
    height: 100%;
    background-color: #2b4b6b;
    .login_form{
        width: 450px;
        height: 300px;
        background-color: #ffffff;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        .avatar{
          width: 130px;
          height: 130px;
          position: absolute;
          left: 50%;
          transform: translate(-50%,-50%);
          background-color: #ffffff;
          border-radius: 50%;
          padding: 10px;
          box-shadow: 0 0 10px #d1d9e1;
          img{
            width: 100%;
            height: 100%;
            background-color: #eeeeee;
            border-radius: 50%;
          }
        }
        .el-form{
          margin-top: 112px;
          .el-form-item{
            padding: 0 20px;
          }
        }
        .btns{
          text-align: right;
        }
    }
}
</style>