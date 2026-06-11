import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

// First crumb is always the feed; the last crumb is the current page.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs: Crumb[] = [{ label: 'Feed', to: '/' }, ...items]

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={`${crumb.label}-${index}`}>
              {crumb.to && !isLast ? (
                <Link to={crumb.to}>
                  {index === 0 && <img src="/assets/icons/message-circle.svg" alt="" />}
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
              )}
              {!isLast && <span className="crumb-sep" aria-hidden>›</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
