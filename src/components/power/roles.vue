<template>
	<div>
		<el-breadcrumb separator="/">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>

		<el-row :gutter="20">
			<el-col :span="4">
				<el-button type='primary' @click="addDialogVisible = true" class="tianjia">添加角色</el-button>
			</el-col>
		</el-row>

		<el-card>
			<el-table :data="rolesList" :border='true' :stripe='true'>
				<el-table-column type="expand">
					<template v-slot="scope">
						<el-row :class="['bdbottom',index === 0 ? 'bdtop' : '']"
							v-for="(item,index) in scope.row.children" :key="item.id" class="row-align">
							<!-- 一级权限 -->
							<el-col :span="5" class="bdt">
								<el-tag>{{item.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<el-col :span="19">
								<el-row :class="[index1 === 0 ? '' : 'bdtop','row-align']"
									v-for="(item1,index1) in item.children" :key="item1.id">
									<!-- 二级权限 -->
									<el-col :span="9" class="bdt">
										<el-tag closable @close="tagClose(scope.row.id,item2.id)" type="success">
											{{item1.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<!-- 三级权限 -->
									<el-col :span="15">
										<el-tag closable @close="tagClose(scope.row.id,item2.id)" type="warning"
											v-for="(item2,index2) in item1.children" :key="item2.id">{{item2.authName}}
										</el-tag>
									</el-col>
								</el-row>

							</el-col>
						</el-row>
						<!-- <pre >{{item}}</pre> -->
					</template>
				</el-table-column>
				<el-table-column type="index">
				</el-table-column>
				<el-table-column label="角色名称" prop="roleName">
				</el-table-column>
				<el-table-column label="角色描述" prop="roleDesc">
				</el-table-column>
				<el-table-column label="操作" width="300px">
					<template v-slot="scope">
						<el-button type="primary" icon="el-icon-edit" size='small'
							@click="showEditDialog(scope.row.id)">编辑</el-button>
						<el-button type="danger" icon="el-icon-delete" size='small' @click="deleteForm(scope.row.id)">删除
						</el-button>
						<el-button type="warning" icon="el-icon-setting" size='small'
							@click="showSetRightsDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 添加角色的对话框 -->
		<el-dialog title="添加用户" :visible.sync="addDialogVisible" @close="addDialogClosed" width="30%">
			<el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesRef" label-width="100px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="addRolesForm.roleName" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="addRolesForm.roleDesc" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addRole">确 定</el-button>
			</span>
		</el-dialog>


		<!-- 编辑角色的对话框 -->
		<el-dialog title="编辑用户" :visible.sync="editDialogVisible" @close="editDialogClosed" width="30%">
			<el-form :model="editRolesForm" :rules="addRolesFormRules" ref="editRolesRef" label-width="100px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="editRolesForm.roleName" autocomplete="off" disabled></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="editRolesForm.roleDesc" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editRoles">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 展示分配权限的对话框 @close="setDialogClosed"-->
		<el-dialog title="分配权限" :visible.sync="showSetDialogVisible" width="30%" @close="setDialogClosed">
			<el-tree :data="setRightsList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true"
				v-model="setRightsList" :default-checked-keys="defKeys" ref="setRolesRef"></el-tree>

			<span slot="footer">
				<el-button @click="showSetDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="setRoles">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: 'roles',
		data() {
			return {
				rolesList: [],
				// 分配权限的数组
				setRightsList: [],
				addDialogVisible: false,
				editDialogVisible: false,
				showSetDialogVisible: false,
				// 默认选中的节点id值
				defKeys: [],
				// 当前即将分配权限的角色id
				roleId: '',
				// 添加角色的表单数据
				addRolesForm: {
					roleName: '',
					roleDesc: ''
				},
				// 编辑角色的表单数据
				editRolesForm: {
					roleName: '',
					roleDesc: ''
				},
				// 树形控件
				treeProps: {
					children: 'children',
					label: 'authName',
				},
				addRolesFormRules: {
					roleName: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}, {
						min: 2,
						max: 10,
						message: '长度在2到10个字符',
						trigger: 'blur'
					}],
					roleDesc: [{
							required: true,
							message: '请输入用户名',
							trigger: 'blur'
						},
						{
							min: 2,
							max: 10,
							message: '长度在2到10个字符',
							trigger: 'blur'
						}
					]
				},

			}
		},
		created() {
			this.getRolesList()
		},
		methods: {
			async getRolesList() {
				const {
					data: res
				} = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return false
				}
				// console.log(res)
				this.rolesList = res.data
			},
			addDialogClosed() {
				this.$refs.addRolesRef.resetFields()
			},
			addRole() {
				this.$refs.addRolesRef.validate(async valid => {
					if (!valid) return false
					const {
						data: res
					} = await this.$http.post('roles', this.addRolesForm)
					if (res.meta.status !== 201) {
						return this.$message.error('添加角色失败')
					}
					this.getRolesList()
					this.addDialogVisible = false
					this.$message.success('添加角色成功')
				})
			},
			// 编辑角色
			async showEditDialog(id) {
				this.editDialogVisible = true
				const {
					data: res
				} = await this.$http.get(`roles/${id}`)
				if (res.meta.status !== 200) {
					return this.$message.error('获取失败')
				}
				this.$message.success('获取成功')
				this.editRolesForm = res.data
				// console.log(this.editRolesForm)
			},
			//编辑的reset
			editDialogClosed() {
				this.$refs.editRolesRef.resetFields()
			},
			// 把编辑角色的数据保存在数据库中
			async editRoles() {
				const {
					data: res
				} = await this.$http.put('roles/' + this.editRolesForm.roleId, {
					roleName: this.editRolesForm.roleName,
					roleDesc: this.editRolesForm.roleDesc
				})
				if (res.meta.status !== 200) {
					return false
				}
				this.$message.success('编辑角色成功')
				this.getRolesList()
				this.editDialogVisible = false
			},
			// 删除角色
			async deleteForm(id) {
				const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				// 如果用户确认删除，则返回值为字符串 confirm
				// 如果用户取消删除，则返回值为字符串 cancel
				// console.log(confirmResult)
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				const {
					data: res
				} = await this.$http.delete(`roles/${id}`)
				if (res.meta.status === 200) {
					this.$message.success('删除成功')
				}
				this.getRolesList()
				// console.log(res)
			},
			// 弹框提示是否删除
			async tagClose(roleId, rightsId) {
				const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				const {
					data: res
				} = await this.$http.delete(`roles/${roleId}/rights/${rightsId}`)
				if (res.meta.status === 200) {
					this.$message.success('删除成功')
				}
				this.getRolesList()
			},
			// 展示分配权限的对话框
			async showSetRightsDialog(role) {
				this.roleId = role.id
				const {
					data: res
				} = await this.$http.get('rights/tree')
				if (res.meta.status !== 200) {
					this.$message.success('获取权限列表失败')
				}
				this.setRightsList = res.data
				// console.log(res)
				// this.defKeys.push(this.setRightsList.)
				var arr = []
				var children1 = role.children
				for (var i = 0; i < children1.length; i++) {
					var children2 = children1[i].children
					for (var j = 0; j < children2.length; j++) {
						var children3 = children2[j].children
						console.log(children3)
						for (var k = 0; k < children3.length; k++) {
							arr.push(children3[k].id)
						}
					}
				}
				this.defKeys = arr
				// console.log(this.defKeys)
				this.showSetDialogVisible = true
			},
			// 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
			// getLeafKeys(node,arr){
			// 	// 如果当前 node 节点不包含children属性，则是三级节点
			// 	if(!node.children){
			// 		return arr.push(node.id)
			// 	}
			// 	// 每循环一次，就得到一个item，item再次调用递归函数
			// 	node.children.forEach(item=>{
			// 		this.getLeafKeys(item,arr)
			// 	})
			// }

			// 监听分配权限对话框的关闭事件
			setDialogClosed() {
				this.defKeys = []
			},
			// 点击为角色分配权限
			async setRoles() {
				// getCheckedKeys
				// 若节点可被选择（即 show-checkbox 为 true），则返回目前半选中的节点的 key 所组成的数组
				const keys = [...this.$refs.setRolesRef.getCheckedKeys(), ...this.$refs.setRolesRef.getHalfCheckedKeys()]
				console.log(keys)
				const idStr = keys.join(',')
				const {
					data: res
				} = await this.$http.post(`roles/${this.roleId}/rights`, {
					rids: idStr
				})
				// console.log(res)
				if (res.meta.status !== 200) {
					return false
				}
				this.$message.success('分配权限成功')
				this.getRolesList()
				this.showSetDialogVisible = false
			}
		}
	}
</script>

<style scoped="">
	.tianjia {
		margin-bottom: 20px;
	}

	.bdbottom {
		border-bottom: 1px solid #c7c7c7;
		margin: 10px 30px;
	}

	.bdtop {
		border-top: 1px solid #c7c7c7;
	}

	.bdt {
		margin-bottom: 10px;
	}

	.bdt:nth-child(1) {
		margin-top: 10px
	}

	.row-align {
		display: flex;
		align-items: center;
	}
</style>
