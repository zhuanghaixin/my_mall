<template>
    <div class="dashboard-container">
        <h1>仪表盘</h1>
        <p>欢迎使用商城管理系统</p>

        <el-row :gutter="20" class="card-panel-row">
            <el-col :xs="12" :sm="12" :md="6" :lg="6">
                <el-card class="card-panel user-card" shadow="hover">
                    <div class="card-panel-content">
                        <div class="card-panel-icon-wrapper">
                            <el-icon class="card-panel-icon">
                                <User />
                            </el-icon>
                        </div>
                        <div class="card-panel-description">
                            <div class="card-panel-text">用户总数</div>
                            <div class="card-panel-num">1,234</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="12" :sm="12" :md="6" :lg="6">
                <el-card class="card-panel product-card" shadow="hover">
                    <div class="card-panel-content">
                        <div class="card-panel-icon-wrapper">
                            <el-icon class="card-panel-icon">
                                <Goods />
                            </el-icon>
                        </div>
                        <div class="card-panel-description">
                            <div class="card-panel-text">商品总数</div>
                            <div class="card-panel-num">5,678</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="12" :sm="12" :md="6" :lg="6">
                <el-card class="card-panel order-card" shadow="hover">
                    <div class="card-panel-content">
                        <div class="card-panel-icon-wrapper">
                            <el-icon class="card-panel-icon">
                                <ShoppingCart />
                            </el-icon>
                        </div>
                        <div class="card-panel-description">
                            <div class="card-panel-text">订单总数</div>
                            <div class="card-panel-num">9,876</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="12" :sm="12" :md="6" :lg="6">
                <el-card class="card-panel sales-card" shadow="hover">
                    <div class="card-panel-content">
                        <div class="card-panel-icon-wrapper">
                            <el-icon class="card-panel-icon">
                                <Money />
                            </el-icon>
                        </div>
                        <div class="card-panel-description">
                            <div class="card-panel-text">销售总额</div>
                            <div class="card-panel-num">¥123,456</div>
                        </div>
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

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.dashboard-container {
    padding: 16px;
    max-width: 100%;
    overflow-x: hidden;

    h1 {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 8px;
        color: $text-color-primary;
    }

    p {
        margin-bottom: 20px;
        color: $text-color-secondary;
        font-size: 14px;
    }

    .card-panel-row {
        margin-bottom: 20px;
    }

    .card-panel {
        height: 90px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        color: #666;
        background: #fff;
        transition: all 0.3s;
        border-radius: 8px;
        padding: 0;
        margin-bottom: 16px;

        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .card-panel-content {
            display: flex;
            align-items: center;
            height: 100%;
            width: 100%;
            padding: 0 6px;
        }

        .card-panel-icon-wrapper {
            margin: 0 10px 0 8px;
            padding: 12px;
            transition: all 0.38s ease-out;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 42px;
        }

        .card-panel-icon {
            font-size: 22px;
            color: #fff;
        }

        .card-panel-description {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: right;
            padding-right: 12px;
            padding-left: 2px;

            .card-panel-text {
                line-height: 16px;
                color: $text-color-secondary;
                font-size: 12px;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .card-panel-num {
                font-size: 20px;
                font-weight: 600;
                color: $text-color-primary;
                letter-spacing: 0.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    .user-card .card-panel-icon-wrapper {
        background: $primary-color;
    }

    .product-card .card-panel-icon-wrapper {
        background: #36a3f7;
    }

    .order-card .card-panel-icon-wrapper {
        background: #f4516c;
    }

    .sales-card .card-panel-icon-wrapper {
        background: #34bfa3;
    }
}

// 移动端适配 - 超小屏幕
@media (max-width: 480px) {
    .dashboard-container {
        padding: 10px;

        h1 {
            font-size: 18px;
            margin-bottom: 5px;
        }

        p {
            margin-bottom: 15px;
            font-size: 12px;
        }

        .card-panel {
            height: 80px;
            margin-bottom: 12px;

            .card-panel-icon-wrapper {
                padding: 10px;
                margin: 0 8px 0 6px;
                min-width: 36px;
            }

            .card-panel-icon {
                font-size: 18px;
            }

            .card-panel-description {
                padding-right: 8px;

                .card-panel-text {
                    font-size: 11px;
                    margin-bottom: 4px;
                }

                .card-panel-num {
                    font-size: 16px;
                }
            }
        }
    }
}

// 平板适配
@media (min-width: $screen-sm) and (max-width: $screen-md) {
    .dashboard-container {
        padding: 16px;

        .card-panel {
            height: 95px;
            margin-bottom: 20px;

            .card-panel-description .card-panel-num {
                font-size: 20px;
            }
        }
    }
}

// 触摸设备适配
@media (hover: none) {
    .dashboard-container .card-panel {
        &:active {
            transform: translateY(-2px);
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.08);
        }
    }
}

// 安全区域适配（针对iPhone X等刘海屏）
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .dashboard-container {
        padding-bottom: calc(16px + env(safe-area-inset-bottom));
        padding-left: calc(16px + env(safe-area-inset-left));
        padding-right: calc(16px + env(safe-area-inset-right));
    }
}
</style>