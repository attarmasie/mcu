interface EmailLinkProps {
  email: string;
  className?: string;
}

export function EmailLink({ email, className }: EmailLinkProps) {
  return (
    <a
      href={`mailto:${email}`}
      className={`text-sm font-medium text-primary hover:underline ${className}`}
    >
      {email}
    </a>
  );
}
