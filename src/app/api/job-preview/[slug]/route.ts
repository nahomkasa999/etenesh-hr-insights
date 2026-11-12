import { isPublicJobSlug } from "@/lib/board/paths";
import { getJobBySlug } from "@/lib/read";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isPublicJobSlug(slug)) {
    return new Response(null, { status: 404 });
  }

  const job = await getJobBySlug(slug);
  if (!job) {
    return new Response(null, { status: 404 });
  }

  return Response.json({ description: job.description });
}
