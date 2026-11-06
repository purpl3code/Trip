import type { ReactNode } from 'react';

export function PageHeading({ title, description, action, titleId, focusable = false }: {
  title: string;
  description: string;
  action?: ReactNode;
  titleId?: string;
  focusable?: boolean;
}) {
  return <div className="page-heading">
    <div className="page-heading-copy"><h1 id={titleId} tabIndex={focusable ? -1 : undefined}>{title}</h1><p>{description}</p></div>
    {action && <div className="page-heading-action">{action}</div>}
  </div>;
}
