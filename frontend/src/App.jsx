import { useEffect, useRef, useState } from 'react';
import { getContent } from './api';
import { fallbackProjects, fallbackStudio } from './content';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import WorkPanel from './components/WorkPanel';
import AboutPanel from './components/AboutPanel';
import ContactPanel from './components/ContactPanel';
import Canvas from './components/Canvas';
import Intro from './components/Intro';

export default function App() {
  const [studio, setStudio] = useState(fallbackStudio);
  const [projects, setProjects] = useState(fallbackProjects);
  const [panel, setPanel] = useState('work');
  const [slide, setSlide] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [contextVisible, setContextVisible] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const touchRef = useRef(false);
  const slideRefs = useRef([]);

  useEffect(() => {
    touchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    let ignore = false;
    getContent()
      .then((data) => {
        if (ignore) return;
        if (data.studio) setStudio(data.studio);
        if (Array.isArray(data.projects) && data.projects.length) setProjects(data.projects);
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (panel === 'work') {
      setContextVisible(false);
      return undefined;
    }
    const timer = setTimeout(() => setContextVisible(true), 80);
    return () => clearTimeout(timer);
  }, [panel]);

  function switchPanel(target) {
    if (target === panel) return;
    setPanel(target);
    setSlide(-1);
    setActiveIndex(-1);
  }

  function onHover(index) {
    if (panel !== 'work') return;
    setSlide((current) => (current === index ? current : index));
  }

  function onSelect(event, index) {
    event.preventDefault();
    if (!touchRef.current || panel !== 'work') return;
    setSlide(index);
    setActiveIndex(index);
  }

  return (
    <>
      {showIntro ? <Intro studio={studio} onDone={() => setShowIntro(false)} /> : null}
      <SiteHeader studio={studio} panel={panel} onNavigate={switchPanel} />
      <div className="split-container">
        <div className="left-side">
          <WorkPanel
            active={panel === 'work'}
            studio={studio}
            projects={projects}
            activeIndex={activeIndex}
            onHover={onHover}
            onSelect={onSelect}
          />
          <AboutPanel active={panel === 'about'} studio={studio} />
          <ContactPanel active={panel === 'contact'} studio={studio} />
        </div>
        <div className="split-divider"></div>
        <Canvas
          studio={studio}
          projects={projects}
          panel={panel}
          slide={slide}
          contextVisible={contextVisible}
          slideRefs={slideRefs}
        />
      </div>
      <SiteFooter studio={studio} />
    </>
  );
}
