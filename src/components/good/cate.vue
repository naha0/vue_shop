<template>
	<div>
		<!-- 面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片 -->
		<el-card class="box-card">
			<el-row>
				<el-button type="primary" @click="addDialog" class="tianjia">添加分类</el-button>
			</el-row>

			<!-- 表格 -->
			<tree-table :data="categorysList" :columns="columns" :selection-type="false" :expand-type="false"
				:border="true" :show-row-hover="false" :show-index="true">
				<template slot="isok" slot-scope="scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:green"></i>
					<i class="el-icon-error" v-else style="color:red"></i>
				</template>
				<template slot="level" slot-scope="scope">
					<el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
					<el-tag type="success" v-else-if="scope.row.cat_level == 1">二级</el-tag>
					<el-tag type="warning" v-else>三级</el-tag>
				</template>
				<template slot="isdo" slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" size='small'
						@click="showEditDialog(scope.row.cat_id)">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size='small' @click="showDelete(scope.row.cat_id)">删除
					</el-button>
				</template>
			</tree-table>


			<!-- 分页 -->
			<!-- pagenum:当前页数  pagesize:当前每页显示多少条数据 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum" :page-sizes="[2, 3, 5, 10]" :page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>


		<!-- 添加分类的按钮 -->
		<el-dialog title="提示" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
			<el-form :model="addCategoryForm" :rules="addCategoryRules" ref="addCategoryRef" label-width="100px">
				<el-form-item label="分类名称" prop="cat_name">
					<el-input v-model="addCategoryForm.cat_name" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="父级名称">
					<div class="block">
						<!-- options 用来指定数据源 -->
						<!-- props 用来指定配置对象 -->
						<el-cascader v-model="selectedKeys" :options="parentCategoryForm"
							:props="{expandTrigger: 'hover',...cascaderProps}" @change="handleChange" clearable>
						</el-cascader>
					</div>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible= false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 编辑按钮的对话框 -->
		<el-dialog title="提示" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
			<el-form :model="editCategoryForm" :rules="addCategoryRules" ref="editCategoryRef" label-width="70px">
				<el-form-item label="分类名称">
					<el-input v-model="editCategoryForm.cat_name">
					</el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="showGoods">确 定</el-button>
			</span>
		</el-dialog>


	</div>
</template>

