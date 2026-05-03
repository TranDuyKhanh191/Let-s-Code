declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      role: "admin" | "teacher";
      email?: string;
    };
  }
}
