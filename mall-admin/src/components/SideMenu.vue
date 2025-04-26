<template>
    <div class="side-menu" :class="{ 'is-mobile': isMobile }">
        <el-menu :default-active="activeMenu" :collapse="isCollapse" :unique-opened="false" :collapse-transition="false"
            class="el-menu-vertical" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
            <template v-for="(route, index) in routes" :key="index">
                <template v-if="!route.meta?.hidden">
                    <!-- 无子菜单 -->
                    <el-menu-item v-if="!hasChildren(route)" :index="route.path" @click="handleMenuClick(route)">
                        <el-icon v-if="route.meta?.icon">
                            <component :is="route.meta.icon" />
                        </el-icon>
                        <span>{{ route.meta?.title }}</span>
                    </el-menu-item>

                    <!-- 有子菜单 -->
                    <el-sub-menu v-else :index="route.path">
                        <template #title>
                            <el-icon v-if="route.meta?.icon">
                                <component :is="route.meta.icon" />
                            </el-icon>
                            <span>{{ route.meta?.title }}</span>
                        </template>

                        <!-- 递归渲染子菜单 -->
                        <template v-for="(child, childIndex) in route.children" :key="childIndex">
                            <template v-if="!child.meta?.hidden">
                                <el-menu-item :index="`${route.path}/${child.path}`"
                                    @click="handleMenuClick(child, route.path)">
                                    <el-icon v-if="child.meta?.icon">
                                        <component :is="child.meta.icon" />
                                    </el-icon>
                                    <span>{{ child.meta?.title }}</span>
                                </el-menu-item>
                            </template>
                        </template>
                    </el-sub-menu>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'

interface Props {
    collapse?: boolean
    routes: RouteRecordRaw[]
}

const props = withDefaults(defineProps<Props>(), {
    collapse: false,
    routes: () => []
})

const isCollapse = computed(() => props.collapse)
const route = useRoute()
const router = useRouter()

// 移动端检测
const isMobile = ref(false)

const checkMobile = () => {
    isMobile.value = window.innerWidth < 992
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

// 当前激活的菜单
const activeMenu = computed(() => {
    // 如果当前路径是dashboard，则返回根路径以激活顶层菜单
    if (route.path === '/dashboard') {
        return '/'
    }
    return route.path
})

// 判断是否有子菜单
const hasChildren = (route: RouteRecordRaw) => {
    if (route.children) {
        return route.children.filter(child => !child.meta?.hidden).length > 0
    }
    return false
}

// 处理菜单点击
const handleMenuClick = (currentRoute: RouteRecordRaw, parentPath?: string) => {
    let path = currentRoute.path

    // 处理子路由路径
    if (parentPath && !path.startsWith('/')) {
        path = `${parentPath}/${path}`
    }

    // 处理重定向
    if (currentRoute.redirect) {
        path = currentRoute.redirect as string
    }

    router.push(path)

    // 触发关闭移动端菜单的事件
    if (isMobile.value) {
        const event = new CustomEvent('menu-click-mobile')
        document.dispatchEvent(event)
    }
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.side-menu {
    height: calc(100% - #{$header-height});
    overflow-y: auto;
    overflow-x: hidden;

    &.is-mobile {
        height: 100%;
        padding-top: 50px; // 为关闭按钮留出空间

        .el-menu-vertical:not(.el-menu--collapse) {
            width: 100%;
        }
    }

    .el-menu-vertical {
        height: 100%;
        border-right: none;

        &:not(.el-menu--collapse) {
            width: $sidebar-width;
        }
    }

    :deep(.el-sub-menu__title) {
        &:hover {
            background-color: #263445 !important;
        }
    }

    :deep(.el-menu-item) {
        &:hover {
            background-color: #263445 !important;
        }

        &.is-active {
            background-color: #263445 !important;
        }

        // 移动端菜单项更高以便于触摸
        @media (max-width: $screen-sm) {
            height: 56px;
            line-height: 56px;
        }
    }

    // 移动端子菜单标题
    :deep(.el-sub-menu) {
        @media (max-width: $screen-sm) {
            .el-sub-menu__title {
                height: 56px;
                line-height: 56px;
            }
        }
    }

    // 修复折叠状态下文本不显示问题
    :deep(.el-menu--collapse) {
        .el-sub-menu {
            &.is-active {
                >.el-sub-menu__title {
                    color: $primary-color !important;
                }
            }
        }
    }

    // 处理移动端滚动
    @media (max-width: $screen-md) {
        -webkit-overflow-scrolling: touch;
    }
}

// 适配iPhone X等底部安全区域
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .side-menu.is-mobile {
        padding-bottom: env(safe-area-inset-bottom);
    }
}
</style>