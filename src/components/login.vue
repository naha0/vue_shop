<template>
	<div class="login_container">
		<div class="login-box">
			<div class="avatar_box">
				<img src="../assets/logo.png">
			</div>
			<el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="100px"
				class="login_form">

				<el-form-item label="用户名" prop="username">
					<el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
				</el-form-item>

				<el-form-item label="密码" prop="password">
					<el-input v-model="loginForm.password" prefix-icon="el-icon-lollipop" show-password></el-input>
				</el-form-item>

				<el-form-item class="btns">
					<el-button type="primary" @click="login">登录</el-button>
					<el-button type="info" @click="resetLoginForm">重置</el-button>
				</el-form-item>

			</el-form>

		</div>
	</div>
</template>

<script>
	export default {
		name: 'login',
		data() {
			return {
				// 登录表单的数据绑定对象
				loginForm: {
					username: 'admin',
					password: '123456'
				},
				// 表单的验证规则对象
				loginFormRules: {
					username: [{
							required: true,
							message: '请输入登录名称',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '长度在 3 到 10 个字符',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入登录密码',
							trigger: 'blur'
						},
						{
							min: 6,
							max: 15,
							message: '长度在 6 到 15 个字符',
							trigger: 'blur'
						}
					]
				}
			}
		},
		methods: {
			// 登录按钮
			login() {
				this.$refs.loginFormRef.validate(async (valid) => {
					// console.log(valid)
					if (!valid) {
						return false
					}
					const {data: res} = await this.$http.post('login', this.loginForm)
					if (res.meta.status !== 200) return this.$message.error('登陆失败')
					this.$message.success('登录成功')
					// console.log(res)
					// 1.将登陆成功之后的token，保存到客户端的 sessionStorage中;localStorage中是持久化的保存
					// 1.1项目中除了登陆之外的其他API接口，必须在登录之后才能访问
					// 1.2 token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
					window.sessionStorage.setItem('token',res.data.token)
					// 2.通过编程式导航跳转到后台主页，路由地址是 /home
					this.$router.push("/home")
				})
			},

			// 重置按钮
			resetLoginForm() {
				this.$refs.loginFormRef.resetFields()
			}
		}

	}
</script>

<style scoped="">
	.login_container {
		color: orangered;
		height: 100%;
		background-color: #eaea65;
	}

	.login-box {
		width: 450px;
		height: 300px;
		background-color: #fad1f1;
		border-radius: 5px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.login_form {
		position: absolute;
		bottom: 0;
		width: 100%;
		padding: 0 30px;
		box-sizing: border-box;
	}

	/* .login_form input{
		width: 100px;
	} */
	.avatar_box {
		width: 100px;
		height: 100px;
		margin: -50px auto 0 auto;
		border-radius: 50%;
		border: 1px solid #eee;
		box-shadow: 0 0 10px #ddd;
		padding: 10px;
		background-color: #fff;
	}

	.avatar_box img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: #eee;
	}

	.btns {
		display: flex;
		justify-content: flex-end;
	}
</style>
