import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("signup", "routes/auth/signup.tsx"),
  route("logout", "routes/auth/logout.tsx"),

  ...prefix("articles", [
    index("routes/articles/index.tsx"),
    route("new", "routes/articles/new.tsx"),
    route(":slug", "routes/articles/detail.tsx"),
    route(":slug/edit", "routes/articles/edit.tsx"),
  ]),
] satisfies RouteConfig;
