<template>
	<div>
		<!-- 面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片 -->
		<el-card>

			<el-row :gutter="20">
				<el-col :span="12">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" class="input-with-select">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type='primary' @click="addDialogVisible = true">添加用户</el-button>
				</el-col>
			</el-row>

			<el-table :data="userlist" :border='true' :stripe='true' class="user-table">
				<el-table-column type="index">
				</el-table-column>
				<el-table-column prop="username" label="姓名">
				</el-table-column>
				<el-table-column prop="email" label="邮箱">
				</el-table-column>
				<el-table-column prop="mobile" label="电话">
				</el-table-column>
				<el-table-column prop="role_name" label="角色">
				</el-table-column>
				<el-table-column prop="mg_state" label="状态">
					<!-- 插槽 v-slot 固定写法 拿到数据源中当前行的数据 -->
					<template v-slot="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width='180px'>
					<template v-slot="scope">
						<el-tooltip class="item" effect="dark" content="修改" placement="top">
							<el-button type="primary" icon="el-icon-edit" size='small'
								@click="showEditDialog(scope.row.id)"></el-button>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="删除" placement="top">
							<el-button type="danger" icon="el-icon-delete" size='small'
								@click="showDelete(scope.row.id)"></el-button>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="管理" placement="top">
							<el-button type="warning" icon="el-icon-setting" size='small'
								@click="controlRole(scope.row)"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>

		<!-- 添加用户的对话框 -->
		<el-dialog title="添加用户" :visible.sync="addDialogVisible" @close="addDialogClosed" width="30%">
			<el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addUserForm.username" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addUserForm.password" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addUserForm.email" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="addUserForm.mobile" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改用户的对话框 -->
		<el-dialog title="修改用户" :visible.sync="editDialogVisible" @close="editDialogClosed" width="30%">
			<el-form :model="editUserForm" :rules="addUserFormRules" ref="editUserFormRef" label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="editUserForm.username" :disabled="true">
					</el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editUserForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="editUserForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo">确 定</el-button>
			</span>
		</el-dialog>



		<el-dialog title="分配角色" :visible.sync="controlDialogVisible" @close="controlDialogClosed" width="30%">
			<div ref="controlRef">
				<p>当前的用户:   {{controlUserInfo.username}}</p>
				<p>当前的角色:   {{controlUserInfo.role_name}}</p>
				<p>分配新角色:
					<el-select v-model="setlectRoleId" placeholder="请选择">
						<el-option v-for="item in options[0]" :key="item.id" :label="item.roleName" :value="item.id"
							:disabled="item.disabled">
						</el-option>
					</el-select>
				</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="controlDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="controlUser">确 定</el-button>
			</span>
		</el-dialog>

	</div>

</template>

