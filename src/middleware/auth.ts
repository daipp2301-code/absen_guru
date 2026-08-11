import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authService } from "@/services/auth.service";

export const requireAppAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No valid authorization token");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const authData = await authService.validateSession(token);

    if (!authData) {
      throw new Error("Unauthorized: Invalid or expired session");
    }

    return next({
      context: {
        userId: authData.profil.id,
        user: authData.profil,
        role: authData.peran,
        teacher: authData.guru,
      },
    });
  },
);
