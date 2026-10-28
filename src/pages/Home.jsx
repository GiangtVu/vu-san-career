import { useEffect, useMemo, useState } from 'react';
import '../styles/home.css';
import { listPath, useJobs } from '../lib/jobs.jsx';
import { HOME_TITLE } from '../lib/seo.js';
import { useLang } from '../lib/lang.jsx';
import { usePrefersReducedMotion, useTween } from '../lib/hooks.js';
import HomeHeader from './home/HomeHeader.jsx';
import { HeroDesktop, HeroMobile } from './home/Hero.jsx';
import Company from './home/Company.jsx';
import JobsSection from './home/JobsSection.jsx';
import Process from './home/Process.jsx';
import Benefits from './home/Benefits.jsx';
import { ActionBar, ContactFooter, Greeting } from './home/Contact.jsx';

// Cycles through `roles`, fading the label out for 260ms before each swap.
function useRotatingRole(roles, enabled) {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (!enabled || roles.length < 2) return undefined;
    let swap = 0;
    const timer = setInterval(() => {
      setOut(true);
      swap = setTimeout(() => { setIdx((i) => i + 1); setOut(false); }, 260);
    }, 2400);
    return () => { clearInterval(timer); clearTimeout(swap); };
  }, [roles, enabled]);
  return { role: roles.length ? roles[idx % roles.length] : '', out };
}

export default function Home() {
  const { status, data } = useJobs();
  const jobs = data ? data.jobs : [];
  const groups = data ? data.groups : {};
  const reduce = usePrefersReducedMotion();
  const { lang } = useLang();

  const [q, setQ] = useState('');
  const [group, setGroup] = useState(null);
  const [entered, setEntered] = useState(false);
  const [greet, setGreet] = useState(false);
  const [greetClosed, setGreetClosed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setEntered(true), reduce ? 0 : 60);
    const t2 = setTimeout(() => setGreet(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduce]);
  useEffect(() => { document.title = HOME_TITLE[lang]; }, [lang]);

  // Short role names from each group ("AI Engineer · Data Engineer · …"), not the long
  // crawled job titles, so the rotating pill stays on one line. Each links to its group's jobs.
  const roles = useMemo(() => Object.entries(groups).flatMap(([k, g]) => (
    g.roles ? g.roles.split(' · ').map((label) => ({ label, url: listPath('', k) })) : []
  )), [groups]);
  const { role, out } = useRotatingRole(roles, !reduce);
  const heroP = useTween(entered, 1100, 400);
  const hotJobs = useMemo(() => jobs.filter((j) => j.hot), [jobs]);

  const onSuggest = (label) => { setQ(label); setGroup(null); };
  const listUrl = listPath(q, group);
  const showGreet = greet && !greetClosed;
  const closeGreet = () => setGreetClosed(true);

  return (
    <div id="top" className={'pg' + (entered ? ' is-entered' : '')}>
      <HomeHeader total={jobs.length} />
      <main>
        <HeroDesktop
          total={Math.round(jobs.length * heroP)}
          groupCount={Math.round(Object.keys(groups).length * heroP)}
          role={role}
          roleOut={out}
          q={q}
          onSearch={setQ}
          onSuggest={onSuggest}
          listUrl={listUrl}
        />
        <HeroMobile
          total={Math.round(jobs.length * heroP)}
          count={jobs.length}
          hotJobs={hotJobs}
          role={role}
          roleOut={out}
          q={q}
          onSearch={setQ}
          listUrl={listUrl}
        />
        <Company />
        <JobsSection
          jobs={jobs}
          groups={groups}
          status={status}
          q={q}
          group={group}
          setGroup={setGroup}
          listUrl={listUrl}
          clear={() => { setQ(''); setGroup(null); }}
        />
        <Process />
        <Benefits />
      </main>
      <ContactFooter />
      <Greeting shown={showGreet} onClose={closeGreet} />
      <ActionBar shown={showGreet} onClose={closeGreet} />
    </div>
  );
}
