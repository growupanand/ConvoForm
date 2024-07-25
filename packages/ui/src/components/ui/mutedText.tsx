

type Props = {
    children: React.ReactNode
}

export  function MutedText({ children }: Props) {
    return <span className="text-muted-foreground font-normal">{children}</span>
}