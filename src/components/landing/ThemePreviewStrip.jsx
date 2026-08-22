import { useEffect, useState } from 'react';
import { themes } from '../../lib/themes/themeDefinitions';

export default function ThemePreviewStrip() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % themes.length), 2600);
    return () => window.clearInterval(timer);
  }, []);
  const theme = themes[active];
  return <div className="preview-wrap" aria-label={`Previewing ${theme.name} mode`}>
    <div className="preview-paper" style={{ backgroundColor: theme.bg, color: theme.ink }}>
      <div className="preview-kicker">Reading preview · {theme.name}</div>
      <div className="preview-line long" /><div className="preview-line" /><div className="preview-line short" />
      <div className="preview-equation">∫<sub>0</sub><sup>∞</sup> e<sup>−x²</sup> dx = √π / 2</div>
      <div className="preview-chart"><i /><i /><i /><i /><b /></div>
    </div>
    <div className="theme-dots">{themes.map((item, index) => <span key={item.id} className={index === active ? 'active' : ''} />)}</div>
  </div>;
}
