declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      role: "admin" | "teacher" | "student";
      email?: string;
    };
  }
}
