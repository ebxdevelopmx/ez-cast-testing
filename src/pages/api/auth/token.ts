import { getToken } from "next-auth/jwt"
import { type NextApiRequest, type NextApiResponse } from "next";

//const secret = process.env.NEXTAUTH_SECRET

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if using `NEXTAUTH_SECRET` env variable, we detect it, and you won't actually need to `secret`
  // const token = await getToken({ req })
  const token = await getToken({ req })
  console.log("JSON Web Token", token)
  res.end();
}