<script>
	export default {
		name: 'users',
		data() {
			// 邮箱的校验规则
			var validateEmail = (rule, value, callback) => {
				const RegEmail =
					/^[A-Za-z0-9-._]+@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,6})$/
				// test() 方法是正则表达式的一个方法，用于检测一个字符串是否匹配某个模式
				if (RegEmail.test(value)) {
					return callback()
				}
				callback(new Error('请输入正确的邮箱'))
			}
			// 手机号的校验规则
			var validateMobile = (rule, value, callback) => {
				const RegMobile = /^[1][3,4,5,7,8,9][0-9]{9}$/
				if (RegMobile.test(value)) {
					return callback()
				}
				callback(new Error('请输入正确的手机号'))
			}
			return {
				// 获取用户列表的参数对象
				queryInfo: {
					query: '',
					// 当前页数
					pagenum: 1,
					// 当前每页显示多少条数据
					pagesize: 2
				},
				userlist: [],
				total: 0,
				// 控制添加用户对话框的显示与隐藏
				addDialogVisible: false,
				// 控制修改用户的对话框的显示与隐藏
				editDialogVisible: false,
				// 控制管理用户的对话框的显示与隐藏,
				controlDialogVisible: false,
				// 保存管理用户的数据
				controlUserInfo: {},
				// 保存管理用户权限的数据
				options:[],
				// 管理用户权限中select中已选择的id值
				setlectRoleId:'',
				// 添加用户的表单数据
				addUserForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				//查询到的用户信息对象
				editUserForm: {
					username: '',
					email: '',
					mobile: ''
				},
				// 添加表单的验证规则对象
				addUserFormRules: {
					username: [{
							required: true,
							message: '请输入用户名',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '长度在3到10个字符',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							min: 6,
							max: 15,
							message: '长度在6到15个字符',
							trigger: 'blur'
						}
					],
					email: [{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: validateEmail,
							trigger: 'blur'
						}
					],
					mobile: [{
							required: true,
							message: '请输入手机号',
							trigger: 'blur'
						},
						{
							validator: validateMobile,
							trigger: 'blur'
						}
					]
				},
			}
		},
		created() {
			this.getUserList()
		},
		methods: {
			async getUserList() {
				const {
					data: res
				} = await this.$http.get('users', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return this.$message.error('获取用户列表失败！')
				}
				// console.log(res)
				this.userlist = res.data.users
				this.total = res.data.total
			},
			// 监听 pagesize 改变的事件
			handleSizeChange(newSize) {
				// console.log(`每页 ${newSize} 条`);
				this.queryInfo.pagesize = newSize
				this.getUserList()
			},
			// 监听 页码值 改变的事件
			handleCurrentChange(newPage) {
				// console.log(`当前页: ${newPage}`);
				this.queryInfo.pagenum = newPage
				this.getUserList()
			},
			// 监听 switch 开关状态的改变 
			async userStateChanged(userinfo) {
				console.log(userinfo)
				const {
					data: res
				} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
				if (res.meta.status !== 200) {
					// 以保证如果发生错误，状态还是跟原来一样
					userinfo.mg_status = !userinfo.mg_status
					return this.$message.error('更新用户状态失败')
				}
				this.$message.success('更新用户状态成功')
			},
			// 监听添加用户对话框的关闭
			addDialogClosed() {
				this.$refs.addUserFormRef.resetFields()
			},
			// 点击按钮，添加新用户
			addUser() {
				this.$refs.addUserFormRef.validate(async valid => {
					if (!valid) return
					// 如果是valid=true则可以发起添加用户的网络请求
					const {
						data: res
					} = await this.$http.post('users', this.addUserForm)
					if (res.meta.status !== 201) {
						return this.$message.error('添加用户失败')
					}
					this.$message.success('添加用户成功')
					// 隐藏用户对话框
					this.addDialogVisible = false
					// 重新获取用户列表
					this.getUserList()
					// console.log(res)
				})
			},
			// 监听修改用户对话框的关闭
			editDialogClosed() {
				this.$refs.editUserFormRef.resetFields()
			},
			// 展示修改的对话框
			async showEditDialog(id) {
				this.editDialogVisible = true
				const {
					data: res
				} = await this.$http.get(`users/${id}`)
				if (res.meta.status !== 200) {
					return this.$message.error('获取失败')
				}
				this.$message.success('获取成功')
				this.editUserForm = res.data
				this.editUserForm.username = res.data.username
				this.editUserForm.email = res.data.email
				this.editUserForm.mobile = res.data.mobile
				// console.log(res)
			},
			editUserInfo() {
				this.$refs.editUserFormRef.validate(async valid => {
					if (!valid) return false
					// 发起修改用户信息的数据请求
					const {
						data: res
					} = await this.$http.put('users/' + this.editUserForm.id, {
						email: this.editUserForm.email,
						mobile: this.editUserForm.mobile
					})
					// console.log(res)
					if (res.meta.status !== 200) {
						return this.$message.error('修改失败')
					}
					this.$message.success('修改成功')
					this.getUserList()
					this.editDialogVisible = false
				})
			},
			// 根据id删除对应的用户信息
			async showDelete(id) {
				// 弹框用户是否删除数据
				const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch((err) => {
					return err
				})
				// 如果用户确认删除，则返回值为字符串 confirm
				// 如果用户取消删除，则返回值为字符串 cancel
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				const {
					data: res
				} = await this.$http.delete(`users/${id}`)
				if (res.meta.status === 200) {
					this.$message.success('删除用户成功')
				}
				this.getUserList()
				console.log(res)
			},
			// 管理角色权限的对话框
			async controlRole(userinfo) {
				this.controlDialogVisible = true
				this.controlUserInfo = userinfo
				const {data:res} = await this.$http.get('roles')
				if(res.meta.status !== 200){
					return this.$message.error('获取用户权限失败')
				}
				console.log('111111',this.controlUserInfo)
				this.options.push(res.data)
				console.log(this.options)


			},
			controlDialogClosed() {
				// this.$refs.controlRef.resetFields()
			},
			async controlUser(){
				const {data:res} = await this.$http.put('users/'+this.controlUserInfo.id+'/role',{rid:this.setlectRoleId})
				// const {data:res} = await this.$http.put(`users/${this.controlUserInfo.id}/role`,{rid:this.setlectRoleId})
				// console.log(res)
				if(res.meta.status !== 200){
					return this.$message.error('管理用户权限失败')
				}
				this.getUserList()
				this.controlDialogVisible = false
			}
		}
	}
</script>

<style scoped="">
	.user-table {
		margin-top: 20px;
		margin-bottom: 20px;
		font-size: 12px;
	}
</style>
