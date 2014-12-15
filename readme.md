## 前端部署：

1. 相关核心代码在 `public/routers/user.coffee`
2. 主要依赖于 Backbone, jQuery, Requirejs
3. 核心入口示例位于 `public/main.coffee`
4. 使用 /user/ 下的路由进行SPA导航：
	- `/user/sign/` # 登录或注册
	- `/user/profile/` # 用户信息页

## 前端初始化：

```
require(["routers/user"],function(UserRouter){
	var userRouter = new UserRouter({el:$("#main")[0]});
	Backbone.history.start(pushState: true);
});

## 后端接口要求：

需要实现以下接口：

- profile: `api/user/profile/` : 获取用户profile
- login: `api/user/login/` : 通过 `email`及 `password` 进行登录
- signOut: `api/user/signOut/` :  登出
- register: `api/user/register/` :  通过 `email`, `password`与`name`进行注册