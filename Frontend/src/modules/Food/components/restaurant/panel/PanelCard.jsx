export default function PanelCard({
  children,
  className = "",
  onClick,
  hoverable = false,
  padding = "p-4",
}) {
  const Tag = onClick ? "button" : "div"

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`
        rt-panel-surface text-left
        ${padding}
        ${hoverable || onClick ? "transition hover:-translate-y-0.5 hover:shadow-lg" : ""}
        ${className}
      `}
    >
      {children}
    </Tag>
  )
}
