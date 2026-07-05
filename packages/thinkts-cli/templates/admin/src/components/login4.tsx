import Image from "next/image";

import { cn } from "@/lib/utils";
interface Login4Props {
  heading?: string;
  description?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
    className?: string;
  };
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Login4({
  heading = "Login",
  description,
  logo,
  footer,
  className,
  children,
}: Login4Props) {
  return (
    <section className={cn("min-h-screen bg-background", className)}>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border bg-card p-8 shadow-sm">
          <a href={logo.url} className="flex items-center gap-3 text-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              title={logo.title}
              width={160}
              height={40}
              className={cn("h-10 w-auto dark:invert", logo.className)}
            />
            {logo.title ? <span className="text-lg font-semibold">{logo.title}</span> : null}
          </a>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="w-full">{children}</div>
          {footer ? <div className="w-full text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
