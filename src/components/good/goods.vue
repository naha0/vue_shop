<template>
	<div>
		<!-- 面包屑 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片 -->
		<el-card>
			<!-- 搜索内容 -->
			<el-form>
				<el-form-item>
					<el-col :span="8">
						<el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true">
							<el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
						</el-input>
					</el-col>
					<el-col :span="4" class="button-left">
						<el-button type="primary">添加商品</el-button>
					</el-col>
				</el-form-item>
			</el-form>
			<!-- table内容 -->
			<el-table :data="goodsList" style="width: 100%" border>
				<el-table-column type="index">
				</el-table-column>
				<el-table-column prop="goods_name" label="商品名称">
				</el-table-column>
				<el-table-column prop="goods_price" label="商品价格" width="100">
				</el-table-column>
				<el-table-column prop="goods_weight" label="商品重量" width="100">
				</el-table-column>
				<el-table-column prop="add_time" label="创建时间" width="180" value-format="timestamp(goodsList.add_time)">
				</el-table-column>
				<el-table-column label="操作" width="180">
					<template v-slot="scope">
						<el-button type="primary" icon="el-icon-edit"></el-button>
						<el-button type="danger" icon="el-icon-delete"></el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页 -->
			<div class="block">
				<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
					:current-page="currentPage4" :page-sizes="[4, 5, 8, 10]" :page-size="100"
					layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</el-card>
	</div>
</template>

<script>
	export default {
		name: 'goods',
		data() {
			return {
				goodsList: [],
				total: 0,
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 10
				},

			}
		},
		created() {
			this.getGoodsList()
		},
		methods: {
			async getGoodsList() {
				const {
					data: res
				} = await this.$http.get('goods', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return false
				}
				this.$message.success('已成功获取数据')
				this.goodsList = res.data.goods
				this.total = res.data.total
				console.log(res)
			},
			// 分页的每页条数
			handleSizeChange() {

			},
			//分页的当前页
			handleCurrentChange() {

			},


			// 时间戳转换成时间
			// 使用element table组件中的formatter属性，传入一个函数
			timestampToTime(row, column) {
				var date = new Date(row.cjsj) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
				var Y = date.getFullYear() + '-'
				var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
				var D = date.getDate() + ' '
				var h = date.getHours() + ':'
				var m = date.getMinutes() + ':'
				var s = date.getSeconds()
				return Y + M + D + h + m + s
				console.log(timestampToTime(1533293827000))
			},
		}
	}
</script>

<style scoped="">
	.button-left {
		margin-left: 20px;
	}
</style>
