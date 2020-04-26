import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/User/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/Welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: User },
            { path: '/rights', component: Rights },
            { path: '/roles', component: Roles }
        ]
    }
]

const router = new VueRouter({ routes })

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 表示将要访问的路径
    // from 表示从哪个路径跳转而来
    // next 是一个函数，表示放行
    // next() 直接放行 next('/login') 强制跳转
    if (to.path === '/login') return next()
    // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router
