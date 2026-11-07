import { useId, useLayoutEffect, useRef, useState } from 'react';
import { fitWholeWords } from '../utils/textPreview';

const withEllipsis = (value: string) => value.replace(/[.,;:!?…]+$/u,'') + '…';

export function PostDescription({ text }: { text: string }) {
  const [expanded,setExpanded] = useState(false);
  const [preview,setPreview] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const measuring = useRef<HTMLParagraphElement>(null);
  const measuringText = useRef<HTMLSpanElement>(null);
  const measuringToggle = useRef<HTMLSpanElement>(null);
  const textId = useId();

  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      const paragraph = measuring.current;
      const content = measuringText.current;
      const toggle = measuringToggle.current;
      if (!active || !paragraph || !content || !toggle || !paragraph.getBoundingClientRect().width) return;
      const limit = parseFloat(getComputedStyle(paragraph).lineHeight) * 3 + .5;
      toggle.hidden = true;
      content.textContent = text;
      if (paragraph.getBoundingClientRect().height <= limit) { setPreview(null); return; }
      toggle.hidden = false;
      const fitted = fitWholeWords(text,candidate => {
        content.textContent = withEllipsis(candidate) + ' ';
        return paragraph.getBoundingClientRect().height <= limit;
      });
      setPreview(fitted);
    };
    measure();
    let lastWidth = container.current?.getBoundingClientRect().width;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width !== lastWidth) { lastWidth = width; measure(); }
    });
    if (container.current) observer.observe(container.current);
    void document.fonts.ready.then(measure);
    return () => { active = false; observer.disconnect(); };
  },[text]);

  return <div className="post-description" ref={container}>
    <p className="post-content" id={textId}>{preview !== null && !expanded ? withEllipsis(preview) : text}{preview !== null && <> <button type="button" className="post-read-more" aria-controls={textId} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Ler menos' : 'Continuar lendo'}</button></>}</p>
    <p className="post-content post-content-measure" aria-hidden="true" ref={measuring}><span ref={measuringText} /><span className="post-read-more" ref={measuringToggle}>Continuar lendo</span></p>
  </div>;
}
