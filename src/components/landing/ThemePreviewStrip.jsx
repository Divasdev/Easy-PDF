import { useState } from 'react';
import { themes } from '../../lib/themes/themeDefinitions';

export default function ThemePreviewStrip() {
  const [active, setActive] = useState(0);
  const theme = themes[active];
  return <div className="preview-wrap" aria-label={`Previewing ${theme.name} mode`}>
    <div className="preview-paper" style={{ backgroundColor: theme.bg, color: theme.ink }}>
      <div className="preview-kicker">Reading preview · {theme.name}</div>
      <div className="preview-line long" /><div className="preview-line" /><div className="preview-line short" />
      <div className="preview-equation">∫<sub>0</sub><sup>∞</sup> e<sup>−x²</sup> dx = √π / 2</div>
      <div className="preview-chart"><i /><i /><i /><i /><b /></div>
    </div>
    <div className="preview-theme-picker" aria-label="Try a reading theme">{themes.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} className={index === active ? 'active' : ''}>{item.name}</button>)}</div>
  </div>;
}
