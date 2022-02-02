<template>

	<el-container class="home-container">
		<!-- 头部 -->
		<el-header>
			<div class="home-header-title">
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="logout">退出</el-button>
		</el-header>

		<!-- 主体 -->
		<el-container>
			<!-- 侧边栏 -->
			<el-aside :width="isCollapse ? '64px' : '200px'">
				<div class="toggle-button" @click="toggleCollapse">|||</div>
				<el-menu background-color="#333744" text-color="#fff" :uniqueOpened="true" :collapse="isCollapse"
					:collapseTransition="false" :router="true" :default-active="activePath">
					<!-- 一级菜单模板 -->
					<el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
						<template slot="title">
							<i class="el-icon-location"></i>
							<span>{{item.authName}}</span>
						</template>
						<!-- 二级菜单模板 -->
						<el-menu-item :index="''+subItem.path" v-for="subItem in item.children" :key="subItem.id"
							@click="saveNavState(''+subItem.path)">
							<template slot="title">
								<i class="el-icon-menu"></i>
								<span>{{subItem.authName}}</span>
							</template>
						</el-menu-item>
					</el-submenu>

				</el-menu>
			</el-aside>
			<!-- 右侧内容主体 -->
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
	export default {
		name: 'home',
		data() {
			return {
				menulist: [],
				isCollapse: false,
				activePath:'',
				
			}
		},
		created() {
			this.getMenuList()
			this.activePath = window.sessionStorage.getItem('activePath')
		},
		methods: {
			logout() {
				// 清除token
				window.sessionStorage.clear()
				// 跳转到登录页
				this.$router.push('/login')
			},
			// 获取所有菜单
			async getMenuList() {
				const {
					data: res
				} = await this.$http.get('menus')
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
				this.menulist = res.data
				// console.log(res)
				// console.log('111', menulist)
			},
			// 切换菜单的折叠与展开
			toggleCollapse() {
				this.isCollapse = !this.isCollapse
			},
			// 保存导航链接的激活状态
			saveNavState(activePath) {
				// 就是保存记录你所选择的path（停留在哪个界面），然后储存在session 里边
				window.sessionStorage.setItem('activePath',activePath)
				this.activePath = activePath
				console.log(this.activePath)
			}
		}
	}
</script>

<style scoped="">
	.home-container {
		height: 100%;
	}

	.el-menu {
		border-right: 0;
	}

	.el-header {
		display: flex;
		justify-content: space-between;
		background-color: #373d41;
		align-items: center;
	}

	.home-header-title {
		display: flex;
		align-items: center;
		font-size: 24px;
		font-weight: 500;
		color: #fff;
	}

	.el-aside {
		background-color: #333744;
	}

	.el-main {
		background-color: #EAEDF1;
	}

	.toggle-button {
		background-color: #4A5064;
		color: #fff;
		font-size: 10px;
		line-height: 24px;
		text-align: center;
		letter-spacing: 0.2em;
		cursor: pointer;
	}
</style>
