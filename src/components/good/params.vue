<template>
	<div>
		<!-- 面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card>
			<el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
			<div class="block">
				<span class="cascader-left">选择商品分类：</span>
				<el-cascader v-model="selectedKeys" :options="parentCategoryForm"
					:props="{ expandTrigger: 'hover',...cascaderProps}" @change="handleChange"></el-cascader>
			</div>
			<el-tabs v-model="activeName" @tab-click="handleClick">
				<!-- 动态参数的面板 -->
				<el-tab-pane label="动态参数" name="many">
					<!-- 添加按钮 -->
					<el-button type="primary" :disabled="btnBooth === false ? true : false "
						@click="addDialogVisible = true" class="tianjia">添加参数</el-button>

					<el-table :data="manyTableList" border style="width: 100%">
						<el-table-column type="expand">
							<template v-slot="scope">
								<el-tag size="medium" closable v-for="(item,index) in scope.row.attr_vals" @close="tagClosed(index,scope.row)" :key="index" v-show="item !== [] && item.length !== 0" class="tags">{{item}}</el-tag>
								<el-input
								  class="input-new-tag"
								  v-if="scope.row.inputVisible"
								  v-model="scope.row.inputValue"
								  ref="saveTagInput"
								  size="small"
								  @keyup.enter.native="handleInputConfirm(scope.row)"
								  @blur="handleInputConfirm(scope.row)"></el-input>
								  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column type="index"></el-table-column>
						<el-table-column label="参数名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scope">
								<el-button type="primary" icon="el-icon-edit" size='small' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
								<el-button type="danger" icon="el-icon-delete" size='small' @click="deleteForm(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>

				<!-- 静态属性的面板 -->
				<el-tab-pane label="静态属性" name="only">
					<!-- 添加按钮 -->
					<el-button type="primary" class="tianjia" @click="addDialogVisible = true"
						:disabled="btnBooth === false ? true : false">添加属性</el-button>
					<el-table :data="onlyTableList" border style="width: 100%">
						<el-table-column type="expand"></el-table-column>
						<el-table-column type="index"></el-table-column>
						<el-table-column label="属性名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scope">
								<el-button type="primary" icon="el-icon-edit" size='small' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
								<el-button type="danger" icon="el-icon-delete" size='small' @click="deleteForm(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>
		
		<!-- 添加按钮的对话框 -->
		<el-dialog :visible.sync="addDialogVisible" width="30%" :title="activeName == 'many' ? '添加动态参数' : '添加静态属性'" @close="addDialogClosed">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item :label="activeName == 'many' ? '动态参数' : '静态属性'" prop="attr_name">
					<el-input v-model="addForm.attr_name" placeholder="请输入内容"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addParamsDialog">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 编辑按钮的对话框 -->
		<el-dialog :visible.sync="editDialogVisible" width="30%" :title="activeName == 'many' ? '添加动态参数' : '添加静态属性'" @close="editDialogClosed">
			<el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
				<el-form-item :label="activeName == 'many' ? '动态参数' : '静态属性'" prop="attr_name">
					<el-input v-model="editForm.attr_name" placeholder="请输入内容"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editParamsDialog">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: 'params',
		data() {
			return {
				// 静态参数的数据
				manyTableList: [],
				// 动态参数的数据
				onlyTableList:[],
				// 得到数据源
				parentCategoryForm: [],
				// 获取指定的id
				selectedKeys: [],
				// 添加按钮的显示与隐藏
				btnBooth: false,
				cascaderProps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				},
				// 控制tags的默认
				activeName: 'many',
				addDialogVisible: false,
				editDialogVisible: false,
				// expand里面的tag的input的显示与隐藏
				// inputVisible:false,
				// expand里面的tag的input输入的数据
				// inputValue: '',
				// 添加参数的表单数据对象
				addForm:{
					attr_name:'',
				},
				// 添加表单的验证规则对象
				addFormRules: {
					attr_name: [{
							required: true,
							message: '请输入活动名称',
							trigger: 'blur'
						},
						{
							min: 2,
							max: 6,
							message: '长度在 2 到 6 个字符',
							trigger: 'blur'
						}
					],
				},
				// 编辑按钮存放数据的表单
				editForm:{},
				// 存储tag的数据
				item_vals:[]

			}
		},
		created() {
			this.getParamsList()
		},
		methods: {
			async getParamsList() {
				const {
					data: res
				} = await this.$http.get('categories')
				if (res.meta.status !== 200) {
					return false
				}
				this.parentCategoryForm = res.data
				console.log('111',this.parentCategoryForm )
				// console.log(res)
			},
			handleClick() {
				this.handleChange()
			},
			// 选择商品分类的级联选择器
			async handleChange() {
				if (this.selectedKeys.length !== 3) {
					this.selectedKeys = []
					this.manyTableList = []
					this.onlyTableList = []
					this.btnBooth = false
					console.log(this.btnBooth)
					return this.$message.error('只允许为第三级分类设置相关参数')
				}
				this.btnBooth = true
				console.log(this.btnBooth)
				const {
					data: res
				} = await this.$http.get('categories/' + this.cateId + '/attributes', {
					params: {
						sel: this.activeName
					}
				})
				if (res.meta.status !== 200) {
					return false
				}
				this.$message.success('获取数据成功')
				res.data.forEach(item =>{
					item.attr_vals = item.attr_vals.split(' ')
					this.item_vals = item.attr_vals
					if(this.item_vals[0] === ''){
						this.item_vals = []
					}
					// 控制文本框的显示与隐藏，输入的值为空
					item.inputVisible = false
					item.inputValue = ''
					// console.log('item_vals',this.item_vals)
				})
				if(this.activeName === 'many'){
					this.manyTableList = res.data
				}else{
					this.onlyTableList = res.data
				}
				
				
				console.log('handle', this.manyTableList)
				// console.log(this.selectedKeys)
			},
			// 添加参数确定的按钮
			addParamsDialog() {
				this.$refs.addFormRef.validate(async valid=>{
					if(!valid) return false
					const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
						attr_name: this.addForm.attr_name,
						attr_sel: this.activeName		
					})
					// console.log(res)
					this.addDialogVisible = false
					this.handleChange()
				})
			},
			// 编辑按钮
			async showEditDialog(attr_id){
				this.editDialogVisible = true
				const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
				// console.log(res)
				if(res.meta.status !== 200){
					return false
				}
				this.$message.success('编辑数据获取成功')
				this.editForm = res.data
			},
			// 编辑的确定按钮
			editParamsDialog(){
				this.$refs.editFormRef.validate(async valid=>{
					if(!valid) return false
					const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
						attr_id:this.editForm.attr_id,
						attr_name:this.editForm.attr_name,
						attr_sel:this.activeName
					})
					if(res.meta.status !== 200){
						return false
					}
					this.editForm.attr_name = res.data.attr_name
					this.editDialogVisible = false
					this.handleChange()
				})
			},
			// 删除按钮
			async deleteForm(attr_id){
				const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
				          confirmButtonText: '确定',
				          cancelButtonText: '取消',
				          type: 'warning'
				}).catch(err =>{
					return err
				})
				if(confirmResult !== 'confirm'){
					return this.$message.info('已取消删除')
				}
				const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
				if(res.meta.status === 200){
					this.$message.success('删除成功')
				}
				this.handleChange()
			},
			// 重置添加按钮对话框的数据
			addDialogClosed(){
				this.$refs.addFormRef.resetFields()
			},
			// 重置编辑按钮的对话框
			editDialogClosed(){
				this.$refs.editFormRef.resetFields()
			},
			// 关闭tag的标签
			tagClosed(index,row){
				row.attr_vals.splice(row.attr_vals.indexOf(row.attr_vals[index]), 1)
				console.log(row.attr_vals)
			},
			showInput(row){
				row.inputVisible = true
				// 让文本框自动获得焦点
				// $nexTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
				this.$nextTick(_ => {
				    this.$refs.saveTagInput.$refs.input.focus()
				})
			},
			async handleInputConfirm(row){
				if(row.inputValue.trim().length === 0){
					row.inputVisible = false;
					row.inputValue = '';
					return true
				}
				row.attr_vals.push(row.inputValue.trim())
				row.inputValue = ''
				row.inputVisible = false
				// 发起请求
				const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
					attr_name:row.attr_name,
					attr_sel:row.attr_sel,
					attr_vals:row.attr_vals.join(' ')
				})
				console.log(res)
				if(res.meta.status !== 200){
					return false
				}
				this.$message.success('添加Tag成功')
			}
			
		},
		computed: {
			cateId() {
				if (this.selectedKeys.length === 3) {
					return this.selectedKeys[2]
				} else {
					return null
				}

			}
		}
	}
</script>

<style scoped="">
	.block {
		margin-top: 20px;
		margin-bottom: 20px;
	}

	.cascader-left {
		font-size: 15px;
		margin-right: 10px;
	}

	.tianjia {
		margin-bottom: 20px;
	}
	.tags{
		margin-right: 20px;
	}
	.tags:nth-child(1){
		margin-left: 50px;
	}
	.button-new-tag,.input-new-tag{
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
</style>
