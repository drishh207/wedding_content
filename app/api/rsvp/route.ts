export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch("https://script.google.com/macros/s/AKfycbyXqvE1Vh5CfiUnX0_AiGAuoy3HMUBysMqRoxmzEUDtKdj92-2atYTa_kkR3ObYojmhVQ/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    })

    const text = await response.text()
    try {
      const data = JSON.parse(text)
      return Response.json(data)
    } catch {
      return Response.json({ status: "success" })
    }
  } catch (error) {
    return Response.json({ status: "error" }, { status: 500 })
  }
}
