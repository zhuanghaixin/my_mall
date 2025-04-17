<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="title">商城管理系统</h2>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="密码" show-password type="password">
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" type="primary" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'

// 表单引用
const loginFormRef = ref<FormInstance>()

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

// 加载状态
const loading = ref(false)

// 用户状态管理
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = true
        // 登录
        await userStore.login(loginForm.username, loginForm.password)
        // 登录成功后跳转
        const redirect = route.query.redirect as string || '/'
        router.push(redirect)
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    } else {
      console.error('登录表单验证失败:', fields)
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;

  .login-card {
    width: 400px;
    border-radius: 8px;

    .title {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 30px;
      color: $primary-color;
    }

    .login-form {
      .login-button {
        width: 100%;
      }
    }
  }
}
</style>