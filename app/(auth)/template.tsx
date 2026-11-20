// A cada troca entre login, recuperação e redefinição, o formulário entra suave.
export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter">{children}</div>
}
