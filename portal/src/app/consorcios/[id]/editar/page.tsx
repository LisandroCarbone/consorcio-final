import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

// The full edit form was replaced by inline editing on the consorcio detail page.
export default async function EditarConsorcioPage({ params }: Props) {
  const { id } = await params;
  redirect(`/consorcios/${id}`);
}
