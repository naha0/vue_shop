import Vue from 'vue'
import VueRouter from 'vue-router'

// const login = () => import('../components/login.vue')
import login from '../components/login.vue'
import home from '../components/home.vue'

Vue.use(VueRouter)

const routes = [{
		path: '/',
		redirect: '/login'
	},
	{
		path: '/login',
		component: login
	},{
		path:'/home',
		component: home
	}
]

const router = new VueRouter({
	routes,
	mode:'history'
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
	// 访问登录页，放行
	if(to.path === '/login') return next()
	// 获取token
	const tokenStr = window.sessionStorage.getItem('token')
	// 没有token，强制跳转到登录页
	if(!tokenStr) return next('/login')
	next()
})

export default router
