import { main } from "../index";
export function GET(request) {
  main();
  return new Response(`Hello from ${process.env.user}`);
}

/* export const config = {
    runtime: 'nodejs',
}; */

