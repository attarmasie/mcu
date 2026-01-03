import { redirect, type ContextOptions } from "@tanstack/react-router";

export const AuthMiddleware = (context: ContextOptions<any, any>) => {
  const authToken = sessionStorage.getItem("authToken");
  const filePath = context.location.pathname;
  try {
    if (!authToken && filePath !== "/") {
      throw redirect({
        to: "/",
        search: context.location.search,
      });
    }

    if (authToken && filePath === "/") {
      throw redirect({
        to: "/dashboard",
        search: context.location.search,
      });
    }
  } catch (error) {
    if (!authToken) {
      throw redirect({
        to: "/",
        search: context.location.search,
      });
    }
    throw error;
  }
};