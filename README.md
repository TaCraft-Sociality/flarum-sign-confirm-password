# 注册确认密码 flarum-sign-confirm-password

给 Flarum 2.x 论坛的注册弹窗加一个「确认密码」输入框：两次密码一致才允许创建账号，避免手滑打错密码把自己锁在门外。

## 功能

1. **注册弹窗确认密码框**：密码框下方多出一个「确认密码」输入框，两次输入不一致时注册请求会被拒绝，弹窗里提示「两次输入的密码不一致。」并自动聚焦到该输入框。
2. **服务端兜底校验**：除了前端提示，后端同样校验 `password === confirmPassword`，绕过前端直接调接口也建不了号。
3. **不影响第三方登录**：QQ / GitHub / 微软 / 皮肤站等带 `token` 的注册不显示该输入框、也不做校验；管理员通过 API 创建用户同样不受限制。

## 安装

```bash
composer require tacraft-sociality/flarum-sign-confirm-password:@dev
php flarum extension:enable tacraft-sociality-sign-confirm-password
php flarum cache:clear
```

## 兼容性

- Flarum `^2.0`
- PHP `^8.2`

## 说明

- 前端：扩展 `SignUpModal` 的 `oninit` / `fields` / `submitData`，确认框优先级 5，位于密码框（10）与注册按钮（-10）之间。
- 后端：监听 `Flarum\User\Event\Saving`，仅对「新用户 + 非管理员 + 无 token」的请求校验，不一致时抛 `ValidationException`（422，字段 `confirmPassword`）。
