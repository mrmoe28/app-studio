export type Shot = { imageUrl: string; caption?: string };

export async function renderWithCreatomate(
  shots: Shot[],
  templateId?: string,
  aspect = "9:16"
) {
  // Default template ID if not provided
  const template = templateId || "default-slideshow-template";

  const modifications = {
    slides: shots.map((s) => ({
      image: s.imageUrl,
      text: s.caption || "",
      duration: 1.8,
      transition: "fade"
    })),
    aspect,
  };

  const body = {
    template_id: template,
    modifications,
    output_format: "mp4",
  };

  const res = await fetch("https://api.creatomate.com/v1/renders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Creatomate ${res.status}`);
  }

  return res.json();
}
