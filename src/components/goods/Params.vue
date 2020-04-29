<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 头部警告区域 -->
            <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                    v-model="selectedCateKeys"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tab标签页区 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" @click="addDialogVisible=true" :disabled="isBtnDisabled">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag closable @close="handleClose(i, scope.row)" v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                ></el-input>
                                <!-- 添加的按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" @click="addDialogVisible=true" :disabled="isBtnDisabled">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag closable @close="handleClose(i, scope.row)" v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                ></el-input>
                                <!-- 添加的按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            catelist: [],
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            selectedCateKeys: [],
            activeName: 'many',
            manyTableData: [],
            onlyTableData: [],
            addDialogVisible: false,
            // 添加参数的表单数据对象
            addForm: {
                attr_name: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            editDialogVisible: false,
            editForm: {},
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            }
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        async getCateList () {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败！')
            }
            this.catelist = res.data
        },
        // 级联选择框选中项变化，会触发这个函数
        handleChange () {
            this.getParamsData()
        },
        handleTabClick () {
            this.getParamsData()
        },
        async getParamsData () {
            if (this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
            }
            const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！')
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                // 控制展开行中的文本框的显示与隐藏
                item.inputVisible = false
                // 文本框中输入的值
                item.inputValue = ''
            })
            if (this.activeName === 'many') {
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        addDialogClosed () {
            this.$refs.addFormRef.resetFields()
        },
        addParams () {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post(`categories/${this.cateid}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
                if (res.meta.status !== 201) {
                    return this.$message.error('添加参数失败')
                }
                this.$message.success('添加参数成功')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        async showEditDialog (attrId) {
            const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数信息失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        editDialogClosed () {
            this.$refs.editFormRef.resetFields()
        },
        editParams () {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateid}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
                if (res.meta.status !== 200) {
                    return this.$message.error('修改参数失败！')
                }
                this.$message.success('修改参数成功')
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        // 根据id删除对应的参数项
        async removeParams (attrId) {
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 用户取消了删除操作
            if (confirmResult !== 'confirm') {
                return this.$message.info('已经取消删除')
            }
            // 删除业务逻辑
            const { data: res } = await this.$http.delete(`categories/${this.cateid}/attributes/${attrId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除参数失败！')
            }
            this.$message.success('删除参数成功')
            this.getParamsData()
        },
        async handleInputConfirm (row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 如果没有return，则证明输入的内容需要做后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 需要发起请求，保存这次操作
            this.saveAttrVals(row)
        },
        showInput (row) {
            row.inputVisible = true
            // 让文本框自动获得焦点
            // $nextTick方法的作用：当页面上元素被重新渲染之后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        async saveAttrVals (row) {
            const { data: res } = await this.$http.put(`categories/${this.cateid}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
            if (res.meta.status !== 200) {
                return this.$message.error('修改参数项失败！')
            }
            this.$message.success('修改参数项成功')
        },
        // 删除对应的参数可选项
        handleClose (i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        }
    },
    computed: {
        // 如果按钮需要被禁用，返回true，否则返回false
        isBtnDisabled () {
            if (this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        cateid () {
            if (this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        titleText () {
            if (this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}

.el-tag {
    margin: 10px;
}

.input-new-tag {
    width: 120px;
}
</style>
