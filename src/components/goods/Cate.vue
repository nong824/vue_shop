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
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table
            class="tree-table"
            :data="catelist"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index
            index-text=""
            border
            :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: green"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                     <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                     <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                     <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt">
                     <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                     <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 30]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed">
        <!-- 添加分类的表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称：" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：">
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="cascaderProps"
                @change="parentCateChanged"
                clearable
                change-on-select></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类的数据列表，默认为空
            catelist: [],
            total: 0,
            // 为table指定类的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 将当前列定义为模板列
                    type: 'template',
                    // 表示将当前列使用的模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    // 将当前列定义为模板列
                    type: 'template',
                    // 表示将当前列使用的模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    // 将当前列定义为模板列
                    type: 'template',
                    // 表示将当前列使用的模板名称
                    template: 'opt'
                }
            ],
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                cat_name: '',
                cat_pid: 0,
                cat_level: 0
            },
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类的列表
            parentCateList: [],
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选中的父级分类的id数组
            selectedKeys: []
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        async getCateList () {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！')
            }
            this.catelist = res.data.result
            this.total = res.data.total
        },
        // 监听pagesize改变
        handleSizeChange (newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 监听pagenum改变
        handleCurrentChange (newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        showAddCateDialog () {
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        // 获取父级分类的数据列表
        async getParentCateList () {
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) {
                return this.$message.error('获取父级数据失败！')
            }
            this.parentCateList = res.data
        },
        parentCateChanged () {
            // 如果selectedKeys数组中的length大于0，证明选中了父级分类
            // 反之就说明没有选中任何父级分类
            if (this.selectedKeys.length > 0) {
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击按钮，添加新的分类
        addCate () {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！')
                }
                this.$message.success('添加分类成功')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        // 监听对话框的关闭事件，重置表单数据
        addCateDialogClosed () {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        }
    }
}
</script>

<style lang="less" scoped>
.tree-table {
    margin-top: 15px;
}

.el-cascader {
    width: 100%;
}
</style>