<script>
	export default {
		name: 'goods',
		data() {
			return {
				categorysList: [],
				// 获取商品分类列表的参数对象
				queryInfo: {
					type: 3,
					// 当前页数
					pagenum: 1,
					// 当前每页显示多少条数据
					pagesize: 5
				},
				total: 0,
				// 添加按钮对话框的显示与隐藏
				addDialogVisible: false,
				// 编辑按钮对话框的显示与隐藏
				editDialogVisible: false,
				// 添加分类按钮的{}
				addCategoryForm: {
					cat_name: '',
					cat_pid: 0,
					// 默认添加等级为一级
					cat_level: 0
				},
				// 添加分类按钮的存储父级分类的数据
				parentCategoryForm: [],
				// 存储父级分类的级联选择器的配置对象
				cascaderProps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children',
					checkStrictly: 'true'
				},
				// 选中的父级分类的id数组
				selectedKeys: [],
				// 编辑存储名称的数据
				editCategoryForm: {
					cat_name: '',
					cat_id: ''
				},
				// 添加分类按钮的规则
				addCategoryRules: {
					cat_name: [{
							required: true,
							message: '请输入活动名称',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 5,
							message: '长度在 3 到 5 个字符',
							trigger: 'blur'
						}
					]
				},
				// 为table指定列的定义
				columns: [{
					label: '分类名称',
					prop: 'cat_name'
				}, {
					label: '是否有效',
					prop: 'cat_deleted',
					// 表示，将当前列定义为模板列
					type: 'template',
					// 表示当前这一列使用模板名称
					template: 'isok'
				}, {
					label: '排序',
					prop: 'cat_level',
					type: 'template',
					template: 'level'
				}, {
					label: '操作',
					type: 'template',
					template: 'isdo'
				}]

			}
		},
		created() {
			this.getCategory()
		},
		methods: {
			async getCategory() {
				const {
					data: res
				} = await this.$http.get('categories', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return false
				}

				// console.log('1111',res)
				// console.log(this.queryInfo)
				this.categorysList = res.data.result
				console.log('33333', this.categorysList)
				this.total = res.data.total
			},
			// pageSize 每页条数改变时会触发
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getCategory()
			},
			// currentPage 当前页改变时会触发
			handleCurrentChange(newNum) {
				this.queryInfo.pagenum = newNum
				this.getCategory()
			},
			// 添加分类的按钮
			addDialog() {
				this.addDialogVisible = true
				this.getParentCateList()
			},
			// 添加分类按钮的获取父级分类的数据列表
			async getParentCateList() {
				const {
					data: res
				} = await this.$http.get('categories', {
					params: {
						type: 2
					}
				})
				if (res.meta.status !== 200) {
					return false
				}
				this.$message.success('获取父级分类数据成功')
				this.parentCategoryForm = res.data
				console.log(res)
			},
			// 级联选择器的change
			handleChange() {
				// console.log(this.selectedKeys)
				// 如果length大于0，则证明选中的父级分类
				// 如果小于0，则没有选中父级分类
				if (this.selectedKeys.length > 0) {
					this.addCategoryForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
					this.addCategoryForm.cat_level = this.selectedKeys.length
					return
				} else {
					this.addCategoryForm.cat_pid = 0
					this.addCategoryForm.cat_level = 0
				}

			},
			// 点击确定，完成添加分类按钮
			addCate() {
				this.$refs.addCategoryRef.validate(async valid => {
					if (!valid) {
						return
					}
					const {
						data: res
					} = await this.$http.post('categories', this.addCategoryForm)
					if (res.meta.status !== 201) {
						return this.$message.error('添加用户失败')
					}
					this.$message.success('添加用户成功')
					this.addDialogVisible = false
					this.getCategory()
				})

				// console.log('1111', this.selectedKeys)
				// console.log(this.addCategoryForm)
			},
			// 根据id查询分类
			async showEditDialog(id) {
				const {
					data: res
				} = await this.$http.get(`categories/${id}`)
				if (res.meta.status !== 200) {
					return false
				}
				// console.log('222', res)
				this.editDialogVisible = true
				this.editForm = res.data
				console.log('dawd', this.editForm)
			},
			// 编辑按钮
			showGoods() {
				this.$refs.editCategoryRef.validate(async valid => {
					console.log(valid)
					if (!valid) return
					const {
						data: res
					} = await this.$http.put('categories/' + this.editForm.cat_id, this.editCategoryForm)
					console.log(res)
					if (res.meta.status !== 200) {
						return false
					}
					this.$message.success('编辑成功')
					this.editForm.cat_name = res.data.cat_name
					this.getCategory()
					this.editDialogVisible = false
				})

			},
			// 删除按钮
			async showDelete(id) {
				const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => {
					return err
				})
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				const {data:res} = await this.$http.delete(`categories/${id}`)
				if(res.meta.status !== 200){
					return false
				}
				this.$message.success('已成功删除')
				this.getCategory()
			},
			addDialogClosed() {
				this.$refs.addCategoryRef.resetFields()
				this.selectedKeys = []
				this.addCategoryForm.cat_pid = 0
				this.addCategoryForm.cat_level = 0
			},
			editDialogClosed() {
				this.$refs.editCategoryRef.resetFields()
				this.editCategoryForm.cat_name = ''
			}
		}
	}
</script>

<style scoped="">
	.tianjia {
		margin-bottom: 20px;
	}

	.el-cascader-menu {
		height: 300px;
	}
</style>

