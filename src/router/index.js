import Vue from 'vue'
import VueRouter from 'vue-router'

// const login = () => import('../components/login.vue')
import login from '../components/login.vue'
import home from '../components/home.vue'
import welcome from '../components/welcome.vue'
import users from '../components/user/users.vue'
import rights from '../components/power/rights.vue'
import roles from '../components/power/roles.vue'
import goods from '../components/good/goods.vue'
import params from '../components/good/params.vue'
import categories from '../components/good/cate.vue'


Vue.use(VueRouter)

const routes = [{
		path: '/',
		redirect: '/login'
	},
	{
		path: '/login',
		component: login
	}, {
		path: '/home',
		component: home,
		children: [{
			path:'',
			redirect:'welcome',
		},{
			path: 'welcome',
			component: welcome,
		},{
			path:'users',
			component:users
		},{
			path:'rights',
			component:rights
		},{
			path:'roles',
			component:roles
		},{
			path:'goods',
			component:goods
		},{
			path:'params',
			component:params
		},{
			path:'categories',
			component:categories
		}]
	}
]

const router = new VueRouter({
	routes,
	mode: 'history'
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
	// 访问登录页，放行
	if (to.path === '/login') return next()
	// 获取token
	const tokenStr = window.sessionStorage.getItem('token')
	// 没有token，强制跳转到登录页
	if (!tokenStr) return next('/login')
	next()
})

export default router
