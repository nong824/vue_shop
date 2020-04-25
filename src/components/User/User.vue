<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区 -->
            <el-table :data="userlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch @change="userStateChanged(scope.row)" v-model="scope.row.mg_state"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip class="item" effect="dark" content="修改信息" placement="top" :enterable="false">
                            <el-button @click="showEditDialog(scope.row.id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip class="item" effect="dark" content="删除用户" placement="top" :enterable="false">
                            <el-button @click="removeUserById(scope.row.id)" size="mini" type="danger" icon="el-icon-delete"></el-button>
                        </el-tooltip>
                        <!-- 分配角色按钮 -->
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[2, 4, 8, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>

            <!-- 添加用户对话框 -->
            <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
            </el-dialog>

            <!-- 修改用户对话框 -->
            <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input disabled v-model="editForm.username"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data () {
        // 验证邮箱
        var checkEamil = (rule, value, cb) => {
            const regEamil = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
            if (regEamil.test(value)) {
                return cb()
            }
            cb(new Error('请输入格式正确的邮箱'))
        }
        // 验证手机号
        var checkMobile = (rule, value, cb) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
            if (regMobile.test(value)) {
                return cb()
            }
            cb(new Error('请输入格式正确的手机'))
        }
        return {
            // 获取用户列表的参数对象
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            userlist: [],
            total: 0,
            addDialogVisible: false,
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '密码长度在6~15个字符之间', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEamil, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            editDialogVisible: false,
            editForm: {},
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEamil, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            }
        }
    },
    created () {
        this.getUserList()
    },
    methods: {
        async getUserList () {
            const { data } = await this.$http.get('users', { params: this.queryInfo })
            if (data.meta.status !== 200) {
                return this.$message.error('获取用户列表失败!')
            }
            this.userlist = data.data.users
            this.total = data.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange (newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange (newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听switch开关状态的改变
        async userStateChanged (userInfo) {
            const { data } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if (data.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败!')
            }
            this.$message.success('更新用户状态成功')
        },
        // 重置添加用户表单
        addDialogClosed () {
            this.$refs.addFormRef.resetFields()
        },
        addUser () {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const { data } = await this.$http.post('users', this.addForm)
                if (data.meta.status !== 201) {
                    this.$message.error('添加用户失败')
                } else if (data.meta.status === 201) {
                    this.$message.success('添加用户成功')
                    this.addDialogVisible = false
                    this.getUserList()
                }
            })
        },
        // 展示编辑用户的对话框
        async showEditDialog (id) {
            const { data } = await this.$http.get('users/' + id)
            if (data.meta.status !== 200) {
                return this.$message.error('查询用户信息失败')
            }
            this.editForm = data.data
            this.editDialogVisible = true
        },
        editDialogClosed () {
            this.$refs.editFormRef.resetFields()
        },
        editUserInfo () {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const { data } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
                if (data.meta.status !== 200) {
                    this.$message.error('编辑用户信息失败')
                } else if (data.meta.status === 200) {
                    this.$message.success('编辑用户信息成功')
                    this.editDialogVisible = false
                    this.getUserList()
                }
            })
        },
        async removeUserById (id) {
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data } = await this.$http.delete('users/' + id)
            if (data.meta.status !== 200) {
                return this.$message.error('删除用户失败！')
            }
            this.$message.success('删除用户成功')
            this.getUserList()
        }
    }
}
</script>

<style lang="less" scoped>

</style>
