import axios from "axios";

export type ExampleGetResult = string;
export async function exampleGet(): Promise<ExampleGetResult> {
  const resp = await axios.get("/api/example");
  return resp.data;
}

export interface ExamplePostArgs {
  name?: string;
}
export interface ExamplePostResult {
  reply: string;
}

export interface RegisterUsername {
  name?: string; 
}

export interface RegisterResult {
  success:boolean;
}

export interface LoginUsername {
  name?: string; 
}

export interface LoginResult{
  success:boolean;
}

export async function examplePost(args: ExamplePostArgs): Promise<ExamplePostResult> {
  const resp = await axios.post("/api/example", args);
  return resp.data;
}

export async function registerUser(args: RegisterUsername): Promise<RegisterResult> {
  const resp = await axios.post("/api/register", args);
  return resp.data;
}

export async function loginUser(args: LoginUsername): Promise<LoginResult> {
  const resp = await axios.post("/api/login", args);
  return resp.data;
}