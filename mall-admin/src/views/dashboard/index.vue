<template>
    <div class="dashboard-container">
        <h1>仪表盘</h1>
        <p>欢迎使用商城管理系统</p>

        <el-row :gutter="20" class="card-panel-row">
            <el-col :span="6">
                <el-card class="card-panel">
                    <div class="card-panel-icon-wrapper">
                        <el-icon class="card-panel-icon">
                            <User />
                        </el-icon>
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">用户总数</div>
                        <div class="card-panel-num">1,234</div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card class="card-panel">
                    <div class="card-panel-icon-wrapper" style="background: #36a3f7;">
                        <el-icon class="card-panel-icon">
                            <Goods />
                        </el-icon>
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">商品总数</div>
                        <div class="card-panel-num">5,678</div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card class="card-panel">
                    <div class="card-panel-icon-wrapper" style="background: #f4516c;">
                        <el-icon class="card-panel-icon">
                            <ShoppingCart />
                        </el-icon>
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">订单总数</div>
                        <div class="card-panel-num">9,876</div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card class="card-panel">
                    <div class="card-panel-icon-wrapper" style="background: #34bfa3;">
                        <el-icon class="card-panel-icon">
                            <Money />
                        </el-icon>
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">销售总额</div>
                        <div class="card-panel-num">¥123,456</div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 更多内容 -->
    </div>
</template>

<script setup lang="ts">
import { User, ShoppingBag, ShoppingCart, Money } from '@element-plus/icons-vue'

// 使用ShoppingBag代替不存在的Goods图标
const Goods = ShoppingBag;

// 仪表盘逻辑待开发
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
}

.dashboard-container h1 {
    font-size: 24px;
    margin-bottom: 10px;
}

.dashboard-container p {
    margin-bottom: 30px;
    color: #606266;
}

.card-panel-row {
    margin-bottom: 20px;
}

.card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
}

.card-panel:hover .card-panel-icon-wrapper {
    color: #fff;
}

.card-panel-icon-wrapper {
    float: left;
    margin: 14px 0 0 14px;
    padding: 16px;
    transition: all 0.38s ease-out;
    border-radius: 6px;
    background: #409EFF;
}

.card-panel-icon {
    float: left;
    font-size: 48px;
    color: #fff;
}

.card-panel-description {
    float: right;
    font-weight: bold;
    margin: 26px 20px 0 0;
}

.card-panel-text {
    line-height: 18px;
    color: #606266;
    font-size: 16px;
    margin-bottom: 12px;
}

.card-panel-num {
    font-size: 20px;
}
</style>