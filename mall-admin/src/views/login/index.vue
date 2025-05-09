<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-title">
        <h2>管理系统</h2>
      </div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" type="primary" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 备案信息 -->
    <div class="beian-info">
      <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
        粤ICP备2025413181号
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 登录表单
const loginForm = reactive({
  username: 'dev_admin',
  password: 'dev_pass123'
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
})

// 登录方法
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true

        // 调用store中的登录方法
        await userStore.login(loginForm.username, loginForm.password)

        ElMessage.success('登录成功')

        // 根据路由跳转，如果有重定向则跳转到重定向页面
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/')
      } catch (error: any) {
        // 错误信息已在拦截器中处理
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  position: relative;

  .login-box {
    width: 400px;
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background-color: #fff;

    .login-title {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        font-size: 24px;
        color: #303133;
      }
    }

    .login-button {
      width: 100%;
    }
  }

  .beian-info {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    padding: 10px 0;
    font-size: 14px;

    a {
      color: #666;
      text-decoration: none;

      &:hover {
        color: #409eff;
        text-decoration: underline;
      }
    }
  }
}
</style>