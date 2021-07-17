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
export async function examplePost(args: ExamplePostArgs): Promise<ExamplePostResult> {
  const resp = await axios.post("/api/example", args);
  return resp.data;
}
