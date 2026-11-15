import { notFound } from "next/navigation";

// Any unknown page under a language shows that language's 404.
export default function Rest() {
  notFound();
}
