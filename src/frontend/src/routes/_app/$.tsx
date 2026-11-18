import { createFileRoute, Link } from "@tanstack/react-router"
import { seo } from "@/lib/seo"
import { Button } from "@/components/ui/button"

// Catch-all for every path no other route matches. Living under /_app puts unknown pages behind
// the same sign-in guard as the rest of the app (XC-7): signed out, they redirect to /sign-in
// instead of showing the router's bare "Not Found".
export const Route = createFileRoute("/_app/$")({
  head: () => ({
    meta: seo({ title: "Page not found | X Clone" }),
  }),
  component: NotFound,
})

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">
        This page doesn't exist. Head back to your timeline.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}
