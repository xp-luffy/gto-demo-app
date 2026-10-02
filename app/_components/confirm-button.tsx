"use client";

export function ConfirmButton({ children, question, className = "row-action" }: { children: React.ReactNode; question: string; className?: string }) {
  return <button className={className} type="submit" onClick={(event) => {
    if (!window.confirm(question)) event.preventDefault();
  }}>{children}</button>;
}
